import os
import traceback
from fastapi import APIRouter, File, UploadFile

from services.ocr import save_upload, extract_text_from_path
from services.llm import categorize

router = APIRouter(prefix="/extract", tags=["Extract"])


@router.post("")
async def extract_single(file: UploadFile = File(...)):
    """Extract contact details from a single-sided business card."""
    tmp_path = save_upload(file)
    try:
        text = extract_text_from_path(tmp_path)
        data = categorize(text)
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        return {"success": False, "error": str(e)}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.post("/both-sides")
async def extract_both_sides(
    front: UploadFile = File(...),
    back:  UploadFile = File(...)
):
    """Extract contact details from both sides of a business card."""
    path1 = save_upload(front)
    path2 = save_upload(back)
    try:
        text1 = extract_text_from_path(path1)
        text2 = extract_text_from_path(path2)
        data  = categorize(text1 + "\n" + text2)
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        return {"success": False, "error": str(e)}
    finally:
        for path in [path1, path2]:
            if os.path.exists(path):
                os.remove(path)