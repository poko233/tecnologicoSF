import { useTheme } from '@theme'
import React, { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'

interface Props {
  visible: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function AdminModal({ visible, title, onClose, children }: Props) {
  const { theme } = useTheme()
  const { width } = useWindowDimensions()
  const isDesktop = width >= 768

  if (isDesktop) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable
            style={[styles.desktopModal, { backgroundColor: theme.colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{title}</Text>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: theme.colors.border }]}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.fullscreen, { backgroundColor: theme.colors.background }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalHeader, {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.card,
          }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: theme.colors.text }]}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            style={{ flex: 1, padding: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopModal: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 16,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  fullscreen: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 20, fontWeight: '300' },
  modalBody: { padding: 20, maxHeight: 500 },
})
