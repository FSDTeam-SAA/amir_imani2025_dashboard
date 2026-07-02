import { useState, useCallback } from 'react'
import type { ViewMode, SortField, SortOrder } from '@/lib/types/qr-code'

interface UseDashboardStateOptions {
  initialPage?: number
  initialPageSize?: number
  initialViewMode?: ViewMode
}

export function useQRCodeState({
  initialPage = 1,
  initialPageSize = 10,
  initialViewMode = 'list',
}: UseDashboardStateOptions = {}) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [selectedQRId, setSelectedQRId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const resetPagination = useCallback(() => {
    setPage(1)
  }, [])

  const toggleSort = useCallback((field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    resetPagination()
  }, [sortBy, sortOrder, resetPagination])

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleSort,
    viewMode,
    setViewMode,
    selectedQRId,
    setSelectedQRId,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    resetPagination,
  }
}
