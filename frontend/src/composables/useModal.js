/**
 * useModal composable - reusable modal open/close state with editing record
 */
import { ref, reactive } from 'vue'

export function useModal() {
  const visible = ref(false)
  const editingRecord = ref(null)

  function open(record = null) {
    editingRecord.value = record
    visible.value = true
  }

  function close() {
    visible.value = false
    editingRecord.value = null
  }

  return { visible, editingRecord, open, close }
}
