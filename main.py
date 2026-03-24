import cv2
import pytesseract
import requests
import json
import re
import os
import shutil
import platform
import tempfile
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

if platform.system() == "Windows":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL              = "arcee-ai/trinity-large-preview:free"
TMP_DIR            = "/tmp"

app = FastAPI(title="Business Card Data Extractor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)



def preprocess(image_path: str):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Image could not be loaded: {image_path}")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh



def extract_text(image) -> str:
    config = "--psm 6 --oem 3"
    return pytesseract.image_to_string(image, config=config).strip()



def _lines(text: str):
    return [l.strip() for l in text.splitlines() if l.strip()]


def parse_response(text: str) -> dict:
    if text.strip().startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
   
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    # Fallback — Key=Value pattern
    pattern = r'(\w+)=([^=]+?)(?=,\s*\w+=|$)'
    matches  = re.findall(pattern, text)
    result   = {}
    for key, value in matches:
        result[key.strip().lower().replace(" ", "_")] = value.strip()
    return result


def save_upload(file: UploadFile) -> str:
    suffix = os.path.splitext(file.filename)[-1] or ".jpg" # type: ignore
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        return tmp.name



def categorize_llm(text: str) -> dict:
    lines  = _lines(text)
    prompt = f"""
        You are an information extraction system.

        From the following OCR text of a business card, extract these fields if present. Following fields are compulsory, 
        return 'NA' if any field is missing . If you find any other data , create an extra field with proper fieldname. Don't assume any details 
        strictly refer to the OCR text. If person name is unclear, you can refer to email id part after '@'. If company name is unclear , refer to comapany website domain.
        Required fields :Name, Designation, Company, Email, Phone, Website, Address. Always put address field at last. Avoid putting numbers in non numerical fields like name).
        Address may contain only country, city or office locations. If the given Business card OCR text is random and has garbage value, return 'Blur image. Please make sure input image is landscape.'
        Return a string which follows this pattern: Fieldname=Value , separated by commas without spaces.
        Business card text:
        {lines}
        """

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": MODEL,
            "max_tokens": 400,
            "messages": [{"role": "user", "content": prompt}]
        }
    )

    if response.status_code != 200:
        raise RuntimeError(f"OpenRouter error {response.status_code}: {response.text}")

    raw = response.json()["choices"][0]["message"]["content"]
    return parse_response(raw)



def process_single(image_path: str) -> dict:
    img  = preprocess(image_path)
    text = extract_text(img)
    print("OCR text:\n", text)
    return categorize_llm(text)


def process_both(image_path1: str, image_path2: str) -> dict:
    img1  = preprocess(image_path1)
    img2  = preprocess(image_path2)
    text1 = extract_text(img1)
    text2 = extract_text(img2)
    print("OCR text (both sides):\n", text1 + "\n" + text2)
    return categorize_llm(text1 + "\n" + text2)



@app.get("/")
def health():
    return {"status": "ok", "service": "Business Card Extractor"}


@app.post("/extract")
async def extract_single(file: UploadFile = File(...)):
    """Single side — accepts image upload."""
    tmp_path = save_upload(file)
    try:
        data = process_single(tmp_path)
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        os.remove(tmp_path)


@app.post("/extract/both-sides")
async def extract_both_sides(
    front: UploadFile = File(...),
    back:  UploadFile = File(...)
):
    """Both sides — accepts two image uploads."""
    path1 = save_upload(front)
    path2 = save_upload(back)
    try:
        data = process_both(path1, path2)
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        os.remove(path1)
        os.remove(path2)
