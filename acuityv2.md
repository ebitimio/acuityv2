Here is a comprehensive `.md` document that captures everything about Acuity — its purpose, features, design, and technical architecture.

Save this as **`ACUITY.md`** in your repo root.

---

# Acuity: The AI Wealth Manager

## 1. What is Acuity?

Acuity is a mobile-first, AI-powered personal wealth and financial management platform designed specifically for Nigerians. It goes beyond traditional expense trackers by helping users answer one critical question: **"How much can I safely spend today without running out of money before my next payday?"**

Acuity is not just a ledger — it is a financial coach. It combines real-time transaction tracking, automated budgeting, multi-account management, and artificial intelligence to give users a clear, anxiety-free view of their financial health.

### 1.1. The Core Value Proposition

Most finance apps show you what you *have spent*. Acuity tells you what you *can spend*. It calculates a daily "Safe to Spend" figure based on your real income, obligations (bills, family support), current cycle (payday to payday), and remaining budget. It is a "Pocket CFO" that protects users from financial ruin.

---

## 2. Target Audience

Acuity is built explicitly for the Nigerian market, with a global-ready architecture.

- **Currency:** Naira (₦) by default, with a toggle to USD (using a live exchange rate).
- **Local Features:** Supports Ajo (cooperative savings groups), Bank Charges analysis, and Tax (PIT & LIRS) tracking.
- **Real-World Obligations:** Accounts for monthly bills, sinking funds, and family support (e.g., "Black Tax").

---

## 3. Core Features & How They Operate

### 3.1. The Dashboard (Home Screen)
The command center of the app. It is designed for clarity and speed.

- **Hero Card:** The orange-red hero card displays the current month, Net Worth, total spent this month, the **Safe to Spend Today** figure, Income (expected minus obligations), and **Net Liquid Assets** (cash only, excluding offline assets).
- **Quick Action Tiles:** One-tap access to Budget, Analytics, and Statement Import.
- **By Category:** A scrollable view of the top spending categories.
- **Tools:** Quick access to Commitments, Tax, Ajo, and other specialized tools.
- **Recent Transactions:** The last 10 transactions with filters (All, In, Out).
- **Setup Checklist:** A guided onboarding flow for new users to add an account, income, and bills.

### 3.2. Safe to Spend Engine
This is the heart of Acuity.

- **Logic:** It takes your total liquid cash, subtracts your upcoming obligations (bills + family support), and divides the remainder by the days left until your next payday.
- **Cycle Awareness:** It uses your custom "Payday Cycle" (e.g., 27th to 26th) to calculate exact days remaining.
- **Budget-Aware:** It does not allow you to spend more than your remaining monthly budget, even if you have cash in the bank.
- **AI Integration:** The AI Advisor uses this data to give realistic advice (e.g., "You have cash, but your budget is tight, so don't spend more than X").

### 3.3. Accounts Management
A complete view of your financial assets.

- **Stacked ATM Cards:** Bank accounts are displayed as visually stacked, gradient cards that expand with a smooth animation to reveal the balance, cardholder name, and actions (Check Balance, Delete).
- **Offline Assets & Liabilities:** Users can add non-liquid assets (land, cars) and liabilities (loans) to track true Net Worth. These can be edited to reflect appreciation or depreciation.
- **Crypto Support:** Users can add crypto holdings (BTC, ETH, USDT, SOL, BNB). Acuity fetches live market prices and converts them to Naira/USD in real time.
- **Internal Transfers:** Users can move money between their own accounts. The app creates a linked debit and credit, ensuring Net Worth remains unchanged.
- **Balance Check-in:** Users can manually reconcile their balance, and Acuity logs an adjustment transaction.

### 3.4. Transactions
- **Quick Add:** A custom numeric keypad for lightning-fast transaction entry.
- **Custom Categories:** Users can create their own categories or choose from provided ones.
- **Transaction Detail:** Tap any transaction to edit, split, or delete it.
- **Search & Filter:** A dedicated full-screen view with search and date grouping.

### 3.5. Budgeting
- **Category Budgets:** Users set limits per category (Groceries, Household, Food & Dining, etc.).
- **Monthly Rollup:** The total budget is the sum of all category budgets.
- **Gauge & Progress:** Visual gauges show budget usage percentage and remaining amount.
- **Payday Cycle:** Users can customize their budget cycle start day.

