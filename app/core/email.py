import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM")


def send_otp_email(to_email: str, otp: str):
    msg = EmailMessage()
    msg["Subject"] = "Your AI Counsellor OTP Verification"
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email

    msg.set_content(
        f"""
Hello 👋

Your OTP for AI Counsellor signup is:

👉 {otp}

This OTP is valid for 10 minutes.

If you didn’t request this, you can ignore this email.

— AI Counsellor Team
"""
    )

    with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
