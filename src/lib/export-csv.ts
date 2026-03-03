import { Finding } from "./mock-data"

/**
 * Escapes a single field value per RFC 4180:
 * - Wrap in double-quotes if it contains a comma, double-quote, or newline.
 * - Escape any internal double-quotes by doubling them.
 */
function escapeCSVField(value: string | number | undefined): string {
  const str = value === undefined || value === null ? "" : String(value)
  const needsQuoting = /[",\r\n]/.test(str)
  if (!needsQuoting) return str
  return `"${str.replace(/"/g, '""')}"`
}

export function exportFindingsCSV(findingsToExport: Finding[], auditId: string): void {
  const headers = ["Status", "Severity", "Rule ID", "Element Hash", "Page URL", "WCAG", "Confidence", "Source"]

  const csvContent = [
    headers.map(escapeCSVField).join(","),
    ...findingsToExport.map(f =>
      [
        f.status,
        f.severity,
        f.ruleId,
        f.elementHash,
        f.pageUrl,
        f.wcag.join("; "),
        f.confidence,
        f.source,
      ]
        .map(escapeCSVField)
        .join(",")
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  const date = new Date().toISOString().split("T")[0]
  link.setAttribute("href", url)
  link.setAttribute("download", `acceda-findings-${auditId}-${date}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
