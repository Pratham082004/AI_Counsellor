from datetime import datetime, timezone

from app.core.email import send_otp_email
from app.models.user import User
from app.models.otp import OTP
from app.core.security import hash_password, verify_password
from app.core.otp import generate_otp, otp_expiry


def create_user_with_otp(db, email: str, password: str):
    if db.query(User).filter(User.email == email).first():
        return None

    user = User(
        email=email,
        password_hash=hash_password(password),
        is_active=False,
    )

    otp_code = generate_otp()

    otp = OTP(
        email=email,
        code=otp_code,
        expires_at=otp_expiry()
    )

    db.add(user)
    db.add(otp)
    db.commit()

    # 📧 Send email
    send_otp_email(email, otp_code)

    return True


def authenticate_user(db, email: str, password: str):
    """
    Authenticate a user by email and password.
    Returns the user if credentials are valid, otherwise None.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def verify_otp(db, email: str, code: str):
    """
    Verify an OTP for the given email.
    If valid and not expired, activates the user and deletes the OTP.
    Returns the user on success, otherwise None.
    """
    otp = db.query(OTP).filter(OTP.email == email, OTP.code == code).first()
    if not otp:
        return None

    # Ensure we compare timezone-aware datetimes (Postgres returns aware UTC)
    if otp.expires_at < datetime.now(timezone.utc):
        # OTP expired
        return None

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    user.is_active = True
    db.delete(otp)
    db.commit()
    db.refresh(user)

    return user


def resend_otp(db, email: str, min_interval_seconds: int = 60):
    """
    Resend OTP to the given email.
    - Fails if user does not exist or is already active.
    - Rate limits by not allowing a new OTP to be sent more often than `min_interval_seconds`.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False, "User not found."

    if user.is_active:
        return False, "User is already verified."

    otp = db.query(OTP).filter(OTP.email == email).first()

    now_utc = datetime.now(timezone.utc)

    # If an OTP exists and was created recently, enforce rate limiting
    if otp and otp.created_at and (now_utc - otp.created_at).total_seconds() < min_interval_seconds:
        return False, "Please wait before requesting a new OTP."

    code = generate_otp()

    if not otp:
        otp = OTP(
            email=email,
            code=code,
            expires_at=otp_expiry(),
        )
        db.add(otp)
    else:
        otp.code = code
        otp.expires_at = otp_expiry()

    db.commit()

    # 📧 Send email with the new code
    send_otp_email(email, code)

    return True, "OTP resent successfully."
