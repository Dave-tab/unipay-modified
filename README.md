# UniPay: Smart Campus Fintech Ecosystem 🎓💳

UniPay is a comprehensive, production-ready campus financial services platform designed to streamline payments, merchant settlements, parent allowances, and campus service transactions (cafeteria, print hub, shuttle, tuition, and health center).

---

## 🌟 Core Modules & Features

### 1. **Student Digital Wallet & QR Payments**
- **Instant QR Payments**: Secure peer-to-peer and merchant QR code scanning with instant verification.
- **Smart Spending Budgets**: Daily and weekly spending limits, category analytics (food, transport, academics, print).
- **Offline/Online Sync**: Seamless transaction logging with real-time balance tracking.

### 2. **Merchant POS & Instant Payouts**
- **Live Collections Dashboard**: Track today's revenue, completed orders, and settlement status.
- **Automated Bank Payouts**: Secure withdrawal workflow supporting major commercial banks (GTB, Access, Zenith, Kuda, UBA, OPay, First Bank) with PIN authorization and instant receipt generation.
- **POS Terminal Simulator**: Quick charge entry, receipt printing preview, and transaction audit trails.

### 3. **Parent Portal & Allowance Management**
- **Guardian Wallet & Funding**: Dedicated virtual accounts (Providus Bank), debit card, and USSD top-ups.
- **Ward Balance & Allowance Status**: Monitor linked wards' balances and recurring allowance schedules (daily, weekly, monthly).
- **Student Privacy & Autonomy**: Balances and allowance controls are transparent to parents, while individual itemized transaction logs remain strictly private to protect student privacy.

### 4. **Campus Service Hub**
- **Unified Services**: Instant access to Campus Cafeteria, Print Hub, Shuttle Transit, Tuition & Fees, and University Health Clinic.
- **Optimized Carousel**: Smooth touch and mouse swipe scrolling isolated from click interactions.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Animations**: Motion (`motion/react`)
- **Backend & Persistence**: Firebase Firestore / Secure Cloud State
- **Build Tooling**: esbuild & Vite production bundler

---

## 📁 Project Structure

```text
├── src/
│   ├── components/     # Reusable UI components & navigation
│   ├── screens/        # Core app views (HomeScreen, MerchantPosScreen, ParentPortalScreen, QrPayScreen, etc.)
│   ├── App.tsx         # Main application orchestrator & context provider
│   ├── main.tsx        # React DOM entry point
│   └── index.css       # Tailwind CSS global styles
├── public/             # Static assets
├── metadata.json       # Applet capabilities & permissions
├── package.json        # Dependencies and scripts
└── README.md           # Documentation
```

---

## 🚀 Getting Started & Local Development

1. **Clone the Repository** and install dependencies:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 License & Production Status

UniPay is built for production deployment on modern cloud platforms (Google Cloud Run / Vercel / Netlify). All rights reserved.
