import random
from datetime import datetime, timedelta, timezone


def generate_otp(length: int = 6) -> str:
    """
    Generate a numeric OTP code of the given length (default: 6 digits).
    """
    return "".join(str(random.randint(0, 9)) for _ in range(length))


def otp_expiry(minutes: int = 10) -> datetime:
    """
    Return a timezone-aware UTC datetime representing the OTP expiry time.
    Default validity is 10 minutes.
    """
    return datetime.now(timezone.utc) + timedelta(minutes=minutes)


