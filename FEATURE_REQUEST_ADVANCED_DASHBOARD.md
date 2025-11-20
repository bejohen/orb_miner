# Feature Request: Advanced Dashboard Analytics

**Status**: 📋 Planned
**Priority**: High
**Estimated Effort**: 14-21 hours (2-3 days)
**Version**: 2.0
**Created**: 2025-01-19

---

## 🎯 Executive Summary

Enhance the Next.js dashboard with three high-priority intelligence features that showcase the bot's competitive advantages:

1. **Competition & Expected Value (EV) Dashboard** - Real-time profitability intelligence
2. **Tier Performance Tracker** - Monte Carlo validation and tier optimization insights
3. **Real-Time Decision Log** - Live activity feed of bot decisions

These features will provide transparency into the bot's decision-making process, validate the Monte Carlo optimization strategy, and demonstrate how the profitability protection system saves users from losses.

---

## 🌟 Feature Descriptions

### Feature 1: Competition & Expected Value (EV) Dashboard

**Problem**: The bot has sophisticated EV calculation logic using real-time on-chain competition data, but this intelligence is invisible to users.

**Solution**: A dedicated dashboard page showing:

- **Live EV Chart**: Timeline of EV calculations with color-coded deploy/skip decisions
- **Competition Analysis**: Real-time competition multiplier (your deployment vs. total pool)
- **Profitability Protection Stats**: How many rounds were skipped due to negative EV
- **EV Statistics**: Average EV when deployed vs. skipped, deployment rate
- **Protection Value**: Estimated SOL saved by skipping unprofitable rounds

**User Value**:
- Visibility into why the bot skips certain rounds
- Confidence that the bot is protecting their capital
- Understanding of competition dynamics
- Validation that the bot only mines when profitable

**Screenshots/Mockups**: See Phase 4, Task 4.1 implementation

---

### Feature 2: Tier Performance Tracker

**Problem**: The bot uses Monte Carlo-optimized tier system with expected ROI for each motherload tier, but users can't see if actual performance matches predictions.

**Solution**: A performance dashboard showing:

- **Current Tier Badge**: Display which tier the bot is operating in (e.g., "700-799 ORB - PEAK TIER")
- **Expected vs. Actual ROI**: Side-by-side comparison of Monte Carlo prediction vs. real results
- **Tier Stats**: Rounds deployed, SOL deployed, wins/losses, win rate
- **Performance Score**: Actual ROI as percentage of expected ROI
- **Tier History**: Past tier performances with ROI comparisons
- **Auto-Restart Events**: When motherload changed ±40-50% triggering tier changes

**User Value**:
- Validate that Monte Carlo simulations are accurate
- See which tiers perform best
- Understand tier-based bet sizing strategy
- Confidence in the bot's optimization approach

**Screenshots/Mockups**: See Phase 4, Task 4.2 implementation

---

### Feature 3: Real-Time Decision Log

**Problem**: Users don't see what the bot is doing between rounds, creating a "black box" experience.

**Solution**: A live activity feed showing all bot decisions in real-time:

**Decision Types**:
- ✅ **Deploy**: Deployed X SOL to round #N (EV: +0.015 SOL)
- ⏸️ **Skip**: Round #N skipped - Negative EV (-0.002 SOL)
- 🎯 **Claim**: Claimed 0.142 SOL + 1.2 ORB from mining
- 🔄 **Swap**: Swapped 5.4 ORB → 0.082 SOL at $32.15/ORB
- 💎 **Stake**: Staked 10 ORB for passive rewards
- ⚡ **Restart**: Motherload increased 50% - Restarting automation
- 📍 **Checkpoint**: Checkpointed 3 rounds before claiming

**Features**:
- Auto-refresh every 5 seconds
- Time-based filtering (1h, 24h, 7d)
- Decision type statistics
- Color-coded by decision type
- Shows relevant amounts (SOL, ORB, EV)
- Collapsible details with full reasoning

**User Value**:
- Complete transparency into bot behavior
- Real-time feedback that bot is working
- Educational - learn about mining mechanics
- Troubleshooting - see if bot is stuck or making correct decisions

**Screenshots/Mockups**: See Phase 4, Task 4.3 implementation

---

## 🏗️ Technical Architecture

