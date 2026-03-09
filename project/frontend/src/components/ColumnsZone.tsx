import type { BuilderItem } from '../types';
import { DropZone } from './DropZone';

export function ColumnsZone({ items }: { items: BuilderItem[] }) {
  return <DropZone id="columns" title="COLUMNS" items={items} />;
}
