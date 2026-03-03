import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { UploadCloud, Globe, CheckCircle2, AlertCircle, Loader2, Shield, RefreshCcw, Sparkles, FileText, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function NewAudit() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [url, setUrl] = React.useState("")
  const [isValidUrl, setIsValidUrl] = React.useState<boolean | null>(null)
  const [confidence, setConfidence] = React.useState([0.75])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [currentStage, setCurrentStage] = React.useState(0)
  const [isDocumentMode, setIsDocumentMode] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<string | null>(null)

  const WEBSITE_STAGES = [
    { label: "Discovering pages via sitemap...", result: "Found 847 pages" },
    { label: "Running axe-core scans...", result: "1,204 violations, 387 incompletes" },
    { label: "Deploying AI agents for 387 incompletes...", result: "344 classified, 43 need review" },
    { label: "Generating remediation suggestions...", result: "" },
    { label: "Audit complete! Redirecting...", result: "" },
  ]

  const DOCUMENT_STAGES = [
    { label: "Extracting document structure...", result: "124 pages, 42 tables" },
    { label: "Analyzing tag tree for PDF/UA compliance...", result: "87 missing alt-texts, 12 heading errors" },
    { label: "AI Remediation of complex tables...", result: "42 tables remediated" },
    { label: "Generating accessible PDF/UA output...", result: "" },
    { label: "Remediation complete! Redirecting...", result: "" },
  ]

  const STAGES = isDocumentMode ? DOCUMENT_STAGES : WEBSITE_STAGES

  React.useEffect(() => {
    if (isLoading && currentStage < STAGES.length) {
      const timer = setTimeout(() => {
        if (currentStage === STAGES.length - 1) {
          navigate("/audit/v2.4.1")
        } else {
          setCurrentStage(prev => prev + 1)
        }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isLoading, currentStage, navigate])

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)
    if (value.length > 0) {
      try {
        new URL(value)
        setIsValidUrl(true)
      } catch {
        setIsValidUrl(false)
      }
    } else {
      setIsValidUrl(null)
    }
  }

  const handleStartAudit = () => {
    if (isValidUrl || (isDocumentMode && uploadedFile)) {
      // Simulate failure if URL contains 'fail'
      if (!isDocumentMode && url.toLowerCase().includes('fail')) {
        setIsLoading(true)
        setCurrentStage(0)
        setTimeout(() => {
          setIsLoading(false)
          setHasError(true)
          toast("Scan failed: Connection timeout", "error")
        }, 1500)
        return
      }

      setIsLoading(true)
      setHasError(false)
      setCurrentStage(0)
      toast("Audit initiated successfully", "success")
    }
  }

  const handleRetry = () => {
    setHasError(false)
    handleStartAudit()
  }

  if (hasError) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-xl border-destructive/20 text-center">
          <CardContent className="pt-12 pb-12 flex flex-col items-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Scan failed</h1>
              <p className="text-muted-foreground">
                We encountered an error while attempting to scan <span className="font-medium text-foreground">{url}</span>. 
                Please check the URL and try again.
              </p>
            </div>
            <div className="flex flex-col w-full gap-3">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry Scan
              </Button>
              <Button variant="outline" onClick={() => setHasError(false)} className="w-full">
                Back to Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12">
        <Card className="w-full max-w-lg shadow-xl border-primary/20">
          <CardContent className="pt-12 pb-12 flex flex-col items-center space-y-8">
            {/* Pulsing Shield with Rotating Ring */}
            <div className="relative">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent opacity-20" />
              <div className="absolute inset-[-8px] animate-[spin_3s_linear_infinite] rounded-full border-2 border-dashed border-primary/40" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 animate-pulse">
                {isDocumentMode ? <FileText className="h-12 w-12 text-primary" /> : <Shield className="h-12 w-12 text-primary" />}
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">
                {isDocumentMode ? `Remediating ${uploadedFile}` : `Scanning ${url}`}
              </h2>
              <p className="text-sm text-muted-foreground animate-pulse">
                {isDocumentMode ? "Document remediation in progress..." : "Analysis in progress..."}
              </p>
            </div>

            <div className="w-full space-y-4 px-4">
              {STAGES.map((stage, index) => {
                const isCompleted = index < currentStage
                const isCurrent = index === currentStage
                const isFuture = index > currentStage

                if (isFuture) return null

                return (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-start gap-3 text-sm transition-all duration-300 animate-in fade-in slide-in-from-left-4",
                      isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                    )}
                    <div className="flex flex-col">
                      <span className={cn(isCurrent && "font-medium text-foreground")}>
                        {stage.label}
                      </span>
                      {isCompleted && stage.result && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                          ✓ {stage.result}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-start pt-32 pb-12 px-4">
      {/* Wizard Callout */}
      <div className="w-full max-w-2xl mb-6">
        <Link 
          to="/" 
          className="group flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all hover:bg-primary/10"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Need a guided experience?</div>
              <div className="text-xs text-muted-foreground">Try our 5-step Compliance Wizard for personalized recommendations.</div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">Compose a New Audit</h1>
          <CardDescription>
            Paste a URL or drop a file to start a direct scan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="website" className="w-full" onValueChange={(v) => setIsDocumentMode(v === "document")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website Scan
              </TabsTrigger>
              <TabsTrigger value="document" className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                Document Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="website" className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="https://useacceda.com"
                    value={url}
                    onChange={handleUrlChange}
                    className="pr-10 h-12 text-base"
                  />
                  {isValidUrl === true && (
                    <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-emerald-500" />
                  )}
                  {isValidUrl === false && (
                    <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full border rounded-md px-4">
                <AccordionItem value="advanced" className="border-none">
                  <AccordionTrigger className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:no-underline">
                    Advanced Options
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Scan Tier
                      </label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option>Express (Sitemap only)</option>
                        <option selected>Standard (Recursive depth 3)</option>
                        <option>Deep Dive (Recursive depth 5)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Include/Exclude Patterns
                      </label>
                      <Input placeholder="e.g., /blog/*, -/admin/*" className="h-9" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Conformance Target
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="target" defaultChecked className="text-primary" />
                          WCAG 2.1 AA
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="target" className="text-primary" />
                          WCAG 2.1 AAA
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="target" className="text-primary" />
                          WCAG 2.2 AA
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          AI Confidence Threshold
                        </label>
                        <span className="text-sm font-medium text-primary">{confidence[0]!.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={confidence}
                        onValueChange={setConfidence}
                        max={1}
                        min={0.5}
                        step={0.05}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="space-y-3">
                <Button
                  className="w-full h-12 text-base font-medium"
                  disabled={!isValidUrl}
                  onClick={handleStartAudit}
                >
                  Start Audit
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Powered by axe-core + AI Agent Pipeline
                </p>
              </div>
            </TabsContent>

            <TabsContent value="document" className="space-y-6">
              <button 
                onClick={() => setUploadedFile("Annual_Report_2025.pdf")}
                className={cn(
                  "flex h-[200px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all",
                  uploadedFile 
                    ? "border-emerald-500/50 bg-emerald-500/5" 
                    : "border-muted-foreground/25 bg-muted/10 hover:bg-muted/20"
                )}
              >
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className={cn("rounded-full p-3", uploadedFile ? "bg-emerald-500/10" : "bg-primary/10")}>
                    {uploadedFile ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <UploadCloud className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {uploadedFile ? uploadedFile : "Drop files here or click to browse"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {uploadedFile ? "File ready for analysis" : "Up to 50MB per file"}
                    </p>
                  </div>
                  {!uploadedFile && (
                    <div className="flex gap-2">
                      <Badge variant="secondary">PDF</Badge>
                      <Badge variant="secondary">DOCX</Badge>
                      <Badge variant="secondary">HTML</Badge>
                    </div>
                  )}
                </div>
              </button>

              <Accordion type="single" collapsible className="w-full border rounded-md px-4">
                <AccordionItem value="advanced" className="border-none">
                  <AccordionTrigger className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:no-underline">
                    Advanced Options
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Conformance Target
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="doc-target" defaultChecked className="text-primary" />
                          WCAG 2.1 AA
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="doc-target" className="text-primary" />
                          WCAG 2.2 AA
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          AI Confidence Threshold
                        </label>
                        <span className="text-sm font-medium text-primary">{confidence[0]!.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={confidence}
                        onValueChange={setConfidence}
                        max={1}
                        min={0.5}
                        step={0.05}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="space-y-3">
                <Button 
                  className="w-full h-12 text-base font-medium" 
                  disabled={!uploadedFile}
                  onClick={handleStartAudit}
                >
                  Analyze Document
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Powered by axe-core + AI Agent Pipeline
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col items-center justify-center p-6 space-y-6 bg-muted/20">
          <div className="flex w-full items-center justify-between">
            <h4 className="text-sm font-medium">Platform Activity</h4>
            <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate("/audits")}>
              View Recent Audits &rarr;
            </Button>
          </div>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-md border bg-card p-3 text-center shadow-sm">
              <span className="text-2xl font-bold text-primary">12,847</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pages Scanned</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border bg-card p-3 text-center shadow-sm">
              <span className="text-2xl font-bold text-destructive">3,201</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Violations Found</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border bg-card p-3 text-center shadow-sm">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">89%</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Classification</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
