from datetime import datetime, timedelta
from jose import jwt
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def create_access_token(*args, **kwargs):
    """
    Create a JWT access token.

    Supports two calling conventions for backward compatibility:
    - create_access_token(data: dict)
    - create_access_token(user_id, email, stage)
    """
    # Determine data payload
    if args:
        # If first arg is a dict, use it
        first = args[0]
        if isinstance(first, dict):
            to_encode = first.copy()
        elif len(args) >= 3:
            user_id, email, stage = args[0], args[1], args[2]
            to_encode = {
                "sub": str(user_id),
                "email": email,
                "stage": stage,
            }
        else:
            # Fallback: try kwargs
            to_encode = kwargs.get("data", {}).copy() if isinstance(kwargs.get("data", {}), dict) else {}
    else:
        to_encode = kwargs.get("data", {}).copy() if isinstance(kwargs.get("data", {}), dict) else {}

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
