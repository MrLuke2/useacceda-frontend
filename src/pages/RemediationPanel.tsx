import * as React from "react"
import { useParams } from "react-router-dom"
import {
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Code,
  CheckCircle2,
  ListChecks,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { Severity, EffortLevel } from "@/lib/mock-data"
import { useRemediationStore } from "@/store/useRemediationStore"
import { cn } from "@/lib/utils"

const SEVERITY_COLORS: Record<Severity, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  Serious: "bg-orange-600 text-white dark:bg-orange-500 dark:text-slate-900",
  Moderate: "bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-900",
  Minor: "bg-slate-500 text-white dark:bg-slate-400 dark:text-slate-900",
}

const SEVERITY_STRIPE: Record<Severity, string> = {
  Critical: "bg-destructive",
  Serious: "bg-orange-600 dark:bg-orange-500",
  Moderate: "bg-amber-500 dark:bg-amber-400",
  Minor: "bg-slate-500 dark:bg-slate-400",
}

const EFFORT_COLORS: Record<EffortLevel, string> = {
  Low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
  High: "bg-destructive/10 text-destructive dark:text-red-500 border-destructive/20",
}

type SortOption = "Most Critical First" | "Lowest Effort First" | "Most Findings Resolved" | "Page URL"

export function RemediationPanel() {
  const { id: _id } = useParams()
  
  const { remediations, isLoading, fetchRemediations } = useRemediationStore()
  
  React.useEffect(() => {
    fetchRemediations()
  }, [fetchRemediations])

  const [effortFilter, setEffortFilter] = React.useState<EffortLevel | "All">("All")
  const [severityFilter, setSeverityFilter] = React.useState<Severity | "All">("All")
  const [sortOption, setSortOption] = React.useState<SortOption>("Most Critical First")

  const effortCounts = React.useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0 }
    remediations.forEach((r) => {
      counts[r.effort]++
    })
    return counts
  }, [remediations])

  const filteredAndSorted = React.useMemo(() => {
    let result = [...remediations]
    
    if (effortFilter !== "All") {
      result = result.filter((r) => r.effort === effortFilter)
    }
    if (severityFilter !== "All") {
      result = result.filter((r) => r.severity === severityFilter)
    }

    result.sort((a, b) => {
      if (sortOption === "Most Critical First") {
        const severityOrder: Record<Severity, number> = { Critical: 4, Serious: 3, Moderate: 2, Minor: 1 }
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity]
        }
        return b.resolvesCount - a.resolvesCount
      } else if (sortOption === "Lowest Effort First") {
        const effortOrder: Record<EffortLevel, number> = { Low: 1, Medium: 2, High: 3 }
        if (effortOrder[a.effort] !== effortOrder[b.effort]) {
          return effortOrder[a.effort] - effortOrder[b.effort]
        }
        return b.resolvesCount - a.resolvesCount
      } else if (sortOption === "Most Findings Resolved") {
        return b.resolvesCount - a.resolvesCount
      } else if (sortOption === "Page URL") {
        return a.pageUrl.localeCompare(b.pageUrl)
      }
      return 0
    })

    return result
  }, [remediations, effortFilter, severityFilter, sortOption])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="sticky top-0 z-20 flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <Card className="sticky top-[88px] z-10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <div className="pl-6">
                <CardHeader className="pb-3 pt-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2 w-full max-w-md">
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-4 grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight">Remediation Panel</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">1,405</span> total remediations
            <span className="text-muted-foreground/50">•</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-500">
                {effortCounts.Low} Low
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-500">
                {effortCounts.Medium} Medium
              </span>
              <span className="inline-flex items-center rounded-full bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive dark:text-red-500">
                {effortCounts.High} High
              </span>
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span>Est. ~847 hours</span>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      <Card className="sticky top-[88px] z-10 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <Filter className="mr-2 h-4 w-4" />
                    Effort: {effortFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setEffortFilter("All")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEffortFilter("Low")}>Low</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEffortFilter("Medium")}>Medium</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEffortFilter("High")}>High</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <Filter className="mr-2 h-4 w-4" />
                    Severity: {severityFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setSeverityFilter("All")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter("Critical")}>Critical</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter("Serious")}>Serious</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter("Moderate")}>Moderate</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter("Minor")}>Minor</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" className="h-8 border-dashed">
                <Filter className="mr-2 h-4 w-4" />
                WCAG
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    {sortOption} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOption("Most Critical First")}>Most Critical First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("Lowest Effort First")}>Lowest Effort First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("Most Findings Resolved")}>Most Findings Resolved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("Page URL")}>Page URL</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredAndSorted.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <ListChecks className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold">No remediations match filters</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                We couldn't find any remediations matching your current filters. Try adjusting them to see more results.
              </p>
              <Button variant="outline" onClick={() => { setEffortFilter("All"); setSeverityFilter("All"); }} className="mt-6">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAndSorted.map((remediation) => (
            <Card key={remediation.id} className="relative overflow-hidden transition-all hover:shadow-md">
              <div className={cn("absolute bottom-0 left-0 top-0 w-1.5", SEVERITY_STRIPE[remediation.severity])} />
              
              <div className="pl-6">
                <CardHeader className="pb-3 pt-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs bg-muted/50">
                          {remediation.ruleId}
                        </Badge>
                        {remediation.wcag.map((c) => (
                          <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {c}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-lg">{remediation.summary}</CardTitle>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("border text-xs font-medium", EFFORT_COLORS[remediation.effort])}>
                          {remediation.effort} Effort
                        </Badge>
                        <Badge variant="outline" className={cn("border-transparent text-xs font-medium", SEVERITY_COLORS[remediation.severity])}>
                          {remediation.severity}
                        </Badge>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        Resolves {remediation.resolvesCount} finding{remediation.resolvesCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Element</span>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground truncate max-w-full" title={remediation.elementSelector}>
                        {remediation.elementSelector}
                      </code>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Page URL</span>
                      <span className="truncate text-muted-foreground" title={remediation.pageUrl}>
                        {remediation.pageUrl}
                      </span>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="details" className="border-b-0 border-t">
                      <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
                        View Remediation Details
                      </AccordionTrigger>
                      <AccordionContent className="space-y-6 pt-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Code className="h-4 w-4" />
                              Before
                            </div>
                            <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 font-mono text-xs text-slate-50">
                              <code>{remediation.beforeCode}</code>
                            </pre>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Code className="h-4 w-4 text-emerald-500" />
                              After
                            </div>
                            <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 font-mono text-xs text-slate-50">
                              <code>{remediation.afterCode}</code>
                            </pre>
                          </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <ListChecks className="h-4 w-4" />
                              Implementation Steps
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {remediation.implementationSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground">
                                    {i + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <CheckCircle2 className="h-4 w-4" />
                              Verification Steps
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {remediation.verificationSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                          <div className="text-sm font-semibold">Resources</div>
                          <div className="flex flex-wrap gap-2">
                            {remediation.wcagLinks.map((link, i) => (
                              <a
                                key={i}
                                href={link.url}
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                {link.label}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
