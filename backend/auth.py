from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional

from config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

import bcrypt

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    if not hashed_password or not plain_password:
        return False

    plain_password = plain_password.strip()

    if hashed_password.startswith(("$2b$", "$2a$", "$2y$", "$2$")):
        try:
            valid_hash = hashed_password
            if valid_hash.startswith("$2y$"):
                valid_hash = "$2b$" + valid_hash[4:]
            return bcrypt.checkpw(
                plain_password.encode('utf-8')[:72],
                valid_hash.encode('utf-8')
            )
        except Exception:
            pass

    return plain_password == hashed_password


# ==========================
# JWT Token
# ==========================

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update(
        {
            "exp": expire
        }
    )

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt