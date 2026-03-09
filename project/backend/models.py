from typing import List

from pydantic import BaseModel


class FieldItem(BaseModel):
    id: int
    entityId: int
    fieldKey: str
    displayName: str
    dataType: str
    isFilterable: bool
    isGroupable: bool
    isSortable: bool
    isAggregatable: bool
    isMeasure: bool


class EntityItem(BaseModel):
    id: int
    key: str
    name: str
    fields: List[FieldItem]


class SectionItem(BaseModel):
    id: int
    key: str
    display_name: str
    display_order: int
    entities: List[EntityItem]


class SchemaResponse(BaseModel):
    sections: List[SectionItem]


class LookupItem(BaseModel):
    id: int
    name: str


class LookupResponse(BaseModel):
    items: List[LookupItem]
