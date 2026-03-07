# MaestraVista Reporting Builder

A metadata-driven, full-stack report structure builder inspired by Power BI field panels.
It supports dragging fields from entity metadata into report configuration sections (no charts/visualization).

## Project Structure

```text
project/
 ├ backend/
 │   ├ main.py
 │   ├ database.py
 │   ├ models.py
 │   ├ schema_loader.py
 │   ├ .env
 │   └ requirements.txt
 ├ frontend/
 │   ├ index.html
 │   ├ report_builder.html
 │   ├ app.js
 │   ├ api.js
 │   └ style.css
 └ README.md
```

## Backend

### 1) Configure environment

`project/backend/.env`

```env
DB_SERVER=localhost
DB_DATABASE=MaestraVistaReporting
DB_USER=sa
DB_PASSWORD=Password123
DB_DRIVER=ODBC Driver 17 for SQL Server
```

### 2) Install and run

```bash
cd project/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### API Endpoints

- `GET /api/schema`
  - Loads metadata-driven schema from:
    - `ReportingSections`
    - `ReportingEntitySections`
    - `ReportingEntities`
    - `ReportingFields`
  - Returns: `sections -> entities -> fields`

- `GET /api/datatypes`
  - Source: `vw_DataType`

- `GET /api/sponsors`
  - Source: `vw_Sponsor`

- `GET /api/therapeutic-areas`
  - Source: `vw_TherapeuticArea`

- `GET /api/relationships`
  - Source: `ReportingRelationships`
  - Included for future UI use.

## Frontend

Serve static frontend files:

```bash
cd project/frontend
python -m http.server 5500
```

Open:

- `http://localhost:5500/index.html`
- `http://localhost:5500/report_builder.html`

## UI Behavior

- Left panel (Section A): jsTree entity/field panel from API schema.
- Right panel (Section B): report configuration blocks.
- SortableJS clone drag from tree fields to drop zones.
- Drop zones:
  - Filters
  - Header
  - Footer
  - Group By
  - Columns
- Tags render as `[Entity.Field]` and can be removed.
- Scope dropdowns load values from backend lookup endpoints.
