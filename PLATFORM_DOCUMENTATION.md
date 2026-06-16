# Stackline — Commercial Property Intelligence Platform

## Complete Platform Documentation

**Version:** 1.0 (Phase 1 — Frontend Prototype)
**Last Updated:** February 2026
**Target Users:** Commercial property brokers, brokerage firms, internal property acquisition teams

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What Has Been Built](#2-what-has-been-built)
3. [Architecture & Tech Stack](#3-architecture--tech-stack)
4. [File Structure & Code Map](#4-file-structure--code-map)
5. [Feature Breakdown](#5-feature-breakdown)
6. [Data Model](#6-data-model)
7. [Demo / Seed Data](#7-demo--seed-data)
8. [Current Limitations](#8-current-limitations)
9. [What Is Needed Next — Phase 2](#9-what-is-needed-next--phase-2)
10. [What Is Needed Next — Phase 3](#10-what-is-needed-next--phase-3)
11. [What Is Needed Next — Phase 4](#11-what-is-needed-next--phase-4)
12. [Security & Compliance Considerations](#12-security--compliance-considerations)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Competitive Positioning](#14-competitive-positioning)
15. [Glossary](#15-glossary)

---

## 1. Executive Summary

**Stackline** is a centralized commercial real estate intelligence platform designed for brokers and acquisition teams to manage every aspect of their property database, owner relationships, vacancies, and deal pipeline — all in one place.

### What has been delivered (Phase 1)

A fully functional, single-page web application built with React, TypeScript, Vite, and Tailwind CSS. The prototype includes:

- **10 seeded commercial properties** (Office, Industrial, Retail, Mixed-Use) across 7 U.S. cities
- **10 contacts** (Owners, Brokers, Tenants, Investors, Property Managers)
- **12 vacancies** tracked across the portfolio
- **9 active deals** in a visual Kanban pipeline
- **4 team members** with per-property sharing controls
- **Full CRUD** (Create, Read, Update, Delete) operations on all data entities
- **localStorage persistence** — data survives browser refresh
- **Responsive design** — works on desktop, tablet, and mobile
- A **global search** that finds properties, contacts, and deals in real-time
- An **activity feed** that logs every action with timestamps and user attribution

### What this is NOT (yet)

- There is no backend server, database, or API — all data lives in the browser's localStorage
- There is no user authentication — team-member switching is simulated via a dropdown
- There is no real multi-user collaboration — it's single-browser, single-session
- There are no map integrations, document uploads, or external data feeds

---

## 2. What Has Been Built

### 2.1 Dashboard (`src/pages/Dashboard.tsx`)

The landing page provides a complete portfolio overview at a glance.

| Element | Description |
|---|---|
| **Welcome Hero** | Dark gradient card with quick-action buttons (Browse Properties, Add Property) |
| **5 KPI Tiles** | Properties Tracked, Total Square Feet, Available Space, Pipeline Value, Avg Occupancy |
| **Deal Pipeline Chart** | Horizontal bar chart showing deal value by stage (Sourcing → Under Contract) |
| **Portfolio Mix Donut** | SVG donut chart showing property-type distribution (Office, Industrial, Retail, etc.) |
| **Recent Activity Feed** | Chronological timeline of the last 7 actions (property additions, deal movements, contact logs) |
| **Upcoming Key Dates** | Calendar-card list of the next 6 deal milestones (LOI deadlines, closing dates, tour dates) |
| **Available Space Cards** | Top 4 largest vacancies with SF, rent, status, and property link |

All data is **computed in real-time** from the app state using `useMemo` hooks — no stale data.

---

### 2.2 Properties Module (`src/pages/Properties.tsx` + `src/pages/PropertyDetail.tsx`)

#### Properties List Page

| Feature | Details |
|---|---|
| **Full-text search** | Searches name, address, city, state, tags simultaneously |
| **Multi-filter bar** | Filter by Property Type, Status, City — filters highlight when active |
| **Sort controls** | Recently added, Name A–Z, Largest, Occupancy, Asking Rent |
| **Starred filter** | Toggle to show only starred/bookmarked properties |
| **Card grid** | Responsive 1 / 2 / 3-column grid with property photos, badges, and key metrics |
| **Property cards** | Each card shows: image, status badge, type/class badges, name, address, total SF, occupancy %, asking rent, owner name, and tags |
| **Star toggle** | Star/unstar properties directly from the card |
| **Active filter count** | Shows how many filters are currently applied |
| **Empty state** | Clean empty-state placeholder when no results match |

#### Property Detail Page

A full-page deep-dive into a single property, organized into **6 tabs**:

| Tab | What it shows |
|---|---|
| **Overview** | Description, building intelligence (9 fields), amenities list, internal notes (flagged as private), financials panel, occupancy progress bar, ownership card, timestamps |
| **Vacancies** | All tracked suites/spaces — add, edit, mark as leased, delete; shows suite, SF, rent, available date, type, status, divisibility |
| **Contacts** | All linked owners/brokers/tenants — contact cards with avatar, type badge, email, phone; add new contacts directly |
| **Deals** | All transactions on this property — deal cards with stage, type, value, probability bar, assigned broker, expected close; create new deals |
| **Sharing** | Per-teammate sharing controls — see who has access, toggle individual team members on/off |
| **Activity** | Recent activity feed scoped to the team's actions |

Additional detail page features:
- **Hero banner** with property photo, status/type/class badges, full address
- **Quick-stat strip** (Total SF, Occupancy, Asking Rent, Stories, Year Built, Available SF)
- **Star & Share buttons** in the header
- **Edit button** opens the property form pre-filled
- **Delete button** with confirmation modal (cascades to vacancies, unlinks deals)
- **Shared members strip** at the bottom with avatar stack

---

### 2.3 Property Form (`src/components/PropertyForm.tsx`)

A comprehensive **multi-section modal form** used for both adding and editing properties:

| Section | Fields |
|---|---|
| **Basics** | Property Name*, Property Type (8 options), Status (5 options), Building Class (4 options), Owner (linked from contacts) |
| **Location** | Street Address, City, State (auto-uppercased, 2-char limit), ZIP |
| **Size & Financials** | Total SF, Stories, Year Built, Occupancy %, Available SF, Asking Rent ($/sf), Sale Price ($) |
| **Building Intelligence** | Parking Ratio, Ceiling Height, HVAC, Year Renovated, Ownership Type, Zoning, Lot Size, Electric, Energy Star (checkbox) |
| **Details** | Description (textarea), Amenities (comma-separated), Tags (comma-separated), Internal Notes (private-to-team textarea) |

The form includes **validation** (required name field) and **error display**.

---

### 2.4 Vacancies Module (`src/pages/Vacancies.tsx`)

A cross-portfolio view of all available spaces.

| Feature | Details |
|---|---|
| **4 summary cards** | Total vacancies, Available now, Negotiating, Available SF |
| **Search & filter** | Search by suite or property name; filter by status (Available/Negotiating/Hold/Leased) and type (Direct/Sublease) |
| **Sort options** | Largest, Highest rent, Soonest available |
| **Table/list view** | Responsive grid showing: Suite/Property, Size, Rent, Available date, Type badge, Status badge, Edit/Delete actions |
| **Property picker modal** | When adding a vacancy, first select which property it belongs to, then fill in suite details |
| **Inline actions** | Edit (pencil icon) and Delete (trash icon) per row |

#### Vacancy Form (`src/components/VacancyForm.tsx`)

| Field | Details |
|---|---|
| Suite/Unit* | Free-text (e.g., "Suite 2800", "Fl 9", "Outparcel B") |
| Floor | Floor number/identifier |
| Square Feet | Numeric |
| Asking Rent ($/sf) | Numeric |
| Available Date | Date picker |
| Type | Direct or Sublease |
| Status | Tap-to-select: Available, Negotiating, Hold, Leased (with colored highlights) |
| Divisible | Checkbox |
| Notes | Textarea |

---

### 2.5 Deal Pipeline (`src/pages/Deals.tsx`)

A complete deal-tracking module with **two view modes**.

#### Kanban Board View
- **7 stage columns**: Sourcing → Qualified → Touring → LOI → Under Contract → Closed → Lost
- Each column shows: colored dot, stage name, deal count, and total value
- **Deal cards** show: type badge, probability %, title, linked property, deal value, probability progress bar, assigned broker avatar, expected close date
- **Hover actions**: Move left (◄) / Move right (►) arrows to advance or regress deals between stages
- **Click to open** detailed deal modal

#### List View
- Sorted by deal value (descending)
- Shows: stage badge, title, property, type, value, probability bar, assigned broker avatar
- Click to open detail modal

#### Summary Statistics (top row)
| Metric | Description |
|---|---|
| Open Pipeline | Sum of all non-Closed, non-Lost deal values |
| Weighted Forecast | Probability-adjusted pipeline value |
| Closed (YTD) | Sum of closed deal values |
| Win-Stage | Count of deals in LOI or Under Contract |

#### Deal Detail Modal
- Deal value, probability, type, expected close date
- **Stage movement controls**: Button row for all 7 stages + Back/Advance arrows
- Linked property (clickable link to property detail)
- Key dates timeline (e.g., "LOI Executed — Feb 1", "DD Deadline — Feb 20")
- Assigned broker with avatar and role
- Involved contacts with avatars
- Notes section

#### Deal Form (`src/components/DealForm.tsx`)
| Field | Details |
|---|---|
| Deal Title* | Free-text |
| Property | Dropdown linked to properties database |
| Deal Type | Lease, Sale, Acquisition, Disposition |
| Stage | 7-stage dropdown |
| Deal Value ($) | Numeric |
| Probability | 0–100% slider |
| Assigned To | Dropdown of team members |
| Expected Close | Date picker |
| Contacts | Multi-select chip toggles from all contacts |
| Key Dates | Dynamic add/remove rows with label + date |
| Notes | Textarea |

---

### 2.6 Contacts Module (`src/pages/Contacts.tsx`)

A CRM-style contact management system.

| Feature | Details |
|---|---|
| **Full-text search** | Searches name, company, email, title |
| **Type filter** | Owner, Broker, Tenant, Investor, Property Manager |
| **Starred filter** | Toggle to show only starred/key contacts |
| **Card grid** | 1 / 2 / 3-column responsive grid |
| **Contact cards** | Avatar (color-coded by name hash), name, title, company, type badge, star toggle, email link, linked-property count |
| **Detail modal** | Full contact profile: all contact fields, notes, linked properties (clickable), linked deals (clickable), date added, last contacted date |
| **Edit & Delete** | From the detail modal footer |

#### Contact Form (`src/components/ContactForm.tsx`)
| Field | Details |
|---|---|
| Full Name* | Free-text |
| Company | Free-text |
| Title / Role | Free-text |
| Contact Type | Owner, Broker, Tenant, Investor, Property Manager |
| Email | Email input |
| Phone | Free-text |
| LinkedIn | URL input |
| Linked Properties | Multi-select chip toggles from all properties |
| Notes | Textarea |

---

### 2.7 Team & Sharing (`src/pages/Team.tsx`)

Internal collaboration management.

| Feature | Details |
|---|---|
| **Intro hero** | Dark gradient card explaining the sharing model |
| **Team members grid** | All team members with avatar, name, role, and delete button |
| **Add member form** | Name, Role, Email fields + 8-color swatch picker; adds to the team |
| **Access model explanation** | Three tiers: Firm (everyone sees the database), Shared (flag buildings for deal teams), Private (internal notes default to private) |
| **Data management** | localStorage info + "Reset to demo data" button with confirmation modal |
| **Shared properties list** | Table of all properties that have sharing enabled, with avatar stacks showing who has access, clickable property links |

---

### 2.8 Global Search (`inside src/components/Layout.tsx`)

A search bar in the sticky top header that searches **across all three entity types simultaneously**:

| Search Target | Fields Searched | Results Show |
|---|---|---|
| Properties | Name, city, state, type | Property name, location, type/status badge |
| Contacts | Name, company | Contact name, company, type badge |
| Deals | Title | Deal title, stage |

- Results appear in a **dropdown with grouped sections** (Properties, Contacts, Deals)
- Click any result to navigate directly to its detail view
- Clear button to reset search
- Maximum 4 property, 3 contact, 3 deal results shown to prevent overflow
- Empty-state message when no matches found

---

### 2.9 Layout & Navigation (`src/components/Layout.tsx`)

| Element | Details |
|---|---|
| **Sidebar (desktop)** | 256px dark sidebar with brand logo, 6 navigation items with icons and active-state indicator (blue left bar + white text + blue icon), user switcher at bottom |
| **User switcher** | Dropdown at sidebar bottom — click to switch between team members; shows avatar, name, role for each |
| **Mobile nav** | Hamburger menu opens a slide-out drawer with the same sidebar; backdrop overlay to close |
| **Top header** | Sticky, blur-glass header with page title, subtitle, global search bar, and "Add Property" button |
| **Content area** | Max-width 1400px, auto-padded, scrollable main content region |

---

### 2.10 Activity Feed (`src/components/ActivityFeed.tsx`)

An automated audit trail that logs every significant action:

| Logged Actions | Example |
|---|---|
| Property added | "Added **Meridian Tower** to the database." |
| Property updated | "Updated property details." |
| Property deleted | "Removed a property from the database." |
| Contact added | "New contact **Eleanor Whitfield** added." |
| Vacancy listed | "New vacancy listed: **Suite 2800**." |
| Deal created | "Created deal **Meridian Tower — Fl 28 Lease**." |
| Deal moved | "Moved a deal to **LOI**." |
| Property shared | "Shared **The Atrium at Cypress** with 2 teammates." |

Each entry shows: icon (color-coded by type), description, user name, and relative timestamp ("2h ago", "3d ago").

---

### 2.11 Reusable UI Component Library (`src/components/ui.tsx`)

A comprehensive design-system built from scratch:

| Component | Purpose |
|---|---|
| `Badge` | Colored pill with optional leading dot; 9 tone variants |
| `Button` | 6 variants (primary, secondary, ghost, danger, subtle, outline) × 4 sizes (sm, md, lg, icon) |
| `Card` | Rounded container with border and shadow |
| `SectionTitle` | Title + subtitle + optional action slot |
| `Avatar` | Circular initials avatar with customizable color and size |
| `Modal` | Full-screen overlay dialog with title, subtitle, body, and footer slots; ESC to close, backdrop click to close, body scroll lock |
| `Field` | Form label with optional hint text and required indicator |
| `Input` | Styled text/number/date input |
| `Textarea` | Auto-styled multi-line input |
| `Select` | Styled dropdown with custom chevron |
| `ProgressBar` | Animated fill bar with 9 color variants |
| `EmptyState` | Icon + title + description + action CTA for empty lists |
| `Stat` | Dot + label + large value display |

### 2.12 Charts (`src/components/charts.tsx`)

Two custom SVG chart components (no external charting library):

| Chart | Usage |
|---|---|
| `DonutChart` | Portfolio mix by property type on the Dashboard; supports center label/value, colored legend |
| `HBarChart` | Deal pipeline by stage on the Dashboard; shows label, value, and proportional fill bar |

---

## 3. Architecture & Tech Stack

### 3.1 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19.2.6 |
| Language | TypeScript | 5.9.3 |
| Build Tool | Vite | 7.3.2 |
| CSS Framework | Tailwind CSS | 4.1.17 |
| Icons | Lucide React | Latest |
| Utility | clsx + tailwind-merge | — |
| Output | vite-plugin-singlefile | Single HTML file |

### 3.2 Architecture Pattern

```
┌──────────────────────────────────────────────┐
│                  App.tsx                      │
│           (Root + Hash Router)               │
├──────────────────────────────────────────────┤
│               AppProvider                    │
│  (React Context + localStorage persistence)  │
├──────────────┬───────────────────────────────┤
│   Layout     │      Page Components          │
│  (Sidebar +  │  ┌─────────────────────────┐  │
│   Header +   │  │  Dashboard              │  │
│   Search)    │  │  Properties / Detail     │  │
│              │  │  Vacancies              │  │
│              │  │  Deals (Kanban)         │  │
│              │  │  Contacts              │  │
│              │  │  Team & Sharing        │  │
│              │  └─────────────────────────┘  │
├──────────────┴───────────────────────────────┤
│             Shared Components                │
│  (ui.tsx, charts, forms, PropertyImage,      │
│   ActivityFeed)                              │
├──────────────────────────────────────────────┤
│       Data Layer (types, seed, format, meta)  │
└──────────────────────────────────────────────┘
```

### 3.3 Routing

The app uses a **custom hash-based router** (`src/lib/router.tsx`) — no external router dependency:

| Route | Page |
|---|---|
| `#/` or `#/dashboard` | Dashboard |
| `#/properties` | Properties list |
| `#/properties/:id` | Property detail |
| `#/vacancies` | Vacancies list |
| `#/deals` | Deal pipeline |
| `#/deals?focus=:id` | Deal pipeline with auto-opened deal modal |
| `#/contacts` | Contacts list |
| `#/contacts/:id` | Contacts list with auto-opened detail |
| `#/team` | Team & Sharing |

### 3.4 State Management

A **single React Context** (`src/store/AppContext.tsx`) holds all application state:

- **State shape**: `AppData` = `{ properties, contacts, vacancies, deals, team, activity }`
- **Persistence**: Every state change triggers a `localStorage.setItem()` via `useEffect`
- **Load**: On mount, reads from localStorage; falls back to seed data
- **Reset**: "Reset to demo data" button in Team page restores the original seed
- **Activity logging**: Every mutation (add/update/delete/move/share) auto-logs an ActivityLog entry with timestamp and current user name

### 3.5 Design System

| Token | Value |
|---|---|
| **Font (body)** | Inter (400, 500, 600, 700, 800) |
| **Font (headings)** | Plus Jakarta Sans (600, 700, 800) |
| **Background** | `#eef1f6` (light blue-gray) |
| **Sidebar** | `ink-950` (very dark navy: `#0a1120`) |
| **Primary color** | Blue-600 (`#2563eb`) |
| **Accent palette** | 9 tones: slate, blue, emerald, amber, violet, rose, cyan, indigo, teal |
| **Border radius** | `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for modals |
| **Shadows** | `shadow-sm` default, `shadow-lg` on hover lift |
| **Animations** | `fade-in` (opacity + translateY), `scale-in` (opacity + translateY + scale) |
| **Scrollbar** | Custom thin scrollbar (9px, rounded thumb, transparent track) |

---

## 4. File Structure & Code Map

```
project-root/
├── index.html                     # HTML shell with fonts, favicon, meta
├── package.json                   # Dependencies & scripts
├── vite.config.ts                 # Vite + Tailwind + single-file plugin
├── tsconfig.json                  # TypeScript configuration
│
└── src/
    ├── main.tsx                   # React DOM mount point
    ├── App.tsx                    # Root component + hash routing
    ├── index.css                  # Tailwind import + custom theme + animations
    ├── types.ts                   # All TypeScript interfaces & type unions
    │
    ├── data/
    │   └── seed.ts                # 10 properties, 10 contacts, 12 vacancies,
    │                                 9 deals, 4 team members, 10 activity entries
    │
    ├── store/
    │   └── AppContext.tsx          # Central state: Context + Provider + all
    │                                 CRUD operations + localStorage persistence
    │
    ├── lib/
    │   ├── router.tsx             # Hash-based router (useHashRoute, navigate, Link)
    │   ├── format.ts              # Number/currency/date/time formatting helpers
    │   └── meta.ts                # Lookup maps: status→tone, type→gradient, etc.
    │
    ├── utils/
    │   └── cn.ts                  # clsx + tailwind-merge utility
    │
    ├── components/
    │   ├── ui.tsx                 # 12+ reusable UI primitives (Badge, Button, Card,
    │   │                             Modal, Avatar, Field, Input, Select, etc.)
    │   ├── charts.tsx             # DonutChart + HBarChart (pure SVG)
    │   ├── Layout.tsx             # App shell: sidebar, header, search, mobile nav
    │   ├── ActivityFeed.tsx       # Timeline feed component
    │   ├── PropertyImage.tsx      # Image with gradient fallback
    │   ├── PropertyForm.tsx       # Add/Edit property modal (5 sections)
    │   ├── VacancyForm.tsx        # Add/Edit vacancy modal
    │   ├── DealForm.tsx           # Add/Edit deal modal (with key dates & contacts)
    │   └── ContactForm.tsx        # Add/Edit contact modal
    │
    └── pages/
        ├── Dashboard.tsx          # KPIs, charts, activity, key dates, avail space
        ├── Properties.tsx         # Filtered/sorted property card grid
        ├── PropertyDetail.tsx     # 6-tab deep-dive with inline CRUD
        ├── Vacancies.tsx          # Cross-portfolio vacancy table
        ├── Deals.tsx              # Kanban board + list view + deal detail modal
        ├── Contacts.tsx           # Contact cards + detail modal
        └── Team.tsx               # Team management + sharing + data reset
```

**Total: 26 source files** across 7 directories.

---

## 5. Feature Breakdown

### Features Completed ✅

| # | Feature | Status |
|---|---|---|
| 1 | Add properties with full building intelligence | ✅ Complete |
| 2 | Edit properties | ✅ Complete |
| 3 | Delete properties (with cascade) | ✅ Complete |
| 4 | Star/bookmark properties | ✅ Complete |
| 5 | Search properties (name, address, city, tags) | ✅ Complete |
| 6 | Filter properties (type, status, city) | ✅ Complete |
| 7 | Sort properties (5 sort modes) | ✅ Complete |
| 8 | Property detail page with 6 tabs | ✅ Complete |
| 9 | Building intelligence (9 structured fields) | ✅ Complete |
| 10 | Amenities tracking | ✅ Complete |
| 11 | Internal notes (private to team) | ✅ Complete |
| 12 | Manage owner contacts | ✅ Complete |
| 13 | Contact CRM (add, edit, delete, star, search) | ✅ Complete |
| 14 | Contact types (Owner, Broker, Tenant, Investor, PM) | ✅ Complete |
| 15 | Link contacts to multiple properties | ✅ Complete |
| 16 | Link contacts to deals | ✅ Complete |
| 17 | Track vacancies per property | ✅ Complete |
| 18 | Cross-portfolio vacancy view | ✅ Complete |
| 19 | Vacancy statuses (Available, Negotiating, Hold, Leased) | ✅ Complete |
| 20 | Direct vs. Sublease tracking | ✅ Complete |
| 21 | Deal pipeline (7-stage Kanban) | ✅ Complete |
| 22 | Move deals between stages (buttons + click-to-set) | ✅ Complete |
| 23 | Deal types (Lease, Sale, Acquisition, Disposition) | ✅ Complete |
| 24 | Deal probability + weighted forecast | ✅ Complete |
| 25 | Key dates tracking per deal | ✅ Complete |
| 26 | Deal detail modal | ✅ Complete |
| 27 | Share properties with specific teammates | ✅ Complete |
| 28 | Team member management | ✅ Complete |
| 29 | User switching (simulated) | ✅ Complete |
| 30 | Global search (properties + contacts + deals) | ✅ Complete |
| 31 | Dashboard KPIs (5 metrics) | ✅ Complete |
| 32 | Portfolio mix chart (donut) | ✅ Complete |
| 33 | Pipeline chart (horizontal bars) | ✅ Complete |
| 34 | Activity feed (automated audit trail) | ✅ Complete |
| 35 | Upcoming key dates calendar | ✅ Complete |
| 36 | Available space highlights | ✅ Complete |
| 37 | localStorage persistence | ✅ Complete |
| 38 | Reset to demo data | ✅ Complete |
| 39 | Responsive design (mobile/tablet/desktop) | ✅ Complete |
| 40 | Custom design system (12+ components) | ✅ Complete |
| 41 | Real property photography (stock) | ✅ Complete |
| 42 | Graceful image fallbacks (gradient + icon) | ✅ Complete |
| 43 | SVG favicon | ✅ Complete |

---

## 6. Data Model

### Entity Relationship Overview

```
TeamMember ──┐
             │ assignedTo / sharedWith
Property ◄───┤
  │          │ ownerId
  │    Contact ◄── contactIds ──► Deal
  │                                 │
  ├── Vacancy (1:many)              │ propertyId
  │                                 │
  └─────────────────────────────────┘

ActivityLog (standalone — references users by name string)
```

### Key Relationships

| Relationship | Cardinality | Implementation |
|---|---|---|
| Property → Owner (Contact) | Many-to-One | `property.ownerId` → `contact.id` |
| Contact → Properties | Many-to-Many | `contact.propertyIds[]` → `property.id` |
| Property → Vacancies | One-to-Many | `vacancy.propertyId` → `property.id` |
| Deal → Property | Many-to-One | `deal.propertyId` → `property.id` |
| Deal → Contacts | Many-to-Many | `deal.contactIds[]` → `contact.id` |
| Deal → Assigned Team | Many-to-One | `deal.assignedTo` → `teamMember.name` (string) |
| Property → Shared Team | Many-to-Many | `property.sharedWith[]` → `teamMember.id` |

### Cascade Behavior

| Action | Effect |
|---|---|
| Delete Property | Deletes all linked vacancies; unlinks (but preserves) deals |
| Delete Contact | Unlinks from property ownership (sets `ownerId` to null) |
| Delete Deal | Removes from deals array (no cascade) |

---

## 7. Demo / Seed Data

The seed dataset (`src/data/seed.ts`) provides a **realistic, interconnected** demo:

### Properties (10)
| Name | City | Type | Status | SF | Occupancy |
|---|---|---|---|---|---|
| Meridian Tower | New York, NY | Office (A) | Active | 412K | 88% |
| Harbor Point Center | Seattle, WA | Office (A) | Active | 286K | 81% |
| The Atrium at Cypress | Austin, TX | Office (B) | Off-Market | 164K | 74% |
| Summit Financial Plaza | Chicago, IL | Office (A) | Under Contract | 520K | 92% |
| Lakeside Commerce Bldg | Denver, CO | Office (B) | Active | 198K | 95% |
| Gateway Logistics Ctr | Dallas, TX | Industrial (A) | Active | 685K | 100% |
| Northpoint Distrib Hub | Phoenix, AZ | Industrial (B) | Prospect | 412K | 60% |
| Crossroads Retail Pav | Miami, FL | Retail (A) | Active | 96K | 90% |
| Market Street Shoppes | Nashville, TN | Retail (B) | Active | 54K | 84% |
| Metro Galleria | Phoenix, AZ | Mixed-Use (A) | Prospect | 320K | 86% |

### Contacts (10)
5 Owners, 2 Brokers, 1 Tenant, 1 Property Manager, 1 Investor — all with realistic firm names, titles, notes, and cross-references.

### Deals (9)
Spanning all pipeline stages: 2 Sourcing, 2 Qualified, 1 Touring, 1 LOI, 2 Under Contract, 1 Closed. Mix of Lease, Sale, Acquisition, and Disposition types. Total pipeline > $475M.

### Images
11 stock photos from Pexels (office towers, warehouses, retail centers) — loaded via URL, with graceful gradient fallbacks if offline.

---

## 8. Current Limitations

| # | Limitation | Impact | Priority |
|---|---|---|---|
| 1 | **No backend/database** — localStorage only | Data limited to one browser; no sync, no backup, 5–10 MB cap | 🔴 Critical |
| 2 | **No authentication** — simulated user switching | No access control; anyone with the URL sees everything | 🔴 Critical |
| 3 | **No real multi-user** — single session | Team members can't actually collaborate simultaneously | 🔴 Critical |
| 4 | **No map integration** | Properties have addresses but no map pins or spatial search | 🟡 High |
| 5 | **No document upload** | Can't attach leases, LOIs, floorplans, photos | 🟡 High |
| 6 | **No email/calendar integration** | Key dates aren't synced to calendars; no email logging | 🟡 High |
| 7 | **No notifications** | No alerts for upcoming deadlines, deal changes, etc. | 🟡 High |
| 8 | **No reporting/export** | Can't export property lists, deal reports, or vacancy schedules | 🟡 High |
| 9 | **No market data feeds** | No CoStar, REIS, or public records integration | 🟠 Medium |
| 10 | **No comp tracking** | No lease/sale comp database | 🟠 Medium |
| 11 | **No tenant tracking** | Vacancies track status but not current tenant details | 🟠 Medium |
| 12 | **No financial modeling** | No cap rate calculator, DCF, or rent roll analysis | 🟠 Medium |
| 13 | **No drag-and-drop** | Kanban cards can't be dragged between columns | 🟢 Low |
| 14 | **No dark mode** | Light theme only | 🟢 Low |
| 15 | **No i18n / localization** | English and USD only | 🟢 Low |
| 16 | **No automated tests** | No unit, integration, or E2E tests | 🟢 Low (for prototype) |
| 17 | **No accessibility audit** | Basic semantics exist but WCAG compliance not verified | 🟢 Low (for prototype) |

---

## 9. What Is Needed Next — Phase 2 (Backend & Multi-User)

### 9.1 Backend API Server

| Requirement | Recommendation |
|---|---|
| Runtime | Node.js (Express or Fastify) or Python (FastAPI) |
| Database | PostgreSQL (relational, strong for CRE data models) |
| ORM | Prisma (TypeScript) or SQLAlchemy (Python) |
| API style | REST or GraphQL (REST recommended for simplicity) |
| Hosting | AWS (ECS/Lambda), Google Cloud Run, or Vercel Serverless |

**Key API endpoints needed:**

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh

GET    /api/properties
POST   /api/properties
GET    /api/properties/:id
PUT    /api/properties/:id
DELETE /api/properties/:id

GET    /api/properties/:id/vacancies
POST   /api/properties/:id/vacancies
PUT    /api/vacancies/:id
DELETE /api/vacancies/:id

GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/:id
PUT    /api/contacts/:id
DELETE /api/contacts/:id

GET    /api/deals
POST   /api/deals
GET    /api/deals/:id
PUT    /api/deals/:id
DELETE /api/deals/:id
PATCH  /api/deals/:id/stage

GET    /api/team
POST   /api/team/invite
DELETE /api/team/:id

GET    /api/activity?limit=50

POST   /api/properties/:id/share
POST   /api/search?q=...
```

### 9.2 Authentication & Authorization

| Feature | Details |
|---|---|
| **Auth provider** | Auth0, Clerk, or Supabase Auth (recommended for speed) |
| **JWT tokens** | Access + refresh tokens; httpOnly cookies recommended |
| **Roles** | Admin, Broker, Analyst, Read-Only |
| **Permissions** | Row-level security: users only see properties shared with them (unless Admin) |
| **SSO** | SAML / Google Workspace integration for brokerage firms |
| **Invitation flow** | Admin invites by email → user sets password → joins the firm's workspace |

### 9.3 Database Schema Design

```sql
-- Core tables
firms               (id, name, domain, plan, created_at)
users               (id, firm_id, email, name, role, avatar_url, ...)
properties          (id, firm_id, name, address, city, state, zip, type, status, ...)
building_intel      (id, property_id, parking_ratio, ceiling_height, hvac, ...)
contacts            (id, firm_id, name, company, type, email, phone, ...)
vacancies           (id, property_id, suite, floor, sf, asking_rent, ...)
deals               (id, firm_id, property_id, title, type, stage, value, ...)
deal_key_dates      (id, deal_id, label, date)
activity_logs       (id, firm_id, user_id, type, description, timestamp)

-- Junction tables
property_contacts   (property_id, contact_id)
deal_contacts       (deal_id, contact_id)
property_shares     (property_id, user_id)
property_tags       (property_id, tag)
property_amenities  (property_id, amenity)
```

### 9.4 Real-Time Sync

| Feature | Technology |
|---|---|
| Live updates | WebSockets (Socket.io) or Server-Sent Events |
| Optimistic UI | Update UI immediately, reconcile on server response |
| Conflict resolution | Last-write-wins for simple fields; merge for arrays |

### 9.5 Multi-Tenancy

- Each brokerage firm is a **tenant** with isolated data
- All queries scoped by `firm_id`
- Subdomain routing: `acme.stackline.co`
- Data never leaks between firms

---

## 10. What Is Needed Next — Phase 3 (Feature Expansion)

### 10.1 Map Integration

| Feature | Details |
|---|---|
| **Map view** | Full-screen map alongside property list; pins color-coded by type/status |
| **Geocoding** | Auto-geocode addresses on property creation (Google Maps or Mapbox API) |
| **Spatial search** | "Properties within 5 miles of [address]" |
| **Submarket boundaries** | Overlay submarket polygons |
| **Nearby comps** | Show comparable properties on the map |
| **Tech** | Mapbox GL JS or Google Maps JavaScript API |

### 10.2 Document Management

| Feature | Details |
|---|---|
| **File uploads** | Attach leases, LOIs, floor plans, photos, site plans to any property or deal |
| **Storage** | AWS S3 or Google Cloud Storage with pre-signed URLs |
| **Viewer** | In-app PDF viewer; image gallery with lightbox |
| **Versioning** | Track document versions (v1, v2, v3 of a lease) |
| **Tagging** | Tag files: "Lease", "LOI", "Floor Plan", "Inspection Report" |

### 10.3 Reporting & Export

| Feature | Details |
|---|---|
| **Property flyers** | Auto-generate branded PDF marketing flyers from property data |
| **Vacancy schedule** | Export a rent roll / vacancy schedule to Excel |
| **Pipeline report** | Weekly/monthly deal pipeline summary (PDF or email) |
| **Custom dashboards** | Drag-and-drop dashboard builder with saved views |
| **Data export** | CSV/Excel export for any filtered list |
| **Tech** | React-PDF for PDFs; SheetJS for Excel; html2canvas for screenshots |

### 10.4 Comp Database

| Feature | Details |
|---|---|
| **Lease comps** | Track closed leases: tenant, SF, term, rent, TI, free rent, escalations |
| **Sale comps** | Track closed sales: price, $/SF, cap rate, buyer, seller |
| **Comp search** | Filter by market, property type, size range, date range |
| **Comp export** | Generate comp-set reports for proposals |
| **Comp linking** | Link comps to specific properties as market evidence |

### 10.5 Tenant Tracking

| Feature | Details |
|---|---|
| **Tenant roster** | Per-property tenant list: name, SF, lease start/end, rent, escalations |
| **Lease expiration schedule** | Calendar or timeline view of upcoming expirations |
| **Lease rollover risk** | Dashboard widget showing 12/24/36-month expiration exposure |
| **Tenant creditworthiness** | Store credit rating or financial health notes |
| **Expansion/contraction flags** | Track if tenant is expanding, contracting, or renewing |

### 10.6 Financial Tools

| Feature | Details |
|---|---|
| **Rent roll analysis** | Import or build a rent roll; calculate weighted avg rent, WALT, roll exposure |
| **Cap rate calculator** | NOI / price = cap rate; comparison tool |
| **DCF model** | Simple discounted cash flow for acquisition underwriting |
| **Debt sizing** | LTV, DSCR, and debt yield calculator |
| **Investment memo generator** | Auto-populate from property + financial data |

### 10.7 Communication & Calendar

| Feature | Details |
|---|---|
| **Email integration** | Log emails to contacts (Gmail/Outlook integration via API) |
| **Calendar sync** | Push key dates to Google Calendar or Outlook |
| **Task management** | Assign tasks to team members with due dates |
| **Notifications** | In-app + email notifications for deal changes, upcoming deadlines, team shares |
| **Activity comments** | Comment on activity feed entries for threaded discussions |

### 10.8 Advanced Search & Filters

| Feature | Details |
|---|---|
| **Saved searches** | Save filter combinations as named views ("My Active Offices", "Austin Pipeline") |
| **Advanced query builder** | Build complex queries: "Office AND Class A AND SF > 100,000 AND Occupancy < 90%" |
| **Full-text search** | ElasticSearch or Typesense for notes, descriptions, and documents |
| **Recent searches** | Show search history for quick re-access |

---

## 11. What Is Needed Next — Phase 4 (Scale & Intelligence)

### 11.1 Market Data Integration

| Source | Data Provided |
|---|---|
| **CoStar / LoopNet** | Market rents, vacancy rates, comparables, property listings |
| **REIS / Moody's** | Market forecasts, submarket analytics |
| **County records** | Ownership history, tax assessments, deed transfers |
| **Census / ACS** | Demographics, employment, population growth |
| **Walk Score / Transit Score** | Location quality metrics |

### 11.2 AI / Machine Learning Features

| Feature | Details |
|---|---|
| **Smart pricing** | Suggest asking rents based on comps and market data |
| **Deal scoring** | Predict deal probability based on historical patterns |
| **Tenant matching** | Suggest tenants for vacancies based on requirements and preferences |
| **Natural language search** | "Show me Class A offices over 200K SF in Texas with vacancies" |
| **Automated summaries** | AI-generated property descriptions and investment summaries |
| **Anomaly detection** | Flag unusual rent changes, occupancy drops, or market shifts |

### 11.3 Mobile App

| Feature | Details |
|---|---|
| **Native mobile app** | React Native or Flutter for iOS/Android |
| **Offline mode** | Cache properties and contacts for field use |
| **Photo capture** | Take property photos from the app; auto-upload and geo-tag |
| **Barcode/QR scanning** | Scan property markers for instant lookup |
| **Push notifications** | Deal stage changes, key date reminders, new shares |
| **Location-aware** | "Properties near me" using GPS |

### 11.4 API & Integrations

| Integration | Purpose |
|---|---|
| **CRM sync** | Salesforce, HubSpot — bidirectional contact sync |
| **Accounting** | QuickBooks, Yardi — commission tracking |
| **Deal room** | Secure data rooms for due diligence document sharing |
| **MLS / Listing platforms** | Push listings to LoopNet, Crexi, CREXi |
| **Zapier / Make** | No-code integrations for workflow automation |

### 11.5 Analytics & Business Intelligence

| Feature | Details |
|---|---|
| **Broker performance** | Deals closed, pipeline generated, conversion rates per broker |
| **Market analytics** | Rent trends, vacancy trends, absorption by submarket |
| **Portfolio analytics** | NOI growth, occupancy trends, revenue per SF over time |
| **Custom reports** | Drag-and-drop report builder with charts and tables |
| **Benchmark comparisons** | Compare portfolio performance against market averages |

### 11.6 Enterprise Features

| Feature | Details |
|---|---|
| **Audit trail** | Immutable log of all data changes (who, what, when) |
| **Data retention policies** | Auto-archive old deals after configurable periods |
| **Custom fields** | Admin-defined custom fields per entity type |
| **Workflow automation** | "When a deal moves to Under Contract, auto-notify the team" |
| **White-labeling** | Custom branding per firm (logo, colors, domain) |
| **SLA & uptime** | 99.9% uptime guarantee with status page |

---

## 12. Security & Compliance Considerations

### Immediate Needs (Phase 2)

| Area | Requirement |
|---|---|
| **HTTPS** | TLS 1.3 everywhere; HSTS headers |
| **Input validation** | Server-side validation on all API inputs |
| **SQL injection** | Parameterized queries (Prisma handles this) |
| **XSS prevention** | React auto-escapes; Content-Security-Policy headers |
| **CORS** | Restrict to known origins |
| **Rate limiting** | API rate limits to prevent abuse |
| **Data encryption** | Encrypt at rest (AES-256) and in transit (TLS) |
| **Backup** | Automated daily database backups with point-in-time recovery |

### Compliance (Phase 3+)

| Standard | Relevance |
|---|---|
| **SOC 2 Type II** | Required by enterprise brokerage clients |
| **GDPR** | If serving EU-based clients; data residency + right to deletion |
| **CCPA** | California consumer privacy; data access requests |
| **PCI DSS** | If processing payments (subscription billing) |

---

## 13. Deployment Strategy

### Phase 1 (Current — Static Prototype)

```
Vite Build → Single HTML File → Any static host
                                (Netlify, Vercel, S3+CloudFront)
```

### Phase 2 (Production Architecture)

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ CDN     │    │ Frontend │    │ API      │    │ Database │
│ (CF)   │◄───│ (Vercel) │───►│ (Cloud   │───►│ (Postgres│
│         │    │          │    │  Run)    │    │  on RDS) │
└─────────┘    └──────────┘    └──────────┘    └──────────┘
                                    │
                               ┌────┴────┐
                               │ Object  │
                               │ Storage │
                               │ (S3)    │
                               └─────────┘
```

### Recommended Infrastructure

| Component | Service | Cost Estimate |
|---|---|---|
| Frontend hosting | Vercel or Netlify | Free – $20/mo |
| API server | AWS ECS Fargate or Google Cloud Run | $50–200/mo |
| Database | AWS RDS PostgreSQL or Supabase | $25–100/mo |
| File storage | AWS S3 | $5–20/mo |
| Auth service | Auth0 or Clerk | Free – $50/mo |
| Search | Typesense Cloud | $30–100/mo |
| Maps | Mapbox | Free tier – $50/mo |
| Monitoring | Datadog or Sentry | $25–50/mo |
| **Total** | | **$135–590/mo** |

---

## 14. Competitive Positioning

### Existing Market

| Competitor | Strength | Stackline Differentiator |
|---|---|---|
| **CoStar** | Market data monopoly | Stackline is a *workflow tool*, not just a data provider; private database |
| **Buildout** | Marketing & flyer generation | Stackline covers the full deal lifecycle, not just marketing |
| **REthink CRM** | CRM for brokers | Stackline adds building intelligence, vacancy tracking, and pipeline |
| **VTS** | Leasing & asset management | Stackline targets *brokers and acquisitions*, not landlords |
| **Dealpath** | Deal management for acquisitions | Stackline adds property database + CRM + vacancy tracking |
| **Excel / Google Sheets** | Ubiquitous, flexible | Stackline provides structure, search, and sharing without spreadsheet chaos |

### Target Value Proposition

> *"Stackline replaces the 7 spreadsheets, 3 email threads, and 2 CRMs your brokerage team uses to track buildings, owners, and deals — with one searchable, shareable, long-term property intelligence platform."*

---

## 15. Glossary

| Term | Definition |
|---|---|
| **SF** | Square feet — standard measure of commercial space |
| **PSF** | Per square foot — rent or price expressed on a per-SF basis |
| **Occupancy %** | Percentage of total building SF that is currently leased |
| **Class A/B/C** | Building quality classification (A = trophy, B = functional, C = value) |
| **LOI** | Letter of Intent — non-binding proposal to lease or purchase |
| **PSA** | Purchase and Sale Agreement — binding contract for property sale |
| **DD** | Due diligence — investigation period after contract signing |
| **TI** | Tenant improvements — construction allowance for tenant buildouts |
| **WALT** | Weighted average lease term — portfolio stability metric |
| **NOI** | Net Operating Income — property income minus operating expenses |
| **Cap Rate** | Capitalization rate — NOI ÷ property value; measures yield |
| **1031 Exchange** | Tax-deferred property exchange under IRS Section 1031 |
| **Sale-Leaseback** | Owner sells property and leases it back from the buyer |
| **Cross-dock** | Warehouse designed for direct loading/unloading between trucks |
| **ESFR** | Early Suppression, Fast Response — advanced fire sprinkler system |
| **VAV** | Variable Air Volume — HVAC system type |
| **LEED** | Leadership in Energy and Environmental Design — green building certification |

---

*This document was generated from the Stackline v1.0 codebase. For questions, contact the development team.*
