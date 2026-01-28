# Flyra MVP - Stablecoin Remittance Platform

Create a web application for Flyra, a stablecoin-native remittance platform that enables instant, low-cost money transfers from the US to emerging markets, starting with Sub-Saharan Africa and India.

## Core Features for MVP

### 1. User Registration & KYC
- **Sender Registration (US-based)**:
  - Email/password authentication
  - Basic KYC collection: Full name, date of birth, address, SSN (last 4 digits for MVP)
  - Phone number verification via SMS
  - Simple income verification (manual entry for MVP: employer name, monthly income)
  
- **Receiver Registration (Africa/India)**:
  - Phone number-based registration
  - Basic identity collection: Full name, country, city
  - Mobile money account details (M-PESA, Airtel Money, UPI ID)

### 2. Wallet Management
- **USDC Wallet for Senders**:
  - Display balance in USDC and USD equivalent
  - Show transaction history
  - Add funds via mock bank connection (simulate ACH transfer)
  
- **Multi-currency Wallet for Receivers**:
  - Display balance in USDC and local currency equivalent
  - Option to hold in USDC or auto-convert to local currency
  - Transaction history with remittance details

### 3. Send Money Flow
- **Quick Send**:
  - Select or add receiver by phone number
  - Enter amount in USD
  - Show real-time conversion to USDC and receiver's local currency
  - Display total fees (flat $2.99 for MVP)
  - Estimated delivery time: "Instant"
  - Review and confirm transaction
  
- **Recurring Sends**:
  - Set up monthly automatic transfers
  - Choose specific date of month
  - Set fixed amount or percentage of income

### 4. Receive Money Flow
- **Instant Notifications**:
  - SMS notification when money arrives (simulated)
  - In-app notification with sender details and amount
  
- **Cash Out Options**:
  - Direct to mobile money (M-PESA, Airtel Money, UPI)
  - Hold in USDC wallet
  - Show local agent locations (static list for MVP)

### 5. Transaction Dashboard
- **Sender Dashboard**:
  - Total sent (lifetime, this month)
  - Recent transactions list
  - Upcoming scheduled transfers
  - Quick access to frequent receivers
  
- **Receiver Dashboard**:
  - Total received (lifetime, this month)
  - Recent receipts with sender info
  - Current balance and cash-out options

## Technical Requirements

### Frontend (Next.js 14)
- Responsive design optimized for mobile
- Clean, simple UI using Tailwind CSS and ShadCN components
- Support for both light/dark themes
- Multi-language support (English, Swahili, Hindi for MVP)
- Progressive Web App capabilities

### Backend (FastAPI)
- RESTful API design
- JWT-based authentication
- Mock stablecoin integration (simulate USDC transfers)
- Mock payment provider integration
- Exchange rate service (use mock rates: 1 USD = 1 USDC, predetermined local rates)

### Database (DynamoDB)
- Users table (senders and receivers)
- Wallets table
- Transactions table
- Exchange rates table (mock data)
- KYC documents table

### Key User Flows

1. **First-time Sender**:
   - Sign up → KYC → Add bank → Fund wallet → Add receiver → Send money

2. **Returning Sender**:
   - Login → Select receiver → Enter amount → Confirm → Send

3. **First-time Receiver**:
   - Receive SMS notification → Sign up with phone → View money → Choose cash-out method

4. **Returning Receiver**:
   - Login → View balance → Cash out or hold

## Mock Data & Constraints

- Simulate all external integrations (banking, USDC, mobile money)
- Use fixed exchange rates: 1 USD = 160 KES (Kenya), 1 USD = 83 INR (India)
- Transaction fees: Flat $2.99 per transfer
- Mock KYC approval: Instant for demo purposes
- Simulated processing time: Show 3-second loading for "blockchain confirmation"

## UI/UX Priorities

1. **Mobile-first design** - Most users will access via smartphone
2. **Minimal steps** - Maximum 3 screens for any core action
3. **Clear fee transparency** - Always show fees upfront
4. **Trust indicators** - Security badges, encryption notices, regulatory compliance text
5. **Accessibility** - Large touch targets, clear contrast, simple language

## Demo Scenarios

The app should support these demo flows:
1. **Amara in NYC** sends $500 to her mother **Ngozi in Lagos**
2. **Raj in San Francisco** sets up recurring $300 monthly transfer to family in **Mumbai**
3. **Ngozi** receives money and cashes out to M-PESA
4. Dashboard showing transaction history and analytics

## Success Metrics to Display

- Total volume transferred (mock: $2.3M)
- Active users (mock: 1,250)
- Average transfer time: "< 30 seconds"
- User testimonials (3 mock testimonials)

Build this application with a focus on simplicity, trust, and speed. The MVP should demonstrate the core value proposition: instant, affordable remittances powered by stablecoins.