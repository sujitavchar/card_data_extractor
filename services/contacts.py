from core.config import supabase


def save_contact(data: dict, note: str , scanned_by: str):

    row = {
        "name":        data.get("name") or data.get("Name"),
        "designation": data.get("designation") or data.get("Designation"),
        "company":     data.get("company") or data.get("Company"),
        "email":       data.get("email") or data.get("Email"),
        "phone_no":       data.get("phone") or data.get("Phone"),
        "website":     data.get("website") or data.get("Website"),
        "address":     data.get("address") or data.get("Address"),
        "profiles": data.get("profiles") or data.get("Profiles") ,
        "scanned_by":  scanned_by,
        "note":    note
    }

   

    result = supabase.table("cards").insert(row).execute()
    return result.data[0] if result.data else {}


def get_all_contacts() -> list:
    result = supabase.table("cards").select("*").order("created_at", desc=True).execute()
    return result.data