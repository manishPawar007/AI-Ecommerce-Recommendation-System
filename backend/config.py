from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'app.db'}"
)
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "supersecretkey"
)
ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        60
    )
)