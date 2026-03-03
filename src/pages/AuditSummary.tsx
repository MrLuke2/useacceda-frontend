import * as React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  UserCheck,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Activity,
  Clock,
  Calendar,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuditDetailsStore } from "@/store/useAuditDetailsStore"
import { cn } from "@/lib/utils"

import { FindingsPagination } from "@/components/findings/FindingsPagination"

export function AuditSummary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { auditDetails, isLoading, fetchAuditDetails } = useAuditDetailsStore()
  const data = id ? auditDetails[id] : null

  React.useEffect(() => {
    if (id) {
      fetchAuditDetails(id)
    }
  }, [id, fetchAuditDetails])

  const [currentPage, setCurrentPage] = React.useState(1)
  const [focusedRowIndex, setFocusedRowIndex] = React.useState<number>(-1)
  const rowsPerPage = 10
  const totalPages = data ? Math.ceil(data.pages.length / rowsPerPage) : 0
  const paginatedPages = data ? data.pages.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) : []

  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    if (paginatedPages.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedRowIndex(prev => (prev < paginatedPages.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedRowIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter' && focusedRowIndex >= 0) {
      e.preventDefault()
      const page = paginatedPages[focusedRowIndex]
      if (page) navigate(`/audit/${id}/findings?page=${encodeURIComponent(page.url)}`)
    }
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex items-center justify-center pb-6">
              <Skeleton className="h-24 w-24 rounded-full" />
            </CardContent>
          </Card>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <Skeleton className="h-[250px] w-[250px] rounded-full" />
              <div className="mt-4 flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {Array.from({ length: 18 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between">
                <Skeleton className="h-12 w-16" />
                <Skeleton className="h-12 w-16" />
              </div>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full mt-6" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* TOP SECTION — Audit Identity Bar */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm dark:ring-1 dark:ring-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="sr-only">Audit Summary for {data.url}</h1>
            <Badge variant="outline" className="font-mono text-sm bg-muted/50">
              {data.id}
            </Badge>
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-lg font-semibold hover:underline"
            >
              {data.url}
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <Badge variant="secondary" className="ml-2 uppercase tracking-wider text-[10px]">
              {data.triggerType}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {data.duration}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {data.timestamp}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant="success"
            className="px-3 py-1 text-sm font-medium uppercase tracking-wider shadow-sm"
          >
            {data.status}
          </Badge>
        </div>
      </div>

      {/* ROW 1 — Key Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        <ComplianceScoreCard 
          violations={data.metrics.violationsFound} 
          total={data.metrics.totalPages * 5} 
        />
        <MetricCard
          title="Pages Scanned"
          value={data.metrics.totalPages}
          icon={FileText}
          trend={0}
        />
        <MetricCard
          title="Violations Found"
          value={data.metrics.violationsFound}
          icon={AlertTriangle}
          trend={12}
          trendLabel="vs baseline"
          color="destructive"
        />
        <MetricCard
          title="Resolved by AI"
          value={data.metrics.incompletesResolvedByAI}
          icon={BrainCircuit}
          trend={45}
          color="info"
        />
        <MetricCard
          title="AI Classification"
          value={`${data.metrics.aiClassificationRate}%`}
          icon={CheckCircle2}
          trend={2.4}
          color="info"
        />
        <MetricCard
          title="Human Review"
          value={data.metrics.requiresHumanReview}
          icon={UserCheck}
          trend={-8}
          color="purple"
        />
        <MetricCard
          title="Regressions"
          value={data.metrics.regressionsDetected}
          icon={TrendingUp}
          trend={3}
          color="rose"
        />
      </div>

      {/* ROW 2 — Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* LEFT (60%): Severity Breakdown chart */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Severity Breakdown</CardTitle>
            <CardDescription>Distribution of violations by impact level</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.severityBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.severityBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)" }}
                    itemStyle={{ color: "var(--color-foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
              {data.severityBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-muted-foreground">
                    <span className="text-foreground font-bold">{item.value}</span> {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT (40%): WCAG Criterion Heatmap */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>WCAG Criterion Heatmap</CardTitle>
            <CardDescription>Failure density across success criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              <TooltipProvider delayDuration={100}>
                {data.wcagHeatmap.map((item) => {
                  let bgColor = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  if (item.count > 0 && item.count <= 5) {
                    bgColor = "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                  } else if (item.count > 5) {
                    bgColor = "bg-destructive/20 text-destructive dark:text-red-400"
                  }

                  return (
                    <Tooltip key={item.criterion}>
                      <TooltipTrigger asChild>
                        <div
                          role="gridcell"
                          aria-label={`${item.criterion}: ${item.count} failures, Level ${item.level}`}
                          className={cn(
                            "flex cursor-pointer flex-col items-center justify-center rounded-md p-2 text-center transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1",
                            bgColor
                          )}
                        >
                          <span className="text-[10px] font-bold tracking-tighter">{item.criterion.replace("SC ", "")}</span>
                          <span className="text-xs font-semibold">{item.count}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold">{item.criterion}</p>
                          <p className="text-xs text-muted-foreground">Level {item.level}</p>
                          <p className="text-xs">{item.count} failures</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 3 — Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT (50%): Lighthouse Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lighthouse Score Distribution</CardTitle>
            <CardDescription>Accessibility score density across all pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-amber-500">72</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average Score</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold text-destructive">38</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Minimum Score</span>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.lighthouseDistribution} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="score" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)" }}
                    itemStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-primary)"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT (50%): CI/CD Baseline Delta */}
        <Card>
          <CardHeader>
            <CardTitle>CI/CD Baseline Delta</CardTitle>
            <CardDescription>
              Comparison against baseline{" "}
              <Link to="/audit/v2.4.0" className="font-mono text-primary hover:underline">
                v2.4.0
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-[calc(100%-5rem)]">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">New Violations</span>
                    <span className="text-xs text-muted-foreground">Introduced in this build</span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-destructive">+{data.metrics.newViolations}</span>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Resolved Since Baseline</span>
                    <span className="text-xs text-muted-foreground">Fixed in this build</span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                  {data.metrics.resolvedSinceBaseline}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10">
                    <Activity className="h-5 w-5 text-rose-600 dark:text-rose-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Regression Delta</span>
                    <span className="text-xs text-muted-foreground">Previously passed, now failing</span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-500">
                  +{data.metrics.regressionDelta}
                </span>
              </div>
            </div>

            <Button className="w-full mt-6" variant="outline" asChild>
              <Link to={`/audit/${id}/gate`}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                View Gate Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ROW 4 — Page Summary Table */}
      <Card 
        className="overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={0}
        onKeyDown={handleTableKeyDown}
        onBlur={() => setFocusedRowIndex(-1)}
      >
        <CardHeader>
          <CardTitle>Page Summary</CardTitle>
          <CardDescription>Detailed breakdown of findings per page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="w-[300px]">Page URL</TableHead>
                  <TableHead scope="col" className="text-right">Violations</TableHead>
                  <TableHead scope="col" className="text-right">Incompletes</TableHead>
                  <TableHead scope="col" className="text-right">Passes</TableHead>
                  <TableHead scope="col" className="text-right">Lighthouse</TableHead>
                  <TableHead scope="col" className="text-right">Status</TableHead>
                  <TableHead scope="col"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPages.map((page, index) => (
                  <TableRow
                    key={page.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      focusedRowIndex === index && "ring-2 ring-primary ring-inset z-10 relative bg-muted/50",
                      page.status === "Failed" && "bg-red-50/50 dark:bg-red-950/20"
                    )}
                    onClick={() => navigate(`/audit/${id}/findings?page=${encodeURIComponent(page.url)}`)}
                  >
                    <TableCell className="font-mono text-xs font-medium">
                      <div className="max-w-[250px] truncate" title={page.url}>
                        {page.url}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {page.violations}
                    </TableCell>
                    <TableCell className="text-right font-medium text-amber-600 dark:text-amber-500">
                      {page.incompletes}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-500">
                      {page.passes}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono",
                          page.lighthouseScore >= 90
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : page.lighthouseScore >= 50
                            ? "border-amber-500 text-amber-600 dark:text-amber-400"
                            : "border-destructive text-destructive"
                        )}
                      >
                        {page.lighthouseScore}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          page.status === "Failed"
                            ? "destructive"
                            : page.status === "Needs Review"
                            ? "warning"
                            : "success"
                        }
                        className="uppercase tracking-wider text-[10px]"
                      >
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y">
            {paginatedPages.map((page) => (
              <div
                key={page.id}
                className={cn(
                  "flex flex-col gap-3 p-4 hover:bg-muted/50 cursor-pointer",
                  page.status === "Failed" && "bg-red-50/50 dark:bg-red-950/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-medium truncate max-w-[200px]" title={page.url}>
                    {page.url}
                  </div>
                  <Badge
                    variant={
                      page.status === "Failed"
                        ? "destructive"
                        : page.status === "Needs Review"
                        ? "warning"
                        : "success"
                    }
                    className="uppercase tracking-wider text-[10px]"
                  >
                    {page.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="flex flex-col items-center p-2 bg-muted/30 rounded-md">
                    <span className="text-xs text-muted-foreground mb-1">Violations</span>
                    <span className="font-semibold text-destructive">{page.violations}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted/30 rounded-md">
                    <span className="text-xs text-muted-foreground mb-1">Incomplete</span>
                    <span className="font-medium text-amber-600 dark:text-amber-500">{page.incompletes}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted/30 rounded-md">
                    <span className="text-xs text-muted-foreground mb-1">Passes</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-500">{page.passes}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted/30 rounded-md">
                    <span className="text-xs text-muted-foreground mb-1">Score</span>
                    <span className={cn(
                      "font-mono font-medium",
                      page.lighthouseScore >= 90
                        ? "text-emerald-600 dark:text-emerald-400"
                        : page.lighthouseScore >= 50
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-destructive"
                    )}>
                      {page.lighthouseScore}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <FindingsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={data.pages.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function ComplianceScoreCard({ violations, total }: { violations: number; total: number }) {
  const score = Math.max(0, Math.min(100, Math.round(((total - violations) / total) * 100)))
  
  const getColor = (s: number) => {
    if (s >= 90) return "text-emerald-500 stroke-emerald-500"
    if (s >= 70) return "text-amber-500 stroke-amber-500"
    return "text-destructive stroke-destructive"
  }

  const colorClass = getColor(score)
  const strokeDasharray = `${score}, 100`

  return (
    <Card className="flex flex-col items-center justify-center p-4 text-center transition-all hover:shadow-md dark:hover:ring-slate-700">
      <CardTitle className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Compliance Score
      </CardTitle>
      <div className="relative mb-2 flex items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-24 w-24">
          <path
            className="stroke-muted"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={cn("transition-all duration-1000 ease-out", colorClass.split(' ')[1])}
            strokeWidth="3"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className={cn("absolute inset-0 flex items-center justify-center text-2xl font-bold", colorClass.split(' ')[0])}>
          {score}
        </div>
      </div>
      <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        WCAG 2.1 AA
      </div>
    </Card>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = "default",
}: {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: number
  trendLabel?: string
  color?: "default" | "destructive" | "info" | "purple" | "rose"
}) {
  const colorClasses = {
    default: "text-foreground",
    destructive: "text-destructive",
    info: "text-blue-600 dark:text-blue-500",
    purple: "text-purple-600 dark:text-purple-500",
    rose: "text-rose-600 dark:text-rose-500",
  }

  return (
    <Card className="flex flex-col justify-between transition-all hover:shadow-md dark:hover:ring-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold tracking-tight", colorClasses[color])}>{value}</div>
        {trend !== undefined && trend !== 0 && (
          <p className="mt-1 flex items-center text-xs text-muted-foreground">
            {trend > 0 ? (
              <TrendingUp className={cn("mr-1 h-3 w-3", trend > 0 && color === "destructive" ? "text-destructive" : "text-emerald-500")} />
            ) : (
              <TrendingDown className={cn("mr-1 h-3 w-3", trend < 0 && color === "destructive" ? "text-emerald-500" : "text-destructive")} />
            )}
            <span
              className={cn(
                "font-medium",
                trend > 0 && color === "destructive" ? "text-destructive" : trend < 0 && color === "destructive" ? "text-emerald-500" : trend > 0 ? "text-emerald-500" : "text-destructive"
              )}
            >
              {Math.abs(trend)}
            </span>
            {trendLabel && <span className="ml-1">{trendLabel}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
