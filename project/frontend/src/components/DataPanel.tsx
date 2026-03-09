import { memo, useMemo, useState } from 'react';
import type { ReportingEntity } from '../types';
import { EntityTree } from './EntityTree';

interface Props {
  entities: ReportingEntity[];
}

export const DataPanel = memo(function DataPanel({ entities }: Props) {
  const [search, setSearch] = useState('');
  const lowered = search.toLowerCase();

  const filteredEntities = useMemo(
    () =>
      entities
        .map((entity) => ({
          ...entity,
          fields: entity.fields.filter((f) => f.displayName.toLowerCase().includes(lowered)),
        }))
        .filter((e) => e.fields.length > 0 || e.name.toLowerCase().includes(lowered)),
    [entities, lowered],
  );

  return (
    <section className="lg:col-span-3 bg-[#f3f2f1] border border-slate-200 flex flex-col h-[calc(100vh-6rem)] sticky top-6">
      <div className="p-3 pb-2 pt-4">
        <h2 className="text-[15px] font-semibold text-[#252423] mb-3 px-1">Data</h2>
        <div className="relative shrink-0">
          <i className="fa-solid fa-search absolute left-2.5 top-1.5 text-[#605e5c] text-[13px]"></i>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-full border border-[#8a8886] rounded-sm pl-8 pr-2 py-1 text-[13px] text-[#252423] bg-white focus:border-[#0078d4] focus:outline-none placeholder-[#605e5c]" />
        </div>
      </div>
      <div id="schema-tree" className="flex-1 overflow-y-auto pb-4 px-2">
        {filteredEntities.map((entity) => <EntityTree key={entity.id} entity={entity} />)}
      </div>
    </section>
  );
});
