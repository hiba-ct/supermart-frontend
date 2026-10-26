// src/types/tanstack-table.d.ts

import '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    removeRow?: (rowIndex: number) => void;
  }
}
