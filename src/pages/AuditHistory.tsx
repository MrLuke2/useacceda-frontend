import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  X,
  ScanSearch,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { AuditHistoryEntry, AuditTrigger, AuditStatus } from "@/lib/mock-data"
import { useAuditStore } from "@/store/useAuditStore"
import { cn } from "@/lib/utils"

type SortField = keyof AuditHistoryEntry | ""
type SortDirection = "asc" | "desc"

import { FindingsPagination } from "@/components/findings/FindingsPagination"

export function AuditHistory() {
  const navigate = useNavigate()
  
  const { audits, isLoading, fetchAudits } = useAuditStore()
  
  React.useEffect(() => {
    fetchAudits()
  }, [fetchAudits])

  const [searchQuery, setSearchQuery] = React.useState("")
  const [triggerFilter, setTriggerFilter] = React.useState<AuditTrigger | "All">("All")
  const [statusFilter, setStatusFilter] = React.useState<AuditStatus | "All">("All")
  const [sortField, setSortField] = React.useState<SortField>("timestamp")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [focusedRowIndex, setFocusedRowIndex] = React.useState<number>(-1)
  const [selectedAudits, setSelectedAudits] = React.useState<Set<string>>(new Set())
  const [showComparison, setShowComparison] = React.useState(false)
  
  const rowsPerPage = 20

  const handleSort = (field: keyof AuditHistoryEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredAndSorted = React.useMemo(() => {
    let result = [...audits]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (a) => a.id.toLowerCase().includes(query) || a.rootUrl.toLowerCase().includes(query)
      )
    }

    if (triggerFilter !== "All") {
      result = result.filter((a) => a.trigger === triggerFilter)
    }

    if (statusFilter !== "All") {
      result = result.filter((a) => a.status === statusFilter)
    }

    result.sort((a, b) => {
      if (!sortField) return 0
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal === bVal) return 0
      if (aVal === null) return 1
      if (bVal === null) return -1
      
      const modifier = sortDirection === "asc" ? 1 : -1
      return aVal < bVal ? -1 * modifier : 1 * modifier
    })

    return result
  }, [searchQuery, triggerFilter, statusFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSorted.length / rowsPerPage)
  const paginatedAudits = filteredAndSorted.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    if (paginatedAudits.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedRowIndex(prev => (prev < paginatedAudits.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedRowIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter' && focusedRowIndex >= 0) {
      e.preventDefault()
      const audit = paginatedAudits[focusedRowIndex]
      if (audit) navigate(`/audit/${audit.id}`)
    }
  }

  const toggleSelectAudit = (e: React.MouseEvent, auditId: string) => {
    e.stopPropagation()
    const newSelected = new Set(selectedAudits)
    if (newSelected.has(auditId)) {
      newSelected.delete(auditId)
    } else {
      if (newSelected.size < 2) {
        newSelected.add(auditId)
      }
    }
    setSelectedAudits(newSelected)
  }

  const comparisonData = React.useMemo(() => {
    if (selectedAudits.size !== 2) return null
    const [id1, id2] = Array.from(selectedAudits)
    const audit1 = audits.find((a: AuditHistoryEntry) => a.id === id1)
    const audit2 = audits.find((a: AuditHistoryEntry) => a.id === id2)
    if (!audit1 || !audit2) return null
    
    // Sort by timestamp to ensure chronological comparison
    const sorted = [audit1, audit2].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    const older = sorted[0]!
    const newer = sorted[1]!

    return {
      older,
      newer,
      deltas: {
        pages: newer.pagesScanned - older.pagesScanned,
        violations: newer.violationsFound - older.violationsFound,
        aiRate: newer.aiClassificationRate - older.aiClassificationRate
      }
    }
  }, [selectedAudits])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-8 w-full sm:w-64" />
            </div>
          </CardHeader>
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

  if (audits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted/50">
          <ScanSearch className="h-16 w-16 text-muted-foreground/40" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">No audits yet</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start your first accessibility audit to see results here. We'll track your compliance progress over time.
          </p>
        </div>
        <Button size="lg" onClick={() => navigate("/")} className="px-8">
          Start First Audit
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit History</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all past accessibility scans
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedAudits.size === 2 && (
            <Button 
              variant="outline" 
              className="bg-primary/5 border-primary/50 text-primary hover:bg-primary/10"
              onClick={() => setShowComparison(!showComparison)}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              {showComparison ? "Hide Comparison" : "Compare Audits"}
            </Button>
          )}
          <Button onClick={() => navigate("/")}>New Audit</Button>
        </div>
      </div>

      {showComparison && comparisonData && (
        <Card className="animate-in fade-in slide-in-from-top-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Audit Comparison</CardTitle>
              <CardDescription>Comparing {comparisonData.older.id} vs {comparisonData.newer.id}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowComparison(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ComparisonMetric 
                label="Pages Scanned" 
                older={comparisonData.older.pagesScanned} 
                newer={comparisonData.newer.pagesScanned} 
                delta={comparisonData.deltas.pages}
                inverse={false}
              />
              <ComparisonMetric 
                label="Violations Found" 
                older={comparisonData.older.violationsFound} 
                newer={comparisonData.newer.violationsFound} 
                delta={comparisonData.deltas.violations}
                inverse={true}
              />
              <ComparisonMetric 
                label="AI Classification" 
                older={comparisonData.older.aiClassificationRate} 
                newer={comparisonData.newer.aiClassificationRate} 
                delta={comparisonData.deltas.aiRate}
                inverse={false}
                suffix="%"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card 
        className="overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={0}
        onKeyDown={handleTableKeyDown}
        onBlur={() => setFocusedRowIndex(-1)}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <Filter className="mr-2 h-4 w-4" />
                    Trigger: {triggerFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setTriggerFilter("All")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTriggerFilter("CI/CD")}>CI/CD</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTriggerFilter("Scheduled")}>Scheduled</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTriggerFilter("Manual")}>Manual</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTriggerFilter("API")}>API</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <Filter className="mr-2 h-4 w-4" />
                    Status: {statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setStatusFilter("All")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Complete")}>Complete</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("In Progress")}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Failed")}>Failed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" className="h-8 border-dashed">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Date Range
              </Button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search URL or Audit ID..."
                className="h-8 w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="w-[40px] px-4">
                    <div className="h-4 w-4" />
                  </TableHead>
                  <TableHead scope="col" className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("id")}>
                    <button className="flex items-center gap-1 w-full text-left" aria-label="Sort by Audit ID">Audit ID <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                  <TableHead scope="col" className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("rootUrl")}>
                    <button className="flex items-center gap-1 w-full text-left" aria-label="Sort by Root URL">Root URL <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                  <TableHead scope="col" className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("trigger")}>
                    <button className="flex items-center gap-1 w-full text-left" aria-label="Sort by Trigger">Trigger <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                  <TableHead scope="col" className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}>
                    <button className="flex items-center gap-1 w-full text-left" aria-label="Sort by Status">Status <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                  <TableHead scope="col" className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort("pagesScanned")}>
                    <button className="flex items-center justify-end gap-1 w-full text-right" aria-label="Sort by Pages Scanned">Pages <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                  <TableHead scope="col" className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort("violationsFound")}>
                    <button className="flex items-center justify-end gap-1 w-full text-right" aria-label="Sort by Violations Found">Violations <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                  <TableHead scope="col" className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort("aiClassificationRate")}>
                    <button className="flex items-center justify-end gap-1 w-full text-right" aria-label="Sort by AI Classification Rate">AI Rate <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                  <TableHead scope="col" className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort("duration")}>
                    <button className="flex items-center justify-end gap-1 w-full text-right" aria-label="Sort by Duration">Duration <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                  <TableHead scope="col" className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort("timestamp")}>
                    <button className="flex items-center justify-end gap-1 w-full text-right" aria-label="Sort by Date and Time">Date/Time <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                  <TableHead scope="col" className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort("gateStatus")}>
                    <button className="flex items-center justify-center gap-1 w-full text-center" aria-label="Sort by Gate Status">Gate <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAudits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 py-8">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                          <Search className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-semibold">No audits found</h2>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          We couldn't find any audits matching your current filters. Try adjusting your search or start a new audit.
                        </p>
                        <Button onClick={() => navigate("/")} className="mt-4">
                          Start New Audit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAudits.map((audit, index) => (
                    <TableRow
                      key={audit.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        focusedRowIndex === index && "ring-2 ring-primary ring-inset z-10 relative bg-muted/50",
                        selectedAudits.has(audit.id) && "bg-primary/5"
                      )}
                      onClick={() => navigate(`/audit/${audit.id}`)}
                    >
                      <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          aria-label={`Select audit ${audit.id}`}
                          checked={selectedAudits.has(audit.id)}
                          onChange={(e) => toggleSelectAudit(e as any, audit.id)}
                          disabled={!selectedAudits.has(audit.id) && selectedAudits.size >= 2}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/audit/${audit.id}`}
                          className="font-mono text-sm font-medium text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {audit.id}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={audit.rootUrl}>
                        {audit.rootUrl}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                          {audit.trigger}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            audit.status === "Complete"
                              ? "success"
                              : audit.status === "Failed"
                              ? "destructive"
                              : "warning"
                          }
                          className="text-[10px] uppercase tracking-wider"
                        >
                          {audit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {audit.pagesScanned.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        {audit.violationsFound.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium text-blue-600 dark:text-blue-500">
                        {audit.aiClassificationRate}%
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {audit.duration}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {audit.timestamp}
                      </TableCell>
                      <TableCell className="text-center">
                        {audit.gateStatus && (
                          <div
                            className={cn(
                              "mx-auto h-2.5 w-2.5 rounded-full",
                              audit.gateStatus === "Pass" ? "bg-emerald-500" : "bg-destructive"
                            )}
                            title={`Gate ${audit.gateStatus}`}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y">
            {paginatedAudits.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-12 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold">No audits found</h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  We couldn't find any audits matching your current filters. Try adjusting your search or start a new audit.
                </p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  Start New Audit
                </Button>
              </div>
            ) : (
              paginatedAudits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex flex-col gap-3 p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/audit/${audit.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/audit/${audit.id}`}
                      className="font-mono text-sm font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {audit.id}
                    </Link>
                    <Badge
                      variant={
                        audit.status === "Complete"
                          ? "success"
                          : audit.status === "Failed"
                          ? "destructive"
                          : "warning"
                      }
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {audit.status}
                    </Badge>
                  </div>
                  <div className="text-sm truncate font-medium" title={audit.rootUrl}>
                    {audit.rootUrl}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Date</span>
                      <span>{audit.timestamp}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Trigger</span>
                      <span>{audit.trigger}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Pages</span>
                      <span>{audit.pagesScanned.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Violations</span>
                      <span className="text-destructive font-medium">{audit.violationsFound.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <FindingsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={filteredAndSorted.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function ComparisonMetric({ 
  label, 
  older, 
  newer, 
  delta, 
  inverse = false,
  suffix = ""
}: { 
  label: string; 
  older: number; 
  newer: number; 
  delta: number;
  inverse?: boolean;
  suffix?: string;
}) {
  const isImprovement = inverse ? delta < 0 : delta > 0
  const isNeutral = delta === 0
  
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-background border shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{newer}{suffix}</span>
          <span className="text-[10px] text-muted-foreground">from {older}{suffix}</span>
        </div>
        {!isNeutral && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full",
            isImprovement ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
          )}>
            {isImprovement ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta > 0 ? "+" : ""}{delta.toFixed(delta % 1 === 0 ? 0 : 1)}{suffix}
          </div>
        )}
      </div>
    </div>
  )
}
