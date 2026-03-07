from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import LookupResponse, SchemaResponse
from schema_loader import SchemaLoadError, load_lookup, load_relationships, load_schema

app = FastAPI(title="MaestraVista Reporting Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/schema", response_model=SchemaResponse)
def get_schema() -> dict:
    try:
        return load_schema()
    except SchemaLoadError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/datatypes", response_model=LookupResponse)
def get_datatypes() -> dict:
    try:
        return load_lookup("vw_DataType", "DataTypeId", "DataTypeName")
    except SchemaLoadError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/sponsors", response_model=LookupResponse)
def get_sponsors() -> dict:
    try:
        return load_lookup("vw_Sponsor", "SponsorId", "SponsorName")
    except SchemaLoadError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/therapeutic-areas", response_model=LookupResponse)
def get_therapeutic_areas() -> dict:
    try:
        return load_lookup("vw_TherapeuticArea", "TherapeuticAreaId", "TherapeuticAreaName")
    except SchemaLoadError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/relationships")
def get_relationships() -> dict:
    try:
        return load_relationships()
    except SchemaLoadError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
