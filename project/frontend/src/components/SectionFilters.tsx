import type { BuilderItem } from '../types';
import { DropZone } from './DropZone';

export function SectionFilters({ items }: { items: BuilderItem[] }) {
  return (
    <div id="section-filter" className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-slate-800 mb-3">B2 — Filters</h3>
      <DropZone id="filters" items={items} />
    </div>
  );
}
