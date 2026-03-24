import os
import platform
import pytesseract
from dotenv import load_dotenv
 
load_dotenv()
 
# Tesseract path — Windows only
if platform.system() == "Windows":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
 
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL              = "arcee-ai/trinity-large-preview:free"