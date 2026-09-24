# Mainnet Verification & Migration Guide

Guide for transitioning Novera from Sui testnet to Sui mainnet, including verification procedures and deployment checklist.

---

## 🎯 Overview

**Current Status**: Novera is deployed on **Sui testnet**
**Goal**: Migrate to **Sui mainnet** for production use
**Timeline**: 2-4 weeks preparation

### Key Differences

| Aspect | Testnet | Mainnet |
|--------|---------|---------|
| **Network** | Sui testnet (public, resets) | Sui mainnet (permanent) |
| **Data Permanence** | Temporary (testnet may reset) | Permanent (immutable) |
| **Walrus Blobs** | Testnet blobs | Mainnet blobs (real cost) |
| **Cost** | Free (testnet) | ~$0.01 per student profile |
| **Validator Trust** | Test validators | Real Sui validators |
| **Use Case** | Development/Testing | Production |
| **Legal Status** | Non-binding | Legally enforceable records |

---

## 📋 Mainnet Readiness Checklist

### Phase 1: Code Readiness (Week 1)

- [ ] **Network Configuration**
  - [ ] Test against mainnet RPC in staging
  - [ ] Verify Walrus mainnet availability
  - [ ] Confirm API endpoints are mainnet
  - [ ] Test with mainnet gas prices

- [ ] **Security Audit**
  - [ ] Code review for mainnet safety
  - [ ] Check no testnet-specific hardcodes
  - [ ] Verify key management
  - [ ] Test key rotation procedures
  - [ ] Confirm secrets management

- [ ] **Contract/Blob Testing**
  - [ ] Test Walrus blob creation
  - [ ] Test blob retrieval
  - [ ] Test deduplication logic
  - [ ] Verify data integrity
  - [ ] Test error handling

- [ ] **Performance Testing**
  - [ ] Load test with 100 concurrent users
  - [ ] Measure Walrus latency
  - [ ] Check gas usage per transaction
  - [ ] Verify response times acceptable
  - [ ] Monitor resource usage

### Phase 2: Infrastructure Readiness (Week 1-2)

- [ ] **Mainnet Wallet**
  - [ ] Create mainnet wallet
  - [ ] Fund with SUI tokens
  - [ ] Test transactions on mainnet
  - [ ] Verify wallet balance
  - [ ] Set up key backup

- [ ] **Monitoring Setup**
  - [ ] Configure mainnet RPC monitoring
  - [ ] Set up alerts for failed transactions
  - [ ] Track Walrus blob creation cost
  - [ ] Monitor gas usage
  - [ ] Track student data growth

- [ ] **Backup & Recovery**
  - [ ] Test data backup from mainnet
  - [ ] Verify recovery procedures
  - [ ] Document disaster recovery
  - [ ] Set up offsite backups
  - [ ] Test restore procedures

- [ ] **Deployment Infrastructure**
  - [ ] Staging environment on mainnet
  - [ ] Production environment ready
  - [ ] Database backups configured
  - [ ] Rollback procedures documented
  - [ ] Health check infrastructure

### Phase 3: Data Migration (Week 2)

- [ ] **Testnet Data Extraction**
  ```bash
  # Export all testnet student profiles
  pnpm -C packages/memory run export-testnet
  # Creates: testnet_export.json (all student profiles)
  ```

- [ ] **Migration Validation**
  - [ ] Verify all student profiles exported
  - [ ] Check data integrity
  - [ ] Sample validate 10+ profiles
  - [ ] Verify no data corruption
  - [ ] Test import on staging

- [ ] **Mainnet Data Import**
  ```bash
  # Import to mainnet Walrus (staging first)
  NODE_ENV=staging pnpm -C packages/memory run import-mainnet --file testnet_export.json
  ```

- [ ] **Post-Migration Verification**
  - [ ] All profiles migrated successfully
  - [ ] Spot-check random students
  - [ ] Verify memory retrieval working
  - [ ] Test personalization accuracy
  - [ ] Confirm no data loss

### Phase 4: Student Communication (Week 2-3)

