import * as React from "react"
import { Finding, FindingStatus, Severity, FindingSource } from "@/lib/mock-data"

export type SortField = keyof Finding | ""
export type SortDirection = "asc" | "desc"

interface UseFindingsFiltersOptions {
  findings: Finding[]
  defaultRowsPerPage?: number
  prefilter?: Partial<{
    status: Set<FindingStatus>
    severity: Set<Severity>
    source: Set<FindingSource>
    wcag: Set<string>
    pageUrl: Set<string>
  }>
}

export function useFindingsFilters({
  findings,
  defaultRowsPerPage = 25,
  prefilter,
}: UseFindingsFiltersOptions) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortField, setSortField] = React.useState<SortField>("")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = React.useState(1)
  
  const [activeStatusFilters, setActiveStatusFilters] = React.useState<Set<FindingStatus>>(
    prefilter?.status || new Set()
  )
  const [activeSeverityFilters, setActiveSeverityFilters] = React.useState<Set<Severity>>(
    prefilter?.severity || new Set()
  )
  const [activeSourceFilters, setActiveSourceFilters] = React.useState<Set<FindingSource>>(
    prefilter?.source || new Set()
  )
  const [activeWcagFilters, setActiveWcagFilters] = React.useState<Set<string>>(
    prefilter?.wcag || new Set()
  )
  const [activePageUrlFilters, setActivePageUrlFilters] = React.useState<Set<string>>(
    prefilter?.pageUrl || new Set()
  )

  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
  const [focusedRowIndex, setFocusedRowIndex] = React.useState<number>(-1)

  const rowsPerPage = defaultRowsPerPage

  const handleSort = (field: keyof Finding) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredFindings = React.useMemo(() => {
    return findings.filter((finding) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          finding.ruleId.toLowerCase().includes(query) ||
          finding.elementHash.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      if (activeStatusFilters.size > 0 && !activeStatusFilters.has(finding.status)) {
        return false
      }

      if (activeSeverityFilters.size > 0 && !activeSeverityFilters.has(finding.severity)) {
        return false
      }

      if (activeSourceFilters.size > 0 && !activeSourceFilters.has(finding.source)) {
        return false
      }

      if (activeWcagFilters.size > 0) {
        const matchesWcag = finding.wcag.some(c => activeWcagFilters.has(c))
        if (!matchesWcag) return false
      }

      if (activePageUrlFilters.size > 0 && !activePageUrlFilters.has(finding.pageUrl)) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (!sortField) return 0
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal === bVal) return 0
      if (aVal === undefined) return 1
      if (bVal === undefined) return -1
      
      const modifier = sortDirection === "asc" ? 1 : -1
      return aVal < bVal ? -1 * modifier : 1 * modifier
    })
  }, [
    findings,
    searchQuery,
    sortField,
    sortDirection,
    activeStatusFilters,
    activeSeverityFilters,
    activeSourceFilters,
    activeWcagFilters,
    activePageUrlFilters,
  ])

  const totalPages = Math.ceil(filteredFindings.length / rowsPerPage)
  const paginatedFindings = filteredFindings.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  const clearAllFilters = () => {
    setSearchQuery("")
    setActiveStatusFilters(new Set())
    setActiveSeverityFilters(new Set())
    setActiveSourceFilters(new Set())
    setActiveWcagFilters(new Set())
    setActivePageUrlFilters(new Set())
    setCurrentPage(1)
  }

  const hasActiveFilters = 
    searchQuery !== "" ||
    activeStatusFilters.size > 0 ||
    activeSeverityFilters.size > 0 ||
    activeSourceFilters.size > 0 ||
    activeWcagFilters.size > 0 ||
    activePageUrlFilters.size > 0

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedFindings.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedFindings.map((f) => f.id)))
    }
  }

  const toggleSelectRow = (e: React.MouseEvent, rowId: string) => {
    e.stopPropagation()
    const newSelected = new Set(selectedRows)
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId)
    } else {
      newSelected.add(rowId)
    }
    setSelectedRows(newSelected)
  }

  const handleTableKeyDown = (e: React.KeyboardEvent, onRowAction?: (finding: Finding) => void) => {
    if (paginatedFindings.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedRowIndex(prev => (prev < paginatedFindings.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedRowIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter' && focusedRowIndex >= 0) {
      e.preventDefault()
      const finding = paginatedFindings[focusedRowIndex]
      if (onRowAction && finding) onRowAction(finding)
    }
  }

  const uniqueWcag = React.useMemo(() => {
    const wcagSet = new Set<string>()
    findings.forEach(f => f.wcag.forEach(c => wcagSet.add(c)))
    return Array.from(wcagSet).sort()
  }, [findings])

  const uniquePageUrls = React.useMemo(() => {
    const urlSet = new Set<string>()
    findings.forEach(f => urlSet.add(f.pageUrl))
    return Array.from(urlSet).sort()
  }, [findings])

  return {
    searchQuery, setSearchQuery,
    activeStatusFilters, setActiveStatusFilters,
    activeSeverityFilters, setActiveSeverityFilters,
    activeSourceFilters, setActiveSourceFilters,
    activeWcagFilters, setActiveWcagFilters,
    activePageUrlFilters, setActivePageUrlFilters,
    clearAllFilters,
    hasActiveFilters,
    sortField, setSortField, sortDirection, setSortDirection, handleSort,
    filteredFindings,
    paginatedFindings,
    currentPage, setCurrentPage, totalPages, rowsPerPage,
    selectedRows, setSelectedRows, toggleSelectAll, toggleSelectRow,
    focusedRowIndex, setFocusedRowIndex, handleTableKeyDown,
    uniqueWcag, uniquePageUrls,
  }
}
