from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'app.db'}"
)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# If running on Render and DATABASE_URL refers to localhost/127.0.0.1, fallback to SQLite
is_render = os.getenv("RENDER") or os.getenv("RENDER_SERVICE_ID")
if is_render and ("localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL):
    print("Warning: localhost DATABASE_URL detected on Render. Falling back to SQLite app.db")
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'app.db'}"
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