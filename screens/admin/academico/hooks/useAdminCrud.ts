import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [itemToDelete, setItemToDelete] = useState<T | null>(null) // 👈 nuevo

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

  // Solo guarda qué item se quiere borrar — el modal lo muestra la UI
  const handleDelete = (item: T) => {
    setItemToDelete(item)
  }

  // Lo llama el botón "Confirmar" del modal de confirmación
  const confirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete[idField] as number
    try {
      await deleteFn(id)
      Toast.show({ type: 'success', text1: 'Eliminado correctamente' })
      refresh()
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'No se pudo eliminar' })
    } finally {
      setItemToDelete(null)
    }
  }

  // Lo llama el botón "Cancelar" del modal de confirmación
  const cancelDelete = () => setItemToDelete(null)

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
    confirmDelete,   
    cancelDelete,    
    itemToDelete,   
    handleSave,
    refresh,
  }
}