import { useTheme } from '@theme'
import React from 'react'
import { Text, View } from 'react-native'
import { GenericAdminScreen } from '../components/GenericAdminScreen'
import { StatusBadge } from '../components/StatusBadge'
import { useAdminCrud } from '../hooks/useAdminCrud'
import { ColumnDef } from '../types/admin.types'
import { Materia } from './materia.types'
import { MateriaForm } from './MateriaForm'
import { materiaService } from './materiaService'

export function MateriaScreen() {
  const { theme } = useTheme()

  const columns: ColumnDef[] = [
    { key: 'codigo', header: 'Código', width: 90 },
    { key: 'nombreMateria', header: 'Materia', flex: 2 },
    { key: 'semestre', header: 'Semestre', width: 90 },
    {
      key: 'carreras',
      header: 'Carreras',
      width: 200,
      render: (val: any) => {
        if (!val || !Array.isArray(val) || val.length === 0) {
          return (
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontStyle: 'italic' }}>
              Sin carrera
            </Text>
          )
        }

        const truncate = (str: string, maxLen: number = 20) => {
          return str.length > maxLen ? str.substring(0, maxLen) + '...' : str
        }

        // Mostrar máximo 3 carreras, el resto como "+X"
        const maxVisible = 3
        const visibleCarreras = val.slice(0, maxVisible)
        const remaining = val.length - maxVisible

        return (
          <View style={{ height: 60, justifyContent: 'center', paddingVertical: 2 }}>
            {visibleCarreras.map((c: any, idx: number) => (
              <Text
                key={idx}
                style={{
                  fontSize: 11,
                  color: theme.colors.text,
                  lineHeight: 16,
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {truncate(c.nombreCarrera, 22)}
              </Text>
            ))}
            {remaining > 0 && (
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.primary,
                  fontWeight: '600',
                  marginTop: 2,
                }}
              >
                +{remaining} más
              </Text>
            )}
          </View>
        )
      },
    },
    {
      key: 'fecha_inicio',
      header: 'Fecha Inicio',
      width: 120,
      render: (val: any) => {
        if (!val) {
          return (
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontStyle: 'italic' }}>
              --
            </Text>
          )
        }
        const [year, month, day] = val.split('-')
        return (
          <Text style={{ fontSize: 13, color: theme.colors.text }}>
            {`${day}/${month}/${year}`}
          </Text>
        )
      },
    },
    {
      key: 'fecha_fin',
      header: 'Fecha Fin',
      width: 120,
      render: (val: any) => {
        if (!val) {
          return (
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontStyle: 'italic' }}>
              --
            </Text>
          )
        }
        const [year, month, day] = val.split('-')
        return (
          <Text style={{ fontSize: 13, color: theme.colors.text }}>
            {`${day}/${month}/${year}`}
          </Text>
        )
      },
    },
    { key: 'estado', header: 'Estado', width: 110, render: (val) => <StatusBadge status={val} /> },
  ]

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
      saveError={crud.saveError}
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