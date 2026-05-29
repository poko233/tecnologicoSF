import { ReactNode } from 'react'

export interface ColumnDef {
  key: string
  header: string
  width?: number
  flex?: number
  render?: (value: any, item: any) => ReactNode
}

export interface CrudConfig<T> {
  fetchAll: () => Promise<T[]>
  create: (data: Partial<T>) => Promise<T>
  update: (id: number, data: Partial<T>) => Promise<T>
  delete: (id: number) => Promise<void>
  searchFields: (keyof T)[]
  idField: keyof T
}

export interface GenericAdminScreenProps {
  title: string
  columns: ColumnDef[]
  data: any[]
  loading: boolean
  onSearch: (text: string) => void
  onAdd: () => void
  onEdit: (item: any) => void
  onDelete: (item: any) => void
  renderForm: () => ReactNode
  modalVisible: boolean
  onCloseModal: () => void
  selectedItem: any | null
  searchPlaceholder?: string
  itemToDelete?: any | null       
  onConfirmDelete?: () => void 
  onCancelDelete?: () => void 
}
