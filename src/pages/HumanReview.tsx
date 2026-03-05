import * as React from "react"
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Eye, 
  ChevronDown, 
  RotateCcw, 
  Maximize2, 
  ZoomIn,
  ZoomOut,
  Code,
  FileText,
  Layers,
  Save,
  Send,
  Inbox
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useFindingsFilters } from "@/hooks/useFindingsFilters"
import { FindingsFilterBar } from "@/components/findings/FindingsFilterBar"
import { FindingsTable } from "@/components/findings/FindingsTable"
import { FindingsPagination } from "@/components/findings/FindingsPagination"
import { Finding, FindingStatus, Severity } from "@/lib/mock-data"
import { useFindingStore } from "@/store/useFindingStore"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import { STATUS_CONFIG, SEVERITY_COLORS } from "@/lib/finding-constants"

// --- Mock Document Content ---
const MOCK_DOCUMENT_HTML = `
<div class="p-8 font-sans text-slate-900 max-w-3xl mx-auto bg-white min-h-[1000px] shadow-sm">
  <header class="border-b pb-4 mb-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-slate-800">Q3 Revenue Report</h1>
      <span class="text-slate-500">Confidential</span>
    </div>
    <p class="text-slate-600 mt-2">Prepared for Executive Review</p>
  </header>

  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4 text-slate-800">Executive Summary</h2>
    <p class="mb-4 leading-relaxed text-slate-700">
      The third quarter has shown significant growth across all major sectors. 
      Revenue increased by 15% year-over-year, driven primarily by the expansion 
      in the APAC region and the launch of our new enterprise tier.
    </p>
    <p class="mb-4 leading-relaxed text-slate-700">
      Operating expenses have remained stable, resulting in a net profit margin 
      increase of 2.4%. We anticipate this trend to continue into Q4.
    </p>
  </section>

  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4 text-slate-800">Regional Performance</h2>
    <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
      <!-- Problematic Element: Image with poor alt text -->
      <div class="relative group">
        <div class="aspect-video bg-slate-200 rounded flex items-center justify-center mb-2 overflow-hidden">
          <img src="https://picsum.photos/seed/chart/800/450" alt="chart" class="w-full h-full object-cover" />
        </div>
        <p class="text-sm text-slate-500 text-center italic">Figure 1: Revenue by Region</p>
        
        <!-- Annotation Badge (Simulated) -->
        <div class="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce z-10">
          Finding fid-1000
        </div>
        <div class="absolute inset-0 border-4 border-red-500/50 rounded pointer-events-none animate-pulse"></div>
      </div>
    </div>

    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-slate-300">
          <th class="py-2 font-semibold text-slate-700">Region</th>
          <th class="py-2 font-semibold text-slate-700 text-right">Revenue (M)</th>
          <th class="py-2 font-semibold text-slate-700 text-right">YoY Growth</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-slate-100">
          <td class="py-2 text-slate-600">North America</td>
          <td class="py-2 text-slate-600 text-right">$45.2</td>
          <td class="py-2 text-slate-600 text-right">+12%</td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 text-slate-600">Europe</td>
          <td class="py-2 text-slate-600 text-right">$32.8</td>
          <td class="py-2 text-slate-600 text-right">+8%</td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 text-slate-600">APAC</td>
          <td class="py-2 text-slate-600 text-right">$28.4</td>
          <td class="py-2 text-slate-600 text-right">+24%</td>
        </tr>
      </tbody>
    </table>
  </section>

  <footer class="mt-12 pt-4 border-t text-sm text-slate-400 text-center">
    &copy; 2026 Acme Corp. All rights reserved.
  </footer>
</div>
`

// --- Mock Accessibility Tree ---
interface AxNode {
  role: string
  name?: string
  children?: AxNode[]
  ignored?: boolean
  finding?: boolean
}

