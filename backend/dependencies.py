from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db


def get_database():
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()