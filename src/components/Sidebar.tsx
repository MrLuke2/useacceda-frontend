import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Shield,
  ScanSearch,
  History,
  Settings,
  LayoutDashboard,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  FileStack,
  UserCheck,
  FileSpreadsheet,
  BookOpen,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { mockFindings, mockDocuments, mockRemediations } from "@/lib/mock-data"

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobile?: boolean
  onClose?: () => void
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobile, onClose }: SidebarProps) {
  const location = useLocation()
  const isAuditActive = location.pathname.startsWith("/audit/")
  const auditIdMatch = location.pathname.match(/^\/audit\/([^/]+)/)
  const auditId = auditIdMatch ? auditIdMatch[1] : "v2.4.1"
  const navRef = React.useRef<HTMLDivElement>(null)

  // Dynamic Counts
  const humanReviewCount = mockFindings.filter(f => f.status === "RequiresHumanReview").length
  const processingDocsCount = mockDocuments.filter(d => d.status === "Processing").length
  const totalFindingsCount = mockFindings.length
  const remediationCount = mockRemediations.length

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!navRef.current) return
    
    if (e.key === 'Escape' && isMobile && onClose) {
      onClose()
      return
    }
    
    const links = Array.from(navRef.current.querySelectorAll('a, button')) as HTMLElement[]
    const currentIndex = links.indexOf(document.activeElement as HTMLElement)
    
    if (currentIndex === -1) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % links.length
      links[nextIndex]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + links.length) % links.length
      links[prevIndex]?.focus()
    }
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-card text-card-foreground transition-all duration-300",
        isCollapsed ? "w-16" : "w-60",
        isMobile && "w-full"
      )}
      ref={navRef}
      onKeyDown={handleKeyDown}
    >
      <div className={cn("flex h-14 items-center border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
        <div className="flex items-center gap-2 overflow-hidden">
          <Shield className="h-6 w-6 shrink-0 text-primary" />
          {!isCollapsed && <span className="font-bold tracking-tight text-foreground">ACCEDA</span>}
        </div>
        {isMobile && onClose && (
          <button 
            onClick={onClose} 
            className="rounded-md p-1 hover:bg-muted" 
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto py-4">
        <nav className="flex flex-col gap-1 px-2">
          <NavItem
            to="/"
            icon={Sparkles}
            label="Start Here"
            isCollapsed={isCollapsed}
            isActive={location.pathname === "/"}
            onClick={isMobile ? onClose : undefined}
          />
          <NavItem
            to="/new-audit"
            icon={ScanSearch}
            label="New Audit"
            isCollapsed={isCollapsed}
            isActive={location.pathname === "/new-audit"}
            onClick={isMobile ? onClose : undefined}
          />
          <NavItem
            to="/documents"
            icon={FileStack}
            label="Documents"
            isCollapsed={isCollapsed}
            isActive={location.pathname === "/documents"}
            badge={processingDocsCount > 0 ? processingDocsCount.toString() : undefined}
            onClick={isMobile ? onClose : undefined}
          />
          <NavItem
            to="/audits"
            icon={History}
            label="Audit History"
            isCollapsed={isCollapsed}
            isActive={location.pathname === "/audits"}
            onClick={isMobile ? onClose : undefined}
          />
          
          <div className="my-2 px-2">
            <Separator />
          </div>

          {!isCollapsed && (
            <div className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workflow
            </div>
          )}
          <NavItem
            to="/review"
            icon={UserCheck}
            label="Human Review"
            isCollapsed={isCollapsed}
            isActive={location.pathname === "/review"}
            badge={humanReviewCount > 0 ? humanReviewCount.toString() : undefined}
            onClick={isMobile ? onClose : undefined}
          />
          <NavItem
            to="/vpat"
            icon={FileSpreadsheet}
            label="VPAT Editor"
            isCollapsed={isCollapsed}
            isActive={location.pathname === "/vpat"}
            onClick={isMobile ? onClose : undefined}
          />

          <div className="my-2 px-2">
            <Separator />
          </div>

          <NavItem
            to="/docs"
            icon={BookOpen}
            label="Documentation"
            isCollapsed={isCollapsed}
            isActive={location.pathname === "/docs"}
            onClick={isMobile ? onClose : undefined}
          />
          <NavItem
            to="/settings"
            icon={Settings}
            label="Settings"
            isCollapsed={isCollapsed}
            isActive={location.pathname === "/settings"}
            onClick={isMobile ? onClose : undefined}
          />
        </nav>

        {isAuditActive && (
          <div className="mt-8 flex flex-col gap-1 px-2">
            {!isCollapsed && (
              <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Audit
              </div>
            )}
            <NavItem
              to={`/audit/${auditId}`}
              icon={LayoutDashboard}
              label="Overview"
              isCollapsed={isCollapsed}
              isActive={location.pathname === `/audit/${auditId}`}
              onClick={isMobile ? onClose : undefined}
            />
            <NavItem
              to={`/audit/${auditId}/findings`}
              icon={AlertTriangle}
              label="Findings"
              isCollapsed={isCollapsed}
              badge={totalFindingsCount > 0 ? totalFindingsCount.toString() : undefined}
              onClick={isMobile ? onClose : undefined}
            />
            <NavItem
              to={`/audit/${auditId}/remediation`}
              icon={Wrench}
              label="Remediation"
              isCollapsed={isCollapsed}
              badge={remediationCount.toString()}
              onClick={isMobile ? onClose : undefined}
            />
            <NavItem
              to={`/audit/${auditId}/gate`}
              icon={ShieldCheck}
              label="CI/CD Gate"
              isCollapsed={isCollapsed}
              dot="failed"
              onClick={isMobile ? onClose : undefined}
            />
          </div>
        )}
      </div>

      {!isMobile && (
        <div className="border-t p-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      )}
    </div>
  )
}

function NavItem({
  to,
  icon: Icon,
  label,
  isCollapsed,
  isActive,
  badge,
  dot,
  onClick,
}: {
  to: string
  icon: React.ElementType
  label: string
  isCollapsed: boolean
  isActive?: boolean
  badge?: string
  dot?: "passed" | "failed"
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={to === "/"}
      className={({ isActive: isNavLinkActive }) =>
        cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive || isNavLinkActive
            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400"
            : "text-slate-700 hover:bg-muted hover:text-foreground dark:text-slate-300"
        )
      }
      title={isCollapsed ? label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && (
        <span className="flex flex-1 items-center justify-between truncate">
          {label}
          {badge && (
            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4">
              {badge}
            </Badge>
          )}
          {dot && (
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                dot === "passed" ? "bg-emerald-500" : "bg-destructive"
              )}
            />
          )}
        </span>
      )}
    </NavLink>
  )
}
