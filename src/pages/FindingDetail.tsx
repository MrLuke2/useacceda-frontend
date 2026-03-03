import * as React from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  ImageIcon,
  Code,
  Layers,
  Activity,
  FileJson,
  MousePointer2,
  Keyboard,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { useFindingStore } from "@/store/useFindingStore"
import { cn } from "@/lib/utils"
import { STATUS_CONFIG, SEVERITY_COLORS, STATUS_BORDER_COLORS } from "@/lib/finding-constants"

function ConfidenceGauge({ value }: { value: number }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  
  const getColor = (v: number) => {
    if (v >= 90) return "stroke-emerald-500"
    if (v >= 75) return "stroke-blue-500"
    if (v >= 50) return "stroke-amber-500"
    return "stroke-red-500"
  }

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500", getColor(value))}
        />
      </svg>
      <span className="absolute text-[10px] font-bold">{value}%</span>
    </div>
  )
}

export function FindingDetail() {
  const { id, fid } = useParams()
  const navigate = useNavigate()
  const { findingDetails, isLoading, fetchFindingDetail } = useFindingStore()

  React.useEffect(() => {
    if (fid) {
      fetchFindingDetail(fid)
    }
  }, [fid, fetchFindingDetail])

  const finding = fid ? findingDetails[fid] : null

  if (isLoading || !finding) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Skeleton className="h-8 w-32" />
        </div>
        <Card className="h-32">
          <CardContent className="p-6">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const status = STATUS_CONFIG[finding.status]

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header / Identity Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/audit/${id}/findings`)} className="h-8 px-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Findings
          </Button>
          <span>/</span>
          <span className="font-mono">{finding.id}</span>
        </div>

        <Card className={cn("border-l-4", STATUS_BORDER_COLORS[finding.status])}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <ConfidenceGauge value={Math.round((finding.confidence || 0) * 100)} />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={cn("flex items-center gap-1", status.bg, status.color)}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                    <Badge className={cn("font-semibold", SEVERITY_COLORS[finding.severity])}>
                      {finding.severity}
                    </Badge>
                    <span className="font-mono text-lg font-bold">{finding.ruleId}</span>
                    {finding.wcag.map(c => (
                      <Badge key={c} variant="outline" className="font-mono text-[10px]">
                        {c}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <a href={finding.pageUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                      {finding.pageUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span>•</span>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {finding.source}
                    </Badge>
                    <span>•</span>
                    <Badge variant="outline" className="text-[10px] h-5 bg-muted/50">
                      Cycle {finding.cycleCount.current} of {finding.cycleCount.total}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-right">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Created: <span className="text-foreground font-medium">{finding.timestamps.created}</span></div>
                  <div>Updated: <span className="text-foreground font-medium">{finding.timestamps.updated}</span></div>
                  <div>Resolved: <span className="text-foreground font-medium">{finding.timestamps.resolved || "—"}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-md bg-muted/50 border font-mono text-xs overflow-x-auto whitespace-nowrap">
              {finding.elementSelector}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reasoning" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="reasoning" className="text-sm">AI Reasoning</TabsTrigger>
          <TabsTrigger value="diff" className="text-sm">Snapshot Diff</TabsTrigger>
          <TabsTrigger value="remediation" className="text-sm">Remediation</TabsTrigger>
          <TabsTrigger value="evidence" className="text-sm">Raw Evidence</TabsTrigger>
        </TabsList>

        {/* TAB 1: AI Reasoning */}
        <TabsContent value="reasoning" className="mt-6 space-y-6">
          {finding.status === "RequiresHumanReview" && (
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <CardContent className="p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-400">Requires Human Review</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-500/90">{finding.humanReviewReason}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Reasoning Chain
            </h3>
            <div className="grid gap-4">
              {finding.reasoning.map((step) => (
                <Card key={step.step} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                  <CardContent className="p-4 flex gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold shrink-0">
                      {step.step}
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="bg-muted/50">{step.tool}</Badge>
                      <p className="text-sm leading-relaxed">{step.text}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Conclusion: {finding.status}
                </div>
                <Badge variant="secondary" className="font-mono">Confidence: {finding.confidence}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Evidence References</h4>
            <div className="flex flex-wrap gap-2">
              {finding.evidenceReferences.map(ref => (
                <a key={ref} href="#" className="text-xs font-mono p-2 rounded border bg-muted/30 hover:bg-muted transition-colors flex items-center gap-2">
                  <FileJson className="w-3 h-3" />
                  {ref}
                </a>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Snapshot Diff */}
        <TabsContent value="diff" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                S0: Baseline Tree
              </h3>
              <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-2">
                  {finding.s0Tree.map((node, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between p-2 rounded text-xs border border-transparent",
                      node.diffStatus === "removed" && "bg-red-500/10 border-red-500/20",
                      node.diffStatus === "modified" && "bg-amber-500/10 border-amber-500/20"
                    )}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">{node.role}</Badge>
                        <span className="font-medium truncate max-w-[200px]">{node.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {node.states.map(s => <Badge key={s} className="text-[8px] h-3 px-1 bg-slate-200 text-slate-700">{s}</Badge>)}
                        {node.focusable && <Keyboard className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                S1: Post-Action Tree
              </h3>
              <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-2">
                  {finding.s1Tree.map((node, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between p-2 rounded text-xs border border-transparent",
                      node.diffStatus === "added" && "bg-emerald-500/10 border-emerald-500/20",
                      node.diffStatus === "modified" && "bg-amber-500/10 border-amber-500/20"
                    )}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">{node.role}</Badge>
                        <span className="font-medium truncate max-w-[200px]">{node.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {node.states.map(s => <Badge key={s} className="text-[8px] h-3 px-1 bg-slate-200 text-slate-700">{s}</Badge>)}
                        {node.focusable && <Keyboard className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {finding.focusTransition && (
            <Card className="bg-muted/20 border-dashed">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Focus Transition</CardTitle>
                  <Badge className={finding.focusTransition.passed ? "bg-emerald-500" : "bg-destructive"}>
                    {finding.focusTransition.passed ? "PASS" : "FAIL"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8 p-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">From</span>
                    <div className="p-3 rounded border bg-background flex items-center gap-2">
                      <Badge variant="outline">{finding.focusTransition.from.role}</Badge>
                      <span className="text-sm font-medium">{finding.focusTransition.from.name}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">To</span>
                    <div className="p-3 rounded border bg-background flex items-center gap-2">
                      <Badge variant="outline">{finding.focusTransition.to.role}</Badge>
                      <span className="text-sm font-medium">{finding.focusTransition.to.name}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Invariant Results</h3>
              <Badge variant={finding.invariants.every(i => i.passed) ? "default" : "destructive"} className={cn(finding.invariants.every(i => i.passed) ? "bg-emerald-500" : "")}>
                All Invariants: {finding.invariants.every(i => i.passed) ? "PASS" : "FAIL"}
              </Badge>
            </div>
            <div className="grid gap-2">
              {finding.invariants.map((inv, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-3">
                    {inv.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <div className="space-y-0.5">
                      <div className="font-mono text-sm">{inv.name}</div>
                      {inv.detail && <div className="text-xs text-muted-foreground">{inv.detail}</div>}
                    </div>
                  </div>
                </div>
              ))}
              {finding.invariants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground italic">No behavioral invariants defined for this finding type.</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: Remediation */}
        <TabsContent value="remediation" className="mt-6 space-y-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{finding.remediation.summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground">Before</h4>
              <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto min-h-[120px]">
                <pre>{finding.remediation.beforeCode}</pre>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground">After</h4>
              <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto min-h-[120px]">
                <pre>{finding.remediation.afterCode}</pre>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Implementation Steps
                </h3>
                <div className="space-y-4">
                  {finding.remediation.implementationSteps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Verification Steps
                </h3>
                <div className="space-y-3">
                  {finding.remediation.verificationSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">ARIA & Attribute Changes</h3>
                <ul className="space-y-2">
                  {finding.remediation.ariaChanges.map((change, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-primary">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase">Effort Estimate</span>
                  <Badge variant="secondary" className="w-full justify-center py-1">
                    {finding.remediation.effort} Effort
                  </Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase">Severity</span>
                  <Badge className={cn("w-full justify-center py-1", SEVERITY_COLORS[finding.severity])}>
                    {finding.severity}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">WCAG Techniques</h4>
                <div className="flex flex-col gap-2">
                  {finding.remediation.wcagLinks.map(link => (
                    <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      {link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>

              {finding.remediation.relatedFindingIds.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Related Findings</h4>
                  <div className="flex flex-wrap gap-2">
                    {finding.remediation.relatedFindingIds.map(rfid => (
                      <Link key={rfid} to={`/audit/${id}/finding/${rfid}`} className="text-[10px] font-mono px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors">
                        {rfid}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button disabled className="w-full h-12 text-lg font-semibold">
                        Apply Fix
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming soon — automated fix application</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: Raw Evidence */}
        <TabsContent value="evidence" className="mt-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="aspect-video rounded-lg bg-muted border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="w-8 h-8 opacity-50" />
                <span className="text-[10px] font-medium uppercase">DevTools Screenshot</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="aspect-video rounded-lg bg-muted border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="w-8 h-8 opacity-50" />
                <span className="text-[10px] font-medium uppercase">S0 Baseline Screenshot</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="aspect-video rounded-lg bg-muted border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="w-8 h-8 opacity-50" />
                <span className="text-[10px] font-medium uppercase">S1 Post-Action Screenshot</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" disabled className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Open Playwright Trace
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="axe">
              <AccordionTrigger className="text-sm font-semibold">axe-core Output</AccordionTrigger>
              <AccordionContent>
                <pre className="p-4 rounded bg-slate-950 text-slate-300 font-mono text-xs max-h-96 overflow-y-auto">
                  {JSON.stringify(finding.rawEvidence.axe, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="mcp">
              <AccordionTrigger className="text-sm font-semibold">MCP Scanner Output</AccordionTrigger>
              <AccordionContent>
                <pre className="p-4 rounded bg-slate-950 text-slate-300 font-mono text-xs max-h-96 overflow-y-auto">
                  {JSON.stringify(finding.rawEvidence.mcp, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="lighthouse">
              <AccordionTrigger className="text-sm font-semibold">Lighthouse Output</AccordionTrigger>
              <AccordionContent>
                <pre className="p-4 rounded bg-slate-950 text-slate-300 font-mono text-xs max-h-96 overflow-y-auto">
                  {JSON.stringify(finding.rawEvidence.lighthouse, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Interaction Log
            </h3>
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-muted" />
              {finding.interactionLog.map((log, i) => (
                <div key={i} className="relative flex items-center gap-4">
                  <div className="absolute -left-[19px] w-4 h-4 rounded-full bg-background border-2 border-primary z-10" />
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 w-full">
                    {log.type === "tab" ? (
                      <Keyboard className="w-4 h-4 text-muted-foreground" />
                    ) : log.type === "click" ? (
                      <MousePointer2 className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Code className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-mono">{log.text}</span>
                  </div>
                </div>
              ))}
              {finding.interactionLog.length === 0 && (
                <div className="text-center py-4 text-muted-foreground italic text-sm">No interaction logs for this finding.</div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
