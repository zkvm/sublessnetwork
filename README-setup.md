# Subless Network - Setup Guide

Complete guide to set up and run the Subless Network platform (Payment Service, Resource Service, and Frontend App).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Running Services](#running-services)
5. [Testing](#testing)

---

## 🔧 Prerequisites

### Required Software

```bash
# Node.js (v18+)
node --version  # Should be >= 18.0.0

# npm
npm --version

# PostgreSQL (v14+)
psql --version

# Redis (v6+)
redis-server --version

# PM2 (for production)
npm install -g pm2
```

### System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib redis-server
```

**macOS:**
```bash
brew install postgresql@14 redis
```

---

## ⚙️ Environment Setup

### 1. Clone Repository

```bash
git clone git@github.com:zkvm/sublessnetwork.git
cd sublessnetwork
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env
```

**Required Environment Variables:**

```env
# ================ Payment (x402) ================
FACILITATOR_URL=https://facilitator.payai.network
NETWORK=solana
TREASURY_WALLET_ADDRESS=
USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# ================ Application ================
BASE_URL=http://localhost:4021
PORT=4021
NODE_ENV=development

# ================ Database ================
DATABASE_URL=

# ================ Redis ================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ================ Encryption ================
ENCRYPTION_KEY=your-32-byte-hex-encryption-key-here
ENCRYPTION_ALGORITHM=aes-256-gcm

# ================ Twitter (Optional) ================
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
TWITTER_BOT_USER_ID=your_bot_user_id
MENTION_POLL_INTERVAL_SECONDS=90
```

---

## 🗄️ Database Setup

### 1. Start PostgreSQL

```bash
# Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS
brew services start postgresql@14
```

### 2. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In psql console:
```

```sql
-- Create user
CREATE USER sublessuser WITH PASSWORD 'your_secure_password';

-- Create database
CREATE DATABASE sublessnetwork OWNER sublessuser;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sublessnetwork TO sublessuser;
ALTER SCHEMA public OWNER TO sublessuser;

-- Exit
\q
```

### 3. Import Database Schema

```bash
# Import tables
psql -U sublessuser -d sublessnetwork -h localhost -f schema/01_resources.sql
psql -U sublessuser -d sublessnetwork -h localhost -f schema/02_purchases.sql

# Verify tables
psql -U sublessuser -d sublessnetwork -h localhost -c "\dt"
```

Expected output:
```
             List of relations
 Schema |    Name    | Type  | Owner 
--------+------------+-------+-------
 public | purchases  | table | sublessuser
 public | resources  | table | sublessuser
```

### 4. Start Redis

```bash
# Ubuntu/Debian
sudo systemctl start redis-server
sudo systemctl enable redis-server

# macOS
brew services start redis

# Test connection
redis-cli ping  # Should return: PONG
```

---

## 🚀 Running Services

The platform consists of three services that need to run simultaneously:

### Development Mode (Local)

#### Terminal 1: Payment Service (Port 4021)

```bash
npm run dev

# Or manually:
# tsx watch payment/index.ts
```

**What it does:**
- Handles x402 payment verification
- Serves resource preview endpoints (`/api/resources/:id/preview`)
- Serves resource purchase endpoints (`/api/resources/:id`)
- Decrypts content after successful payment

**Logs:**
```
🚀 Payment API Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server:       http://localhost:4021
💰 Network:      solana
🏦 Treasury:     
💵 USDC Mint:    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

#### Terminal 2: Resource Service (Background Workers)

```bash
npm run dev:resource

# Or manually:
# tsx watch core/index.ts
```

**What it does:**
- Consumes message queues (BullMQ + Redis)
- Processes DM messages (encrypts content, stores resources)
- Processes mention tweets (verifies proofs, publishes resources)
- Polls Twitter mentions (if credentials configured)
- Sends Twitter replies (mention-reply-worker)

**Logs:**
```
🚀 X402X Resource Queue Workers Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Redis:        localhost:6379
📊 Database:     localhost:5432/sublessnetwork

📋 Active Queues:
   1️⃣  dm_received (DM processing)
   2️⃣  dm_reply (DM replies - not consumed)
   3️⃣  mention_received (Mention processing)
   4️⃣  mention_reply (Mention reply worker)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Twitter client initialized
✅ Twitter mention poller started
✅ DM processor ready
✅ Mention processor ready
✅ Mention reply worker ready
```

#### Terminal 3: Frontend App (Port 3000)

```bash
npm run dev:app

# Or manually:
# cd app && next dev --port 3000
```

**What it does:**
- Serves the Next.js frontend
- Resource purchase pages (`/resources/:id`)
- Landing page
- Documentation page

**Logs:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully
```

### Access URLs (Development)

- **Frontend:** http://localhost:3000
- **Payment API:** http://localhost:4021
- **Resource Page:** http://localhost:3000/resources/:id
- **API Preview:** http://localhost:4021/api/resources/:id/preview

---

## 🧪 Testing

### Test Resource Creation (DM Queue)

```bash
# Test creating a resource via DM queue
npx tsx test/test-dm-queue.ts

# Follow the prompts to create a test resource
```

### Test Mention Processing

```bash
# Test mention verification and publishing
npx tsx test/test-mention-queue.ts <resource-id> <proof-token> [price]

# Example:
npx tsx test/test-mention-queue.ts 9d4bb88d-0f75-4d44-8755-a727d37cdf6a 942-cbeb 0.50
```

### Manual Testing

#### 1. Create a Test Resource

```bash
# Run DM queue test
npx tsx test/test-dm-queue.ts
```

You'll get output like:
```
✅ Resource created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Resource Details:
   Resource ID: 19b195d0-7836-4dd6-b31d-90a58ec100c4
   Proof Token: 942-cbeb
   Status:      draft
```

#### 2. Publish the Resource

```bash
# Run mention queue test with the resource ID and proof
npx tsx test/test-mention-queue.ts 19b195d0-7836-4dd6-b31d-90a58ec100c4 942-cbeb 0.50
```

#### 3. Test Frontend Purchase Flow

1. Open browser: http://localhost:3000/resources/19b195d0-7836-4dd6-b31d-90a58ec100c4
2. You should see the preview
3. Connect Solana wallet
4. Click "Purchase Content" to test x402 payment

---