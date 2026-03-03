import * as React from "react"
import { Filter, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FindingStatus, Severity, FindingSource } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface FindingsFilterBarProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeStatusFilters: Set<FindingStatus>
  setActiveStatusFilters: (s: Set<FindingStatus>) => void
  activeSeverityFilters: Set<Severity>
  setActiveSeverityFilters: (s: Set<Severity>) => void
  activeSourceFilters: Set<FindingSource>
  setActiveSourceFilters: (s: Set<FindingSource>) => void
  activeWcagFilters: Set<string>
  setActiveWcagFilters: (s: Set<string>) => void
  activePageUrlFilters: Set<string>
  setActivePageUrlFilters: (s: Set<string>) => void
  clearAllFilters: () => void
  setCurrentPage: (p: number) => void
  uniqueWcag: string[]
  uniquePageUrls: string[]
  statusConfig: Record<FindingStatus, { icon: React.ElementType; color: string; bg: string; label: string }>
  severityColors: Record<Severity, string>
  compact?: boolean
}

export function FindingsFilterBar({
  searchQuery,
  setSearchQuery,
  activeStatusFilters,
  setActiveStatusFilters,
  activeSeverityFilters,
  setActiveSeverityFilters,
  activeSourceFilters,
  setActiveSourceFilters,
  activeWcagFilters,
  setActiveWcagFilters,
  activePageUrlFilters,
  setActivePageUrlFilters,
  clearAllFilters,
  setCurrentPage,
  uniqueWcag,
  uniquePageUrls,
  statusConfig,
  severityColors,
  compact = false,
}: FindingsFilterBarProps) {
  return (
    <CardContent className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-8 border-dashed", activeStatusFilters.size > 0 && "bg-primary/5 border-primary/50")}>
                <Filter className="mr-2 h-4 w-4" />
                Status
                {activeStatusFilters.size > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
                    {activeStatusFilters.size}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(statusConfig) as FindingStatus[]).map((status) => {
                const config = statusConfig[status]
                const Icon = config.icon
                return (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={activeStatusFilters.has(status)}
                    onCheckedChange={(checked) => {
                      const next = new Set(activeStatusFilters)
                      if (checked) next.add(status)
                      else next.delete(status)
                      setActiveStatusFilters(next)
                      setCurrentPage(1)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", config.color)} />
                      <span>{config.label}</span>
                    </div>
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-8 border-dashed", activeSeverityFilters.size > 0 && "bg-primary/5 border-primary/50")}>
                <Filter className="mr-2 h-4 w-4" />
                Severity
                {activeSeverityFilters.size > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
                    {activeSeverityFilters.size}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by Severity</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["Critical", "Serious", "Moderate", "Minor"] as Severity[]).map((severity) => (
                <DropdownMenuCheckboxItem
                  key={severity}
                  checked={activeSeverityFilters.has(severity)}
                  onCheckedChange={(checked) => {
                    const next = new Set(activeSeverityFilters)
                    if (checked) next.add(severity)
                    else next.delete(severity)
                    setActiveSeverityFilters(next)
                    setCurrentPage(1)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", severityColors[severity].split(" ")[0])} />
                    <span>{severity}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-8 border-dashed", activeSourceFilters.size > 0 && "bg-primary/5 border-primary/50")}>
                <Filter className="mr-2 h-4 w-4" />
                Source
                {activeSourceFilters.size > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
                    {activeSourceFilters.size}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["Axe", "Lighthouse", "McpScanner"] as FindingSource[]).map((source) => (
                <DropdownMenuCheckboxItem
                  key={source}
                  checked={activeSourceFilters.has(source)}
                  onCheckedChange={(checked) => {
                    const next = new Set(activeSourceFilters)
                    if (checked) next.add(source)
                    else next.delete(source)
                    setActiveSourceFilters(next)
                    setCurrentPage(1)
                  }}
                >
                  {source}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!compact && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-8 border-dashed", activeWcagFilters.size > 0 && "bg-primary/5 border-primary/50")}>
                    <Filter className="mr-2 h-4 w-4" />
                    WCAG
                    {activeWcagFilters.size > 0 && (
                      <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
                        {activeWcagFilters.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Filter by WCAG</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-72">
                    {uniqueWcag.map((wcag) => (
                      <DropdownMenuCheckboxItem
                        key={wcag}
                        checked={activeWcagFilters.has(wcag)}
                        onCheckedChange={(checked) => {
                          const next = new Set(activeWcagFilters)
                          if (checked) next.add(wcag)
                          else next.delete(wcag)
                          setActiveWcagFilters(next)
                          setCurrentPage(1)
                        }}
                      >
                        {wcag}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-8 border-dashed", activePageUrlFilters.size > 0 && "bg-primary/5 border-primary/50")}>
                    <Filter className="mr-2 h-4 w-4" />
                    Page URL
                    {activePageUrlFilters.size > 0 && (
                      <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
                        {activePageUrlFilters.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80">
                  <DropdownMenuLabel>Filter by Page URL</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-72">
                    {uniquePageUrls.map((url) => (
                      <DropdownMenuCheckboxItem
                        key={url}
                        checked={activePageUrlFilters.has(url)}
                        onCheckedChange={(checked) => {
                          const next = new Set(activePageUrlFilters)
                          if (checked) next.add(url)
                          else next.delete(url)
                          setActivePageUrlFilters(next)
                          setCurrentPage(1)
                        }}
                      >
                        <span className="truncate">{url}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search rule ID or hash..."
            className="h-8 w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {(activeStatusFilters.size > 0 || 
        activeSeverityFilters.size > 0 || 
        activeSourceFilters.size > 0 || 
        activeWcagFilters.size > 0 || 
        activePageUrlFilters.size > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {Array.from(activeStatusFilters).map((status) => (
            <Badge key={`status-${status}`} variant="secondary" className="flex items-center gap-1 font-normal">
              Status: <span className="font-medium">{statusConfig[status].label}</span>
              <button 
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20" 
                onClick={() => {
                  const next = new Set(activeStatusFilters)
                  next.delete(status)
                  setActiveStatusFilters(next)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {Array.from(activeSeverityFilters).map((severity) => (
            <Badge key={`severity-${severity}`} variant="secondary" className="flex items-center gap-1 font-normal">
              Severity: <span className="font-medium">{severity}</span>
              <button 
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20" 
                onClick={() => {
                  const next = new Set(activeSeverityFilters)
                  next.delete(severity)
                  setActiveSeverityFilters(next)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {Array.from(activeSourceFilters).map((source) => (
            <Badge key={`source-${source}`} variant="secondary" className="flex items-center gap-1 font-normal">
              Source: <span className="font-medium">{source}</span>
              <button 
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20" 
                onClick={() => {
                  const next = new Set(activeSourceFilters)
                  next.delete(source)
                  setActiveSourceFilters(next)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {!compact && Array.from(activeWcagFilters).map((wcag) => (
            <Badge key={`wcag-${wcag}`} variant="secondary" className="flex items-center gap-1 font-normal">
              WCAG: <span className="font-medium">{wcag}</span>
              <button 
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20" 
                onClick={() => {
                  const next = new Set(activeWcagFilters)
                  next.delete(wcag)
                  setActiveWcagFilters(next)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {!compact && Array.from(activePageUrlFilters).map((url) => (
            <Badge key={`url-${url}`} variant="secondary" className="flex items-center gap-1 font-normal">
              URL: <span className="font-medium truncate max-w-[100px]">{url}</span>
              <button 
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20" 
                onClick={() => {
                  const next = new Set(activePageUrlFilters)
                  next.delete(url)
                  setActivePageUrlFilters(next)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button 
            variant="link" 
            size="sm" 
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={clearAllFilters}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </CardContent>
  )
}