### 3.6. Analytics & Deep Dives
- **Spending Heatmap:** A 30-day grid showing daily spending intensity. Tapping a square reveals the exact amount spent. The heatmap is always black-backed for consistency across themes.
- **Net Worth Tab:** Deep dive into Liquid Assets, Non-Liquid Assets, Liabilities, and a USD conversion at the current exchange rate. Includes an AI Advisor Insight box.
- **Category Deep Dive:** Tap a category to see a gauge (budget vs. spent), a visual calendar of spending days (highlighted in orange-red), and a list of all transactions in that category.

### 3.7. AI Advisor (Acuity AI)
- **Conversational Interface:** A chat interface with an animated gradient background.
- **Full Financial Context:** The AI reads all your data — accounts, budgets, income, bills, family support, Ajo groups, assets, liabilities, and transactions — before answering.
- **Realistic Coaching:** It gives structured, analytical advice (e.g., warning you if your budget exceeds your income, or if spending would lead to debt).
- **Formatting:** It uses plain text and bullet points for readability, rendered cleanly in the chat bubbles.

---

## 4. Design Style & Colour Scheme

Acuity uses a **"Quiet Glass"** design philosophy — a premium, dark-mode-first aesthetic with a focus on clarity, contrast, and subtle motion.

### 4.1. Colour Palette

| Token | Dark Mode | Light Mode | Purpose |
|---|---|---|---|
| `--bg` | `#0b0b0c` | `#f7f7f9` | Main background |
| `--surface-1` | `#121213` | `#ffffff` | Card backgrounds |
| `--surface-2` | `#1a1a1c` | `#eef0f5` | Elevated surfaces |
| `--surface-3` | `#242427` | `#e4e7ee` | Modals/sheets |
| `--brand` | `#DE3121` | `#DE3121` | Primary orange-red accent |
| `--brand-soft` | `rgba(222, 49, 33, 0.14)` | `rgba(222, 49, 33, 0.12)` | Subtle brand tints |
| `--gain` | `#52c28a` | `#2e9e6b` | Income/positive |
| `--danger` | `#ff6b60` | `#d9453b` | Expenses/negative |
| `--warn` | `#e8a23b` | `#c77d12` | Warnings |
| `--text-1` | `#f5f5f6` | `#0f1115` | Primary text |
| `--text-2` | `rgba(245,245,246,0.6)` | `rgba(15,17,21,0.62)` | Secondary text |
| `--text-3` | `rgba(245,245,246,0.38)` | `rgba(15,17,21,0.4)` | Tertiary text |

**Accent Colour:** `#DE3121` (Orange-Red) — a bold, energetic hue that signals action, urgency, and warmth. It is used for:
- The hero card background
- The floating "+" quick add button
- Active tab indicators
- Icons in quick action tiles and tools
- The AI gradient background
- The "Safe to Spend" pill (as a black pill with white text)

### 4.2. Typography
- **Font:** Geist Sans (system fallback: -apple-system, SF Pro, system-ui).
- **Numerals:** Tabular numerals (`font-variant-numeric: tabular-nums`) are used for all financial figures to ensure they align in columns.
- **ATM Card Name:** Monospace (`font-mono`) with wide letter-spacing and uppercase to mimic the embossed name on a physical ATM card.

### 4.3. Motion & Animation
Acuity uses Framer Motion for:
- **Screen Transitions:** Pages fade and slide in/out smoothly.
- **Floating Tab Bar:** The bottom navigation has a pill that animates (using `layoutId`) to show the active tab.
- **Stacked Cards:** ATM cards overlap and expand with a spring animation.
- **AI Gradient:** The AI chat screen has a slowly flowing orange-to-black gradient background.
- **Number Rolls:** Large figures animate using `NumberRoll` with a spring effect.

### 4.4. Layout & Spacing
- **Radii:** Cards use `24px`, tiles `18px`, fields `16px`, sheets `28px`.
- **Safe Areas:** All screens respect `env(safe-area-inset-*)` for iOS notch and home indicators.
- **Sticky Headers:** The home screen header uses a blurred glass effect (`backdrop-filter: blur(20px)`).
- **Dark Mode Only (For Some Cards):** The Heatmap card, Net Worth card, Calendar card, and ATM cards are hardcoded to dark mode for consistent visual identity across themes.

---

## 5. Technical Blueprint & Architecture

### 5.1. Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS Variables |
| Animation | Framer Motion |
| Auth & DB | Supabase (PostgreSQL + Row Level Security) |
| AI | OpenAI GPT-4o-mini (via tool-calling) |
| Crypto Prices | Binance Public API |
| Icons | Lucide React |
| Fonts | Geist Sans / Geist Mono (via `next/font`) |

