import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'
import { CrudConfig } from '../types/admin.types'

export function useAdminCrud<T extends Record<string, any>>(config: CrudConfig<T>) {
  const { fetchAll, create, update, delete: deleteFn, searchFields, idField } = config

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [saving, setSaving] = useState(false)

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return data
    const term = searchText.toLowerCase()
    return data.filter((item) =>
      searchFields.some((field) => {
        const val = item[field]
        return val != null && String(val).toLowerCase().includes(term)
      })
    )
  }, [data, searchText, searchFields])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAll()
      setData(result)
    } catch (e: any) {
      const msg = e?.message || 'Error al cargar datos'
      setError(msg)
      Toast.show({ type: 'error', text1: 'Error', text2: msg })
    } finally {
      setLoading(false)
    }
  }, [fetchAll])

  useEffect(() => { refresh() }, [refresh])

  const openCreate = () => {
    setSelectedItem(null)
    setModalVisible(true)
  }

  const openEdit = (item: T) => {
    setSelectedItem(item)
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setSelectedItem(null)
  }

  const handleDelete = (item: T) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFn(item[idField] as number)
              Toast.show({ type: 'success', text1: 'Eliminado correctamente' })
              refresh()
            } catch (e: any) {
              Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'No se pudo eliminar' })
            }
          },
        },
      ]
    )
  }

  const handleSave = async (formData: Partial<T>) => {
    setSaving(true)
    try {
      if (selectedItem) {
        await update(selectedItem[idField] as number, formData)
        Toast.show({ type: 'success', text1: 'Actualizado correctamente' })
      } else {
        await create(formData)
        Toast.show({ type: 'success', text1: 'Creado correctamente' })
      }
      closeModal()
      refresh()
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'No se pudo guardar' })
    } finally {
      setSaving(false)
    }
  }

  return {
    data,
    loading,
    error,
    searchText,
    setSearchText,
    filteredData,
    modalVisible,
    selectedItem,
    saving,
    openCreate,
    openEdit,
    closeModal,
    handleDelete,
    handleSave,
    refresh,
  }
}
