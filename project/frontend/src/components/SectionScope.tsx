import type { LookupItem } from '../types';

export function SectionScope({ dataTypes, sponsors, therapeuticAreas }: { dataTypes: LookupItem[]; sponsors: LookupItem[]; therapeuticAreas: LookupItem[] }) {
  return (
    <div id="section-scope" className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-slate-800 mb-3">B3 — Scope</h3>
      <div className="grid md:grid-cols-3 gap-3">
        <select className="border border-slate-300 rounded-md px-3 py-2"><option>Select Data Type</option>{dataTypes.map((i) => <option key={i.id}>{i.name}</option>)}</select>
        <select className="border border-slate-300 rounded-md px-3 py-2"><option>Select Sponsor</option>{sponsors.map((i) => <option key={i.id}>{i.name}</option>)}</select>
        <select className="border border-slate-300 rounded-md px-3 py-2"><option>Select Therapeutic Area</option>{therapeuticAreas.map((i) => <option key={i.id}>{i.name}</option>)}</select>
      </div>
    </div>
  );
}
