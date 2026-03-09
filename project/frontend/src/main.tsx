import ReactDOM from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';
import { fetchDataTypes, fetchSchema, fetchSponsors, fetchTherapeuticAreas } from './api';
import { ReportBuilder } from './components/ReportBuilder';
import '../style.css';
import type { ReportingEntity } from './types';

function App() {
  const [entities, setEntities] = useState<ReportingEntity[]>([]);
  const [lookups, setLookups] = useState({ dataTypes: [], sponsors: [], therapeuticAreas: [] });

  useEffect(() => {
    Promise.all([fetchSchema(), fetchDataTypes(), fetchSponsors(), fetchTherapeuticAreas()]).then(([schema, d, s, t]) => {
      const entityMap = new Map<number, ReportingEntity>();
      schema.sections.forEach((section) => {
        section.entities.forEach((entity) => {
          if (!entityMap.has(entity.id)) entityMap.set(entity.id, entity);
        });
      });
      setEntities(Array.from(entityMap.values()));
      setLookups({ dataTypes: d.items, sponsors: s.items, therapeuticAreas: t.items });
    });
  }, []);

  const hasData = useMemo(() => entities.length > 0, [entities.length]);
  return hasData ? <ReportBuilder entities={entities} lookups={lookups} /> : <div className="p-6">Loading...</div>;
}

ReactDOM.createRoot(document.getElementById('report-builder-root')!).render(<App />);
