import React from 'react'
import { GenericAdminScreen } from '../components/GenericAdminScreen'
import { StatusBadge } from '../components/StatusBadge'
import { useAdminCrud } from '../hooks/useAdminCrud'
import { ColumnDef } from '../types/admin.types'
import { Grupo } from './grupo.types'
import { GrupoForm } from './GrupoForm'
import { grupoService } from './grupoService'

const columns: ColumnDef[] = [
  { key: 'nombre', header: 'Nombre', flex: 1 },
  { key: 'codigo', header: 'Código', width: 100 },
  { key: 'paralelo', header: 'Paralelo', width: 80 },
  { key: 'turno', header: 'Turno', width: 90 },
  { key: 'hora_inicio', header: 'Inicio', width: 80 },
  { key: 'hora_fin', header: 'Fin', width: 80 },
  { key: 'gestion', header: 'Gestión', width: 90 },
  { key: 'cupos', header: 'Cupos', width: 70 },
  { key: 'tipo', header: 'Tipo', width: 90 },
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
