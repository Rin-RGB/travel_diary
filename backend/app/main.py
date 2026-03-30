from fastapi import FastAPI

from app.routers import auth, health, places, folders

app = FastAPI(
    title="Travel Places API",
    version="1.0.0"
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(places.router)
app.include_router(folders.router)