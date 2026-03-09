import { useDroppable } from '@dnd-kit/core';
import type { BuilderItem } from '../types';

interface Props {
  id: string;
  title?: string;
  items: BuilderItem[];
}

export function DropZone({ id, title, items }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div>
      {title ? <h4 className="text-sm font-medium text-slate-700 mb-2">{title}</h4> : null}
      <div ref={setNodeRef} className={`drop-zone ${isOver ? 'drag-over' : ''}`} data-zone={id}>
        {items.length === 0 && <span className="drop-placeholder">Drag fields here</span>}
        {items.map((item) => (
          <div key={item.id} className="field-tag">{item.function ? `${item.function} ` : ''}{item.entity}.{item.field}</div>
        ))}
      </div>
    </div>
  );
}