- [ ] **Notification Email**
  ```
  Subject: Novera Moving to Blockchain Mainnet 📈

  Hi [Student],

  Exciting news! We're moving Novera to Sui mainnet to give you
  true data ownership.

  What changes for you?
  ✅ Your learning profile is now permanently on-chain
  ✅ Data is immutable (can never be deleted)
  ✅ You can prove your learning forever
  ✅ Same experience, more power

  What stays the same?
  ✅ Same Telegram bot (@novera_bot)
  ✅ Same learning experience
  ✅ All your progress transferred
  ✅ Free access still available

  Mainnet launch: [DATE]

  Questions? Reply to this email.

  Learning together,
  Novera Team
  ```

- [ ] **Blog Post**
  - Explain mainnet migration
  - Highlight data ownership benefits
  - Provide FAQ
  - Set timeline

- [ ] **FAQ Prepared**
  - "What's mainnet vs testnet?"
  - "Will my data transfer?"
  - "Is it more expensive?"
  - "Can I export my profile?"
  - "What about privacy?"

### Phase 5: Testing on Staging (Week 2-3)

- [ ] **End-to-End Testing**
  ```bash
  # Run full test suite on mainnet staging
  pnpm -r run test:staging

  # Manual testing checklist
  [ ] /start works (new user)
  [ ] /quiz works (question generation)
  [ ] /memory works (profile retrieval)
  [ ] /progress works (metrics display)
  [ ] Gemini integration working
  [ ] Walrus profile storage working
  [ ] Response times acceptable
  ```

- [ ] **Load Testing**
  ```bash
  # Simulate 100 concurrent users
  npm install -g Artillery

  artillery quick --count 100 --num 10 https://staging.novera.app
  ```

- [ ] **Mainnet Transaction Testing**
  - [ ] Create Walrus blob on mainnet
  - [ ] Retrieve from mainnet
  - [ ] Update profile on mainnet
  - [ ] Test error recovery
  - [ ] Verify gas usage

### Phase 6: Mainnet Launch (Week 4)

- [ ] **Pre-Launch** (24 hours before)
  - [ ] Final code review
  - [ ] Staging tests all pass
  - [ ] Wallet funded with SUI
  - [ ] Monitoring alerts configured
  - [ ] Rollback plan ready

- [ ] **Launch Procedure**
  ```bash
  # 1. Verify mainnet configuration
  NODE_ENV=production npm run verify-mainnet

  # 2. Stop testnet service (if running separately)
  docker-compose -f compose.testnet.yml down

  # 3. Start mainnet service
  docker-compose -f compose.mainnet.yml up -d

  # 4. Run health check
  curl https://novera.app:4000/health

  # 5. Test with real user
  # Message @novera_bot, verify working
  ```

- [ ] **Post-Launch** (24 hours after)
  - [ ] Monitor error logs
  - [ ] Check Walrus transaction success rate
  - [ ] Verify student data integrity
  - [ ] Test sample queries from Walrus
  - [ ] Gather feedback

---

## 🔧 Technical Migration Details

### Environment Configuration

**Before** (Testnet):
```env
MEMWAL_SERVER_URL=https://walrus-testnet-rpc.walrus.space
MEMWAL_NAMESPACE=novera-testnet
NODE_ENV=development
SUI_NETWORK=testnet
```

**After** (Mainnet):
```env
MEMWAL_SERVER_URL=https://walrus-mainnet-rpc.walrus.space
MEMWAL_NAMESPACE=novera
NODE_ENV=production
SUI_NETWORK=mainnet
```

### Code Changes Required

**1. Configuration Update**

```typescript
// config.ts
const MAINNET_RPC = "https://walrus-mainnet-rpc.walrus.space";

export const config = {
  ...
  memwalServerUrl: process.env.NODE_ENV === 'production'
    ? MAINNET_RPC
    : "https://walrus-testnet-rpc.walrus.space",
  memwalNamespace: process.env.NODE_ENV === 'production'
    ? "novera"
    : "novera-testnet",
};
```

