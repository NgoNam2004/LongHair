/**
 * useTable composable - reusable table logic with pagination, search, loading
 * @param {Function} fetchFn - async function that fetches data
 * @param {Object} defaultParams - default query params
 */
import { ref, reactive } from 'vue'

export function useTable(fetchFn, defaultParams = {}) {
  const loading = ref(false)
  const data = ref([])
  const total = ref(0)
  const params = reactive({
    page: 1,
    pageSize: 10,
    ...defaultParams,
  })

  async function load(extraParams = {}) {
    loading.value = true
    try {
      const res = await fetchFn({ ...params, ...extraParams })
      data.value = res.data || res
      total.value = res.total || (res.data?.length ?? 0)
    } catch (err) {
      console.error('useTable fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  function onTableChange(pagination) {
    params.page = pagination.current
    params.pageSize = pagination.pageSize
    load()
  }

  function resetParams() {
    Object.assign(params, { page: 1, ...defaultParams })
    load()
  }

  return { loading, data, total, params, load, onTableChange, resetParams }
}
