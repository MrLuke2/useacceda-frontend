export type Severity = "Critical" | "Serious" | "Moderate" | "Minor";

export interface Violation {
  id: string;
  severity: Severity;
  criterion: string;
  count: number;
}

export interface PageSummary {
  id: string;
  url: string;
  violations: number;
  incompletes: number;
  passes: number;
  lighthouseScore: number;
  status: "Failed" | "Passed" | "Needs Review";
}

export interface AuditSummary {
  id: string;
  url: string;
  triggerType: "CI/CD" | "Scheduled" | "Manual" | "API";
  duration: string;
  timestamp: string;
  status: "Complete" | "In Progress";
  metrics: {
    totalPages: number;
    violationsFound: number;
    incompletesResolvedByAI: number;
    aiClassificationRate: number;
    requiresHumanReview: number;
    regressionsDetected: number;
    newViolations: number;
    resolvedSinceBaseline: number;
    regressionDelta: number;
  };
  severityBreakdown: {
    name: Severity;
    value: number;
    fill: string;
  }[];
  wcagHeatmap: {
    criterion: string;
    count: number;
    level: "A" | "AA" | "AAA";
  }[];
  lighthouseDistribution: {
    score: number;
    count: number;
  }[];
  pages: PageSummary[];
}

export type FindingStatus = "Violation" | "Incomplete" | "Pass" | "Verified" | "Regression" | "Escalated" | "RequiresHumanReview" | "ResolvedPartial";
export type FindingSource = "Axe" | "Lighthouse" | "McpScanner";

export interface Finding {
  id: string;
  status: FindingStatus;
  severity: Severity;
  ruleId: string;
  elementHash: string;
  pageUrl: string;
  wcag: string[];
  confidence?: number;
  source: FindingSource;
}

export interface ReasoningStep {
  step: number;
  tool: string;
  text: string;
}

export interface AccessibilityNode {
  role: string;
  name: string;
  states: string[];
  focusable: boolean;
  diffStatus?: "added" | "removed" | "modified";
}

export interface FocusTransition {
  from: { role: string; name: string };
  to: { role: string; name: string };
  passed: boolean;
}

export interface InvariantResult {
  name: string;
  passed: boolean;
  detail?: string;
}

export interface FindingDetail extends Finding {
  elementSelector: string;
  timestamps: {
    created: string;
    updated: string;
    resolved?: string;
  };
  cycleCount: {
    current: number;
    total: number;
  };
  reasoning: ReasoningStep[];
  evidenceReferences: string[];
  humanReviewReason?: string;
  s0Tree: AccessibilityNode[];
  s1Tree: AccessibilityNode[];
  focusTransition?: FocusTransition;
  invariants: InvariantResult[];
  remediation: {
    summary: string;
    beforeCode: string;
    afterCode: string;
    ariaChanges: string[];
    implementationSteps: string[];
    verificationSteps: string[];
    wcagLinks: { label: string; url: string }[];
    relatedFindingIds: string[];
    effort: EffortLevel;
  };
  rawEvidence: {
    axe: any;
    mcp: any;
    lighthouse: any;
  };
  interactionLog: {
    type: "tab" | "click" | "input";
    text: string;
  }[];
}

