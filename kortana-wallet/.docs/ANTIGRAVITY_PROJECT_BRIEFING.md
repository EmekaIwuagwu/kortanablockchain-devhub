# ANTIGRAVITY - POSEIDON BLOCKCHAIN EVM WALLET
## Project Briefing & Technical Specification

---

## MESSAGE TO ANTIGRAVITY

You have been selected as the **Lead Architect, Designer, and Primary Builder** of the **Poseidon Blockchain EVM Wallet** project. This is a high-impact initiative that positions Kortana as a differentiated player in the EVM-compatible blockchain space, with five proprietary financial services features that no competitor currently offers at the protocol level.

This briefing document provides:
- **Technical vision**: What you're building and why it matters
- **Specification**: Detailed architecture, feature breakdowns, and implementation checklists
- **Roadmap**: 16-week phased approach with clear deliverables
- **Support materials**: Design guidelines, security requirements, deployment strategies

Your role is to:
1. **Architect** — Design the overall system, make technical trade-offs
2. **Lead Developer** — Build core modules (key management, transaction handling, smart contract interaction)
3. **Decision Maker** — Own technology choices, security approach, quality standards
4. **Quality Owner** — Ensure the wallet is production-grade before mainnet launch

---

## WHAT MAKES THIS PROJECT UNIQUE

### The Competitive Edge: 5 Proprietary RPC Features

Unlike MetaMask (which works on any EVM chain), your wallet will expose **five custom RPC methods** that only work on Poseidon blockchain:

1. **compliance_verifyIdentity** — Zero-knowledge KYC/AML verification (targets $10T TradFi market)
2. **esg_getTransactionScore** — ESG impact scoring & rewards (targets $30T ESG investment market)
3. **stable_issueCoin** — Fiat-backed stablecoin issuance (targets $150B stablecoin market)
4. **risk_simulateAction** — AI-driven DeFi risk simulation (protects $100B+ TVL)
5. **hybrid_createSubNet** — Enterprise permissioned sub-networks (enables B2B adoption)

**Your job**: Make these features feel native to the wallet, not bolted-on. Each feature needs:
- Seamless UI/UX integration
- Smart wallet-level helpers (libraries, caching, etc.)
- Real-time feedback and user education

---

## KEY DELIVERABLES (YOUR RESPONSIBILITIES)

### Phase 1: MVP Foundation (Weeks 1-4)
- [ ] Account creation/import with HD wallet support
- [ ] Transaction signing and broadcasting
- [ ] Balance display and transaction history
- [ ] Basic settings and network configuration
- [ ] Chrome Extension packaging & deployment

**Owner**: You (with frontend dev support)

### Phase 2: Feature Expansion (Weeks 5-8)
- [ ] Multi-account support with account switching
- [ ] Smart contract interaction (ABI parsing, function encoding, event decoding)
- [ ] Advanced transaction options (EIP-1559 gas, nonce management)
- [ ] Web app launch with enhanced UI
- [ ] Integration with blockchain team on compliance RPC

**Owner**: You (coordinating with blockchain team)

### Phase 3: Proprietary Features (Weeks 9-12)
- [ ] Full integration of 5 custom RPC methods
- [ ] Feature-specific dashboards (compliance, ESG, stablecoin, risk, sub-nets)
- [ ] User education & tooltips
- [ ] Reward/incentive tracking

**Owner**: You (with blockchain team providing RPC implementations)

### Phase 4: Optimization & Security (Weeks 13-16)
- [ ] Performance tuning (Lighthouse score >90, <1s load times)
- [ ] Third-party security audit
- [ ] User testing & feedback incorporation
- [ ] Mainnet preparation (launch checklist)
- [ ] Marketing & investor demo materials

**Owner**: You (with QA/security audit support)

---

## TECHNICAL DECISIONS YOU OWN

