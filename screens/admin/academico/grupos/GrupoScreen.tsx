import React from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { GenericAdminScreen } from '../components/GenericAdminScreen'
import { useAdminCrud } from '../hooks/useAdminCrud'
import { ColumnDef } from '../types/admin.types'
import { GrupoForm } from './GrupoForm'
import { grupoService } from './grupoService'
import { Grupo } from './grupo.types'

const columns: ColumnDef[] = [
  { key: 'nombre', header: 'Nombre', flex: 1 },
  { key: 'turno', header: 'Turno', width: 90 },
  { key: 'gestion', header: 'Gestión', width: 90 },
  { key: 'cupos', header: 'Cupos', width: 70 },
  { key: 'estado', header: 'Estado', width: 110, render: (val) => <StatusBadge status={val} /> },
]

export function GrupoScreen() {
  const crud = useAdminCrud<Grupo>({
    fetchAll: grupoService.getAll,
    create: grupoService.create,
    update: grupoService.update,
    delete: grupoService.delete,
    searchFields: ['nombre', 'codigo', 'gestion'],
    idField: 'idGrupo',
  })

  return (
    <GenericAdminScreen
      title="Grupos"
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
      searchPlaceholder="Buscar grupo..."
      renderForm={() => (
        <GrupoForm
          initialData={crud.selectedItem}
          onSave={crud.handleSave}
          onCancel={crud.closeModal}
        />
      )}
    />
  )
}