export const mockFindingDetails: Record<string, FindingDetail> = {
  "fid-1000": {
    id: "fid-1000",
    status: "Violation",
    severity: "Serious",
    ruleId: "image-alt",
    elementHash: "x9f2a",
    pageUrl: "/reports/q3",
    wcag: ["1.1.1"],
    confidence: 0.91,
    source: "Axe",
    elementSelector: "main > section.data-viz > div.chart-container > img",
    timestamps: {
      created: "Feb 28, 2026",
      updated: "Feb 28, 2026",
    },
    cycleCount: { current: 2, total: 5 },
    reasoning: [
      { step: 1, tool: "axe-core", text: "axe-core flagged element x9f2a on /reports/q3 as incomplete for rule image-alt. Static scan cannot determine if alt text 'chart' is contextually sufficient." },
      { step: 2, tool: "MCP Scanner", text: "Retrieved computed accessible name, parent landmark (role=main), adjacent heading text 'Q3 Revenue by Region'." },
      { step: 3, tool: "Lighthouse", text: "Page accessibility score: 61. Image is in top 3 audit failures." },
      { step: 4, tool: "AI Classification", text: "Alt text 'chart' names the type, not the content. Adjacent heading provides context but does not substitute for descriptive alt." }
    ],
    evidenceReferences: ["r2://audit-v2.4.1/fid-1000/snapshot-s0.json", "r2://audit-v2.4.1/fid-1000/snapshot-s1.json", "r2://audit-v2.4.1/fid-1000/trace.zip"],
    s0Tree: [
      { role: "main", name: "Main Content", states: [], focusable: false },
      { role: "heading", name: "Q3 Revenue by Region", states: [], focusable: false },
      { role: "img", name: "chart", states: [], focusable: false, diffStatus: "modified" },
      { role: "text", name: "Source: Finance Dept", states: [], focusable: false },
    ],
    s1Tree: [
      { role: "main", name: "Main Content", states: [], focusable: false },
      { role: "heading", name: "Q3 Revenue by Region", states: [], focusable: false },
      { role: "img", name: "Bar chart showing Q3 revenue by region: APAC $4.2M, EMEA $3.1M, AMER $6.8M", states: [], focusable: false, diffStatus: "modified" },
      { role: "text", name: "Source: Finance Dept", states: [], focusable: false },
    ],
    invariants: [],
    remediation: {
      summary: "The image uses a generic alt attribute ('chart') which does not convey the actual data presented in the bar chart. Users relying on screen readers cannot access the financial data.",
      beforeCode: `<img src="/charts/q3-revenue.png" alt="chart" />`,
      afterCode: `<img src="/charts/q3-revenue.png" \n  alt="Bar chart showing Q3 revenue by region: APAC $4.2M, EMEA $3.1M, AMER $6.8M" \n/>`,
      ariaChanges: ["Add descriptive alt text that summarizes the data trends and values."],
      implementationSteps: [
        "Identify the data points being rendered in the chart.",
        "Update the alt attribute in the template to include a summary of these points.",
        "Ensure the alt text is localized if the application supports multiple languages."
      ],
      verificationSteps: [
        "Verify that the screen reader announces the full data summary when the image is focused.",
        "Run axe-core to ensure the image-alt rule now passes."
      ],
      wcagLinks: [{ label: "Understanding SC 1.1.1: Non-text Content", url: "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html" }],
      relatedFindingIds: ["fid-1024", "fid-1056"],
      effort: "Low"
    },
    rawEvidence: {
      axe: { id: "image-alt", impact: "serious", description: "Ensures <img> elements have alternate text or a role of none or presentation", nodes: [{ html: '<img src="/charts/q3-revenue.png" alt="chart">', target: ["img"] }] },
      mcp: { accessibleName: "chart", role: "img", parentRole: "main", siblings: ["h2: Q3 Revenue by Region"] },
      lighthouse: { score: 0.61, audits: { "image-alt": { score: 0, title: "Images do not have alternate text" } } }
    },
    interactionLog: [
      { type: "tab", text: "Tab → focused [Link: Home]" },
      { type: "tab", text: "Tab → focused [Link: Reports]" },
      { type: "click", text: "Click → [Link: Reports]" }
    ]
  },
  "fid-1001": {
    id: "fid-1001",
    status: "Violation",
    severity: "Critical",
    ruleId: "focus-trap",
    elementHash: "x4c5d",
    pageUrl: "/checkout",
    wcag: ["2.1.2"],
    confidence: 0.87,
    source: "McpScanner",
    elementSelector: "div.modal-overlay > div.modal-content",
    timestamps: {
      created: "Feb 28, 2026",
      updated: "Feb 28, 2026",
    },
    cycleCount: { current: 1, total: 3 },
    reasoning: [
      { step: 1, tool: "Playwright", text: "Automated interaction script opened the 'Confirm Purchase' modal." },
      { step: 2, tool: "MCP Scanner", text: "Detected focus escaping modal boundary during Tab sequence. Focus moved to background navigation link 'Terms of Service'." },
      { step: 3, tool: "AI Classification", text: "Modal does not implement a focus trap. This prevents keyboard users from easily returning to the modal content or closing it without navigating the entire page." }
    ],
    evidenceReferences: ["r2://audit-v2.4.1/fid-1001/interaction-video.mp4", "r2://audit-v2.4.1/fid-1001/dom-snapshot.html"],
    s0Tree: [
      { role: "dialog", name: "Confirm Purchase", states: ["expanded"], focusable: true },
      { role: "button", name: "Close", states: [], focusable: true },
      { role: "button", name: "Confirm", states: [], focusable: true },
    ],
    s1Tree: [
      { role: "link", name: "Home Navigation", states: [], focusable: true, diffStatus: "added" },
      { role: "link", name: "Terms of Service", states: [], focusable: true, diffStatus: "added" },
    ],
    focusTransition: {
      from: { role: "button", name: "Close" },
      to: { role: "link", name: "Home Navigation" },
      passed: false
    },
    invariants: [
      { name: "modal_focus_trap", passed: false, detail: "Focus escaped modal to background nav element" },
      { name: "aria_modal_present", passed: true },
      { name: "escape_closes_dialog", passed: true }
    ],
    remediation: {
      summary: "The modal dialog allows keyboard focus to escape to the background page elements. This violates the requirement for modal dialogs to trap focus until dismissed.",
      beforeCode: `<div class="modal" role="dialog" aria-modal="true">\n  <button>Close</button>\n  <button>Confirm</button>\n</div>`,
      afterCode: `<FocusTrap>\n  <div class="modal" role="dialog" aria-modal="true">\n    <button>Close</button>\n    <button>Confirm</button>\n  </div>\n</FocusTrap>`,
      ariaChanges: ["Ensure aria-modal='true' is set (already present).", "Implement a focus trap using a library like react-focus-lock or focus-trap-react."],
      implementationSteps: [
        "Wrap the modal content in a focus trap component.",
        "Ensure the first focusable element is focused on open.",
        "Ensure focus returns to the triggering element on close."
      ],
      verificationSteps: [
        "Open the modal and press Tab repeatedly. Focus should cycle only through modal elements.",
        "Verify Shift+Tab also stays within the modal."
      ],
      wcagLinks: [{ label: "Understanding SC 2.1.2: No Focus Trap", url: "https://www.w3.org/WAI/WCAG21/Understanding/no-focus-trap.html" }],
      relatedFindingIds: ["fid-1102"],
      effort: "Medium"
    },
    rawEvidence: {
      axe: { id: "focus-trap", impact: "critical", description: "Ensures focus is trapped within modal dialogs" },
      mcp: { focusSequence: ["Button: Close", "Link: Home Navigation"], escaped: true },
      lighthouse: { audits: { "focus-trap": { score: 0 } } }
    },
    interactionLog: [
      { type: "tab", text: "Tab → focused [Button: Close]" },
      { type: "tab", text: "Tab → focused [Link: Home Navigation]" },
      { type: "tab", text: "Tab → focused [Link: Terms]" }
    ]
  },
  "fid-1002": {
    id: "fid-1002",
    status: "RequiresHumanReview",
    severity: "Moderate",
    ruleId: "color-contrast",
    elementHash: "x1b2c",
    pageUrl: "/pricing",
    wcag: ["1.4.3"],
    confidence: 0.62,
    source: "Axe",
    elementSelector: "section.pricing-tiers > div.tier-card.premium > h3",
    timestamps: {
      created: "Feb 28, 2026",
      updated: "Feb 28, 2026",
    },
    cycleCount: { current: 1, total: 1 },
    reasoning: [
      { step: 1, tool: "axe-core", text: "axe-core flagged the 'Premium' tier heading for potential color contrast violation." },
      { step: 2, tool: "DevTools", text: "Computed contrast ratio 4.48:1 is borderline — 4.5:1 required for normal text." },
      { step: 3, tool: "AI Classification", text: "The background is a complex linear gradient. Automated tools may be miscalculating the exact background color at the text position." }
    ],
    humanReviewReason: "Computed contrast ratio 4.48:1 is borderline — 4.5:1 required. Background gradient makes automated measurement unreliable.",
    evidenceReferences: ["r2://audit-v2.4.1/fid-1002/screenshot.png"],
    s0Tree: [
      { role: "heading", name: "Premium", states: [], focusable: false },
    ],
    s1Tree: [
      { role: "heading", name: "Premium", states: [], focusable: false },
    ],
    invariants: [],
    remediation: {
      summary: "The contrast between the text and its gradient background may be below the 4.5:1 threshold required by WCAG AA.",
      beforeCode: `<h3 class="text-white bg-gradient-to-b from-blue-400 to-blue-600">Premium</h3>`,
      afterCode: `<h3 class="text-white bg-gradient-to-b from-blue-600 to-blue-800">Premium</h3>`,
      ariaChanges: ["Darken the background gradient colors to ensure a safe contrast ratio across the entire text area."],
      implementationSteps: [
        "Test the contrast at the lightest point of the gradient.",
        "Adjust CSS variables for the gradient colors."
      ],
      verificationSteps: [
        "Use a manual color contrast picker to verify the ratio at multiple points."
      ],
      wcagLinks: [{ label: "Understanding SC 1.4.3: Contrast (Minimum)", url: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html" }],
      relatedFindingIds: [],
      effort: "Low"
    },
    rawEvidence: {
      axe: { id: "color-contrast", impact: "moderate", nodes: [{ html: '<h3 class="premium">Premium</h3>', any: [{ id: "color-contrast", data: { fgColor: "#ffffff", bgColor: "#60a5fa", contrastRatio: 4.48, fontSize: "18.0pt", fontWeight: "bold" } }] }] },
      mcp: {},
      lighthouse: {}
    },
    interactionLog: []
  }
};

const RULE_IDS = ["image-alt", "color-contrast", "aria-required-attr", "focus-trap", "heading-order", "label", "link-name"];
const STATUSES: FindingStatus[] = ["Violation", "Incomplete", "Pass", "Verified", "Regression", "Escalated", "RequiresHumanReview", "ResolvedPartial"];
const SEVERITIES: Severity[] = ["Critical", "Serious", "Moderate", "Minor"];
const SOURCES: FindingSource[] = ["Axe", "Lighthouse", "McpScanner"];

export const mockFindings: Finding[] = Array.from({ length: 55 }).map((_, i) => {
  const isAi = Math.random() > 0.5;
  return {
    id: `fid-${1000 + i}`,
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)]!,
    severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)]!,
    ruleId: RULE_IDS[Math.floor(Math.random() * RULE_IDS.length)]!,
    elementHash: `x${Math.random().toString(16).slice(2, 10)}`,
    pageUrl: i % 3 === 0 ? "/about" : i % 3 === 1 ? "/contact" : "/products/widget-a",
    wcag: [`${Math.floor(Math.random() * 4 + 1)}.${Math.floor(Math.random() * 4 + 1)}.${Math.floor(Math.random() * 4 + 1)}`],
    confidence: isAi ? 0.42 + Math.random() * 0.56 : undefined,
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)]!,
  };
});