const MOCK_AX_TREE: AxNode = {
  role: "document",
  children: [
    { role: "main", children: [
      { role: "heading", name: "Q3 Revenue Report", children: [] },
      { role: "section", name: "Executive Summary", children: [
        { role: "heading", name: "Executive Summary" },
        { role: "paragraph" },
        { role: "paragraph" }
      ]},
      { role: "section", name: "Regional Performance", children: [
        { role: "heading", name: "Regional Performance" },
        { role: "img", name: "chart", finding: true },
        { role: "table", children: [
          { role: "rowgroup", children: [
            { role: "row", children: [
              { role: "columnheader", name: "Region" },
              { role: "columnheader", name: "Revenue (M)" },
              { role: "columnheader", name: "YoY Growth" }
            ]}
          ]},
          { role: "rowgroup", children: [
            { role: "row", name: "North America, $45.2, +12%" },
            { role: "row", name: "Europe, $32.8, +8%" },
            { role: "row", name: "APAC, $28.4, +24%" }
          ]}
        ]}
      ]},
      { role: "contentinfo", name: "© 2026 Acme Corp. All rights reserved." }
    ]}
  ]
}

function AccessibilityTreeNode({ node, depth = 0 }: { node: AxNode; depth?: number }) {
  return (
    <div className="font-mono text-sm">
      <div 
        className={cn(
          "flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 transition-colors cursor-default",
          node.finding && "bg-destructive/10 text-destructive font-medium border border-destructive/20"
        )}
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
      >
        <span className={cn("opacity-70", node.finding && "opacity-100")}>{node.role}</span>
        {node.name && <span className="text-muted-foreground truncate max-w-[300px]">"{node.name}"</span>}
        {node.finding && <Badge variant="outline" className="h-4 text-[10px] px-1 ml-auto border-destructive/40 text-destructive">Issue Detected</Badge>}
      </div>
      {node.children?.map((child, i) => (
        <AccessibilityTreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

// --- Components ---

function StatCard({ label, value, subtext, icon: Icon }: { label: string; value: string; subtext: string; icon?: any }) {
  return (
    <div className="flex flex-col p-4 bg-background rounded-xl border shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span className="text-xs font-medium text-muted-foreground">{subtext}</span>
      </div>
    </div>
  )
}

export function HumanReview() {
  const [mode, setMode] = React.useState<"queue" | "workspace">("queue")
  const [selectedFinding, setSelectedFinding] = React.useState<Finding | null>(null)
  const [htmlSource, setHtmlSource] = React.useState(MOCK_DOCUMENT_HTML)
  const [isEditingHtml, setIsEditingHtml] = React.useState(false)
  const [zoomLevel, setZoomLevel] = React.useState(100)
  const { toast } = useToast()
  const { findings, isLoading, fetchFindings, updateFindingStatus } = useFindingStore()

  React.useEffect(() => {
    fetchFindings()
  }, [fetchFindings])

  const isModified = htmlSource !== MOCK_DOCUMENT_HTML

  const handleResetHtml = () => {
    setHtmlSource(MOCK_DOCUMENT_HTML)
    toast("Source HTML reset to original.", "info")
  }

  // Filter findings for the queue
  const queueFindings = React.useMemo(() => {
    return findings.filter(f => f.status === "RequiresHumanReview" || (f.confidence && f.confidence < 0.7))
  }, [findings])

  // Use the hook for the queue mode
  const {
    searchQuery, setSearchQuery,
    activeStatusFilters, setActiveStatusFilters,
    activeSeverityFilters, setActiveSeverityFilters,
    activeSourceFilters, setActiveSourceFilters,
    clearAllFilters,
    hasActiveFilters: _hasActiveFilters,
    sortField, setSortField: _setSortField,
    sortDirection, setSortDirection: _setSortDirection,
    handleSort,
    filteredFindings,
    selectedRows,
    toggleSelectAll,
    toggleSelectRow,
    focusedRowIndex,
    handleTableKeyDown,
    currentPage, setCurrentPage,
    totalPages,
    rowsPerPage
  } = useFindingsFilters({
    findings: queueFindings,
    defaultRowsPerPage: 10,
    prefilter: { status: new Set(["RequiresHumanReview"]) }
  })

  const [classification, setClassification] = React.useState<FindingStatus | "">("")
  const [severity, setSeverity] = React.useState<Severity | "">("")
  const [notes, setNotes] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])

  const currentReviewIndex = selectedFinding 
    ? queueFindings.findIndex(f => f.id === selectedFinding.id) + 1 
    : 0

  const handleReviewClick = (finding: Finding) => {
    setSelectedFinding(finding)
    setClassification(finding.status)
    setSeverity(finding.severity)
    setNotes("")
    setTags([])
    setMode("workspace")
  }

  const handleBackToQueue = () => {
    setMode("queue")
    setSelectedFinding(null)
  }

  const handleSaveDraft = () => {
    toast(`Draft saved for Finding ${selectedFinding?.id}`, "info")
  }

  const handleSubmitReview = () => {
    if (selectedFinding && classification) {
      updateFindingStatus(selectedFinding.id, classification as FindingStatus)
      toast(`Review Submitted: Finding ${selectedFinding.id} has been updated.`, "success")
    }
    
    // Find current index
    const currentIndex = queueFindings.findIndex(f => f.id === selectedFinding?.id)
    if (currentIndex !== -1 && currentIndex < queueFindings.length - 1) {
      // Go to next
      const nextFinding = queueFindings[currentIndex + 1]
      if (nextFinding) handleReviewClick(nextFinding)
    } else {
      // No more findings, go back to queue
      toast("All findings reviewed!", "success")
      handleBackToQueue()
    }
  }

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {mode === "queue" ? (
          <motion.div 
            key="queue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col space-y-8 p-8 overflow-hidden bg-slate-50/50 dark:bg-transparent"
          >
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Human Review Queue</h1>
                  <p className="text-muted-foreground mt-1">Manage and resolve findings requiring manual verification.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1 bg-background">
                    <span className="h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
                    Live Updates Active
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Awaiting Review" value={queueFindings.length.toString()} subtext="items" icon={Inbox} />
                <StatCard label="Completed Today" value="12" subtext="items" icon={CheckCircle2} />
                <StatCard label="Avg. Review Time" value="2.4" subtext="min" icon={RotateCcw} />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 space-y-4 bg-background rounded-2xl border shadow-sm overflow-hidden p-1">
              <div className="p-4 pb-0">
                <FindingsFilterBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  activeStatusFilters={activeStatusFilters}
                  setActiveStatusFilters={setActiveStatusFilters}
                  activeSeverityFilters={activeSeverityFilters}
                  setActiveSeverityFilters={setActiveSeverityFilters}
                  activeSourceFilters={activeSourceFilters}
                  setActiveSourceFilters={setActiveSourceFilters}
                  activeWcagFilters={new Set()}
                  setActiveWcagFilters={() => {}}
                  activePageUrlFilters={new Set()}
                  setActivePageUrlFilters={() => {}}
                  uniqueWcag={[]}
                  uniquePageUrls={[]}
                  clearAllFilters={clearAllFilters}
                  setCurrentPage={setCurrentPage}
                  statusConfig={STATUS_CONFIG}
                  severityColors={SEVERITY_COLORS}
                  compact={true}
                />
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : filteredFindings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                      <div className="mb-4 rounded-full bg-muted p-4">
                        <Inbox className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Queue Empty</h3>
                      <p className="max-w-sm text-sm">
                        Great job! There are no findings currently requiring human review.
                      </p>
                    </div>
                  ) : (
                    <FindingsTable
                      findings={filteredFindings}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      handleSort={handleSort}
                      selectedRows={selectedRows}
                      toggleSelectAll={toggleSelectAll}
                      toggleSelectRow={toggleSelectRow}
                      focusedRowIndex={focusedRowIndex}
                      onRowClick={handleReviewClick}
                      handleTableKeyDown={handleTableKeyDown}
                      statusConfig={STATUS_CONFIG}
                      severityColors={SEVERITY_COLORS}
                      onClearFilters={clearAllFilters}
                      renderAction={(finding) => (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReviewClick(finding)
                          }}
                          aria-label={`Review finding ${finding.id}`}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      )}
                    />
                  )}
                </ScrollArea>
                {!isLoading && filteredFindings.length > 0 && (
                  <div className="p-4 border-t bg-muted/20">
                    <FindingsPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalCount={filteredFindings.length}
                      rowsPerPage={rowsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="workspace"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col h-full bg-background"
          >
            {/* Workspace Header */}
            <header className="h-20 border-b flex items-center justify-between px-8 bg-card shrink-0 z-10 shadow-sm">
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="sm" onClick={handleBackToQueue} className="gap-2 -ml-2 hover:bg-muted" aria-label="Back to queue">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back to Queue</span>
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold font-mono tracking-tight text-primary/90">{selectedFinding?.ruleId}</span>
                  <div className="flex gap-1.5 mt-0.5">
                    {selectedFinding?.wcag.map(c => (
                      <span key={c} className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                        WCAG {c}
                      </span>
                    ))}
                  </div>
                  <Badge className={cn("text-[10px] h-4.5 px-2 font-black uppercase tracking-wider", SEVERITY_COLORS[selectedFinding?.severity || "Minor"])}>
                    {selectedFinding?.severity}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border">
                <div className="flex items-center gap-1 mr-4 ml-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Review {currentReviewIndex} of {queueFindings.length}</span>
                </div>
                <Button 
                  variant={classification === "Violation" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setClassification("Violation")}
                  className={cn(
                    "h-9 px-4 rounded-lg transition-all",
                    classification === "Violation" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md" : "text-destructive hover:bg-destructive/10"
                  )}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Violation
                </Button>
                <Button 
                  variant={classification === "Pass" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setClassification("Pass")}
                  className={cn(
                    "h-9 px-4 rounded-lg transition-all",
                    classification === "Pass" ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md" : "text-emerald-600 hover:bg-emerald-500/10"
                  )}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Pass
                </Button>
                <Button 
                  variant={classification === "RequiresHumanReview" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setClassification("RequiresHumanReview")}
                  className={cn(
                    "h-9 px-4 rounded-lg transition-all",
                    classification === "RequiresHumanReview" ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md" : "text-orange-600 hover:bg-orange-500/10"
                  )}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Escalate
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="sm" className="h-9 rounded-lg">Skip</Button>
              </div>
            </header>

            {/* Split Pane Workspace */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden bg-slate-50/30 dark:bg-transparent">
              {/* Left Pane: Document Viewer */}
              <div className="col-span-7 border-r flex flex-col overflow-hidden">
                <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
                  <div className="px-6 pt-3 border-b bg-background">
                    <TabsList className="w-full justify-start h-11 bg-transparent p-0 gap-6">
                      <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-semibold transition-all">
                        <FileText className="mr-2 h-4 w-4" /> Document Preview
                      </TabsTrigger>
                      <TabsTrigger value="source" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-semibold transition-all">
                        <Code className="mr-2 h-4 w-4" /> Source HTML
                      </TabsTrigger>
                      <TabsTrigger value="tree" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-semibold transition-all">
                        <Layers className="mr-2 h-4 w-4" /> Accessibility Tree
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="preview" className="flex-1 m-0 relative overflow-hidden flex flex-col min-h-0">
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-white/90 backdrop-blur shadow-sm rounded-md p-1 border">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(z => Math.min(z + 10, 200))} aria-label="Zoom in">
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(100)} aria-label="Reset zoom">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(z => Math.max(z - 10, 50))} aria-label="Zoom out">
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </div>
                    <ScrollArea className="flex-1 bg-background">
                      <div className="p-6">
                        <div 
                          className="origin-top transition-transform duration-200 ease-out border rounded-md p-4 bg-muted/10"
                          style={{ transform: `scale(${zoomLevel / 100})` }}
                        >
                          <div dangerouslySetInnerHTML={{ __html: htmlSource }} />
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="source" className="flex-1 m-0 flex flex-col overflow-hidden min-h-0">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-slate-400 border-b border-slate-800 text-xs font-mono">
                      <span>index.html</span>
                      <div className="flex items-center gap-2">
                        {isModified && (
                          <>
                            <Badge variant="outline" className="text-amber-500 border-amber-500">Modified</Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-xs hover:text-white hover:bg-slate-800"
                              onClick={handleResetHtml}
                              title="Reset to original"
                              aria-label="Reset HTML to original"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs hover:text-white hover:bg-slate-800"
                          onClick={() => setIsEditingHtml(!isEditingHtml)}
                        >
                          {isEditingHtml ? "Done" : "Edit"}
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="flex-1 bg-slate-950">
                      <div className="p-4 font-mono text-sm">
                        {isEditingHtml ? (
                          <Textarea 
                            value={htmlSource} 
                            onChange={(e) => setHtmlSource(e.target.value)}
                            className="min-h-[600px] bg-transparent border-none text-slate-300 focus-visible:ring-0 p-0 leading-relaxed resize-none font-mono"
                            spellCheck={false}
                            aria-label="Edit HTML source"
                          />
                        ) : (
                          <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {htmlSource}
                          </pre>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="tree" className="flex-1 m-0 flex flex-col overflow-hidden min-h-0">
                    <ScrollArea className="flex-1 bg-background">
                      <div className="p-6">
                        <div className="border rounded-md p-4 bg-muted/10">
                          <AccessibilityTreeNode node={MOCK_AX_TREE} />
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Pane: Review Panel */}
              <div className="col-span-5 bg-background flex flex-col border-l overflow-hidden min-h-0 shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
                <ScrollArea className="flex-1">
                  <div className="p-8 space-y-10">
                    {/* AI Reasoning */}
                    <section className="space-y-4" aria-labelledby="ai-reasoning-heading">
                      <div className="flex items-center justify-between">
                        <h3 id="ai-reasoning-heading" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">AI Reasoning Engine</h3>
                        <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-200 text-[10px] font-bold px-2 py-0.5">
                          Confidence: {Math.round((selectedFinding?.confidence || 0) * 100)}%
                        </Badge>
                      </div>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <Card className="relative bg-card border-indigo-100 dark:border-indigo-900/50 shadow-sm overflow-hidden">
                          <CardContent className="p-5 text-sm leading-relaxed">
                            <p className="text-slate-700 dark:text-slate-300">The image uses a generic alt attribute ("chart") which does not convey the actual data presented in the bar chart. Users relying on screen readers cannot access the financial data.</p>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-indigo-50 dark:border-indigo-900/30">
                              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                              <p className="text-indigo-600/70 dark:text-indigo-400/70 text-[10px] font-bold uppercase tracking-wider">
                                Cross-referenced via Axe-core & MCP Scanner
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </section>

                    <Separator className="opacity-50" />

                    {/* Human Review Form */}
                    <section className="space-y-6" aria-labelledby="review-decision-heading">
                      <h3 id="review-decision-heading" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">Human Verification</h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <label id="classification-label" className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Classification</label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between h-11 px-4 border-muted-foreground/20 hover:border-primary/30 transition-all" aria-labelledby="classification-label">
                                <span className="font-medium">{classification ? STATUS_CONFIG[classification as FindingStatus]?.label : "Select Status"}</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[200px] p-1">
                              {(Object.keys(STATUS_CONFIG) as FindingStatus[]).map(status => (
                                <DropdownMenuItem key={status} onClick={() => setClassification(status)} className="rounded-lg py-2">
                                  <div className="flex items-center gap-3">
                                    <div className={cn("p-1.5 rounded-md", status === "Pass" ? "bg-emerald-50" : status === "Violation" ? "bg-red-50" : "bg-orange-50")}>
                                      {React.createElement(STATUS_CONFIG[status].icon, { className: cn("h-3.5 w-3.5", STATUS_CONFIG[status].color) })}
                                    </div>
                                    <span className="font-medium">{STATUS_CONFIG[status].label}</span>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-2.5">
                          <label id="severity-label" className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Severity Level</label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between h-11 px-4 border-muted-foreground/20 hover:border-primary/30 transition-all" aria-labelledby="severity-label">
                                <span className="font-medium">{severity || "Select Severity"}</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[200px] p-1">
                              {(["Critical", "Serious", "Moderate", "Minor"] as Severity[]).map(sev => (
                                <DropdownMenuItem key={sev} onClick={() => setSeverity(sev)} className="rounded-lg py-2">
                                  <div className="flex items-center gap-3">
                                    <div className={cn("h-3 w-3 rounded-full shadow-sm", SEVERITY_COLORS[sev].split(" ")[0])} />
                                    <span className="font-medium">{sev}</span>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label htmlFor="reviewer-notes" className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Reviewer Notes</label>
                        <Textarea 
                          id="reviewer-notes"
                          placeholder="Add context or instructions for remediation..." 
                          className="min-h-[120px] resize-none border-muted-foreground/20 focus-visible:ring-primary/20 p-4 leading-relaxed" 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Metadata Tags</label>
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Tags">
                          {["Content Issue", "Design Issue", "Code Issue", "False Positive", "Needs Discussion"].map(tag => {
                            const isSelected = tags.includes(tag)
                            return (
                              <Badge 
                                key={tag} 
                                variant={isSelected ? "default" : "secondary"} 
                                className={cn(
                                  "cursor-pointer px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all", 
                                  isSelected 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
                                )}
                                onClick={() => {
                                  if (isSelected) setTags(tags.filter(t => t !== tag))
                                  else setTags([...tags, tag])
                                }}
                                role="checkbox"
                                aria-checked={isSelected}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    if (isSelected) setTags(tags.filter(t => t !== tag))
                                    else setTags([...tags, tag])
                                  }
                                }}
                              >
                                {tag}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    </section>

                    <Separator className="opacity-50" />

                    {/* Remediation */}
                    <section className="space-y-4" aria-labelledby="remediation-heading">
                      <h3 id="remediation-heading" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">Suggested Remediation</h3>
                      <div className="space-y-4">
                        <div className="rounded-xl bg-slate-950 p-5 text-xs font-mono text-slate-300 overflow-x-auto shadow-inner border border-slate-800">
                          <div className="text-red-400 opacity-50 mb-1.5 select-none">- &lt;img src="..." alt="chart" /&gt;</div>
                          <div className="text-emerald-400">+ &lt;img src="..." alt="Bar chart showing revenue growth..." /&gt;</div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full h-10 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-all" disabled>
                          Apply AI Fix (Coming Soon)
                        </Button>
                      </div>
                    </section>

                    <Separator className="opacity-50" />

                    {/* History */}
                    <section className="space-y-4 pb-8" aria-labelledby="history-heading">
                      <h3 id="history-heading" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">Audit History</h3>
                      <div className="relative pl-6 border-l-2 border-muted space-y-6">
                        <div className="relative">
                          <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background shadow-sm" />
                          <p className="text-sm font-bold">AI Engine Classification</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Flagged as <span className="text-orange-600 font-bold">RequiresHumanReview</span></p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase font-bold tracking-tighter">Feb 28, 2026 • 3:42 PM</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </ScrollArea>

                {/* Bottom Action Bar */}
                <div className="p-6 border-t bg-card flex items-center justify-between shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden lg:flex items-center gap-2">
                    <span className="bg-muted px-2 py-1 rounded border shadow-sm">⌘ + Enter</span>
                    <span>to submit review</span>
                  </div>
                  <div className="flex gap-4 w-full lg:w-auto">
                    <Button variant="outline" className="flex-1 lg:flex-none h-11 px-6 border-muted-foreground/20 hover:bg-muted transition-all" onClick={handleSaveDraft}>
                      <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                    <Button onClick={handleSubmitReview} className="flex-1 lg:flex-none min-w-[180px] h-11 px-8 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                      <Send className="mr-2 h-4 w-4" /> Submit Review
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
