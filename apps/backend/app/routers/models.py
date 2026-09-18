from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models_orm import ModelRelease
from ..schemas import ModelReleaseOut

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/latest", response_model=ModelReleaseOut)
def latest_model(db: Session = Depends(get_db)) -> ModelRelease:
    """
    Metadata de la ultima version publicada del clasificador entrenado
    (ver ml/export_web_model.py), para que la app pueda ofrecer
    "Descargar modelos" en Ajustes sin necesitar una actualizacion del
    APK. El modelo que ya viene empacado en la app sigue funcionando si
    esto no responde (sin red, o sin ninguna version publicada todavia).
    """
    release = db.scalar(select(ModelRelease).order_by(ModelRelease.published_at.desc()))
    if release is None:
        raise HTTPException(status_code=404, detail="Todavia no hay ninguna version de modelo publicada")
    return release
