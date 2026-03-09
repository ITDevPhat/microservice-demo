import { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { DragPayload, ReportingField } from '../types';

interface Props {
  entityId: number;
  functionKey: string;
  field: ReportingField;
}

export const MeasureItem = memo(function MeasureItem({ entityId, functionKey, field }: Props) {
  const payload: DragPayload = { type: 'MEASURE', fieldId: field.id, entityId, functionKey };
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `measure-${functionKey}-${field.id}`,
    data: payload,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }}
      className="field-item flex items-center gap-2 py-0.5 metric"
      {...listeners}
      {...attributes}
    >
      <i className="fa-solid fa-calculator text-[14px] text-[#605e5c]"></i>
      <span className="field-name-text text-sm">{field.displayName}</span>
    </div>
  );
});
