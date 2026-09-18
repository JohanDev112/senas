# Manos LSM — backend

FastAPI. Opcional para que la app funcione (todo lo esencial corre
on-device), sirve para actualizar el diccionario de palabras y respaldar
historial sin publicar una nueva version del APK.

## Correr local

```bash
uv venv apps/backend/.venv
uv pip install --python apps/backend/.venv -r apps/backend/requirements.txt
uv run --python apps/backend/.venv uvicorn app.main:app --reload --app-dir apps/backend
```

Documentacion interactiva en `http://127.0.0.1:8000/docs`.

## Endpoints

| Metodo | Ruta | Que hace |
|---|---|---|
| GET | `/health` | chequeo simple |
| GET | `/dictionary/words` | diccionario del modo Beta "Texto → seña" |
| POST | `/history/sync` | respaldo opcional del historial local (por `device_id`, sin cuentas) |
| GET | `/history/{device_id}` | recupera el historial respaldado |
| GET | `/models/latest` | metadata de la ultima version publicada del clasificador |

## Docker

```bash
cd apps/backend
docker compose up --build
```

## Base de datos

SQLite (`manoslsm.db`, se crea sola al arrancar) via SQLAlchemy. Para
produccion, cambiar `DATABASE_URL` en `app/db.py` a Postgres es directo
(SQLAlchemy ya abstrae el dialecto).
