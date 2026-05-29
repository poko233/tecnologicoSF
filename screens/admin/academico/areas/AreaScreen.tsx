import React from 'react'
import { GenericAdminScreen } from '../components/GenericAdminScreen'
import { StatusBadge } from '../components/StatusBadge'
import { useAdminCrud } from '../hooks/useAdminCrud'
import { ColumnDef } from '../types/admin.types'
import { Area } from './area.types'
import { AreaForm } from './AreaForm'
import { areaService } from './areaService'

const columns: ColumnDef[] = [
  { key: 'idArea', header: 'ID', width: 60 },
  { key: 'nombre', header: 'Nombre', flex: 1 },
  { key: 'descripccion', header: 'Descripción', flex: 2 },
  { key: 'estado', header: 'Estado', width: 110, render: (val) => <StatusBadge status={val} /> },
]

export function AreaScreen() {
  const crud = useAdminCrud<Area>({
    fetchAll: areaService.getAll,
    create: areaService.create,
    update: areaService.update,
    delete: areaService.delete,
    searchFields: ['nombre', 'descripccion'],
    idField: 'idArea',
  })

  return (
    <GenericAdminScreen
      title="Áreas"
      columns={columns}
      data={crud.filteredData}
      loading={crud.loading}
      onSearch={crud.setSearchText}
      onAdd={crud.openCreate}
      onEdit={crud.openEdit}
      onDelete={crud.handleDelete}
      modalVisible={crud.modalVisible}
      onCloseModal={crud.closeModal}
      selectedItem={crud.selectedItem}
      searchPlaceholder="Buscar área..."
      renderForm={() => (
        <AreaForm
          initialData={crud.selectedItem}
          onSave={crud.handleSave}
          onCancel={crud.closeModal}
        />
      )}
      itemToDelete={crud.itemToDelete}       
      onConfirmDelete={crud.confirmDelete}  
      onCancelDelete={crud.cancelDelete}  
    />
  )
}
