from typing import List

from pydantic import BaseModel


class FieldItem(BaseModel):
    key: str
    display_name: str
    datatype: str
    is_measure: bool


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
