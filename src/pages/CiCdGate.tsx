import * as React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Settings2,
  Terminal,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { mockGateResult, Severity } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const SEVERITY_COLORS: Record<Severity, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  Serious: "bg-orange-600 text-white dark:bg-orange-500 dark:text-slate-900",
  Moderate: "bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-900",
  Minor: "bg-slate-500 text-white dark:bg-slate-400 dark:text-slate-900",
}

export function CiCdGate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const data = mockGateResult
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)
  const [isConfigured, setIsConfigured] = React.useState(true) // Added for empty state demo
  
  const [isLoading, setIsLoading] = React.useState(true)
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(data.config, null, 2))
    toast("Configuration copied to clipboard", "success")
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="bg-muted p-8 text-center sm:p-12">
            <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
            <Skeleton className="mx-auto mb-2 h-10 w-64" />
            <Skeleton className="mx-auto h-4 w-96" />
          </div>
        </Card>

        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mt-4">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mt-4">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
          <Settings2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Gate Not Configured</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto mb-6">
          This audit does not have a CI/CD gate configured. Set up a gate to automatically fail builds when accessibility regressions are introduced.
        </p>
        <Button onClick={() => setIsConfigured(true)}>
          Configure Gate
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setIsConfigured(false)}>
          Test Empty State
        </Button>
      </div>
      {/* TOP — GATE STATUS */}
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border p-12 text-center shadow-sm transition-colors",
          data.passed
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
            : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
        )}
      >
        <div
          className={cn(
            "mb-4 flex h-24 w-24 items-center justify-center rounded-full",
            data.passed
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-500"
              : "bg-red-100 text-destructive dark:bg-red-900/50 dark:text-red-500"
          )}
        >
          {data.passed ? (
            <ShieldCheck className="h-12 w-12" />
          ) : (
            <ShieldAlert className="h-12 w-12" />
          )}
        </div>
        <h1
          className={cn(
            "text-4xl font-extrabold tracking-tight",
            data.passed ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
          )}
        >
          Gate {data.passed ? "Passed" : "Failed"}
        </h1>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-muted-foreground">
          <span>Max new critical: {data.config.maxNewCritical}</span>
          <span className="text-muted-foreground/30">•</span>
          <span>Max new serious: {data.config.maxNewSerious}</span>
          <span className="text-muted-foreground/30">•</span>
          <span>Block regressions: {data.config.blockRegressions ? "Yes" : "No"}</span>
          <span className="text-muted-foreground/30">•</span>
          <span>
            Baseline:{" "}
            <Link to={`/audit/${data.config.baselineAuditId}`} className="text-primary hover:underline">
              {data.config.baselineAuditId}
            </Link>
          </span>
        </div>
      </div>

      {/* FAILURE REASONS */}
      {!data.passed && data.failureReasons.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Failure Reasons
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.failureReasons.map((reason, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span className="font-medium">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TWO COLUMNS */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT — New Blocking Violations */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle>New Blocking Violations</CardTitle>
              <CardDescription>Violations introduced since baseline</CardDescription>
            </div>
            <Badge variant="destructive" className="font-semibold">
              {data.newBlockingViolations.length} new critical violations
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="w-[100px]">Severity</TableHead>
                  <TableHead scope="col">Rule ID</TableHead>
                  <TableHead scope="col">Page URL</TableHead>
                  <TableHead scope="col">Element</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.newBlockingViolations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No new blocking violations.
                    </TableCell>
                  </TableRow>
                ) : (
                  <TooltipProvider delayDuration={300}>
                    {data.newBlockingViolations.map((finding) => (
                      <TableRow
                        key={finding.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => navigate(`/audit/${id}/finding/${finding.id}`)}
                      >
                        <TableCell>
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", SEVERITY_COLORS[finding.severity])}>
                            {finding.severity}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{finding.ruleId}</TableCell>
                        <TableCell>
                          <div className="max-w-[120px] truncate text-xs" title={finding.pageUrl}>
                            {finding.pageUrl}
                          </div>
                        </TableCell>
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
                      </TableRow>
                    ))}
                  </TooltipProvider>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* RIGHT — Regressions */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle>Regressions</CardTitle>
              <CardDescription>Previously resolved issues that have returned</CardDescription>
            </div>
            <Badge variant="outline" className="border-rose-500 text-rose-600 dark:text-rose-500 font-semibold bg-rose-500/10">
              {data.regressions.length} regressions
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Rule ID</TableHead>
                  <TableHead scope="col">Page URL</TableHead>
                  <TableHead scope="col">Original Finding</TableHead>
                  <TableHead scope="col">Regression Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.regressions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No regressions detected.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.regressions.map((finding) => (
                    <TableRow
                      key={finding.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => navigate(`/audit/${id}/finding/${finding.id}`)}
                    >
                      <TableCell className="font-mono text-xs">{finding.ruleId}</TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate text-xs" title={finding.pageUrl}>
                          {finding.pageUrl}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/audit/${data.config.baselineAuditId}/finding/${finding.id}`}
                          className="font-mono text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {finding.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          Re-introduced in {finding.pageUrl}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM — Gate Config Editor */}
      <Card>
        <CardHeader
          className="cursor-pointer flex flex-row items-center justify-between space-y-0 hover:bg-muted/50 transition-colors"
          onClick={() => setIsConfigOpen(!isConfigOpen)}
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Gate Configuration</CardTitle>
          </div>
          {isConfigOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </CardHeader>
        {isConfigOpen && (
          <CardContent className="pt-4 border-t">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Max New Critical
                    </label>
                    <Input type="number" value={data.config.maxNewCritical} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Max New Serious
                    </label>
                    <Input type="number" value={data.config.maxNewSerious} disabled className="bg-muted/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Baseline Audit ID
                    </label>
                    <Input type="text" value={data.config.baselineAuditId} disabled className="bg-muted/50 font-mono text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Block Regressions
                    </label>
                    <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3">
                      <span className="text-sm font-medium">{data.config.blockRegressions ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Button variant="outline" onClick={handleCopyConfig} className="w-full sm:w-auto">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Config JSON
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Terminal className="h-4 w-4" />
                  API Endpoint
                </label>
                <div className="rounded-md bg-slate-950 p-4">
                  <pre className="overflow-x-auto font-mono text-xs text-slate-50">
                    <code>
<span className="text-blue-400">GET</span> /api/audits/{id}/gate
<span className="text-slate-500">{"\n"}// Response:</span>
{JSON.stringify(data, null, 2)}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