### 5.2. Data Model (Core Tables)
| Table | Purpose |
|---|---|
| `workspaces` | Top-level financial space (multi-workspace support) |
| `accounts` | Bank accounts (checking, savings, wallet, dom) |
| `transactions` | All money movements (debit/credit, linked to accounts) |
| `budgets` | Category budgets per account |
| `recurring_items` | Income, bills, and sinking fund targets |
| `assets` | Offline assets & liabilities (including crypto with `meta` JSONB) |
| `ajo_groups` | Cooperative savings groups |
| `balance_checkins` | Log of manual balance reconciliations |
| `custom_categories` | User-created spending categories |
| `category_rules` | Merchant-to-category auto-tagging rules |
| `profiles` | User profile data (`full_name`, `avatar_url`) |

### 5.3. Key SQL Functions
| Function | Purpose |
|---|---|
| `get_home_metrics()` | Returns Net Worth, Spent, Income, Budget Limit, Uncategorized count |
| `get_account_balances()` | Calculates current balance for each account (anchor + transactions since anchor) |
| `get_safe_to_spend()` | Calculates daily safe spending amount (cash + budget + obligations) |
| `get_current_cycle()` | Returns the start and end dates of the current payday cycle |
| `get_setup_status()` | Returns onboarding step progress |
| `reanchor_account()` | Resets an account's balance anchor after a manual check-in |

### 5.4. AI Architecture
- **Client:** `AIDrawer.tsx` sends messages to `/api/chat`.
- **Server:** `route.ts` invokes OpenAI with a `system` prompt and a list of `tools`.
- **Tools:** `lib/ai/tools.ts` defines functions like `get_financial_context`, `get_safe_to_spend_status`, `get_budget_status`, etc. The AI calls these tools in a loop until it has enough data to answer.
- **Context:** The AI receives the user's full financial picture (income, obligations, assets, liabilities, ajo groups) and is instructed to give realistic, structured advice.

### 5.5. State Management
- **Global Contexts:** `CurrencyProvider` (NGN/USD toggle), `WorkspaceProvider` (active workspace).
- **Local State:** Each screen fetches its own data via `lib/supabase/database.ts` (e.g., `getAccounts()`, `getAssets()`).
- **Cache:** `clearDataCache()` is called before every major fetch to ensure fresh data.

### 5.6. Routing
- **Single-page app style:** `page.tsx` manages all screens via `activeScreen` state (`home`, `analytics`, `budget`, `accounts`, etc.).
- **Screen Transition:** Wraps content in `<ScreenTransition>` to animate between screens.
- **Modals & Sheets:** `<Modal>` component handles bottom sheets and full-screen modals with drag-to-dismiss.

---

## 6. User Flow Summary

1. **Onboarding:** User signs up → Setup Wizard (Account → Income → Bills) → Dashboard.
2. **Daily Use:** Open app → See Safe to Spend → Quick Add a transaction → Watch numbers update in real time.
3. **Weekly:** Check Budget screen for category limits → Review Analytics for spending trends.
4. **Monthly:** Add offline assets (land, crypto) → Check Net Worth → Adjust budgets.
5. **AI Use:** Tap the AI tab → Ask questions → Get realistic, structured financial advice.

---

## 7. Design Principles

1. **Clarity over Clutter:** Every screen has a clear hierarchy. The most important number (Safe to Spend) is always prominent.
2. **Speed:** Custom keypads, quick-add pills, and one-tap navigation reduce friction.
3. **Trust:** Dark mode, tabular numbers, and consistent icons signal reliability.
4. **Local Context:** Naira-first, Ajo groups, family support, and tax features make the app feel built for Nigerians.
5. **Intelligence:** The AI is not a gimmick; it is a realistic coach that prevents financial mistakes.
6. **Consistency:** The orange-red accent (`#DE3121`) ties everything together across light and dark mode.

---

## 8. Future Blueprint (Roadmap)

- **Statement Scan (Step 5):** Automated import of bank statements (CSV/XLSX) with AI-powered categorization.
- **Multi-Currency Wallets:** Direct tracking of USD, GBP, and EUR accounts.
- **Shared Workspaces:** Family or business collaboration with permission levels.
- **Goal Tracking:** Visual progress towards sinking funds and savings goals.
- **Offline Mode:** Local caching for full functionality without internet.

---

## 9. Conclusion

Acuity is more than a finance app — it is a **financial command center**. It combines the elegance of a premium mobile app with the intelligence of a personal CFO. Whether you are a young professional trying to survive to payday or a high-net-worth individual tracking land, crypto, and multi-account cash flow, Acuity gives you the clarity and confidence to make smarter money decisions every day.