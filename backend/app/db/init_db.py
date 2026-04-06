from app.db.session import engine
from app.db.models import Base

# создает таблицы если их нет
def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()