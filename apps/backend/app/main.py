from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from .db import Base, SessionLocal, engine
from .models_orm import WordEntry
from .routers import dictionary, history, models

# Palabras semilla, iguales a SUGGESTED_WORDS en apps/mobile/src/data/words.ts
SEED_WORDS = ["hola", "gracias", "familia", "casa", "amigo", "por favor"]


def seed_dictionary() -> None:
    with SessionLocal() as db:
        existing = set(db.scalars(select(WordEntry.word)))
        for word in SEED_WORDS:
            if word not in existing:
                db.add(WordEntry(word=word))
        db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_dictionary()
    yield


app = FastAPI(title="Manos LSM API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dictionary.router)
app.include_router(history.router)
app.include_router(models.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