export type EffortLevel = "Low" | "Medium" | "High";

export interface Remediation {
  id: string;
  ruleId: string;
  wcag: string[];
  summary: string;
  elementSelector: string;
  pageUrl: string;
  severity: Severity;
  effort: EffortLevel;
  effortHours: number;
  resolvesCount: number;
  beforeCode: string;
  afterCode: string;
  implementationSteps: string[];
  verificationSteps: string[];
  wcagLinks: { label: string; url: string }[];
}

const SUMMARIES = [
  "Add alternative text to image",
  "Ensure text has sufficient color contrast",
  "Add aria-required attribute to required input",
  "Trap focus within modal dialog",
  "Fix heading hierarchy",
  "Associate label with form control",
  "Provide descriptive link text",
];

const CODE_SNIPPETS = {
  "image-alt": {
    before: `<img src="/hero-banner.jpg" class="w-full h-auto" />`,
    after: `<img src="/hero-banner.jpg" alt="Team collaborating in modern office" class="w-full h-auto" />`,
  },
  "color-contrast": {
    before: `<span class="text-gray-400 bg-white">Subtle text</span>`,
    after: `<span class="text-gray-600 bg-white">Accessible text</span>`,
  },
  "aria-required-attr": {
    before: `<input type="text" name="email" required />`,
    after: `<input type="text" name="email" required aria-required="true" />`,
  },
  "focus-trap": {
    before: `<div class="modal">...</div>`,
    after: `<div class="modal" role="dialog" aria-modal="true">...</div>`,
  },
  "heading-order": {
    before: `<h3>Section Title</h3>`,
    after: `<h2>Section Title</h2>`,
  },
  "label": {
    before: `<input type="checkbox" id="terms" /> I agree`,
    after: `<input type="checkbox" id="terms" /> <label for="terms">I agree</label>`,
  },
  "link-name": {
    before: `<a href="/read-more">Click here</a>`,
    after: `<a href="/read-more">Read more about our services</a>`,
  },
};

