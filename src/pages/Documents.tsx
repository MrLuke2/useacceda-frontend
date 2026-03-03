import * as React from "react"
import { 
  FileText, 
  FileType2, 
  Globe, 
  Plus, 
  Search, 
  Eye, 
  Scan, 
  Trash2, 
  UploadCloud, 
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpDown,
  MoreHorizontal,
  FileStack
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { DocumentEntry } from "@/lib/mock-data"
import { useDocumentStore } from "@/store/useDocumentStore"
import { cn } from "@/lib/utils"

function ComplianceScoreGauge({ score, size = 32 }: { score: number; size?: number }) {
  const radius = 15.9155
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`
  
  const getColor = (s: number) => {
    if (s >= 90) return "text-emerald-500 stroke-emerald-500"
    if (s >= 70) return "text-amber-500 stroke-amber-500"
    return "text-destructive stroke-destructive"
  }
  
  const colorClass = getColor(score)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
        <circle
          className="stroke-muted"
          strokeWidth="3"
          fill="none"
          cx="18"
          cy="18"
          r={radius}
        />
        <circle
          className={cn("transition-all duration-1000 ease-out", colorClass.split(' ')[1])}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          fill="none"
          cx="18"
          cy="18"
          r={radius}
        />
      </svg>
      <div className={cn("absolute inset-0 flex items-center justify-center text-[10px] font-bold", colorClass.split(' ')[0])}>
        {score}
      </div>
    </div>
  )
}

export function Documents() {
  const navigate = useNavigate()
  const { documents, isLoading, fetchDocuments, addDocument, deleteDocument, updateDocumentStatus } = useDocumentStore()
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [sortField, setSortField] = React.useState<keyof DocumentEntry>("uploadedAt")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc")

  React.useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const filteredDocuments = React.useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === "all" || doc.fileType.toLowerCase() === activeTab.toLowerCase()
      return matchesSearch && matchesTab
    }).sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      const modifier = sortDirection === "asc" ? 1 : -1
      if (aVal < bVal) return -1 * modifier
      if (aVal > bVal) return 1 * modifier
      return 0
    })
  }, [documents, searchQuery, activeTab, sortField, sortDirection])

  const handleSort = (field: keyof DocumentEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleUpload = (fileName: string) => {
    const fileType = fileName.split('.').pop()?.toUpperCase() as "PDF" | "DOCX" | "HTML"
    const newDoc: DocumentEntry = {
      id: `doc-${Date.now()}`,
      name: fileName,
      fileType: fileType || "PDF",
      status: "Processing",
      pages: Math.floor(Math.random() * 50) + 1,
      findingsCount: 0,
      aiRemediatedCount: 0,
      complianceScore: 0,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fileSize: "1.2 MB"
    }

    addDocument(newDoc)
    setIsUploadModalOpen(false)

    // Simulate processing
    setTimeout(() => {
      updateDocumentStatus(newDoc.id, "Scanned")
      // In a real app we'd trigger a more complex update but for now this works with the store
    }, 2000)
  }

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="h-4 w-4 text-rose-500" />
      case "DOCX": return <FileType2 className="h-4 w-4 text-blue-500" />
      case "HTML": return <Globe className="h-4 w-4 text-emerald-500" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scanned": return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Scanned</Badge>
      case "Processing": return <Badge variant="warning" className="gap-1 animate-pulse"><Clock className="h-3 w-3" /> Processing</Badge>
      case "Failed": return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Failed</Badge>
      case "Pending": return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Library</h1>
          <p className="text-sm text-muted-foreground">
            Manage documents for accessibility compliance scanning
          </p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2" aria-label="Upload new document">
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="pdf">PDFs</TabsTrigger>
            <TabsTrigger value="docx">DOCX</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search documents"
          />
        </div>
      </div>

      {documents.length === 0 && !isLoading && (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <FileStack className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">No documents yet</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Upload your first document to start scanning for accessibility compliance issues.
              </p>
            </div>
            <Button onClick={() => setIsUploadModalOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}

      {documents.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">Document Name <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col" className="text-right cursor-pointer" onClick={() => handleSort("pages")}>
                    <div className="flex items-center justify-end gap-1">Pages <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead scope="col" className="text-right cursor-pointer" onClick={() => handleSort("findingsCount")}>
                    <div className="flex items-center justify-end gap-1">Findings <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead scope="col" className="text-right">AI Remediated</TableHead>
                  <TableHead scope="col" className="text-center">Score</TableHead>
                  <TableHead scope="col" className="cursor-pointer" onClick={() => handleSort("uploadedAt")}>
                    <div className="flex items-center gap-1">Uploaded <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead scope="col" className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredDocuments.length === 0 && !isLoading && documents.length === 0 ? (
                  null
                ) : filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <div className="mb-4 rounded-full bg-muted p-4">
                          <Search className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No matching documents</h3>
                        <p className="mb-4 max-w-sm text-sm">
                          Try adjusting your search or filters to find what you're looking for.
                        </p>
                        <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveTab("all"); }} className="gap-2">
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow 
                      key={doc.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/audit/v2.4.1`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getFileTypeIcon(doc.fileType)}
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-right">{doc.pages}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn(doc.findingsCount > 0 && "text-destructive font-medium")}>
                          {doc.findingsCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(doc.aiRemediatedCount > 0 && "text-blue-600 font-medium")}>
                          {doc.aiRemediatedCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <ComplianceScoreGauge score={doc.complianceScore} />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doc.uploadedAt}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/audit/v2.4.1`)}>
                              <Eye className="mr-2 h-4 w-4" /> View Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Scan className="mr-2 h-4 w-4" /> Rescan
                            </DropdownMenuItem>
                             <DropdownMenuItem className="text-destructive" onClick={() => deleteDocument(doc.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsUploadModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-xl bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold">Upload Document</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsUploadModalOpen(false)} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all",
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleUpload(file.name);
                  }}
                >
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Supported formats: PDF, DOCX, HTML (Max 50MB)
                    </p>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Badge variant="outline">PDF</Badge>
                    <Badge variant="outline">DOCX</Badge>
                    <Badge variant="outline">HTML</Badge>
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    accept=".pdf,.docx,.html"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file.name);
                    }}
                    aria-label="File upload"
                  />
                </div>
              </div>
              <div className="flex justify-end border-t p-4">
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
