from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Dict, Any
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
import bcrypt

from core.config import supabase, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()

class AuthRequest(BaseModel):
    email: str
    password: str



def hash_password(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str):
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # type: ignore


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
        email = payload.get("email")

        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Fetch user from Supabase
        res = supabase.table("users").select("*").eq("email", email).execute()

        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")

        return res.data[0]

    except ExpiredSignatureError: 
        raise HTTPException(status_code=401, detail="Token expired")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/signup")
def signup(data: AuthRequest):
    try:
        # Check if user exists
        existing = supabase.table("users").select("*").eq("email", data.email).execute()

        if existing.data:
            raise HTTPException(status_code=400, detail="User already exists")

        hashed_password = hash_password(data.password)

        # Insert user
        res = supabase.table("users").insert({
            "email": data.email,
            "password": hashed_password
        }).execute()

        return {
            "message": "User created successfully",
            "user": res.data[0]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin")
def signin(data: AuthRequest):
    try:
        res = supabase.table("users").select("*").eq("email", data.email).execute()

        if not res or not res.data:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user: Dict[str, Any] = res.data[0] # type: ignore

        if not verify_password(data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token({
            "email": user["email"]
        })

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))



@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "user": current_user
    }