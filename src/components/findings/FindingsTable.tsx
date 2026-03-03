import * as React from "react"
import { ArrowUpDown, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Finding, FindingStatus, Severity } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { SortField, SortDirection } from "@/hooks/useFindingsFilters"

interface FindingsTableProps {
  findings: Finding[]
  sortField: SortField
  sortDirection: SortDirection
  handleSort: (field: keyof Finding) => void
  selectedRows: Set<string>
  toggleSelectAll: () => void
  toggleSelectRow: (e: React.MouseEvent, id: string) => void
  focusedRowIndex: number
  onRowClick: (finding: Finding) => void
  handleTableKeyDown: (e: React.KeyboardEvent) => void
  statusConfig: Record<FindingStatus, { icon: React.ElementType; color: string; bg: string; label: string }>
  severityColors: Record<Severity, string>
  onClearFilters: () => void
  renderAction?: (finding: Finding) => React.ReactNode
}

export function FindingsTable({
  findings,
  sortField: _sortField,
  sortDirection: _sortDirection,
  handleSort,
  selectedRows,
  toggleSelectAll,
  toggleSelectRow,
  focusedRowIndex,
  onRowClick,
  handleTableKeyDown,
  statusConfig,
  severityColors,
  onClearFilters,
  renderAction,
}: FindingsTableProps) {
  return (
    <div 
      className="hidden md:block focus:outline-none"
      tabIndex={0}
      onKeyDown={handleTableKeyDown}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col" className="w-[40px] px-4">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
                aria-label="Select all findings on this page"
                checked={selectedRows.size === findings.length && findings.length > 0}
                onChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead scope="col" className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}>
              <div className="flex items-center gap-1">Status <ArrowUpDown className="h-3 w-3" /></div>
            </TableHead>
            <TableHead scope="col" className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("severity")}>
              <div className="flex items-center gap-1">Severity <ArrowUpDown className="h-3 w-3" /></div>
            </TableHead>
            <TableHead scope="col" className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("ruleId")}>
              <div className="flex items-center gap-1">Rule ID <ArrowUpDown className="h-3 w-3" /></div>
            </TableHead>
            <TableHead scope="col">Element</TableHead>
            <TableHead scope="col" className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("pageUrl")}>
              <div className="flex items-center gap-1">Page URL <ArrowUpDown className="h-3 w-3" /></div>
            </TableHead>
            <TableHead scope="col">WCAG</TableHead>
            <TableHead scope="col" className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("confidence")}>
              <div className="flex items-center gap-1">Confidence <ArrowUpDown className="h-3 w-3" /></div>
            </TableHead>
            <TableHead scope="col" className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("source")}>
              <div className="flex items-center gap-1">Source <ArrowUpDown className="h-3 w-3" /></div>
            </TableHead>
            {renderAction && <TableHead scope="col" className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {findings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={renderAction ? 10 : 9} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center space-y-3 py-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold">No findings match filters</h2>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    We couldn't find any findings matching your current filters and search query. Try adjusting them to see more results.
                  </p>
                  <Button variant="outline" onClick={onClearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <TooltipProvider delayDuration={300}>
              {findings.map((finding, index) => {
                const config = statusConfig[finding.status]
                const StatusIcon = config.icon
                
                return (
                  <TableRow
                    key={finding.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      focusedRowIndex === index && "ring-2 ring-primary ring-inset z-10 relative bg-muted/50"
                    )}
                    onClick={() => onRowClick(finding)}
                  >
                    <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        aria-label={`Select finding ${finding.ruleId}`}
                        checked={selectedRows.has(finding.id)}
                        onChange={(e) => toggleSelectRow(e as any, finding.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", config.bg, config.color)}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {config.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", severityColors[finding.severity])}>
                        {finding.severity}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{finding.ruleId}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-mono text-xs text-muted-foreground hover:text-foreground">
                            {finding.elementHash.substring(0, 8)}...
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs">{finding.elementHash}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="max-w-[150px] truncate text-sm">
                            {finding.pageUrl}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{finding.pageUrl}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {finding.wcag.map((c) => (
                          <Badge key={c} variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {finding.confidence !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"
                            role="progressbar"
                            aria-valuenow={Math.round(finding.confidence * 100)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className={cn(
                                "h-full rounded-full",
                                finding.confidence >= 0.9 ? "bg-emerald-500" :
                                finding.confidence >= 0.75 ? "bg-blue-500" :
                                finding.confidence >= 0.5 ? "bg-amber-500" : "bg-destructive"
                              )}
                              style={{ width: `${finding.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(finding.confidence * 100)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {finding.source}
                      </Badge>
                    </TableCell>
                    {renderAction && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {renderAction(finding)}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TooltipProvider>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
