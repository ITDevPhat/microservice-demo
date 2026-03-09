import { memo, useMemo } from 'react';
import type { ReportingEntity } from '../types';
import { FieldItem } from './FieldItem';
import { MeasureItem } from './MeasureItem';

interface Props {
  entity: ReportingEntity;
}

const FUNCTIONS = ['SUM', 'MAX', 'MIN', 'COUNT', 'AVG'];

export const EntityTree = memo(function EntityTree({ entity }: Props) {
  const aggregatableFields = useMemo(
    () => entity.fields.filter((f) => f.isAggregatable),
    [entity.fields],
  );

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1"><i className="fa-solid fa-border-all text-[15px] text-[#3b3a39]"></i>{entity.name}</div>
      <div className="pl-4 space-y-1">
        {entity.fields.map((field) => (
          <FieldItem key={field.id} entityId={entity.id} field={field} />
        ))}
        <div>
          <div className="font-medium text-[#605e5c] text-sm mt-2">Measures</div>
          {FUNCTIONS.map((func) => (
            <div key={func} className="pl-2">
              <div className="text-sm text-[#252423]">{func}</div>
              {aggregatableFields.map((field) => (
                <MeasureItem key={`${func}-${field.id}`} entityId={entity.id} functionKey={func} field={field} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
