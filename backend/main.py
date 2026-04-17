from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, admin, timetable

app = FastAPI(title="Timetable Generator API", version="1.0.0")

# ✅ TEMPORARY: allow ALL origins (guaranteed to work)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # ← IMPORTANT
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(timetable.router)

@app.get("/")
def root():
    return {"message": "Timetable Generator API is running!"}

@app.get("/health")
def health():
    return {"status": "ok"}
