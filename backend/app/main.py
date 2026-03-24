from fastapi import FastAPI
from app.routers import health
from app.routers import places

app = FastAPI(
    title="Travel Places API",
    version="1.0.0"
)

# проверка
app.include_router(health.router)
app.include_router(places.router)