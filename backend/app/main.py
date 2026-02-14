from fastapi import FastAPI
from routers import health

app = FastAPI(
    title="Travel Places API",
    version="1.0.0"
)

# проверка
app.include_router(health.router)