import type { BuilderItem } from '../types';
import { DropZone } from './DropZone';

export function SectionHeaderFooter({ header, footer }: { header: BuilderItem[]; footer: BuilderItem[] }) {
  return (
    <div id="section-header-footer" className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-slate-800 mb-2">B4 — Header and Footer</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <DropZone id="header" title="Header" items={header} />
        <DropZone id="footer" title="Footer" items={footer} />
      </div>
    </div>
  );
}
