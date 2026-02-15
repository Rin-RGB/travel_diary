from app.db.session import engine
from app.models import Base

# создает таблицы если их нет
def init_db():
    Base.metadata.create_all(bind=engine)