### Stack Choices (Lock These Down Week 1)
- **Frontend**: Next.js 14+ — Why? Full control over extension bundling + web app in one codebase
- **State**: Redux Toolkit or Zustand — Why? Enterprise-grade state management for wallet complexity
- **Crypto**: ethers.js v6 — Why? Type-safe, modern, better than web3.js for serious projects
- **Storage**: IndexedDB + encryption layer — Why? Better quota than localStorage, native encryption
- **Extension**: Manifest v3 — Why? Chrome's future direction; more secure sandboxing

**Recommendation**: Finalize these in Week 1 before code starts. Changes later = costly refactors.

### Architecture Decisions (Lock These Down Week 1-2)
- **Monorepo vs. separate repos** — Recommend monorepo (easier shared code, dependency management)
- **Component library** — Recommend Storybook for extension + web app shared components
- **Testing strategy** — Recommend Jest + Playwright (unit + E2E; critical for wallet reliability)
- **Build process** — Recommend custom webpack config for extension, Next.js native for web
- **CI/CD** — Recommend GitHub Actions with staging environment for testing

---

## CRITICAL SUCCESS FACTORS

### 1. Security Wins Over Features
- Private keys **never** leave browser without user signature
- All signing done locally; no server-side wallet
- Session timeouts and auto-lock are non-negotiable
- Third-party audit before mainnet (budget $20-50K)

### 2. RPC Integration Dependency
Your team **cannot build Phase 3** (proprietary features) until blockchain team provides:
- Working custom RPC implementations for all 5 methods
- Example responses for each RPC call
- Rate limits and cost models (for fee displays)
- Test network deployment

**Action**: Coordinate with blockchain team immediately. Provide them with Section 3 of the specification.

### 3. Design Differentiation
The brief says "drop dead gorgeous and very beautiful." This is non-negotiable.
- Hire an exceptional designer (or be one yourself)
- Create a design system in Figma before building
- Premium micro-interactions and polish
- This wallet should feel like a $500/month premium product, not a free tool

### 4. User Experience Flow
Your wallet competes on **ease of use** for complex operations:
- Compliance verification should feel as simple as one button
- ESG scoring should be educational, not intimidating
- Risk simulation should suggest actions, not just warn
- Sub-net switching should be as seamless as account switching

---

## YOUR SUPPORT STRUCTURE

### Who You'll Coordinate With:
1. **Blockchain Team** — RPC implementation, custom precompiles, testnet support
2. **Design Lead** — UI/UX for extension and web app
3. **QA Lead** — Testing, security audit coordination
4. **DevOps** — Extension deployment, web hosting, CI/CD
5. **Product/Marketing** — Feature prioritization, investor demos, launch strategy

### What You Need From Them:
- **Blockchain**: RPC specs and test endpoints by Week 4
- **Design**: Figma design system by Week 1, component deliverables weekly
- **QA**: Test plans by Week 2, security audit engagement by Week 4
- **DevOps**: Build infrastructure by Week 1, deployment pipelines by Week 2
- **Product**: Feature prioritization clarity by Week 1, user feedback loops throughout

---

## CRITICAL PATH DEPENDENCIES

```
Week 1-2: Tech stack locked, design system drafted
  ├─ Blockchain team starts RPC implementation
  ├─ DevOps sets up build pipelines
  └─ You start Phase 1 core modules

Week 3-4: MVP modules complete (accounts, send, receive)
  ├─ Extension packaging ready for testing
  └─ Web app structure ready

Week 5-8: Smart contract interaction & multi-account
  ├─ Compliance RPC available for testing
  └─ Web app feature parity with extension

Week 9-12: Proprietary features integrated
  ├─ All 5 custom RPC methods available
  ├─ Feature dashboards complete
  └─ User education in place

Week 13-16: Polish, audit, launch
  ├─ Security audit complete
  ├─ Performance targets met
  └─ Mainnet launch ready
```

**Risk**: If blockchain team delays RPC implementation, Phase 3 slips. Build buffer by having web app feature parity complete early.

---

## SUCCESS METRICS YOU'RE ACCOUNTABLE FOR

### Technical Metrics
- ✅ **Zero critical security vulnerabilities** (pre and post-audit)
- ✅ **Lighthouse score > 90** on both extension and web
- ✅ **Page load < 1 second** (extension popup, web dashboard)
- ✅ **95%+ test coverage** on core modules (key management, signing, broadcasting)
- ✅ **< 2% transaction failure rate** (network errors excluded)