export const mockRemediations: Remediation[] = Array.from({ length: 25 }).map((_, i) => {
  const ruleId = RULE_IDS[Math.floor(Math.random() * RULE_IDS.length)] as keyof typeof CODE_SNIPPETS;
  const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)]!;
  const effortLevel: EffortLevel = Math.random() > 0.6 ? "High" : Math.random() > 0.3 ? "Medium" : "Low";
  const effortHours = effortLevel === "Low" ? 0.5 : effortLevel === "Medium" ? 2 : 5;
  
  return {
    id: `rem-${1000 + i}`,
    ruleId,
    wcag: [`${Math.floor(Math.random() * 4 + 1)}.${Math.floor(Math.random() * 4 + 1)}.${Math.floor(Math.random() * 4 + 1)}`],
    summary: SUMMARIES[RULE_IDS.indexOf(ruleId)]!,
    elementSelector: `div > span:nth-child(${Math.floor(Math.random() * 10) + 1}) > .class-${Math.floor(Math.random() * 100)}`,
    pageUrl: i % 3 === 0 ? "/about" : i % 3 === 1 ? "/contact" : "/products/widget-a",
    severity,
    effort: effortLevel,
    effortHours,
    resolvesCount: Math.floor(Math.random() * 15) + 1,
    beforeCode: CODE_SNIPPETS[ruleId].before,
    afterCode: CODE_SNIPPETS[ruleId].after,
    implementationSteps: [
      "Locate the component in the source code.",
      "Apply the suggested code changes.",
      "Ensure the change doesn't break existing functionality.",
    ],
    verificationSteps: [
      "Run the accessibility scanner locally.",
      "Verify visually or with a screen reader.",
    ],
    wcagLinks: [
      { label: `Understanding SC ${Math.floor(Math.random() * 4 + 1)}.${Math.floor(Math.random() * 4 + 1)}.${Math.floor(Math.random() * 4 + 1)}`, url: "#" },
    ],
  };
});

