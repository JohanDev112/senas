from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models_orm import WordEntry
from ..schemas import WordEntryOut

router = APIRouter(prefix="/dictionary", tags=["dictionary"])


@router.get("/words", response_model=list[WordEntryOut])
def list_words(db: Session = Depends(get_db)) -> list[WordEntry]:
    """
    Diccionario de palabras para el modo Beta 'Texto -> seña'. La app lo
    descarga y lo cachea localmente, asi que sigue funcionando offline con
    la ultima copia aunque no haya red -- esto solo permite ampliar el
    vocabulario sin publicar una nueva version del APK.
    """
    return list(db.scalars(select(WordEntry).order_by(WordEntry.word)))
