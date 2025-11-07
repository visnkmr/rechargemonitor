# Recharge Monitor

A comprehensive financial monitoring application built with Next.js that helps you track recharges, bills, expenses, and perform various financial calculations.

## Features

- **Recharge Tracking**: Monitor mobile recharges and other recurring payments
- **Bill Management**: Track and manage your monthly bills
- **Expense Tracking**: Keep track of daily expenses
- **Financial Calculators**: 
  - SIP (Systematic Investment Plan) calculator
  - FD (Fixed Deposit) calculator
  - Loan calculator
  - XIRR (Extended Internal Rate of Return) calculator
- **Mutual Funds**: Track mutual fund purchases and watchlist
- **Data Synchronization**: Automatic sync across devices using PouchDB and CouchDB
- **PWA Support**: Install as a mobile app

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rechargemonitor
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data Synchronization

The application includes automatic data synchronization across devices using PouchDB and CouchDB.

### Local Sync (Default)
- Data is automatically synced within the browser using PouchDB
- Works offline and syncs when online
- No additional setup required

### Remote Sync Setup
To sync data across multiple devices, set up a CouchDB instance:

1. **Set up CouchDB**:
   - Use a hosted service like [CouchDB Cloud](https://cloud.couchdb.com) or self-host
   - Create a new database (e.g., `rechargemonitor`)

2. **Configure Environment Variable**:
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_COUCHDB_URL=https://your-couchdb-instance.com/rechargemonitor
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

The application will now automatically sync all data (recharges, bills, expenses, calculations, mutual funds) across all devices that access the same CouchDB instance.

### Sync Features
- **Automatic**: All localStorage data is automatically synced without manual intervention
- **Conflict Resolution**: Device-aware conflict handling with timestamps
- **Offline Support**: Works offline and syncs when connection is restored
- **Real-time**: Changes on one device appear on others instantly

## Build and Deploy

### Build for Production
```bash
npm run build
npm start
```

### Deploy on Vercel
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Data Sync**: PouchDB with CouchDB
- **PWA**: Next PWA plugin

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
