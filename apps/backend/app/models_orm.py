from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class WordEntry(Base):
    """Palabra del diccionario del modo Beta 'Texto -> seña'."""

    __tablename__ = "word_entries"

    word: Mapped[str] = mapped_column(String, primary_key=True)
    # placeholder para cuando existan clips reales de la seña completa;
    # mientras tanto la app deletrea con el abecedario.
    sign_asset_url: Mapped[str | None] = mapped_column(String, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class HistoryRecord(Base):
    """Respaldo opcional del historial local de un dispositivo (sin cuentas)."""

    __tablename__ = "history_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_id: Mapped[str] = mapped_column(String, index=True)
    kind: Mapped[str] = mapped_column(String)  # "letter" | "word"
    text: Mapped[str] = mapped_column(String)
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ModelRelease(Base):
    """Metadata de una version publicada de hand_letters_weights.json/.tflite."""

    __tablename__ = "model_releases"

    version: Mapped[str] = mapped_column(String, primary_key=True)
    url: Mapped[str] = mapped_column(String)
    size_bytes: Mapped[int] = mapped_column(Integer)
    accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
