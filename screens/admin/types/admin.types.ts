import { ReactNode } from 'react';

export interface ColumnDef {
  key: string;
  header: string;
  width?: number;
  flex?: number;
  render?: (value: any, item: any) => ReactNode;
}

export interface CrudConfig<T> {
  fetchAll: () => Promise<T[]>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  delete: (id: number) => Promise<void>;
  searchFields: (keyof T)[];
  idField: keyof T;
}
