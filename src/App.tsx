/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ToastProvider } from "@/components/ui/toast"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { StartHere } from "@/pages/StartHere"
import { NewAudit } from "@/pages/NewAudit"
import { AuditSummary } from "@/pages/AuditSummary"
import { FindingsExplorer } from "@/pages/FindingsExplorer"
import { RemediationPanel } from "@/pages/RemediationPanel"
import { CiCdGate } from "@/pages/CiCdGate"
import { AuditHistory } from "@/pages/AuditHistory"
import { FindingDetail } from "@/pages/FindingDetail"
import { Documents } from "@/pages/Documents"
import { HumanReview } from "@/pages/HumanReview"
import { VpatEditor } from "@/pages/VpatEditor"
import LoginPage from "@/pages/Login"

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StartHere />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="new-audit" element={<NewAudit />} />
              <Route path="audits" element={<AuditHistory />} />
              <Route path="documents" element={<Documents />} />
              <Route path="review" element={<HumanReview />} />
              <Route path="vpat" element={<VpatEditor />} />
              <Route path="docs" element={<div className="p-8 text-center text-muted-foreground">Documentation (Coming Soon)</div>} />
              
              <Route path="audit/:id" element={<AuditSummary />} />
              <Route path="audit/:id/finding/:fid" element={<FindingDetail />} />
              <Route path="audit/:id/findings" element={<FindingsExplorer />} />
              <Route path="audit/:id/remediation" element={<RemediationPanel />} />
              <Route path="audit/:id/gate" element={<CiCdGate />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
