import React from 'react'
import { GenericAdminScreen } from '../components/GenericAdminScreen'
import { StatusBadge } from '../components/StatusBadge'
import { useAdminCrud } from '../hooks/useAdminCrud'
import { ColumnDef } from '../types/admin.types'
import { Materia } from './materia.types'
import { MateriaForm } from './MateriaForm'
import { materiaService } from './materiaService'

const columns: ColumnDef[] = [
  { key: 'codigo', header: 'Código', width: 90 },
  { key: 'nombreMateria', header: 'Materia', flex: 2 },
  { key: 'semestre', header: 'Semestre', width: 90 },
  { key: 'estado', header: 'Estado', width: 110, render: (val) => <StatusBadge status={val} /> },
]

export function MateriaScreen() {
  const crud = useAdminCrud<Materia>({
    fetchAll: materiaService.getAll,
    create: materiaService.create,
    update: materiaService.update,
    delete: materiaService.delete,
    searchFields: ['nombreMateria', 'codigo'],
    idField: 'idMateria',
  })

  return (
    <GenericAdminScreen
      title="Materias"
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
      searchPlaceholder="Buscar materia..."
      renderForm={() => (
        <MateriaForm
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
