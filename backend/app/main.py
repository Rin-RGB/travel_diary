from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, health, places, folders, cities, users, place_statuses, tags

from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Travel Places API",
    version="1.0.0"
)

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:63343",
    "http://localhost:63343",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(places.router)
app.include_router(folders.router)
app.include_router(cities.router)
app.include_router(users.router)
app.include_router(place_statuses.router)
app.include_router(tags.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")