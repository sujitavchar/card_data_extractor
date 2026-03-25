from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import extract
from routers import auth

app = FastAPI(title="Business Card Extractor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

#Routers
app.include_router(extract.router) # type: ignore
app.include_router(auth.router)

# Add future routers here:



@app.get("/")
def health():
    return {"status": "ok", "service": "Business Card Extractor"}