export interface CiCdGateConfig {
  maxNewCritical: number;
  maxNewSerious: number;
  blockRegressions: boolean;
  baselineAuditId: string;
}

export interface GateResult {
  passed: boolean;
  config: CiCdGateConfig;
  failureReasons: string[];
  newBlockingViolations: Finding[];
  regressions: Finding[];
}

export const mockGateResult: GateResult = {
  passed: false,
  config: {
    maxNewCritical: 0,
    maxNewSerious: 5,
    blockRegressions: true,
    baselineAuditId: "v2.4.0",
  },
  failureReasons: [
    "New critical violations (3) exceed threshold (0)",
    "Regressions detected (2) — blocking regressions enabled",
  ],
  newBlockingViolations: [
    {
      id: "fid-9001",
      status: "Violation",
      severity: "Critical",
      ruleId: "image-alt",
      elementHash: "x9f2a3b1c",
      pageUrl: "/checkout",
      wcag: ["1.1.1"],
      confidence: 0.98,
      source: "Axe",
    },
    {
      id: "fid-9002",
      status: "Violation",
      severity: "Critical",
      ruleId: "aria-required-attr",
      elementHash: "x4c5d6e7f",
      pageUrl: "/signup",
      wcag: ["4.1.2"],
      confidence: 0.95,
      source: "Axe",
    },
    {
      id: "fid-9003",
      status: "Violation",
      severity: "Critical",
      ruleId: "button-name",
      elementHash: "x1a2b3c4d",
      pageUrl: "/products/widget-a",
      wcag: ["4.1.2"],
      confidence: 0.92,
      source: "Axe",
    },
  ],
  regressions: [
    {
      id: "fid-8001",
      status: "Regression",
      severity: "Serious",
      ruleId: "color-contrast",
      elementHash: "x5e6f7a8b",
      pageUrl: "/about",
      wcag: ["1.4.3"],
      confidence: 0.88,
      source: "Axe",
    },
    {
      id: "fid-8002",
      status: "Regression",
      severity: "Moderate",
      ruleId: "heading-order",
      elementHash: "x9c0d1e2f",
      pageUrl: "/contact",
      wcag: ["1.3.1"],
      confidence: 0.75,
      source: "Axe",
    },
  ],
};

export type AuditTrigger = "CI/CD" | "Scheduled" | "Manual" | "API";
export type AuditStatus = "Complete" | "In Progress" | "Failed";

export interface AuditHistoryEntry {
  id: string;
  rootUrl: string;
  trigger: AuditTrigger;
  status: AuditStatus;
  pagesScanned: number;
  violationsFound: number;
  aiClassificationRate: number;
  duration: string;
  timestamp: string;
  gateStatus: "Pass" | "Fail" | null;
}

