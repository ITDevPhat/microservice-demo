import type { BuilderItem } from '../types';
import { DropZone } from './DropZone';

export function GroupByZone({ items }: { items: BuilderItem[] }) {
  return <DropZone id="groupBy" title="GROUP BY" items={items} />;
}
