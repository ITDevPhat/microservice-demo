export interface ReportingField {
  id: number;
  entityId: number;
  fieldKey: string;
  displayName: string;
  dataType: string;
  isFilterable: boolean;
  isGroupable: boolean;
  isSortable: boolean;
  isAggregatable: boolean;
  isMeasure: boolean;
}

export interface ReportingEntity {
  id: number;
  key: string;
  name: string;
  fields: ReportingField[];
}

export interface ReportingSection {
  id: number;
  key: string;
  display_name: string;
  display_order: number;
  entities: ReportingEntity[];
}

export interface SchemaResponse {
  sections: ReportingSection[];
}

export interface LookupItem {
  id: number;
  name: string;
}

export type DragItemType = 'FIELD' | 'MEASURE';

export interface DragPayload {
  type: DragItemType;
  fieldId: number;
  entityId: number;
  functionKey?: string;
}

export interface BuilderItem {
  id: string;
  entity: string;
  field: string;
  function?: string;
  payload: DragPayload;
}

export interface BuilderState {
  filters: BuilderItem[];
  groupBy: BuilderItem[];
  columns: BuilderItem[];
  measures: BuilderItem[];
  header: BuilderItem[];
  footer: BuilderItem[];
}