### Database Schema Extensions

**New Tables**:

1. **`ev_history`** - Tracks all EV calculations
   - Columns: round_id, expected_value, profitable, cost_per_round, expected_returns, orb_price, competition_multiplier, decision
   - Indexes: timestamp, decision, profitable

2. **`tier_performance`** - Tracks tier-based performance
   - Columns: tier_name, motherload_orb, target_rounds, rounds_deployed, total_sol_deployed, actual_roi, expected_roi, status
   - Indexes: status, timestamp

3. **`bot_decisions`** - Logs all bot decisions
   - Columns: round_id, decision_type, reason, details (JSON), motherload_orb, ev_sol, amounts
   - Indexes: timestamp, decision_type

**Database Impact**:
- Additional storage: ~1-5 MB per day of operation
- Query performance: Negligible (proper indexes in place)
- Backwards compatible: Existing tables unchanged

### Backend API Routes

**New Endpoints**:

1. **`GET /api/ev`** - EV history and statistics
   - Query params: `period` (1h, 24h, 7d, 30d), `limit`
   - Response: `{ history: [], stats: {} }`

2. **`GET /api/tiers`** - Tier performance data
   - Query params: `limit` (history)
   - Response: `{ activeTier: {}, tierHistory: [] }`

3. **`GET /api/decisions`** - Bot decision log
   - Query params: `period`, `limit`
   - Response: `{ decisions: [], stats: { byType: {} } }`

**Performance**:
- Cached with React Query (30s - 60s TTL)
- Database queries optimized with indexes
- Response size: ~10-50 KB per request

### Frontend Components

**New Pages**:
1. `/ev-tracker` - EV Dashboard
2. `/tier-performance` - Tier Performance Tracker
3. `/decisions` - Real-Time Decision Log

**New Components**:
- `<EVChart />` - Line chart with deploy/skip dots
- `<TierCard />` - Active tier performance card
- `<DecisionFeed />` - Auto-refreshing activity feed
- `<ProtectionAlert />` - Shows rounds protected from

**Tech Stack**:
- React Query for data fetching
- Recharts for visualizations
- shadcn/ui for components
- TailwindCSS for styling

---

## 📋 Implementation Phases

### Phase 1: Database Schema Extensions ⏱️ 2-3 hours

**Tasks**:
- [ ] Add `ev_history` table with indexes
- [ ] Add `tier_performance` table with indexes
- [ ] Add `bot_decisions` table with indexes
- [ ] Create helper functions: `recordEV()`, `recordBotDecision()`, etc.
- [ ] Create query functions: `getEVHistory()`, `getActiveTier()`, etc.
- [ ] Add migration for existing databases

**Files Modified**:
- `src/utils/database.ts`

**Success Criteria**:
- ✅ All three tables created successfully
- ✅ Indexes working (query < 50ms)
- ✅ Helper functions tested
- ✅ No errors on existing database

---

### Phase 2: Data Collection in Bot Logic ⏱️ 3-4 hours

**Tasks**:
- [ ] Hook `recordEV()` into `isProfitableToMine()` function
- [ ] Record deploy decisions after successful deployments
- [ ] Record skip decisions when EV is negative
- [ ] Add tier tracking on automation setup
- [ ] Update tier performance on claims
- [ ] Record claim decisions
- [ ] Record swap decisions
- [ ] Record stake decisions
- [ ] Record restart decisions
- [ ] Add helper functions: `getTierName()`, `getExpectedRoiForTier()`

**Files Modified**:
- `src/commands/smartBot.ts`
- `src/utils/state.ts` (add currentTierId)

**Success Criteria**:
- ✅ EV recorded for every profitability check
- ✅ Decisions logged for all bot actions
- ✅ Tier tracking starts on automation setup
- ✅ Tier performance updates on claims
- ✅ No impact on bot performance (< 10ms overhead per operation)

---

### Phase 3: Backend API Routes ⏱️ 2-3 hours

**Tasks**:
- [ ] Create `dashboard/app/api/ev/route.ts`
- [ ] Create `dashboard/app/api/tiers/route.ts`
- [ ] Create `dashboard/app/api/decisions/route.ts`
- [ ] Add error handling for all endpoints
- [ ] Add query parameter validation
- [ ] Test endpoints with curl/Postman

