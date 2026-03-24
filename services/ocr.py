import cv2
import pytesseract
import tempfile
import shutil
import os
from fastapi import UploadFile

import core.config  # ensures tesseract path is set


def preprocess(image_path: str):
    """Grayscale + Otsu threshold — works on dark/colored cards."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Image could not be loaded: {image_path}")
    gray  = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur  = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh


def extract_text(image) -> str:
    """Run Tesseract OCR on preprocessed image."""
    config = "--psm 6 --oem 3"
    return pytesseract.image_to_string(image, config=config).strip()


def save_upload(file: UploadFile) -> str:
    """Save uploaded file to a temp path, return the path."""
    suffix = os.path.splitext(file.filename)[-1] or ".jpg"  # type: ignore
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        return tmp.name


def extract_text_from_path(image_path: str) -> str:
    """Full pipeline: preprocess → OCR."""
    img  = preprocess(image_path)
    text = extract_text(img)
    print("OCR text:\n", text)
    return text