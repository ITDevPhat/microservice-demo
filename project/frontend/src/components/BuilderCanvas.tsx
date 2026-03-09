import type { BuilderState, LookupItem } from '../types';
import { SectionFilters } from './SectionFilters';
import { SectionHeaderFooter } from './SectionHeaderFooter';
import { SectionReportBody } from './SectionReportBody';
import { SectionScope } from './SectionScope';

export function BuilderCanvas({ builder, lookups }: { builder: BuilderState; lookups: { dataTypes: LookupItem[]; sponsors: LookupItem[]; therapeuticAreas: LookupItem[] } }) {
  return (
    <section className="lg:col-span-9 space-y-4" id="configuration-root">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-slate-800 mb-3">B1 — Report Metadata</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Enter report name..." className="w-full border border-slate-300 rounded-md px-3 py-2" />
          <input type="text" placeholder="Enter description..." className="w-full border border-slate-300 rounded-md px-3 py-2" />
        </div>
      </div>
      <SectionFilters items={builder.filters} />
      <SectionScope {...lookups} />
      <SectionHeaderFooter header={builder.header} footer={builder.footer} />
      <SectionReportBody groupBy={builder.groupBy} columns={builder.columns} measures={builder.measures} />
    </section>
  );
}
