from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WordEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    word: str
    sign_asset_url: str | None
    updated_at: datetime


class HistoryEntryIn(BaseModel):
    kind: str
    text: str
    at: datetime


class HistorySyncRequest(BaseModel):
    device_id: str
    entries: list[HistoryEntryIn]


class HistoryEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    kind: str
    text: str
    at: datetime


class ModelReleaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    version: str
    url: str
    size_bytes: int
    accuracy: float | None
    published_at: datetime
