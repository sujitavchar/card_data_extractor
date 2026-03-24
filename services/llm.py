import requests
import json
import re
from core.config import OPENROUTER_API_KEY, MODEL

PROMPT_TEMPLATE = """
You are an information extraction system.

From the following OCR text of a business card, extract these fields if present. Following fields are compulsory,
return 'NA' if any field is missing. If you find any other data, create an extra field with proper fieldname. Don't assume any details —
strictly refer to the OCR text. If person name is unclear, refer to email id part before '@'. If company name is unclear, refer to company website domain.
Required fields: Name, Designation, Company, Email, Phone, Website, Address. Always put address field at last. Avoid putting numbers in non-numerical fields like name.
Address may contain only country, city or office locations. If the given Business card OCR text is random and has garbage value,
return {{"error": "Blur image. Please make sure input image is landscape."}}
Return ONLY a valid JSON object — no markdown, no explanation.
Business card text:
{text}
"""

def _lines(text: str) -> list:
    return [l.strip() for l in text.splitlines() if l.strip()]


def parse_response(raw: str) -> dict:
    """Parse LLM response — JSON first, Key=Value fallback."""
    # Strip markdown fences
    if raw.strip().startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    # Try JSON
    try:
        return json.loads(raw.strip())
    except json.JSONDecodeError:
        pass
    # Fallback — Key=Value pattern
    pattern = r'(\w+)=([^=]+?)(?=,\s*\w+=|$)'
    matches  = re.findall(pattern, raw)
    return {
        k.strip().lower().replace(" ", "_"): v.strip()
        for k, v in matches
    }


def categorize(text: str) -> dict:
    """Send OCR text to LLM, return structured dict."""
    lines  = _lines(text)
    prompt = PROMPT_TEMPLATE.format(text=lines)

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