**2. Gas Price Estimation**

```typescript
// On mainnet, gas is not free
// Estimate cost per student profile:
// - Create profile: ~0.001 SUI
// - Update profile: ~0.0005 SUI
// - Retrieve profile: FREE (query)

// Budget calculation:
// 10,000 students * $0.01/profile = $100 initial cost
// Ongoing: Updates only (50% monthly active)
// 5,000 students * 2 updates/month * $0.005 = $50/month
```

**3. Mainnet Wallet Integration**

```typescript
// keypair.ts
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

// Load from secure storage (not environment variable for production!)
const keypair = Ed25519Keypair.fromSecretKey(
  Buffer.from(process.env.SUI_MAINNET_SECRET_KEY, "hex")
);
```

### Data Migration Script

```typescript
// scripts/migrate-to-mainnet.ts

import { MemWalClient } from "@novera/memory";

const mainnetClient = new MemWalClient({
  serverUrl: "https://walrus-mainnet-rpc.walrus.space",
  namespace: "novera",
});

const testnelClient = new MemWalClient({
  serverUrl: "https://walrus-testnet-rpc.walrus.space",
  namespace: "novera-testnet",
});

async function migrateStudent(userId: string) {
  // 1. Get profile from testnet
  const profile = await testnetClient.recall(userId);
  
  // 2. Store on mainnet
  await mainnetClient.remember(userId, profile);
  
  // 3. Verify
  const verifyProfile = await mainnetClient.recall(userId);
  
  if (JSON.stringify(profile) !== JSON.stringify(verifyProfile)) {
    throw new Error(`Migration failed for ${userId}`);
  }
  
  console.log(`✓ Migrated ${userId}`);
}

// Migrate all students
async function migrateAll() {
  const studentIds = await getStudentIdsFromTestnet();
  
  for (const id of studentIds) {
    try {
      await migrateStudent(id);
    } catch (error) {
      console.error(`Failed: ${id}`, error);
    }
  }
}
```

---

## 💰 Cost Analysis

### Walrus Mainnet Pricing

```
Storage Cost: $0.01 per blob per year
(Minimum ~0.5 SUI at current prices)

Example for 10k students:
Initial creation:     10,000 * $0.01 = $100
Annual storage:       (already included in initial)
Monthly updates:      5,000 * 2 * $0.005 = $50
Total Year 1:         ~$700

Compare:
- Traditional DB: $5,000/month = $60k/year
- Walrus mainnet: ~$800/year
- Savings: 99% cheaper ✨
```

### Gas Fee Estimation

```
Per transaction on Sui:
- Network fee: ~0.5 mSUI
- Storage: varies by data size

Novera student profile: ~5 KB
- Create: 2 mSUI (~$0.02)
- Update: 1 mSUI (~$0.01)
- Retrieve: FREE

Budget for 10k students/month:
- New signups (1%): 100 * $0.02 = $2
- Updates (50% active): 5000 * 2 * $0.01 = $100
- Total: $102/month (~$1,200/year)
```

---

## ✅ Verification Procedures

### Before Launch

**1. RPC Connectivity**
```bash
curl -X POST https://walrus-mainnet-rpc.walrus.space \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getChainIdentifier","params":[]}'

# Should return mainnet chain ID
```

**2. Wallet Verification**
```bash
# Verify wallet has funds
sui client call --function get_balance \
  --module sui::balance \
  --args <WALLET_ADDRESS>

# Should show SUI balance > 1.0
```

**3. Walrus Blob Creation**
```typescript
// Test creating a blob on mainnet
const testBlob = { test: "data", timestamp: Date.now() };
const blobId = await walrusClient.storeBlob(testBlob);
console.log("✓ Blob created:", blobId);

// Retrieve and verify
const retrieved = await walrusClient.readBlob(blobId);
console.log("✓ Blob retrieved successfully");
```

