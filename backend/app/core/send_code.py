import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_KEY = os.getenv("MAIL_KEY")
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USERNAME)

SMTP_HOST = "smtp.mail.ru"
SMTP_PORT = 465


def send_auth_code(email_to: str, code: str) -> None:
    if not MAIL_USERNAME:
        raise RuntimeError("MAIL_USERNAME is not set")
    if not MAIL_KEY:
        raise RuntimeError("MAIL_KEY is not set")
    if not MAIL_FROM:
        raise RuntimeError("MAIL_FROM is not set")

    message = EmailMessage()
    message["Subject"] = "Код подтверждения"
    message["From"] = MAIL_FROM
    message["To"] = email_to
    message.set_content(
        f"""Ваш код подтверждения: {code}

Код действует 5 минут.
Если вы не запрашивали код, просто проигнорируйте письмо.
"""
    )

    try:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(MAIL_USERNAME, MAIL_KEY)
            server.send_message(message)
    except smtplib.SMTPAuthenticationError:
        raise RuntimeError("Invalid MAIL_USERNAME or MAIL_KEY")
    except Exception as e:
        raise RuntimeError(f"Failed to send email: {e}")

send_auth_code("dariasugarrr@gmail.com", "1234")