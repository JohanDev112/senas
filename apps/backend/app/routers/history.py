from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models_orm import HistoryRecord
from ..schemas import HistoryEntryOut, HistorySyncRequest

router = APIRouter(prefix="/history", tags=["history"])


@router.post("/sync", status_code=201)
def sync_history(payload: HistorySyncRequest, db: Session = Depends(get_db)) -> dict[str, int]:
    """
    Respaldo opcional del historial local de un dispositivo. No hay cuentas
    de usuario: `device_id` es un identificador generado en el propio
    telefono (ver Ajustes en la app), asi que esto es un backup, no un
    login. Util solo para no perder el historial si el usuario cambia de
    telefono; la app funciona igual sin llamar nunca a este endpoint.
    """
    for entry in payload.entries:
        db.add(
            HistoryRecord(
                device_id=payload.device_id,
                kind=entry.kind,
                text=entry.text,
                at=entry.at,
            )
        )
    db.commit()
    return {"saved": len(payload.entries)}


@router.get("/{device_id}", response_model=list[HistoryEntryOut])
def get_history(device_id: str, db: Session = Depends(get_db)) -> list[HistoryRecord]:
    stmt = select(HistoryRecord).where(HistoryRecord.device_id == device_id).order_by(HistoryRecord.at.desc())
    return list(db.scalars(stmt))
