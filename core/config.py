import os
import platform
import pytesseract
from dotenv import load_dotenv
from supabase import create_client, Client
 
load_dotenv()
 
# Tesseract path — Windows only
if platform.system() == "Windows":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
 
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL              = "arcee-ai/trinity-large-preview:free"

# Supabase
SUPABASE_URL: str    = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY: str    = os.getenv("SUPABASE_ANON_KEY", "")
supabase: Client     = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)