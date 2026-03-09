import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import type { BuilderItem, BuilderState, DragPayload, LookupItem, ReportingEntity } from '../types';
import { BuilderCanvas } from './BuilderCanvas';
import { DataPanel } from './DataPanel';

const INITIAL: BuilderState = { filters: [], groupBy: [], columns: [], measures: [], header: [], footer: [] };

type ZoneKey = keyof BuilderState;

const isValidDrop = (zone: ZoneKey, item: DragPayload, entity: ReportingEntity | undefined) => {
  const field = entity?.fields.find((f) => f.id === item.fieldId);
  if (!field) return false;
  if (zone === 'filters') return field.isFilterable;
  if (zone === 'groupBy') return field.isGroupable;
  if (zone === 'columns') return true;
  if (zone === 'measures') return field.isAggregatable;
  if (zone === 'header' || zone === 'footer') return !field.isMeasure;
  return false;
};

export function ReportBuilder({ entities, lookups }: { entities: ReportingEntity[]; lookups: { dataTypes: LookupItem[]; sponsors: LookupItem[]; therapeuticAreas: LookupItem[] } }) {
  const [builder, setBuilder] = useState<BuilderState>(INITIAL);
  const entityById = useMemo(() => new Map(entities.map((e) => [e.id, e])), [entities]);

  const onDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id as ZoneKey | undefined;
    const payload = event.active.data.current as DragPayload | undefined;
    if (!overId || !payload) return;

    const entity = entityById.get(payload.entityId);
    if (!isValidDrop(overId, payload, entity)) return;

    const field = entity?.fields.find((f) => f.id === payload.fieldId);
    if (!field || !entity) return;

    const nextItem: BuilderItem = {
      id: `${overId}-${payload.type}-${payload.fieldId}-${payload.functionKey ?? 'none'}-${Date.now()}`,
      entity: entity.name,
      field: field.displayName,
      function: payload.functionKey,
      payload,
    };

    setBuilder((prev) => ({ ...prev, [overId]: [...prev[overId], nextItem] }));
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <SortableContext items={Object.values(builder).flat().map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <DataPanel entities={entities} />
          <BuilderCanvas builder={builder} lookups={lookups} />
        </div>
      </SortableContext>
    </DndContext>
  );
}