**Files Created**:
- `dashboard/app/api/ev/route.ts`
- `dashboard/app/api/tiers/route.ts`
- `dashboard/app/api/decisions/route.ts`

**Success Criteria**:
- ✅ All endpoints return valid JSON
- ✅ Period filtering works correctly
- ✅ Error handling returns proper status codes
- ✅ Response times < 200ms

---

### Phase 4: Frontend Components ⏱️ 4-6 hours

**Tasks**:
- [ ] Create EV Tracker page (`/ev-tracker`)
  - [ ] Stats cards (total checks, deployed, skipped, avg EV)
  - [ ] EV chart with color-coded deploy/skip dots
  - [ ] Protection card showing rounds saved
  - [ ] Period selector (1h, 24h, 7d, 30d)
- [ ] Create Tier Performance page (`/tier-performance`)
  - [ ] Active tier card with badge
  - [ ] Expected vs. actual ROI comparison
  - [ ] Win/loss stats
  - [ ] Tier history list
- [ ] Create Decision Log page (`/decisions`)
  - [ ] Auto-refreshing feed (5s interval)
  - [ ] Decision type icons and colors
  - [ ] Period selector
  - [ ] Auto-refresh toggle
  - [ ] Stats summary cards
- [ ] Update sidebar navigation with new menu items
- [ ] Add loading states for all pages
- [ ] Add error boundaries

**Files Created**:
- `dashboard/app/ev-tracker/page.tsx`
- `dashboard/app/tier-performance/page.tsx`
- `dashboard/app/decisions/page.tsx`

**Files Modified**:
- `dashboard/components/layout/sidebar.tsx`

**Success Criteria**:
- ✅ All pages render without errors
- ✅ Charts display correctly
- ✅ Auto-refresh works on decision log
- ✅ Period selectors filter data correctly
- ✅ Loading states show while fetching
- ✅ Responsive on mobile and desktop

---

### Phase 5: Integration & Testing ⏱️ 2-3 hours

**Tasks**:
- [ ] Test database schema creation
- [ ] Verify data collection (run bot for 10+ rounds)
- [ ] Test API endpoints with real data
- [ ] Test frontend with various data sizes
- [ ] Performance testing with large datasets
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness testing
- [ ] End-to-end user flow testing

**Test Cases**:
- [ ] EV history shows correct deploy/skip decisions
- [ ] Tier performance calculates ROI correctly
- [ ] Decision log updates in real-time
- [ ] Period filters work on all pages
- [ ] Charts render with 0, few, and many data points
- [ ] Auto-refresh can be toggled on/off
- [ ] Navigation between pages works smoothly

**Success Criteria**:
- ✅ All test cases pass
- ✅ No console errors
- ✅ Dashboard loads in < 2 seconds
- ✅ No database performance degradation
- ✅ Works on Chrome, Firefox, Safari
- ✅ Mobile-friendly layout

---

### Phase 6: Documentation & Polish ⏱️ 1-2 hours

**Tasks**:
- [ ] Update README with new dashboard features
- [ ] Add tooltips explaining technical terms
- [ ] Add loading animations
- [ ] Improve error messages
- [ ] Add "no data" empty states
- [ ] Create user guide for new features
- [ ] Add inline help text
- [ ] Polish UI spacing and colors

**Files Modified**:
- `README.md`
- `CLAUDE.md`
- All dashboard page components

**Success Criteria**:
- ✅ Documentation is clear and accurate
- ✅ All UI elements have proper labels
- ✅ Tooltips explain complex concepts
- ✅ Empty states are informative
- ✅ Error messages are helpful

---

## 📊 Success Metrics

After implementation, users should be able to answer:

✅ **EV Tracking**:
- How many rounds did the bot protect me from deploying in (negative EV)?
- What's my average EV when I deploy vs. when I skip?
- How competitive is each round (real-time competition data)?
- What percentage of rounds are profitable to mine?

✅ **Tier Performance**:
- What tier am I currently operating in?
- Is my actual ROI matching Monte Carlo predictions?
- Which tier has performed best historically?
- When did the bot restart automation due to motherload changes?

