import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Download,
  CheckSquare,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { mockFindings, Finding } from "@/lib/mock-data"
import { exportFindingsCSV } from "@/lib/export-csv"
import { useFindingsFilters } from "@/hooks/useFindingsFilters"
import { FindingsFilterBar } from "@/components/findings/FindingsFilterBar"
import { FindingsTable } from "@/components/findings/FindingsTable"
import { FindingsPagination } from "@/components/findings/FindingsPagination"
import { cn } from "@/lib/utils"
import { STATUS_CONFIG, SEVERITY_COLORS } from "@/lib/finding-constants"

export function FindingsExplorer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = React.useState(true)
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const {
    searchQuery, setSearchQuery,
    activeStatusFilters, setActiveStatusFilters,
    activeSeverityFilters, setActiveSeverityFilters,
    activeSourceFilters, setActiveSourceFilters,
    activeWcagFilters, setActiveWcagFilters,
    activePageUrlFilters, setActivePageUrlFilters,
    clearAllFilters,
    sortField, sortDirection, handleSort,
    filteredFindings,
    paginatedFindings,
    currentPage, setCurrentPage, totalPages, rowsPerPage,
    selectedRows, toggleSelectAll, toggleSelectRow,
    focusedRowIndex, handleTableKeyDown,
    uniqueWcag, uniquePageUrls,
  } = useFindingsFilters({ findings: mockFindings })

  const handleExport = (findingsToExport: Finding[]) => {
    exportFindingsCSV(findingsToExport, id || "unknown")
    toast(`Exported ${findingsToExport.length} findings`, 'success')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <Card className="sticky top-0 z-10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24" />
                ))}
              </div>
              <Skeleton className="h-8 w-full sm:w-64" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-4 p-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Findings Explorer</h1>
          <p className="text-sm text-muted-foreground" role="status">
            Showing {filteredFindings.length} of {mockFindings.length} findings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 mr-2 border-r pr-4">
              <span className="text-sm font-medium">{selectedRows.size} selected</span>
              <Button variant="outline" size="sm" onClick={() => handleExport(filteredFindings.filter(f => selectedRows.has(f.id)))}>
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </Button>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => handleExport(filteredFindings)}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          {selectedRows.size > 0 && (
            <Button size="sm">
              <CheckSquare className="mr-2 h-4 w-4" />
              Mark for Review
            </Button>
          )}
        </div>
      </div>

      <Card className="sticky top-0 z-10 shadow-sm">
        <FindingsFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeStatusFilters={activeStatusFilters}
          setActiveStatusFilters={setActiveStatusFilters}
          activeSeverityFilters={activeSeverityFilters}
          setActiveSeverityFilters={setActiveSeverityFilters}
          activeSourceFilters={activeSourceFilters}
          setActiveSourceFilters={setActiveSourceFilters}
          activeWcagFilters={activeWcagFilters}
          setActiveWcagFilters={setActiveWcagFilters}
          activePageUrlFilters={activePageUrlFilters}
          setActivePageUrlFilters={setActivePageUrlFilters}
          clearAllFilters={clearAllFilters}
          setCurrentPage={setCurrentPage}
          uniqueWcag={uniqueWcag}
          uniquePageUrls={uniquePageUrls}
          statusConfig={STATUS_CONFIG}
          severityColors={SEVERITY_COLORS}
        />
      </Card>

      <Card className="overflow-hidden">
        <FindingsTable
          findings={paginatedFindings}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          selectedRows={selectedRows}
          toggleSelectAll={toggleSelectAll}
          toggleSelectRow={toggleSelectRow}
          focusedRowIndex={focusedRowIndex}
          onRowClick={(finding) => navigate(`/audit/${id}/finding/${finding.id}`)}
          handleTableKeyDown={(e) => handleTableKeyDown(e, (f) => navigate(`/audit/${id}/finding/${f.id}`))}
          statusConfig={STATUS_CONFIG}
          severityColors={SEVERITY_COLORS}
          onClearFilters={clearAllFilters}
        />
        
        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y">
          {paginatedFindings.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12 px-4 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground" />
              <h2 className="text-lg font-semibold">No findings match filters</h2>
              <Button variant="outline" onClick={clearAllFilters} className="mt-2">
                Clear Filters
              </Button>
            </div>
          ) : (
            paginatedFindings.map((finding) => {
              const config = STATUS_CONFIG[finding.status]
              const StatusIcon = config.icon
              return (
                <div 
                  key={finding.id} 
                  className="p-4 space-y-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/audit/${id}/finding/${finding.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", config.bg, config.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </div>
                    <Badge variant="secondary" className={cn("text-[10px] font-semibold", SEVERITY_COLORS[finding.severity])}>
                      {finding.severity}
                    </Badge>
                  </div>
                  <div className="font-mono text-xs font-bold">{finding.ruleId}</div>
                  <div className="text-xs text-muted-foreground truncate">{finding.pageUrl}</div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1">
                      {finding.wcag.slice(0, 2).map(c => (
                        <Badge key={c} variant="outline" className="text-[9px] px-1 h-4">{c}</Badge>
                      ))}
                      {finding.wcag.length > 2 && <span className="text-[9px] text-muted-foreground">+{finding.wcag.length - 2}</span>}
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground">
                      {finding.source}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <FindingsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={filteredFindings.length}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  )
}
