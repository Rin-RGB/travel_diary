from datetime import datetime, timedelta

from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.models import EmailCode


def test_database():
    init_db()

    session = SessionLocal()

    try:
        code = EmailCode(
            email="test@mail.com",
            code="123456",
            expires_at=datetime.now() + timedelta(minutes=5),
            is_used=False
        )

        session.add(code)
        session.commit()

        print("✅")

        result = session.query(EmailCode).filter_by(email="test@mail.com").first()

        if result:
            print("✅ Запись найдена:", result.email, result.code)
        else:
            print("❌ Запись не найдена")

    except Exception as e:
        session.rollback()
        print("❌", e)

    finally:
        session.close()


if __name__ == "__main__":
    test_database()