import {
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  RotateCcw,
  Flag,
  Eye,
} from "lucide-react"
import { FindingStatus, Severity } from "@/lib/mock-data"

export const STATUS_CONFIG: Record<FindingStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  Violation: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", label: "Violation" },
  Incomplete: { icon: HelpCircle, color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10", label: "Incomplete" },
  Pass: { icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-500", bg: "bg-emerald-500/10", label: "Pass" },
  Verified: { icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-500", bg: "bg-emerald-500/10", label: "Verified" },
  Regression: { icon: RotateCcw, color: "text-rose-600 dark:text-rose-500", bg: "bg-rose-500/10", label: "Regression" },
  Escalated: { icon: Flag, color: "text-orange-600 dark:text-orange-500", bg: "bg-orange-500/10", label: "Escalated" },
  RequiresHumanReview: { icon: Eye, color: "text-purple-600 dark:text-purple-500", bg: "bg-purple-500/10", label: "Needs Review" },
  ResolvedPartial: { icon: CheckCircle, color: "text-blue-600 dark:text-blue-500", bg: "bg-blue-500/10", label: "Partial" },
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  Serious: "bg-orange-600 text-white dark:bg-orange-500 dark:text-slate-900",
  Moderate: "bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-900",
  Minor: "bg-slate-500 text-white dark:bg-slate-400 dark:text-slate-900",
}

export const STATUS_BORDER_COLORS: Record<FindingStatus, string> = {
  Violation: "border-l-destructive",
  Incomplete: "border-l-amber-500",
  Pass: "border-l-emerald-500",
  Verified: "border-l-emerald-500",
  Regression: "border-l-rose-500",
  Escalated: "border-l-orange-500",
  RequiresHumanReview: "border-l-purple-500",
  ResolvedPartial: "border-l-blue-500",
}