const TRIGGERS: AuditTrigger[] = ["CI/CD", "Scheduled", "Manual", "API"];

export const mockAuditHistory: AuditHistoryEntry[] = Array.from({ length: 15 }).map((_, i) => {
  const status = i === 0 ? "In Progress" : i === 3 ? "Failed" : "Complete";
  const date = new Date();
  date.setDate(date.getDate() - i * 4); // Spanning roughly 2 months
  
  return {
    id: `v2.4.${15 - i}`,
    rootUrl: i % 2 === 0 ? "https://acme.com" : "https://acme.com/app",
    trigger: TRIGGERS[Math.floor(Math.random() * TRIGGERS.length)]!,
    status,
    pagesScanned: status === "In Progress" ? 142 : Math.floor(Math.random() * 1950) + 50,
    violationsFound: status === "In Progress" ? 34 : Math.floor(Math.random() * 5000) + 10,
    aiClassificationRate: Math.floor(Math.random() * 30) + 65,
    duration: status === "In Progress" ? "00:02:14" : `00:${Math.floor(Math.random() * 45) + 5}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    timestamp: date.toISOString().split('T')[0]! + " " + date.toTimeString().split(' ')[0]!.substring(0, 5),
    gateStatus: status === "Complete" ? (Math.random() > 0.3 ? "Pass" : "Fail") : null,
  };
});

export const mockAuditData: AuditSummary = {
  id: "v2.4.1",
  url: "https://acme.com",
  triggerType: "CI/CD",
  duration: "14m 22s",
  timestamp: "Feb 28, 2026 · 3:42 PM",
  status: "Complete",
  metrics: {
    totalPages: 847,
    violationsFound: 1405,
    incompletesResolvedByAI: 344,
    aiClassificationRate: 88.9,
    requiresHumanReview: 43,
    regressionsDetected: 7,
    newViolations: 12,
    resolvedSinceBaseline: -38,
    regressionDelta: 3,
  },
  severityBreakdown: [
    { name: "Critical", value: 23, fill: "var(--color-destructive)" },
    { name: "Serious", value: 187, fill: "#EA580C" }, // Orange-600
    { name: "Moderate", value: 412, fill: "#F59E0B" }, // Amber-500
    { name: "Minor", value: 783, fill: "var(--color-muted-foreground)" },
  ],
  wcagHeatmap: [
    { criterion: "SC 1.1.1", count: 43, level: "A" },
    { criterion: "SC 1.2.1", count: 0, level: "A" },
    { criterion: "SC 1.3.1", count: 124, level: "A" },
    { criterion: "SC 1.4.1", count: 12, level: "A" },
    { criterion: "SC 1.4.3", count: 201, level: "AA" },
    { criterion: "SC 2.1.1", count: 56, level: "A" },
    { criterion: "SC 2.1.2", count: 12, level: "A" },
    { criterion: "SC 2.2.1", count: 0, level: "A" },
    { criterion: "SC 2.4.1", count: 34, level: "A" },
    { criterion: "SC 2.4.2", count: 5, level: "A" },
    { criterion: "SC 2.4.3", count: 18, level: "A" },
    { criterion: "SC 2.4.4", count: 89, level: "A" },
    { criterion: "SC 3.1.1", count: 2, level: "A" },
    { criterion: "SC 3.2.1", count: 0, level: "A" },
    { criterion: "SC 3.3.1", count: 15, level: "A" },
    { criterion: "SC 3.3.2", count: 45, level: "A" },
    { criterion: "SC 4.1.1", count: 112, level: "A" },
    { criterion: "SC 4.1.2", count: 89, level: "A" },
  ],
  lighthouseDistribution: [
    { score: 30, count: 2 },
    { score: 40, count: 15 },
    { score: 50, count: 45 },
    { score: 60, count: 120 },
    { score: 70, count: 250 },
    { score: 80, count: 310 },
    { score: 90, count: 85 },
    { score: 100, count: 20 },
  ],
  pages: Array.from({ length: 25 }).map((_, i) => ({
    id: `page-${i}`,
    url: i === 0 ? "/about" : i === 1 ? "/contact" : i === 2 ? "/products/widget-a" : i === 3 ? "/blog/post-1" : `/page-${i}`,
    violations: Math.floor(Math.random() * 20),
    incompletes: Math.floor(Math.random() * 5),
    passes: Math.floor(Math.random() * 100) + 50,
    lighthouseScore: Math.floor(Math.random() * 60) + 38,
    status: Math.random() > 0.7 ? "Failed" : Math.random() > 0.5 ? "Needs Review" : "Passed",
  })),
};

export interface DocumentEntry {
  id: string;
  name: string;
  fileType: "PDF" | "DOCX" | "HTML";
  status: "Scanned" | "Processing" | "Failed" | "Pending";
  pages: number;
  findingsCount: number;
  aiRemediatedCount: number;
  complianceScore: number;
  uploadedAt: string;
  fileSize: string;
}

export const mockDocuments: DocumentEntry[] = [
  {
    id: "doc-1",
    name: "Q4-Financial-Report.pdf",
    fileType: "PDF",
    status: "Scanned",
    pages: 47,
    findingsCount: 23,
    aiRemediatedCount: 18,
    complianceScore: 78,
    uploadedAt: "2026-02-15 10:30",
    fileSize: "4.2 MB"
  },
  {
    id: "doc-2",
    name: "Employee-Handbook-2026.pdf",
    fileType: "PDF",
    status: "Scanned",
    pages: 124,
    findingsCount: 56,
    aiRemediatedCount: 41,
    complianceScore: 65,
    uploadedAt: "2026-02-10 14:15",
    fileSize: "12.8 MB"
  },
  {
    id: "doc-3",
    name: "Privacy-Policy.html",
    fileType: "HTML",
    status: "Scanned",
    pages: 1,
    findingsCount: 3,
    aiRemediatedCount: 3,
    complianceScore: 97,
    uploadedAt: "2026-02-20 09:00",
    fileSize: "45 KB"
  },
  {
    id: "doc-4",
    name: "Onboarding-Guide.docx",
    fileType: "DOCX",
    status: "Scanned",
    pages: 32,
    findingsCount: 12,
    aiRemediatedCount: 10,
    complianceScore: 84,
    uploadedAt: "2026-02-22 11:45",
    fileSize: "2.1 MB"
  },
  {
    id: "doc-5",
    name: "Annual-Compliance-Report.pdf",
    fileType: "PDF",
    status: "Processing",
    pages: 89,
    findingsCount: 0,
    aiRemediatedCount: 0,
    complianceScore: 0,
    uploadedAt: "2026-02-28 16:20",
    fileSize: "8.4 MB"
  },
  {
    id: "doc-6",
    name: "Benefits-Overview.pdf",
    fileType: "PDF",
    status: "Scanned",
    pages: 15,
    findingsCount: 8,
    aiRemediatedCount: 7,
    complianceScore: 91,
    uploadedAt: "2026-02-25 13:10",
    fileSize: "1.5 MB"
  },
  {
    id: "doc-7",
    name: "Vendor-Agreement-Template.docx",
    fileType: "DOCX",
    status: "Pending",
    pages: 18,
    findingsCount: 0,
    aiRemediatedCount: 0,
    complianceScore: 0,
    uploadedAt: "2026-02-27 10:05",
    fileSize: "1.2 MB"
  },
  {
    id: "doc-8",
    name: "Accessibility-Statement.html",
    fileType: "HTML",
    status: "Scanned",
    pages: 1,
    findingsCount: 0,
    aiRemediatedCount: 0,
    complianceScore: 100,
    uploadedAt: "2026-02-28 08:30",
    fileSize: "12 KB"
  }
];

export interface Alert {
  id: string
  type: "urgent" | "warning" | "info"
  title: string
  timestamp: string
  read: boolean
}

export const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    type: "urgent",
    title: "Section 508 deadline approaching for 'Annual Audit'",
    timestamp: "2 hours ago",
    read: false
  },
  {
    id: "alert-2",
    type: "warning",
    title: "Low contrast detected in 12 elements of 'Handbook'",
    timestamp: "5 hours ago",
    read: false
  },
  {
    id: "alert-3",
    type: "info",
    title: "AI remediation completed for 'Q4 Report'",
    timestamp: "1 day ago",
    read: false
  },
  {
    id: "alert-4",
    type: "info",
    title: "VPAT export completed for v2.4.0",
    timestamp: "2 days ago",
    read: true
  },
  {
    id: "alert-5",
    type: "urgent",
    title: "New regression detected in /checkout",
    timestamp: "3 days ago",
    read: true
  }
]
