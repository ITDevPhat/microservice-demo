import type { BuilderItem } from '../types';
import { GroupByZone } from './GroupByZone';
import { ColumnsZone } from './ColumnsZone';
import { DropZone } from './DropZone';

export function SectionReportBody({ groupBy, columns, measures }: { groupBy: BuilderItem[]; columns: BuilderItem[]; measures: BuilderItem[] }) {
  return (
    <div id="section-report-body" className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-slate-800 mb-3">B5 — Report Body</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <GroupByZone items={groupBy} />
        <ColumnsZone items={columns} />
        <DropZone id="measures" title="MEASURES" items={measures} />
      </div>
    </div>
  );
}