✅ **Decision Transparency**:
- What is my bot doing right now?
- Why did it skip the last round?
- How much SOL/ORB did it claim?
- When was the last swap/stake/restart?

---

## 🎯 Implementation Priority

**Recommended Order** (for fastest value delivery):

### Day 1 - Priority 1: Decision Log
- **Why**: Quickest to implement, immediate visibility
- **Tasks**: Phase 1.3, Phase 2.5, Phase 3.3, Phase 4.3
- **Value**: Users see bot activity in real-time

### Day 2 - Priority 2: EV Tracker
- **Why**: Showcases competitive advantage
- **Tasks**: Phase 1.1, Phase 2.1-2.2, Phase 3.1, Phase 4.1
- **Value**: Demonstrates profitability protection system

### Day 3 - Priority 3: Tier Performance
- **Why**: Validates strategy, most complex
- **Tasks**: Phase 1.2, Phase 2.3-2.4, Phase 3.2, Phase 4.2
- **Value**: Proves Monte Carlo optimization works

---

## 🚀 Future Enhancements (V3.0+)

After core features are stable, consider:

1. **Win Rate & Variance Analytics**
   - Actual win rate percentage
   - Win/loss streaks
   - Sharpe ratio-style metrics
   - Lucky vs. unlucky round tracking

2. **Automation Health Dashboard**
   - Budget burn rate
   - Estimated rounds remaining
   - Restart prediction alerts
   - Round duration statistics

3. **Fee Optimization Insights**
   - Fee type breakdown (tx, protocol, dev)
   - Priority fee effectiveness
   - Fee savings from dynamic estimation
   - Cost per winning round

4. **Motherload Intelligence**
   - Volatility index
   - Best/worst motherload periods
   - Correlation analysis (ROI vs. tier)
   - 1/625 motherload jackpot tracker

5. **Portfolio & Risk Metrics**
   - Asset allocation pie chart
   - Risk exposure percentage
   - Rebalancing suggestions
   - Price opportunity alerts

6. **Staking Performance** (if enabled)
   - Staking APY calculator
   - Staking vs. selling analysis
   - Compound effect tracker

---

## 💡 Technical Considerations

### Performance
- Database queries optimized with indexes
- React Query caching (30-60s TTL)
- Chart rendering uses virtualization for large datasets
- Auto-refresh can be disabled on decision log

### Scalability
- Tables grow ~1-5 MB per day of operation
- Queries support pagination
- Can add data retention policies (archive after 90 days)
- Indexes prevent performance degradation

### Backwards Compatibility
- New tables don't affect existing functionality
- Safe to deploy to production
- No breaking changes to existing APIs
- Graceful fallback if data not available

### Security
- No sensitive data exposed in APIs
- Same authentication as existing dashboard
- No user input accepted (read-only)

---

## 📝 Acceptance Criteria

Before marking this feature as complete:

- [ ] All database tables created with proper indexes
- [ ] Bot records EV, decisions, and tier data without errors
- [ ] All three API endpoints return valid data
- [ ] All three dashboard pages render correctly
- [ ] Auto-refresh works on decision log
- [ ] Period selectors filter data correctly
- [ ] Charts render with various data sizes
- [ ] Mobile responsive layout
- [ ] Documentation updated
- [ ] No performance regression on bot or dashboard
- [ ] All test cases pass
- [ ] Code reviewed and merged

---

## 🔗 Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Project overview and architecture
- [README.md](./README.md) - Setup and usage instructions
- [src/utils/database.ts](./src/utils/database.ts) - Database schema and functions
- [src/commands/smartBot.ts](./src/commands/smartBot.ts) - Main bot logic

---

## 🤝 Contributors

- Implementation: TBD
- Code Review: TBD
- Testing: TBD

---

## 📅 Timeline

**Start Date**: TBD
**Target Completion**: TBD (2-3 days after start)
**Status Updates**: Daily

---

## 📌 Notes

- This feature request was generated from user analysis on 2025-01-19
- Priority is HIGH due to competitive differentiation value
- Estimated effort assumes developer familiar with codebase
- Can be implemented incrementally (one feature at a time)
- Decision Log can ship first for immediate user value

---

**Last Updated**: 2025-01-19
**Version**: 1.0
**Status**: 📋 Ready for Implementation
