import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import {
  Shield,
  Globe,
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Zap,
  Search,
  Layers,
  Brain,
  Wrench,
  BarChart3,
  Download,
  Sparkles,
  ExternalLink,
  Info,
  LayoutDashboard,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

// =============================================================================
// TYPES
// =============================================================================
interface WizardData {
  assetType: "website" | "documents" | null
  url: string
  docCount: number | null
  deadline: string
  email: string
  scanTier: "express" | "standard" | "deep"
  confidence: number[]
}

interface StepDef {
  id: number
  label: string
  sublabel: string
  icon: React.ElementType
}

// =============================================================================
// CONSTANTS
// =============================================================================
const STEPS: StepDef[] = [
  { id: 1, label: "Your Situation", sublabel: "Tell us about your situation", icon: Shield },
  { id: 2, label: "Configuration", sublabel: "We'll recommend the best approach", icon: Globe },
  { id: 3, label: "Options", sublabel: "Here's what happens next", icon: Layers },
  { id: 4, label: "Review", sublabel: "Review our plan", icon: Search },
  { id: 5, label: "Execution", sublabel: "We're on it", icon: Zap },
]

const DOJ_DEADLINE = new Date("2026-04-24T00:00:00")

const SCAN_TIERS = [
  {
    id: "express" as const,
    name: "Express Scan",
    desc: "Find obvious issues fast",
    time: "5–10 min",
    coverage: "Sitemap only",
    best: "Quick baseline assessment",
    icon: Zap,
  },
  {
    id: "standard" as const,
    name: "Standard Scan",
    desc: "Thorough and efficient",
    time: "15–30 min",
    coverage: "Recursive crawl (depth 3)",
    best: "Most compliance audits",
    icon: Shield,
    recommended: true,
  },
  {
    id: "deep" as const,
    name: "Deep Dive",
    desc: "Leave no stone unturned",
    time: "30–60 min",
    coverage: "Recursive crawl (depth 5)",
    best: "Complex government sites",
    icon: Layers,
  },
]

const EXECUTION_STAGES = [
  { id: "discover", label: "Discovering All Pages", desc: "Crawling your website structure for comprehensive coverage", icon: Search, result: "Found 847 pages" },
  { id: "scan", label: "Running Automated Scans", desc: "Testing each page against WCAG 2.1 AA guidelines via axe-core", icon: Shield, result: "1,204 violations, 387 incompletes" },
  { id: "ai", label: "AI Classification", desc: "Classifying ambiguous findings with confidence scoring", icon: Brain, result: "344 classified, 43 need review" },
  { id: "remediate", label: "Generating Remediation Plan", desc: "Building specific fix suggestions for every violation", icon: Wrench, result: "Remediation plan ready" },
  { id: "results", label: "Assembling Your Report", desc: "Compiling interactive dashboard, VPAT, and export files", icon: BarChart3, result: "Report assembled" },
]

const DOC_COUNTS = [
  { val: 100, label: "Under 100" },
  { val: 500, label: "100 – 500" },
  { val: 2000, label: "500 – 2,000" },
  { val: 10000, label: "2,000+" },
]

// =============================================================================
// UTILITIES
// =============================================================================
function getDaysUntilDeadline(): number {
  const now = new Date()
  const diff = DOJ_DEADLINE.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function validateUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Step progress indicator integrated into the card header area */
function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative flex items-center justify-between px-2 w-full">
      {/* Background Line */}
      <div className="absolute top-[1.125rem] left-[2.5rem] right-[2.5rem] h-0.5 bg-muted-foreground/20 z-0" />
      
      {/* Active Line */}
      <div 
        className="absolute top-[1.125rem] left-[2.5rem] h-0.5 bg-primary transition-all duration-500 z-0" 
        style={{ 
          width: `${Math.max(0, (currentStep - 1) / (STEPS.length - 1) * 100)}%`,
          maxWidth: 'calc(100% - 5rem)'
        }} 
      />

      {STEPS.map((step) => {
        const isComplete = currentStep > step.id
        const isCurrent = currentStep === step.id
        const StepIcon = step.icon

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 bg-background shadow-sm",
                isComplete && "border-primary bg-primary text-primary-foreground",
                isCurrent && "border-primary bg-primary/10 text-primary ring-4 ring-primary/10",
                !isComplete && !isCurrent && "border-muted-foreground/20 bg-muted text-muted-foreground"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <StepIcon className="h-4 w-4" />
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-bold tracking-wide whitespace-nowrap",
                isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** Countdown badge for the DOJ deadline */
function DeadlineBadge() {
  const days = getDaysUntilDeadline()
  return (
    <Badge
      variant={days <= 60 ? "destructive" : "secondary"}
      className={cn(
        "gap-1.5 px-3 py-1 text-xs font-semibold",
        days <= 60
          ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
          : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
      )}
    >
      <span className={cn(
        "inline-block h-1.5 w-1.5 rounded-full animate-pulse",
        days <= 60 ? "bg-destructive" : "bg-primary"
      )} />
      {days} days until DOJ Title II deadline
    </Badge>
  )
}

// =============================================================================
// STEP 1 — YOUR SITUATION
// =============================================================================
function Step1({
  data,
  onUpdate,
}: {
  data: WizardData
  onUpdate: (u: Partial<WizardData>) => void
}) {
  const stats = [
    { value: "90,000+", label: "Agencies Affected", color: "text-primary" },
    { value: "$150K", label: "Per Violation", color: "text-destructive" },
    { value: "5,100+", label: "Lawsuits (2025)", color: "text-amber-600 dark:text-amber-500" },
  ]

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <DeadlineBadge />
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          One Button. Full Compliance.
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
          Automated WCAG 2.1 AA compliance for government agencies — before the deadline.
          Let our experts handle everything.
        </p>
      </div>

      {/* Urgency Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 text-center shadow-sm"
          >
            <span className={cn("text-2xl font-bold", s.color)}>{s.value}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Asset Type Selection */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Tell us about your situation</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            What digital assets do you need to bring into compliance?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {([
            {
              type: "website" as const,
              icon: Globe,
              title: "Website",
              desc: "Scan public-facing web pages for WCAG violations",
            },
            {
              type: "documents" as const,
              icon: FileText,
              title: "Documents",
              desc: "Remediate PDFs and Office documents to PDF/UA compliance",
            },
          ]).map((opt) => {
            const selected = data.assetType === opt.type
            const Icon = opt.icon
            return (
              <button
                key={opt.type}
                onClick={() => onUpdate({ assetType: opt.type })}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-all duration-200",
                  "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                    : "border-muted-foreground/20"
                )}
              >
                <div className={cn(
                  "rounded-full p-3 transition-colors",
                  selected ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className={cn("h-6 w-6", selected ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div>
                  <div className={cn("text-sm font-semibold", selected && "text-primary")}>{opt.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* What Happens Next */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">What happens next:</span>{" "}
          We'll recommend the best approach, show you exactly what our platform will do,
          and execute your compliance audit — all within minutes.
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// STEP 2 — CONFIGURATION
// =============================================================================
function Step2({
  data,
  onUpdate,
}: {
  data: WizardData
  onUpdate: (u: Partial<WizardData>) => void
}) {
  const isWebsite = data.assetType === "website"
  const urlValid = data.url.length > 0 ? validateUrl(data.url) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">We'll recommend the best approach</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isWebsite
            ? "Enter your website URL and we'll handle the rest."
            : "Tell us about your document volume so we can scope your remediation."}
        </p>
      </div>

      <div className="space-y-5">
        {/* Primary Input */}
        {isWebsite ? (
          <div className="space-y-2">
            <label htmlFor="wizard-url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Website URL
            </label>
            <div className="relative">
              <Input
                id="wizard-url"
                type="url"
                placeholder="https://agency.ohio.gov"
                value={data.url}
                onChange={(e) => onUpdate({ url: e.target.value })}
                className={cn(
                  "pr-10 h-12 text-base font-mono",
                  urlValid === true && "border-emerald-500 focus-visible:ring-emerald-500/20",
                  urlValid === false && "border-destructive focus-visible:ring-destructive/20"
                )}
              />
              {urlValid === true && (
                <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-emerald-500" />
              )}
              {urlValid === false && (
                <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-destructive" />
              )}
            </div>
            {urlValid === true && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                URL accepted — we'll automatically discover all pages and linked documents.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Estimated Document Count
            </label>
            <div className="grid grid-cols-4 gap-3">
              {DOC_COUNTS.map((opt) => {
                const sel = data.docCount === opt.val
                return (
                  <button
                    key={opt.val}
                    onClick={() => onUpdate({ docCount: opt.val })}
                    aria-pressed={sel}
                    className={cn(
                      "rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all",
                      "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      sel
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Deadline */}
        <div className="space-y-2">
          <label htmlFor="wizard-deadline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Target Compliance Deadline
          </label>
          <Input
            id="wizard-deadline"
            type="date"
            value={data.deadline}
            onChange={(e) => onUpdate({ deadline: e.target.value })}
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            DOJ Title II deadline: April 24, 2026 — {getDaysUntilDeadline()} days remaining.
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="wizard-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email for Compliance Report
          </label>
          <Input
            id="wizard-email"
            type="email"
            placeholder="ada-coordinator@agency.gov"
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            className="h-10"
          />
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// STEP 3 — OPTIONS
// =============================================================================
function Step3({
  data,
  onUpdate,
}: {
  data: WizardData
  onUpdate: (u: Partial<WizardData>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Here's what happens next</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how deep you'd like us to go. We recommend Standard for most compliance audits.
        </p>
      </div>

      {/* Scan Tier Selection */}
      <div className="space-y-3">
        {SCAN_TIERS.map((tier) => {
          const sel = data.scanTier === tier.id
          const Icon = tier.icon
          return (
            <button
              key={tier.id}
              onClick={() => onUpdate({ scanTier: tier.id })}
              aria-pressed={sel}
              className={cn(
                "flex w-full items-start gap-4 rounded-lg border-2 p-4 text-left transition-all duration-200",
                "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                sel
                  ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                  : "border-muted-foreground/20"
              )}
            >
              <div className={cn(
                "rounded-full p-2.5 shrink-0 mt-0.5 transition-colors",
                sel ? "bg-primary/10" : "bg-muted"
              )}>
                <Icon className={cn("h-4 w-4", sel ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-semibold", sel && "text-primary")}>{tier.name}</span>
                  {tier.recommended && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{tier.desc}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {tier.time}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Layers className="h-3 w-3" /> {tier.coverage}
                  </span>
                </div>
              </div>
              <div className={cn(
                "h-5 w-5 rounded-full border-2 shrink-0 mt-1 transition-all flex items-center justify-center",
                sel ? "border-primary bg-primary" : "border-muted-foreground/30"
              )}>
                {sel && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
              </div>
            </button>
          )
        })}
      </div>

      <Separator />

      {/* Confidence Slider */}
      <div className="space-y-4 rounded-lg border bg-muted/30 p-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI Confidence Level
          </label>
          <span className="text-sm font-bold text-primary tabular-nums">
            {(data.confidence[0]!).toFixed(2)}
          </span>
        </div>
        <Slider
          value={data.confidence}
          onValueChange={(val) => onUpdate({ confidence: val })}
          max={1}
          min={0.5}
          step={0.05}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <div>
            <div className="font-semibold">Broad Coverage</div>
            <div>Catches more — may need review</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Balanced</div>
            <div>Accuracy meets efficiency</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">High Precision</div>
            <div>Only confident classifications</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Controls how our AI classifies ambiguous accessibility findings.
          Higher precision means less manual review but may miss edge cases.
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// STEP 4 — REVIEW
// =============================================================================
function Step4({
  data,
  onGoToStep,
}: {
  data: WizardData
  onGoToStep: (step: number) => void
}) {
  const tier = SCAN_TIERS.find((t) => t.id === data.scanTier) || SCAN_TIERS[1]!
  const isWebsite = data.assetType === "website"

  const summaryItems = [
    { label: "Scanning", value: isWebsite ? "Website" : "Documents" },
    { label: "Target", value: isWebsite ? (data.url || "—") : `~${(data.docCount || 0).toLocaleString()} documents` },
    { label: "Approach", value: tier.name },
    { label: "AI Confidence", value: `${((data.confidence[0]!) * 100).toFixed(0)}%` },
    { label: "Deadline", value: data.deadline || "2026-04-24" },
    { label: "Report to", value: data.email || "—" },
  ]

  const deliverables = [
    { icon: BarChart3, title: "Interactive Dashboard", desc: "Real-time compliance scores and violation maps" },
    { icon: Shield, title: "Violations Breakdown", desc: "Categorized by severity: Critical, Serious, Moderate, Minor" },
    { icon: Brain, title: "AI Remediation Plan", desc: "Specific fix suggestions for every violation found" },
    { icon: Download, title: "Export Options", desc: "Audit report, VPAT template, CSV data, PDF summary" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Review our plan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here's exactly what we'll do. Review the details, then execute with confidence.
        </p>
      </div>

      {/* Audit Summary */}
      <div className="rounded-lg border bg-muted/30 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your Audit Summary
          </h3>
          <Button
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={() => onGoToStep(3)}
          >
            Edit options →
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {summaryItems.map((item) => (
            <div key={item.label}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </div>
              <div className="text-sm font-medium text-foreground mt-0.5 break-all">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Timeline */}
      <div className="rounded-lg border p-5 space-y-4">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Execution Pipeline
        </h3>
        <div className="space-y-0">
          {EXECUTION_STAGES.map((stage, i) => {
            const Icon = stage.icon
            return (
              <div key={stage.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {i < EXECUTION_STAGES.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="pb-4">
                  <div className="text-sm font-medium">Stage {i + 1}: {stage.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stage.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">
            Estimated duration: {tier.time}
          </span>
        </div>
      </div>

      {/* Deliverables */}
      <div className="rounded-lg border p-5 space-y-4">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          What You'll Get
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {deliverables.map((d) => {
            const Icon = d.icon
            return (
              <div key={d.title} className="rounded-md border bg-card p-3 space-y-1.5">
                <Icon className="h-4 w-4 text-primary" />
                <div className="text-xs font-semibold">{d.title}</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">{d.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Transparency Note */}
      <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Our commitment to transparency:</span>{" "}
          Automated scans cover ~57% of WCAG 2.1 AA criteria. We'll clearly identify which findings
          are verified by automation and which require human expert review. No overlays. No shortcuts. Real compliance.
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// STEP 5 — EXECUTION
// =============================================================================
function Step5({ data, onComplete: _onComplete }: { data: WizardData; onComplete: () => void }) {
  const [currentStage, setCurrentStage] = React.useState(0)
  const [complete, setComplete] = React.useState(false)
  const navigate = useNavigate()
  const tier = SCAN_TIERS.find((t) => t.id === data.scanTier) || SCAN_TIERS[1]!

  React.useEffect(() => {
    if (complete) return
    if (currentStage >= EXECUTION_STAGES.length) {
      setComplete(true)
      return
    }
    const timer = setTimeout(() => {
      setCurrentStage((prev) => prev + 1)
    }, 2000)
    return () => clearTimeout(timer)
  }, [currentStage, complete])

  if (complete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Audit Complete</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your compliance report is ready with remediation instructions for every violation.
            </p>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: "847", label: "Pages Scanned", color: "text-primary" },
            { value: "23", label: "Critical Issues", color: "text-destructive" },
            { value: "67", label: "Compliance Score", color: "text-amber-600 dark:text-amber-500" },
            { value: "47", label: "PDFs Found", color: "text-violet-600 dark:text-violet-500" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center rounded-lg border bg-card p-3 text-center shadow-sm">
              <span className={cn("text-2xl font-bold", s.color)}>{s.value}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button className="w-full h-11" onClick={() => navigate("/audit/v2.4.1")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Full Dashboard
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-10">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Button variant="outline" className="h-10">
              <ExternalLink className="mr-2 h-4 w-4" />
              Export VPAT
            </Button>
          </div>
        </div>

        {/* Document Remediation Upsell */}
        <div className="rounded-lg border border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-primary/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-semibold">47 PDFs need remediation for full compliance</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our document remediation engine can fix these automatically — WCAG 2.1 AA + PDF/UA compliant
            in under 2 minutes per document.
          </p>
          <Button
            variant="secondary"
            className="bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            Start Document Remediation
          </Button>
        </div>
      </motion.div>
    )
  }

  // --- Active Scanning State ---
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">We're on it</h2>
        <p className="text-sm text-muted-foreground">
          Running your {tier.name} audit. Here's what's happening in real time.
        </p>
      </div>

      {/* Animated Shield */}
      <div className="relative mx-auto w-28 h-28">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent opacity-20" />
        <div className="absolute inset-[-8px] animate-[spin_3s_linear_infinite] rounded-full border-2 border-dashed border-primary/40" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-primary/10 animate-pulse">
          <Shield className="h-12 w-12 text-primary" />
        </div>
      </div>

      {/* Stage Progress */}
      <div className="w-full space-y-3 px-2">
        <AnimatePresence mode="popLayout">
          {EXECUTION_STAGES.map((stage, index) => {
            const isCompleted = index < currentStage
            const isCurrent = index === currentStage
            const isFuture = index > currentStage

            if (isFuture) return null
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-3 transition-all",
                  isCurrent && "bg-primary/5 border border-primary/20",
                  isCompleted && "opacity-80"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className={cn(
                    "text-sm",
                    isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}>
                    Stage {index + 1}: {stage.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stage.desc}</div>
                  {isCompleted && stage.result && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
                      ✓ {stage.result}
                    </span>
                  )}
                  {isCurrent && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: "5%" }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 1.8, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN EXPORT — StartHere Page
// =============================================================================
export function StartHere() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = React.useState(1)
  const [data, setData] = React.useState<WizardData>({
    assetType: null,
    url: "",
    docCount: null,
    deadline: "2026-04-24",
    email: "",
    scanTier: "standard",
    confidence: [0.75],
  })

  const updateData = React.useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const canProceed = React.useMemo(() => {
    switch (step) {
      case 1: return data.assetType !== null
      case 2:
        if (data.assetType === "website") return validateUrl(data.url)
        return data.docCount !== null
      case 3: return data.scanTier !== null
      case 4: return true
      default: return false
    }
  }, [step, data])

  const goNext = () => {
    if (step === 4) {
      toast("Audit initiated successfully", "success")
    }
    setStep((s) => Math.min(s + 1, 5))
  }

  const goBack = () => setStep((s) => Math.max(s - 1, 1))
  const goTo = (s: number) => setStep(s)

  const isExecuting = step === 5

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-x-hidden p-4 md:p-8">
      {/* Background Accents - Immersive Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.02)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.02)_100%)]" />
      </div>

      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 p-6 flex items-center justify-between z-50 bg-background/80 backdrop-blur-md border-b lg:bg-transparent lg:backdrop-blur-none lg:border-none">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">ACCEDA</span>
        </div>
        <Link 
          to="/new-audit" 
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all group"
        >
          <LayoutDashboard className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          <span className="hidden sm:inline">Skip to Dashboard</span>
          <span className="sm:hidden">Skip</span>
        </Link>
      </header>

      <div className="relative z-10 w-full max-w-2xl mt-16 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="w-full shadow-2xl border-primary/10 bg-card/90 backdrop-blur-xl">
            {/* Step Progress in Header */}
            {!isExecuting && (
              <CardHeader className="p-6 pb-8 border-b bg-muted/30">
                <StepProgress currentStep={step} />
              </CardHeader>
            )}

            <CardContent className={cn("pt-8", isExecuting && "pt-10")}>
              {/* Screen reader announcement */}
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                Step {step} of 5: {STEPS[step - 1]?.sublabel}
              </div>

              {/* Step Content with Animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {step === 1 && <Step1 data={data} onUpdate={updateData} />}
                  {step === 2 && <Step2 data={data} onUpdate={updateData} />}
                  {step === 3 && <Step3 data={data} onUpdate={updateData} />}
                  {step === 4 && <Step4 data={data} onGoToStep={goTo} />}
                  {step === 5 && <Step5 data={data} onComplete={() => navigate("/audit/v2.4.1")} />}
                </motion.div>
              </AnimatePresence>
            </CardContent>

            {/* Navigation Footer */}
            {!isExecuting && (
              <>
                <Separator />
                <CardFooter className="flex items-center justify-between p-6 bg-muted/10">
                  {step > 1 ? (
                    <Button variant="outline" onClick={goBack} className="gap-2 h-11 px-6">
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button
                    onClick={goNext}
                    disabled={!canProceed}
                    className={cn(
                      "gap-2 min-w-[160px] h-11 px-8 shadow-lg shadow-primary/20 transition-all active:scale-95",
                      step === 4 && "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {step === 4 ? (
                      <>
                        <Shield className="h-4 w-4" />
                        Execute Audit
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </motion.div>

        {/* Subtle footer note */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            <span>Section 508</span>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span>WCAG 2.1 AA</span>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span>ADA Title II</span>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-60">
            SOC 2 Type I &middot; FedRAMP Ready &middot; HIPAA Compliant
          </p>
        </div>
      </div>
    </div>
  )
}