**4. Student Profile Migration**
```bash
# Verify 10 random students migrated correctly
for i in {1..10}; do
  STUDENT_ID=$RANDOM
  
  # Get from mainnet
  MAINNET_DATA=$(curl -s "$MAINNET_ENDPOINT/profile/$STUDENT_ID")
  
  # Verify not empty
  if [ -z "$MAINNET_DATA" ]; then
    echo "✗ Migration failed for $STUDENT_ID"
    exit 1
  fi
  
  echo "✓ Profile $i verified on mainnet"
done
```

### After Launch

**1. Daily Health Checks**
```bash
# Automated daily check
0 0 * * * curl https://novera.app:4000/health && \
  curl https://novera.app/verify-mainnet-connection

# Alert if failures
```

**2. Weekly Audits**
```bash
# Verify sample of student profiles on mainnet
pnpm -C packages/memory run audit-mainnet --sample-size 100

# Generates: audit_report_YYYY-MM-DD.json
```

**3. Monthly Reconciliation**
```bash
# Reconcile testnet vs mainnet data
# Ensure clean migration, no orphaned records
pnpm -C packages/memory run reconcile-networks
```

---

## 🔄 Rollback Procedure

**If critical issues occur:**

1. **Stop Production**
   ```bash
   docker-compose -f compose.mainnet.yml down
   ```

2. **Revert to Testnet** (if backup running)
   ```bash
   docker-compose -f compose.testnet.yml up -d
   ```

3. **Notify Users**
   - Email students about issue
   - Provide status updates every 2 hours
   - Explain recovery steps

4. **Root Cause Analysis**
   - Debug logs
   - Identify issue
   - Fix and test on staging

5. **Re-deploy**
   - Fix code
   - Test thoroughly
   - Staged rollout to 10% of users
   - Monitor errors
   - If stable, expand to 100%

---

## 📊 Monitoring Mainnet

### Key Metrics to Track

```
Walrus Operations:
- Blob creation success rate (target: >99%)
- Blob retrieval latency (target: <500ms)
- Storage cost per month
- Total blobs created

Sui Network:
- Gas price trends
- Network congestion
- Validator health

Novera Service:
- Bot response time
- Error rate (target: <0.1%)
- User signups on mainnet
- Data integrity checks
```

### Alert Configuration

```yaml
alerts:
  - name: "High Error Rate"
    condition: "error_rate > 1%"
    action: "Page on-call engineer"
    
  - name: "Slow Walrus Retrieval"
    condition: "walrus_latency > 1s"
    action: "Check RPC health"
    
  - name: "Gas Price Spike"
    condition: "gas_price > threshold"
    action: "Monitor cost impact"
    
  - name: "Blob Creation Failure"
    condition: "blob_creation_fail_rate > 0.1%"
    action: "Investigate network"
```

---

## 🎓 Learning & Documentation

### For Users

Create blog posts explaining:
1. **What is mainnet?** - Non-technical explanation
2. **Why mainnet?** - Benefits of data ownership
3. **How does Walrus work?** - Simple overview
4. **Is it secure?** - Security model explained
5. **FAQ** - Common questions answered

### For Developers

Document:
1. **Mainnet integration guide**
2. **RPC endpoint configuration**
3. **Gas price optimization**
4. **Error handling patterns**
5. **Troubleshooting guide**

---

## 🚀 Post-Mainnet Roadmap

### Month 1: Stabilization
- Monitor mainnet performance
- Fix issues discovered
- Optimize gas usage
- Gather user feedback

### Month 2-3: Scale
- Scale to 10,000+ users
- Implement auto-scaling
- Improve personalization
- Add new features

### Month 4+: Expansion
- Launch mobile app
- Geographic expansion
- Partner integrations
- Institutional sales

---

## 📝 Final Checklist

**Before Going Mainnet:**
- [ ] Security audit completed
- [ ] Code tested on staging mainnet
- [ ] Wallet funded with SUI
- [ ] Data migration tested
- [ ] Monitoring configured
- [ ] Team trained
- [ ] Documentation ready
- [ ] Rollback procedure tested
- [ ] Communications prepared
- [ ] Legal review completed

**✨ Ready for Mainnet Launch!**
