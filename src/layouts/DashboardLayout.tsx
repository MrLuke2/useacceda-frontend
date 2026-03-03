import * as React from "react"
import { Outlet } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { CommandPalette } from "@/components/CommandPalette"

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-background">
      <CommandPalette open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen} />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative z-50 flex w-72 flex-col bg-background shadow-2xl"
            >
              <Sidebar 
                isCollapsed={false} 
                setIsCollapsed={() => {}} 
                isMobile 
                onClose={() => setIsMobileMenuOpen(false)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          onSearchClick={() => setIsCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
