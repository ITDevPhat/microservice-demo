import { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { DragPayload, ReportingField } from '../types';

interface Props {
  entityId: number;
  field: ReportingField;
}

export const FieldItem = memo(function FieldItem({ entityId, field }: Props) {
  const payload: DragPayload = { type: 'FIELD', fieldId: field.id, entityId };
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `field-${field.id}`,
    data: payload,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }}
      className="field-item flex items-center gap-2 py-0.5"
      {...listeners}
      {...attributes}
    >
      <i className="fa-regular fa-square text-[14px] text-[#605e5c] opacity-80"></i>
      <span className="field-name-text text-sm">{field.displayName}</span>
    </div>
  );
});
