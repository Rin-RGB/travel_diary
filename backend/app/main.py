from fastapi import FastAPI
from sqlalchemy.testing.suite.test_reflection import users

from app.routers import auth, health, places, folders, cities, users, place_statuses

app = FastAPI(
    title="Travel Places API",
    version="1.0.0"
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(places.router)
app.include_router(folders.router)
app.include_router(cities.router)
app.include_router(users.router)
app.include_router(place_statuses.router)