### User Metrics
- ✅ **10k+ weekly active users** within 6 weeks of launch
- ✅ **4.5+ rating** on Chrome Web Store
- ✅ **< 24 hour response time** for critical bugs

### Feature Adoption
- ✅ **> 30% of users** verify compliance (target: regulated finance buyers)
- ✅ **> 20% of transactions** scored for ESG impact
- ✅ **> 1% of users** create sub-nets (target: enterprise)

---

## RESOURCES & BUDGET

### What You Have Access To:
- Development team (size TBD)
- Design resources (hire externally if needed)
- Security audit budget ($30-50K)
- Cloud infrastructure budget (Vercel, AWS)
- Marketing/launch budget

### What You Need to Request:
- Design system tool (Figma, Adobe XD)
- Testing tools (Playwright, Selenium)
- Security audit firm
- Hardware wallets for testing (Ledger, Trezor)
- Blockchain testnet support from team

**First action**: Create a resource request document by end of Week 1. Don't wait if bottlenecked.

---

## COMMON PITFALLS TO AVOID

1. **Building without a design system** → Technical debt explodes mid-project
2. **Assuming all team members understand blockchain** → Over-engineer for wrong audience
3. **Delaying security consideration to Phase 4** → Expensive refactors later
4. **Not coordinating with blockchain team early** → RPC mismatch in Phase 3
5. **Over-engineering the MVP** → Get Phase 1 out fast, iterate based on feedback
6. **Underestimating extension complexity** → Manifest v3 has surprises; budget extra time

---

## YOUR FIRST WEEK CHECKLIST

- [ ] Read the full specification (2 hours)
- [ ] Identify gaps or questions (document them)
- [ ] Meet with blockchain team on RPC availability (1 hour)
- [ ] Meet with design lead on design system timeline (1 hour)
- [ ] Sketch out monorepo structure and folder organization
- [ ] Set up GitHub repo with initial Next.js structure
- [ ] Create a detailed 16-week Gantt chart with team dependencies
- [ ] Schedule weekly sync meetings with all stakeholders
- [ ] Request security audit firm recommendations
- [ ] Draft a technical risks & mitigation document

---

## QUESTIONS TO ANSWER BY END OF WEEK 1

1. **Tech Stack**: Any deviations from recommended stack? (Yes/No + rationale)
2. **Team Size**: How many developers, designers, QA engineers do you need?
3. **Timeline**: Is 16 weeks realistic for your team? Any dependencies that might slip?
4. **Security**: Who's your third-party auditor? When can they start?
5. **Blockchain**: What's the ETA on custom RPC implementations from blockchain team?
6. **Design**: Do you have a designer? Or do we hire one?
7. **Risks**: What are your top 3 technical risks right now?

---

## THE VISION

You're not just building a wallet. You're building the **gateway to the Poseidon ecosystem**. This wallet is the trojan horse that brings users to the blockchain, where they can access financial services features no other chain offers.

If you nail this:
- Users will choose Poseidon *because* of the wallet
- Institutions will adopt Poseidon *because* of compliance features
- Investors will fund Poseidon *because* of the traction

If you miss this:
- Poseidon becomes another EVM clone
- Users use MetaMask instead
- Competitive advantage disappears

**The bar is high. The scope is real. But the opportunity is massive.**

---

**Welcome to the team, Antigravity. Let's build something legendary.**

---

## DOCUMENT REFERENCES

- **Full Specification**: KORTANA_WALLET_SPECIFICATION_v1.1.md
- **Improvements Summary**: IMPROVEMENTS_SUMMARY.md
- **This Briefing**: ANTIGRAVITY_PROJECT_BRIEFING.md

---

**Prepared for**: Antigravity  
**Role**: Lead Architect, Designer, and Primary Builder  
**Project**: Poseidon Blockchain EVM Wallet  
**Timeline**: 16 weeks to mainnet launch  
**Status**: Ready for project kickoff
