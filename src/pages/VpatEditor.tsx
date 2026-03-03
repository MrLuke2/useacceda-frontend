import * as React from "react"
import { 
  FileText, 
  Download, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  XCircle, 
  HelpCircle, 
  MinusCircle, 
  ChevronUp
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { mockAuditData, AuditHistoryEntry } from "@/lib/mock-data"
import { useAuditStore } from "@/store/useAuditStore"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

// --- Types & Constants ---

type ConformanceLevel = "Supports" | "Partially Supports" | "Does Not Support" | "Not Applicable" | "Not Evaluated"

interface VpatCriterion {
  id: string
  name: string
  level: "A" | "AA" | "AAA"
  principle: "Perceivable" | "Operable" | "Understandable" | "Robust"
  description: string
  conformance: ConformanceLevel
  remarks: string
  violationCount: number
  pagesAffected: number // Simulated for this mock
}

const CONFORMANCE_OPTIONS: { value: ConformanceLevel; label: string; color: string; icon: React.ElementType }[] = [
  { value: "Supports", label: "Supports", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  { value: "Partially Supports", label: "Partially Supports", color: "text-amber-600 bg-amber-50 border-amber-200", icon: AlertTriangle },
  { value: "Does Not Support", label: "Does Not Support", color: "text-destructive bg-destructive/10 border-destructive/20", icon: XCircle },
  { value: "Not Applicable", label: "Not Applicable", color: "text-slate-500 bg-slate-100 border-slate-200", icon: MinusCircle },
  { value: "Not Evaluated", label: "Not Evaluated", color: "text-slate-400 bg-slate-50 border-slate-100", icon: HelpCircle },
]

const WCAG_MAPPING: Record<string, { name: string; principle: VpatCriterion["principle"]; description: string }> = {
  "SC 1.1.1": { name: "Non-text Content", principle: "Perceivable", description: "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose." },
  "SC 1.2.1": { name: "Audio-only and Video-only (Prerecorded)", principle: "Perceivable", description: "For prerecorded audio-only and video-only media, the following are true, except when the audio or video is a media alternative for text and is clearly labeled as such." },
  "SC 1.3.1": { name: "Info and Relationships", principle: "Perceivable", description: "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text." },
  "SC 1.4.1": { name: "Use of Color", principle: "Perceivable", description: "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." },
  "SC 1.4.3": { name: "Contrast (Minimum)", principle: "Perceivable", description: "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1." },
  "SC 2.1.1": { name: "Keyboard", principle: "Operable", description: "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes." },
  "SC 2.1.2": { name: "No Keyboard Trap", principle: "Operable", description: "If keyboard focus can be moved to a component of the page using a keyboard interface, then focus can be moved away from that component using only a keyboard interface." },
  "SC 2.2.1": { name: "Timing Adjustable", principle: "Operable", description: "For each time limit that is set by the content, at least one of the following is true." },
  "SC 2.4.1": { name: "Bypass Blocks", principle: "Operable", description: "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages." },
  "SC 2.4.2": { name: "Page Titled", principle: "Operable", description: "Web pages have titles that describe topic or purpose." },
  "SC 2.4.3": { name: "Focus Order", principle: "Operable", description: "If a Web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability." },
  "SC 2.4.4": { name: "Link Purpose (In Context)", principle: "Operable", description: "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context." },
  "SC 3.1.1": { name: "Language of Page", principle: "Understandable", description: "The default human language of each Web page can be programmatically determined." },
  "SC 3.2.1": { name: "On Focus", principle: "Understandable", description: "When any component receives focus, it does not initiate a change of context." },
  "SC 3.3.1": { name: "Error Identification", principle: "Understandable", description: "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text." },
  "SC 3.3.2": { name: "Labels or Instructions", principle: "Understandable", description: "Labels or instructions are provided when content requires user input." },
  "SC 4.1.1": { name: "Parsing", principle: "Robust", description: "In content implemented using markup languages, elements have complete start and end tags, elements are nested according to their specifications, elements do not contain duplicate attributes, and any IDs are unique." },
  "SC 4.1.2": { name: "Name, Role, Value", principle: "Robust", description: "For all user interface components (including but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined." },
}

// --- Components ---

function ConformanceSelect({ 
  value, 
  onChange 
}: { 
  value: ConformanceLevel; 
  onChange: (val: ConformanceLevel) => void 
}) {
  const selected = CONFORMANCE_OPTIONS.find(o => o.value === value) || CONFORMANCE_OPTIONS[4]!
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "w-[180px] justify-between border h-8 text-xs font-medium",
            selected.color
          )}
        >
          <div className="flex items-center gap-2">
            <selected.icon className="h-3.5 w-3.5" />
            {selected.label}
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {CONFORMANCE_OPTIONS.map((option) => (
          <DropdownMenuItem 
            key={option.value} 
            onClick={() => onChange(option.value)}
            className="gap-2"
          >
            <option.icon className={cn("h-4 w-4", option.color.split(" ")[0])} />
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function VpatEditor() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(true)
  const audits = useAuditStore(state => state.audits)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const [productInfo, setProductInfo] = React.useState({
    name: "Acme Web Platform",
    version: "v2.4.1",
    description: "Enterprise dashboard for managing accessibility compliance and reporting.",
    date: new Date().toISOString().split('T')[0],
    contact: "accessibility@acme.com",
    methods: {
      manual: true,
      automated: true,
      screenReader: true,
      keyboard: true
    }
  })

  // Initialize VPAT data from mock audit
  const [criteria, setCriteria] = React.useState<VpatCriterion[]>(() => {
    return mockAuditData.wcagHeatmap.map(item => {
      const mapping = WCAG_MAPPING[item.criterion] || { 
        name: "Unknown Criterion", 
        principle: "Robust", 
        description: "" 
      }
      
      // Heuristic for conformance
      let conformance: ConformanceLevel = "Not Evaluated"
      const pagesAffected = Math.min(Math.ceil(item.count / 3), mockAuditData.metrics.totalPages)
      
      if (item.count === 0) {
        conformance = "Supports"
      } else if (pagesAffected / mockAuditData.metrics.totalPages > 0.5) {
        conformance = "Does Not Support"
      } else {
        conformance = "Partially Supports"
      }

      return {
        id: item.criterion,
        name: mapping.name,
        level: item.level as "A" | "AA" | "AAA",
        principle: mapping.principle,
        description: mapping.description,
        conformance,
        remarks: item.count > 0 
          ? `Found ${item.count} violations across approximately ${pagesAffected} pages.` 
          : "No violations found during automated and manual testing.",
        violationCount: item.count,
        pagesAffected
      }
    })
  })

  const [isSection508Open, setIsSection508Open] = React.useState(false)

  // Calculate progress
  const evaluatedCount = criteria.filter(c => c.conformance !== "Not Evaluated").length
  const progress = (evaluatedCount / criteria.length) * 100

  const handleCriterionChange = (id: string, field: keyof VpatCriterion, value: any) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const handleExport = (format: "PDF" | "DOCX") => {
    toast(`Exporting VPAT as ${format}...`, "info")
    // Simulate export delay
    setTimeout(() => {
      toast(`VPAT exported successfully.`, "success")
    }, 1500)
  }

  const groupedCriteria = React.useMemo(() => {
    const groups: Record<string, VpatCriterion[]> = {
      Perceivable: [],
      Operable: [],
      Understandable: [],
      Robust: []
    }
    criteria.forEach(c => {
      if (groups[c.principle]) {
        groups[c.principle]!.push(c)
      }
    })
    return groups
  }, [criteria])

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
        <Card className="max-w-5xl mx-auto border shadow-sm">
          <CardHeader className="border-b pb-8">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="space-y-6">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full md:col-span-2" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VPAT Editor</h1>
          <p className="text-sm text-muted-foreground">
            Generate and edit Voluntary Product Accessibility Conformance Templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Generate from Audit
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Recent Audits</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {audits.filter(a => a.status === "Complete").slice(0, 5).map((audit: AuditHistoryEntry) => (
                <DropdownMenuItem 
                  key={audit.id} 
                  onClick={() => toast(`VPAT data refreshed from Audit ${audit.id}`, "success")}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-sm">{audit.id}</span>
                    <span className="text-xs text-muted-foreground">{audit.timestamp}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={() => handleExport("DOCX")}>
            <FileText className="mr-2 h-4 w-4" /> Export DOCX
          </Button>
          <Button onClick={() => handleExport("PDF")}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-muted-foreground">Completion Status</span>
            <span className="font-bold">{evaluatedCount} of {criteria.length} criteria evaluated</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* VPAT Document Area */}
      <Card className="max-w-5xl mx-auto border shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-serif">Accessibility Conformance Report</CardTitle>
              <CardDescription className="mt-1">ITI VPAT® Version 2.5 (Revised) • International Edition</CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">v2.5</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-10">
          {/* Section 1: Product Information */}
          <section className="space-y-6" aria-labelledby="product-info-heading">
            <h2 id="product-info-heading" className="text-lg font-semibold border-b pb-2">1. Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="product-name" className="text-sm font-medium">Product Name</label>
                <Input 
                  id="product-name"
                  value={productInfo.name} 
                  onChange={(e) => setProductInfo({...productInfo, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="product-version" className="text-sm font-medium">Product Version</label>
                <Input 
                  id="product-version"
                  value={productInfo.version} 
                  onChange={(e) => setProductInfo({...productInfo, version: e.target.value})} 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="product-description" className="text-sm font-medium">Product Description</label>
                <Textarea 
                  id="product-description"
                  value={productInfo.description} 
                  onChange={(e) => setProductInfo({...productInfo, description: e.target.value})} 
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="report-date" className="text-sm font-medium">Report Date</label>
                <Input 
                  id="report-date"
                  type="date"
                  value={productInfo.date} 
                  onChange={(e) => setProductInfo({...productInfo, date: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-info" className="text-sm font-medium">Contact Information</label>
                <Input 
                  id="contact-info"
                  value={productInfo.contact} 
                  onChange={(e) => setProductInfo({...productInfo, contact: e.target.value})} 
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-medium" id="evaluation-methods-label">Evaluation Methods Used</label>
                <div className="flex flex-wrap gap-6" role="group" aria-labelledby="evaluation-methods-label">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="method-manual" 
                      checked={productInfo.methods.manual}
                      onCheckedChange={(c) => setProductInfo({...productInfo, methods: {...productInfo.methods, manual: !!c}})}
                    />
                    <label htmlFor="method-manual" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Manual Testing
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="method-auto" 
                      checked={productInfo.methods.automated}
                      onCheckedChange={(c) => setProductInfo({...productInfo, methods: {...productInfo.methods, automated: !!c}})}
                    />
                    <label htmlFor="method-auto" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Automated Tools
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="method-screen" 
                      checked={productInfo.methods.screenReader}
                      onCheckedChange={(c) => setProductInfo({...productInfo, methods: {...productInfo.methods, screenReader: !!c}})}
                    />
                    <label htmlFor="method-screen" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Screen Reader
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="method-keyboard" 
                      checked={productInfo.methods.keyboard}
                      onCheckedChange={(c) => setProductInfo({...productInfo, methods: {...productInfo.methods, keyboard: !!c}})}
                    />
                    <label htmlFor="method-keyboard" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Keyboard Testing
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: WCAG Conformance Table */}
          <section className="space-y-6" aria-labelledby="wcag-report-heading">
            <h2 id="wcag-report-heading" className="text-lg font-semibold border-b pb-2">2. WCAG 2.1 Report</h2>
            
            {/* Principles Loop */}
            {(["Perceivable", "Operable", "Understandable", "Robust"] as const).map((principle) => (
              <div key={principle} className="space-y-4">
                <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-sm bg-muted/30 p-2 rounded">
                  Principle: {principle}
                </h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead scope="col" className="w-[30%]">Criteria</TableHead>
                        <TableHead scope="col" className="w-[25%]">Conformance Level</TableHead>
                        <TableHead scope="col">Remarks and Explanations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedCriteria[principle]!.map((criterion) => (
                        <TableRow key={criterion.id}>
                          <TableCell className="align-top py-4">
                            <div className="font-medium">{criterion.id} {criterion.name}</div>
                            <div className="text-xs text-muted-foreground mt-1 mb-2">{criterion.description}</div>
                            <Badge variant="outline" className="text-[10px]">Level {criterion.level}</Badge>
                            {criterion.violationCount > 0 && (
                              <div className="mt-2 text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {criterion.violationCount} violations across ~{criterion.pagesAffected} pages
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="align-top py-4">
                            <ConformanceSelect 
                              value={criterion.conformance} 
                              onChange={(val) => handleCriterionChange(criterion.id, "conformance", val)} 
                            />
                          </TableCell>
                          <TableCell className="align-top py-4">
                            <Textarea 
                              value={criterion.remarks} 
                              onChange={(e) => handleCriterionChange(criterion.id, "remarks", e.target.value)}
                              className="min-h-[100px] text-sm"
                              aria-label={`Remarks for ${criterion.id}`}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </section>

          {/* Section 3: Revised Section 508 (Collapsible) */}
          <section className="space-y-6" aria-labelledby="section-508-heading">
            <div 
              className="flex items-center justify-between cursor-pointer border-b pb-2 hover:bg-muted/10 transition-colors"
              onClick={() => setIsSection508Open(!isSection508Open)}
              role="button"
              aria-expanded={isSection508Open}
              aria-controls="section-508-content"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setIsSection508Open(!isSection508Open)
                }
              }}
            >
              <h2 id="section-508-heading" className="text-lg font-semibold">3. Revised Section 508 Report</h2>
              <Button variant="ghost" size="sm" tabIndex={-1}>
                {isSection508Open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            <AnimatePresence>
              {isSection508Open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                  id="section-508-content"
                >
                  <div className="rounded-md border mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead scope="col" className="w-[30%]">Criteria</TableHead>
                          <TableHead scope="col" className="w-[25%]">Conformance Level</TableHead>
                          <TableHead scope="col">Remarks and Explanations</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Chapter 3: Functional Performance Criteria</TableCell>
                          <TableCell>
                            <Badge variant="outline">See WCAG 2.x section</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            Adherence to WCAG 2.1 Level AA implies conformance with 508 Chapter 3.
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Chapter 4: Hardware</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Not Applicable</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            Product is a web application, not hardware.
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Chapter 5: Software</TableCell>
                          <TableCell>
                            <Badge variant="outline">See WCAG 2.x section</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            See information in WCAG 2.1 Report section.
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Chapter 6: Support Documentation and Services</TableCell>
                          <TableCell>
                            <ConformanceSelect value="Supports" onChange={() => {}} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            Documentation is provided in accessible HTML format.
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
