import * as React from "react"
import { useLocation, Link } from "react-router-dom"
import { Bell, Moon, Sun, Menu, Search } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAlertStore } from "@/store/useAlertStore"
import { cn } from "@/lib/utils"

const BREADCRUMB_MAP: Record<string, string> = {
  "audit": "Audit",
  "findings": "Findings",
  "finding": "Finding",
  "remediation": "Remediation",
  "gate": "CI/CD Gate",
  "documents": "Documents",
  "review": "Human Review",
  "vpat": "VPAT Editor",
  "audits": "Audit History",
  "new-audit": "New Audit",
}

export function Topbar({ 
  onMenuClick, 
  onSearchClick 
}: { 
  onMenuClick?: () => void
  onSearchClick?: () => void 
}) {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const { alerts, markAllAsRead } = useAlertStore()

  const unreadCount = alerts.filter(a => !a.read).length

  const pathSegments = location.pathname.split("/").filter(Boolean)
  
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/new-audit">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathSegments.length > 0 && <BreadcrumbSeparator />}
              {pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1
                let path = `/${pathSegments.slice(0, index + 1).join("/")}`
                
                // Handle specific redirections as requested by the user
                if (segment.toLowerCase() === "audit" && !isLast) {
                  path = "/audits"
                }

                let label = BREADCRUMB_MAP[segment.toLowerCase()]
                if (!label) {
                  // Check if it looks like an ID (e.g., v2.4.1, doc-1)
                  if (/^v\d+\.\d+\.\d+$/.test(segment) || /^doc-\d+$/.test(segment) || /^aud-/.test(segment)) {
                     label = segment
                     // If it's an ID, ensure path is /audit/:id even if nested
                     path = `/audit/${segment}`
                  } else {
                     label = segment.charAt(0).toUpperCase() + segment.slice(1)
                  }
                }

                return (
                  <React.Fragment key={`${path}-${index}`}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className={cn(label === segment && "font-mono")}>{label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={path} className={cn(label === segment && "font-mono")}>{label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar - Moved to Right */}
        <div className="hidden md:flex items-center max-w-md mr-2">
          <div 
            className="relative flex items-center w-full cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            onClick={onSearchClick}
          >
            <Search className="absolute left-2.5 h-4 w-4" />
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm w-[200px] lg:w-[300px]">
              <span className="opacity-50 truncate">Search... (⌘K)</span>
            </div>
          </div>
        </div>
        
        {/* Mobile Search Icon */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onSearchClick}>
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="h-9 w-9 rounded-full"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Alert Feed Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[380px] p-0" align="end" role="menu">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {unreadCount} New
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={cn(
                      "flex items-start gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                      !alert.read && "bg-muted/20"
                    )}
                  >
                    <div className={cn(
                      "mt-1.5 h-2 w-2 rounded-full shrink-0",
                      alert.type === "urgent" ? "bg-red-500" :
                      alert.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <div className="space-y-1 flex-1">
                      <p className={cn("text-sm leading-none", !alert.read ? "font-semibold" : "font-medium")}>
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {alert.timestamp}
                      </p>
                    </div>
                    {!alert.read && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-8">
                View All Alerts
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Compliance Officer</p>
                <p className="text-xs leading-none text-muted-foreground">
                  officer@acme.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
