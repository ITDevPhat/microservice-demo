from collections import defaultdict

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from database import engine


class SchemaLoadError(Exception):
    pass


def _rows_to_lookup(rows, id_key: str, name_key: str) -> list[dict]:
    return [{"id": int(row[id_key]), "name": row[name_key]} for row in rows]


def load_schema() -> dict:
    sections_sql = text(
        """
        SELECT RS_Id, RS_SectionKey, RS_DisplayName, RS_DisplayOrder
        FROM ReportingSections
        ORDER BY RS_DisplayOrder, RS_Id
        """
    )

    entities_sql = text(
        """
        SELECT
            RES.RES_SectionId,
            RE.RE_Id,
            RE.RE_EntityKey,
            RE.RE_DisplayName,
            RES.RES_DisplayOrder
        FROM ReportingEntitySections RES
        INNER JOIN ReportingEntities RE ON RE.RE_Id = RES.RES_EntityId
        WHERE
            ISNULL(RES.RES_IsVisible, 1) = 1
            AND ISNULL(RE.RE_IsActive, 1) = 1
        ORDER BY RES.RES_SectionId, RES.RES_DisplayOrder, RE.RE_DisplayName
        """
    )

    fields_sql = text(
        """
        SELECT
            RF.RF_EntityId,
            RF.RF_FieldKey,
            RF.RF_DisplayName,
            RF.RF_DataType,
            ISNULL(RF.RF_IsMeasure, 0) AS RF_IsMeasure
        FROM ReportingFields RF
        WHERE ISNULL(RF.RF_IsActive, 1) = 1
        ORDER BY RF.RF_EntityId, RF.RF_DisplayName
        """
    )
    
    metrics_sql = text(
        """
        SELECT 
            Fn.RFn_FunctionName, 
            RF.RF_EntityId,
            RF.RF_FieldKey,
            RF.RF_DisplayName,
            RF.RF_DataType,
            ISNULL(RF.RF_IsMeasure, 0) AS RF_IsMeasure
        FROM ReportingFieldFunctions RFF
        JOIN ReportingFunctions Fn ON Fn.RFn_Id = RFF.RFF_FunctionId
        JOIN ReportingFields RF ON RF.RF_Id = RFF.RFF_FieldId
        WHERE ISNULL(RF.RF_IsActive, 1) = 1 
          AND ISNULL(Fn.RFn_IsActive, 1) = 1
        ORDER BY Fn.RFn_FunctionName, RF.RF_DisplayName
        """
    )

    try:
        with engine.connect() as connection:
            section_rows = connection.execute(sections_sql).mappings().all()
            entity_rows = connection.execute(entities_sql).mappings().all()
            field_rows = connection.execute(fields_sql).mappings().all()
            
            try:
                metric_rows = connection.execute(metrics_sql).mappings().all()
            except SQLAlchemyError:
                # If these tables don't exist yet or format is different, safely fallback to no metrics
                metric_rows = []
                
    except SQLAlchemyError as exc:
        raise SchemaLoadError(f"Unable to load reporting metadata: {exc}") from exc

    fields_by_entity: dict[int, list[dict]] = defaultdict(list)
    for row in field_rows:
        fields_by_entity[int(row["RF_EntityId"])].append(
            {
                "key": row["RF_FieldKey"],
                "display_name": row["RF_DisplayName"],
                "datatype": row["RF_DataType"] or "unknown",
                "is_measure": bool(row["RF_IsMeasure"]),
            }
        )

    metrics_by_entity: dict[int, dict[str, list[dict]]] = defaultdict(lambda: defaultdict(list))
    for row in metric_rows:
        entity_id = int(row["RF_EntityId"])
        func_name = row["RFn_FunctionName"]
        metrics_by_entity[entity_id][func_name].append(
            {
                "key": row["RF_FieldKey"],
                "display_name": row["RF_DisplayName"],
                "datatype": row["RF_DataType"] or "unknown",
                "is_measure": bool(row["RF_IsMeasure"]),
            }
        )

    entities_by_section: dict[int, list[dict]] = defaultdict(list)
    for row in entity_rows:
        entity_id = int(row["RE_Id"])
        entities_by_section[int(row["RES_SectionId"])].append(
            {
                "id": entity_id,
                "key": row["RE_EntityKey"],
                "name": row["RE_DisplayName"],
                "fields": fields_by_entity.get(entity_id, []),
                "metrics": metrics_by_entity.get(entity_id, {}),
            }
        )

    sections = []
    for row in section_rows:
        section_id = int(row["RS_Id"])
        sections.append(
            {
                "id": section_id,
                "key": row["RS_SectionKey"],
                "display_name": row["RS_DisplayName"],
                "display_order": int(row["RS_DisplayOrder"] or 0),
                "entities": entities_by_section.get(section_id, []),
            }
        )

    return {"sections": sections}


def load_lookup(view_name: str, id_column: str, name_column: str) -> dict:
    query = text(f"SELECT {id_column} AS item_id, {name_column} AS item_name FROM {view_name} ORDER BY {name_column}")

    try:
        with engine.connect() as connection:
            rows = connection.execute(query).mappings().all()
    except SQLAlchemyError as exc:
        raise SchemaLoadError(f"Unable to load lookup data from {view_name}: {exc}") from exc

    return {"items": _rows_to_lookup(rows, "item_id", "item_name")}


def load_relationships() -> dict:
    query = text(
        """
        SELECT RR_ParentEntityId, RR_ChildEntityId, RR_JoinCondition, RR_JoinType
        FROM ReportingRelationships
        """
    )

    try:
        with engine.connect() as connection:
            rows = connection.execute(query).mappings().all()
    except SQLAlchemyError as exc:
        raise SchemaLoadError(f"Unable to load reporting relationships: {exc}") from exc

    return {
        "relationships": [
            {
                "parent_entity_id": int(r["RR_ParentEntityId"]),
                "child_entity_id": int(r["RR_ChildEntityId"]),
                "join_condition": r["RR_JoinCondition"],
                "join_type": r["RR_JoinType"],
            }
            for r in rows
        ]
    }
