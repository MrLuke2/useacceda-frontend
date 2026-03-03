# Acceda — AI-Powered Accessibility Auditing

Acceda is a modern, enterprise-ready accessibility auditing and remediation platform built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**. It leverages AI to classify accessibility findings, generate remediation code, and guide organizations toward WCAG 2.1 AA and Section 508 compliance.

![Version](https://img.shields.io/badge/version-0.2.0--beta-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

## 🚀 Key Features

- **Automated Scanning**: Integrated `axe-core` based scanning with AI classification for "incomplete" findings.
- **Findings Explorer**: Advanced table with multi-select, complex filtering (Severity, Source, Status), and keyboard navigation.
- **Smart Remediation**: Automated Before/After code diffs with step-by-step implementation and verification guides.
- **VPAT Editor**: Dynamic generation of Voluntary Product Accessibility Templates from audit historical data.
- **Compliance Wizard**: A 5-step guided `experience helping organizations navigate ADA Title II deadlines.
- **History & Comparison**: Side-by-side audit comparisons to track compliance progress over time.
- **Export Engine**: RFC 4180 compliant CSV export and detailed report generation.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (integrated in hooks)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: Radix UI primitives & custom design system
- **Type Safety**: TypeScript (Strict Mode + `noUncheckedIndexedAccess`)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (v9+)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MrLuke2/useacceda-frontend.git
   cd acceda-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`.

## 🏗️ Project Structure

```text
src/
├── components/         # Atomic UI & feature-specific components
│   ├── ui/             # Radix-based design system primitives
│   └── findings/       # Tables, filters, and finding-specific UI
├── hooks/              # Custom React hooks (filtering logic, store connectivity)
├── layouts/            # Dashboard and shared layout structures
├── lib/                # Core logic, constants, and mock data
├── pages/              # Main view components (Dashboard, Explorer, etc.)
└── App.tsx             # Routing and theme providers
```

## 🔨 Development Tools

- **Linting & Types**: `npm run lint` (runs `tsc --noEmit` and ESLint)
- **Formatting**: Uses default project configuration for clean coding standards.
- **Aliases**: Global path alias `@/` points to the `src/` directory.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">Built for the future of digital accessibility.</p>
