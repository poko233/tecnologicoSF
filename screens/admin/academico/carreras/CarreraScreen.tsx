import React from 'react'
import { GenericAdminScreen } from '../components/GenericAdminScreen'
import { StatusBadge } from '../components/StatusBadge'
import { useAdminCrud } from '../hooks/useAdminCrud'
import { ColumnDef } from '../types/admin.types'
import { Carrera } from './carrera.types'
import { CarreraForm } from './CarreraForm'
import { carreraService } from './carreraService'

const columns: ColumnDef[] = [
  { key: 'codigo', header: 'Código', width: 90 },
  { key: 'nombreCarrera', header: 'Carrera', flex: 2 },
  { key: 'regimen', header: 'Régimen', width: 100 },
  { key: 'costo', header: 'Costo (Bs.)', width: 110, render: (val) => {
    const React2 = require('react')
    const { Text } = require('react-native')
    return React2.createElement(Text, { style: { fontWeight: '600' } }, `Bs. ${Number(val).toLocaleString()}`)
  }},
  { key: 'estadoCarrera', header: 'Estado', width: 110, render: (val) => <StatusBadge status={val} /> },
]

export function CarreraScreen() {
  const crud = useAdminCrud<Carrera>({
    fetchAll: carreraService.getAll,
    create: carreraService.create,
    update: carreraService.update,
    delete: carreraService.delete,
    searchFields: ['nombreCarrera', 'codigo', 'tipo'],
    idField: 'idCarrera',
  })

  return (
    <GenericAdminScreen
      title="Carreras"
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
      searchPlaceholder="Buscar carrera..."
      renderForm={() => (
        <CarreraForm
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
