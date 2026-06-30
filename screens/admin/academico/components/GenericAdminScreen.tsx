import { useTheme } from '@theme'
import React from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { GenericAdminScreenProps } from '../types/admin.types'
import { AdminCard } from './AdminCard'
import { AdminModal } from './AdminModal'
import { AdminTable } from './AdminTable'
import { SearchBar } from './SearchBar'

export function GenericAdminScreen({
  title,
  columns,
  data,
  loading,
  onSearch,
  onAdd,
  onEdit,
  onDelete,
  renderForm,
  modalVisible,
  onCloseModal,
  selectedItem,
  searchPlaceholder = 'Buscar...',
  itemToDelete,        
  onConfirmDelete,     
  onCancelDelete, 
  saveError,
}: GenericAdminScreenProps) {
  const { theme } = useTheme()
  const { width } = useWindowDimensions()
  const isDesktop = width >= 768

  const [searchText, setSearchText] = React.useState('')

  const handleSearch = (text: string) => {
    setSearchText(text)
    onSearch(text)
  }

  const modalTitle = selectedItem
    ? `Editar ${title.replace(/s$/, '')}`
    : `Crear ${title.replace(/s$/, '')}`

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{title}</Text>
        <Pressable
          onPress={onAdd}
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.addBtnText, { color: theme.colors.primaryForeground }]}>
            + Nuevo
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Buscador */}
        <SearchBar
          value={searchText}
          onChangeText={handleSearch}
          placeholder={searchPlaceholder}
        />

        {/* Loading */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.border }]}>Cargando...</Text>
          </View>
        )}

        {/* Empty */}
        {!loading && data.length === 0 && (
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: theme.colors.border }]}>
              {searchText ? 'No se encontraron resultados' : 'No hay registros aún'}
            </Text>
          </View>
        )}

        {/* Lista (móvil) o Tabla (desktop) */}
        {!loading && data.length > 0 && (
          isDesktop ? (
            <AdminTable
              columns={columns}
              data={data}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : (
            <FlatList
              data={data}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <AdminCard
                  item={item}
                  columns={columns}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
              showsVerticalScrollIndicator={false}
            />
          )
        )}
      </View>

      {/* Modal */}
      <AdminModal
        visible={modalVisible}
        title={modalTitle}
        onClose={onCloseModal}
        saveError={saveError} 
      >
        {!!saveError && (
          <View style={{
            backgroundColor: '#FEE2E2',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}>
            <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '600' }}>
              {saveError}
            </Text>
          </View>
        )}
        {renderForm()}
      </AdminModal>
      <Modal
        visible={!!itemToDelete}
        transparent
        animationType="fade"
        onRequestClose={onCancelDelete}
      >
        <View style={styles.overlay}>
          <View style={[styles.deleteModal, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.deleteTitle, { color: theme.colors.text }]}>
              Eliminar registro
            </Text>
            <Text style={[styles.deleteMessage, { color: theme.colors.text }]}>
              ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                onPress={onCancelDelete}
                style={[styles.deleteBtn, { backgroundColor: theme.colors.border }]}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirmDelete}
                style={[styles.deleteBtn, { backgroundColor: '#ef4444' }]}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  addBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 9 },
  addBtnText: { fontSize: 14, fontWeight: '700' },
  content: { 
    flex: 1, 
    padding: 16, 
    paddingBottom: 24, 
    maxWidth: 1100, 
    alignSelf: 'center', 
    width: '100%',
    paddingHorizontal: 16,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyText: { fontSize: 15 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deleteModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 14,
    padding: 24,
    gap: 16,
  },
  deleteTitle: { fontSize: 18, fontWeight: '700' },
  deleteMessage: { fontSize: 14, lineHeight: 20, opacity: 0.75 },
  deleteActions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  deleteBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
})
