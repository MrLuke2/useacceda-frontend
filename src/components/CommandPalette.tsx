import * as React from "react"
import { useNavigate } from "react-router-dom"
import { 
  Search, 
  FileText, 
  ScanSearch, 
  History, 
  UserCheck, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  Play, 
  Settings
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { mockDocuments } from "@/lib/mock-data"
import { useAuditStore } from "@/store/useAuditStore"
import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  title: string
  icon: React.ElementType
  category: "Page" | "Audit" | "Document" | "Action"
  shortcut?: string
  action: () => void
}

export function CommandPalette({ 
  open, 
  onOpenChange 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Memoize static item arrays so they have stable references for allItems
  const pages = React.useMemo<CommandItem[]>(() => [
    { id: "page-new", title: "New Audit", icon: ScanSearch, category: "Page", action: () => navigate("/") },
    { id: "page-docs", title: "Documents", icon: FileText, category: "Page", action: () => navigate("/documents") },
    { id: "page-history", title: "Audit History", icon: History, category: "Page", action: () => navigate("/audits") },
    { id: "page-review", title: "Human Review", icon: UserCheck, category: "Page", action: () => navigate("/review") },
    { id: "page-vpat", title: "VPAT Editor", icon: FileSpreadsheet, category: "Page", action: () => navigate("/vpat") },
    { id: "page-settings", title: "Settings", icon: Settings, category: "Page", action: () => navigate("/settings") },
  ], [navigate])

  const staticActions = React.useMemo<CommandItem[]>(() => [
    { id: "act-scan", title: "Start New Scan", icon: Play, category: "Action", action: () => navigate("/") },
    { id: "act-upload", title: "Upload Document", icon: UploadCloud, category: "Action", action: () => navigate("/documents") },
    { id: "act-export", title: "Export VPAT", icon: Download, category: "Action", action: () => navigate("/vpat") },
  ], [navigate])

  const storeAudits = useAuditStore(state => state.audits)

  const audits = React.useMemo<CommandItem[]>(() => storeAudits.slice(0, 5).map(audit => ({
    id: `audit-${audit.id}`,
    title: `Audit ${audit.id}`,
    icon: History,
    category: "Audit",
    action: () => navigate(`/audit/${audit.id}`)
  })), [navigate, storeAudits])

  const docs = React.useMemo<CommandItem[]>(() => mockDocuments.slice(0, 5).map(doc => ({
    id: `doc-${doc.id}`,
    title: doc.name,
    icon: FileText,
    category: "Document",
    action: () => navigate(`/documents/${doc.id}`)
  })), [navigate])

  const allItems = React.useMemo(() => {
    const items = [...pages, ...staticActions, ...audits, ...docs]
    if (!search) return items
    return items.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, pages, staticActions, audits, docs])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action()
        onOpenChange(false)
      }
    }
  }

  // Auto-focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl overflow-hidden bg-background shadow-2xl">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            className={cn(
              "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            )}
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Command input"
            role="combobox"
            aria-expanded={true}
            aria-controls="command-list"
            aria-activedescendant={allItems[selectedIndex]?.id}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {allItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            <div className="space-y-1" role="listbox" id="command-list">
              {allItems.map((item, index) => (
                <div
                  key={item.id}
                  id={item.id}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    index === selectedIndex ? "bg-accent text-accent-foreground" : ""
                  )}
                  onClick={() => {
                    item.action()
                    onOpenChange(false)
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{item.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground capitalize bg-muted/50 px-1.5 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground flex justify-between">
          <div className="flex gap-2">
            <span>Use <kbd className="bg-background border rounded px-1">↑</kbd> <kbd className="bg-background border rounded px-1">↓</kbd> to navigate</span>
            <span><kbd className="bg-background border rounded px-1">↵</kbd> to select</span>
          </div>
          <span><kbd className="bg-background border rounded px-1">Esc</kbd> to close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
