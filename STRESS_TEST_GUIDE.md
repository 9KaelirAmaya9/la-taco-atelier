# Comprehensive Stress Testing Guide
## La Taco Atelier - 100% Production Readiness Verification

## 🎯 Testing Strategy

### Phase 1: Automated Testing (30 minutes)
### Phase 2: Load Testing (15 minutes)
### Phase 3: Manual Testing (30 minutes)
### Phase 4: Performance Monitoring (15 minutes)

---

## ✅ PHASE 1: AUTOMATED TESTING

### 1.1 Run E2E Tests with Playwright

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run specific test suites
npx playwright test e2e/homepage.spec.ts
npx playwright test e2e/cart-flow.spec.ts
npx playwright test e2e/checkout-performance.spec.ts
npx playwright test e2e/admin-kitchen-flow.spec.ts
```

**Expected Results:**
- ✅ All tests pass
- ⏱️ Performance tests < 3 seconds
- 📊 No console errors

### 1.2 Run Unit Tests

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage
```

**Expected Results:**
- ✅ All tests pass
- 📈 Coverage > 70% recommended

### 1.3 Build Test

```bash
# Test production build
npm run build

# Check for errors
echo $?  # Should return 0
```

**Expected Results:**
- ✅ Build completes without errors
- 📦 dist/ folder created
- 🔍 No TypeScript errors
- ⚠️ Only warnings allowed (not errors)

---

## ⚡ PHASE 2: LOAD TESTING

### 2.1 Local Load Test

```bash
# Start production server
npm run build
npm run preview

# In another terminal, run load test
node load-test.cjs
```

**Modify load-test.cjs for your environment:**
```javascript
const BASE_URL = 'http://localhost:4173';  // or your deployed URL
const NUM_ORDERS = 50;  // Start with 50
const CONCURRENT = true;  // Test concurrent load
```

**Expected Results:**
- ✅ Success rate > 95%
- ⏱️ Average response time < 2 seconds
- 📊 No server errors
- 💪 Handle 50+ concurrent orders

### 2.2 Progressive Load Testing

Test increasing load:

```bash
# Test 1: Light load (10 orders)
# Modify NUM_ORDERS = 10
node load-test.cjs

# Test 2: Medium load (30 orders)
# Modify NUM_ORDERS = 30
node load-test.cjs

# Test 3: Heavy load (50 orders)
# Modify NUM_ORDERS = 50
node load-test.cjs

# Test 4: Stress test (100 orders)
# Modify NUM_ORDERS = 100
node load-test.cjs
```

**Expected Results:**
| Load Level | Orders | Success Rate | Avg Response |
|------------|--------|--------------|--------------|
| Light      | 10     | 100%         | < 1s         |
| Medium     | 30     | > 98%        | < 2s         |
| Heavy      | 50     | > 95%        | < 3s         |
| Stress     | 100    | > 90%        | < 5s         |

### 2.3 Browser Load Testing (Artillery)

If you want more advanced testing:

```bash
# Install Artillery (optional)
npm install -g artillery

# Create artillery config
cat > artillery-config.yml << EOF
config:
  target: "http://localhost:4173"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Spike test"
scenarios:
  - name: "Browse and order"
    flow:
      - get:
          url: "/"
      - get:
          url: "/menu"
      - get:
          url: "/order"
      - get:
          url: "/cart"
EOF

# Run artillery test
artillery run artillery-config.yml
```

---

## 🔍 PHASE 3: MANUAL TESTING

### 3.1 Authentication Flow

**Test Scenario: Complete Auth Cycle**

1. **Sign In**
   - [ ] Navigate to /signin
   - [ ] Enter credentials
   - [ ] Click "Sign In"
   - [ ] ✅ Redirects to dashboard
   - [ ] ✅ No loading spinner stuck
   - [ ] ✅ Dashboard loads < 2 seconds

2. **Navigate Dashboard Tabs**
   - [ ] Click Admin Panel
   - [ ] ✅ Loads instantly
   - [ ] Click Kitchen Display
   - [ ] ✅ Loads instantly
   - [ ] Click Profile
   - [ ] ✅ Loads instantly
   - [ ] Use back button
   - [ ] ✅ No infinite spinner
   - [ ] ✅ Session persists

3. **Session Persistence**
   - [ ] Close browser tab
   - [ ] Reopen site
   - [ ] ✅ Still logged in
   - [ ] Navigate to /dashboard
   - [ ] ✅ Immediate access

4. **Computer Sleep Test**
   - [ ] Keep dashboard open
   - [ ] Put computer to sleep (5 minutes)
   - [ ] Wake computer
   - [ ] Navigate to different tab
   - [ ] ✅ No signout
   - [ ] ✅ Session maintained

5. **Sign Out**
   - [ ] Click sign out
   - [ ] ✅ Redirects to signin
   - [ ] Try accessing /dashboard directly
   - [ ] ✅ Redirects to signin

### 3.2 Customer Order Flow

**Test Scenario: Complete Order Placement**

1. **Browse Menu**
   - [ ] Navigate to /menu
   - [ ] ✅ All images load
   - [ ] ✅ Prices display correctly
   - [ ] Click 5 different items
   - [ ] ✅ Modals open smoothly

2. **Add to Cart**
   - [ ] Add 3 different items
   - [ ] Customize options
   - [ ] ✅ Cart count updates
   - [ ] ✅ Cart icon shows count
   - [ ] Navigate to /cart
   - [ ] ✅ All items shown correctly

3. **Checkout Process**
   - [ ] Click "Proceed to Checkout"
   - [ ] Fill in customer details
   - [ ] Select delivery/pickup
   - [ ] Add delivery address (if applicable)
   - [ ] ✅ Address validation works
   - [ ] Continue to payment
   - [ ] ✅ Stripe loads < 3 seconds

4. **Payment**
   - [ ] Use test card: 4242 4242 4242 4242
   - [ ] Expiry: any future date
   - [ ] CVC: any 3 digits
   - [ ] Submit payment
   - [ ] ✅ Order created
   - [ ] ✅ Confirmation page shown
   - [ ] ✅ Order number displayed

### 3.3 Kitchen Display Flow

**Test Scenario: Kitchen Operations**

1. **Kitchen Login**
   - [ ] Navigate to /kitchen-login
   - [ ] Enter kitchen credentials
   - [ ] ✅ Redirects to /kitchen

2. **View Orders**
   - [ ] ✅ New orders appear
   - [ ] ✅ Real-time updates work
   - [ ] ✅ Order details shown clearly

3. **Update Order Status**
   - [ ] Click "Start Preparing"
   - [ ] ✅ Status updates
   - [ ] Click "Ready for Pickup"
   - [ ] ✅ Status updates
   - [ ] Click "Complete"
   - [ ] ✅ Order moves to completed

4. **Print Receipt**
   - [ ] Click "Print Ticket"
   - [ ] ✅ Print preview opens
   - [ ] ✅ Restaurant info correct:
       ```
       Ricos Tacos
       505 51st St, Brooklyn, NY 11220
       United States
       Phone: +1 718-633-4816
       ```
   - [ ] ✅ Order details correct

### 3.4 Admin Panel Flow

**Test Scenario: Admin Operations**

1. **Admin Login**
   - [ ] Navigate to /signin
   - [ ] Login with admin account
   - [ ] Navigate to /admin
   - [ ] ✅ Access granted

2. **View Orders**
   - [ ] ✅ Order list loads
   - [ ] ✅ Filter by status works
   - [ ] ✅ Search works
   - [ ] Click order details
   - [ ] ✅ Full order info shown

3. **Update Order**
   - [ ] Change order status
   - [ ] ✅ Updates successfully
   - [ ] Add notes
   - [ ] ✅ Saves correctly

4. **View Analytics**
   - [ ] Navigate to Analytics
   - [ ] ✅ Charts load
   - [ ] ✅ Stats displayed
   - [ ] Filter by date range
   - [ ] ✅ Updates correctly

### 3.5 Mobile Responsiveness

**Test on Mobile Device or Chrome DevTools**

1. **Test Breakpoints**
   - [ ] Desktop (1920x1080)
   - [ ] Laptop (1366x768)
   - [ ] Tablet (768x1024)
   - [ ] Mobile (375x667)
   - [ ] ✅ Layout adjusts properly
   - [ ] ✅ All features accessible

2. **Touch Interactions**
   - [ ] Tap menu items
   - [ ] ✅ Modals open
   - [ ] Swipe navigation
   - [ ] ✅ Gestures work
   - [ ] Pinch zoom
   - [ ] ✅ Images zoom

3. **Mobile Cart**
   - [ ] Add items on mobile
   - [ ] ✅ Cart button visible
   - [ ] ✅ Count updates
   - [ ] Checkout on mobile
   - [ ] ✅ Form usable
   - [ ] ✅ Payment works

---

## 📊 PHASE 4: PERFORMANCE MONITORING

### 4.1 Lighthouse Audit

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit on production build
lighthouse http://localhost:4173 --view
```

**Target Scores:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 4.2 Bundle Analysis

```bash
# Install analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts:
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({ open: true })
  ]
});

# Build and analyze
npm run build
```

**Check for:**
- [ ] No duplicate dependencies
- [ ] Large files < 1MB
- [ ] Tree-shaking working
- [ ] Lazy loading opportunities

### 4.3 Network Performance

**Open Chrome DevTools → Network**

1. **Page Load Times**
   - [ ] Homepage < 2s
   - [ ] Menu page < 3s
   - [ ] Dashboard < 2s
   - [ ] ✅ All under 3s

2. **Resource Sizes**
   - [ ] JS bundles < 500KB each
   - [ ] CSS < 100KB total
   - [ ] Images < 200KB each
   - [ ] ✅ Total < 2MB

3. **API Response Times**
   - [ ] Menu fetch < 500ms
   - [ ] Orders fetch < 1s
   - [ ] Payment intent < 2s
   - [ ] ✅ All reasonable

### 4.4 Console Errors

**Check Browser Console**
- [ ] ✅ No red errors
- [ ] ⚠️ Only expected warnings
- [ ] ✅ No auth errors
- [ ] ✅ No API failures

---

## 🎯 PASS/FAIL CRITERIA

### ✅ PASS Criteria (Ready for Production)

**Authentication:**
- ✅ Login success rate > 99%
- ✅ Session persists across navigation
- ✅ No infinite loading spinners
- ✅ Computer sleep/wake works

**Performance:**
- ✅ Page load < 3 seconds
- ✅ API responses < 2 seconds
- ✅ Handle 50+ concurrent orders
- ✅ Success rate > 95%

**Functionality:**
- ✅ All E2E tests pass
- ✅ Order flow works end-to-end
- ✅ Payment processing succeeds
- ✅ Kitchen display updates
- ✅ Admin panel functional

**Quality:**
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Lighthouse scores > 80
- ✅ Build completes successfully

### ❌ FAIL Criteria (Not Ready - Fix Required)

**Critical Issues:**
- ❌ Login fails > 5%
- ❌ Session expires unexpectedly
- ❌ Orders fail > 10%
- ❌ Payment errors
- ❌ Build failures
- ❌ E2E tests failing
- ❌ Console errors on critical paths

**Blockers:**
- ❌ Page load > 5 seconds
- ❌ Cannot complete checkout
- ❌ Kitchen display broken
- ❌ Admin panel inaccessible
- ❌ Mobile unusable

---

## 📋 FINAL CHECKLIST

### Before Deployment
- [ ] All E2E tests pass
- [ ] Load test success > 95%
- [ ] Manual testing complete
- [ ] No critical console errors
- [ ] Lighthouse audit passed
- [ ] Mobile testing complete
- [ ] Auth system tested thoroughly
- [ ] Payment flow verified
- [ ] Kitchen display working
- [ ] Admin panel functional

### Post-Deployment
- [ ] Monitor Sentry for errors
- [ ] Check real user metrics
- [ ] Monitor order success rate
- [ ] Watch for auth issues
- [ ] Track performance metrics
- [ ] User feedback collection

---

## 🚀 QUICK START

Run this complete test suite:

```bash
# 1. Automated tests (5 min)
npm run test:e2e
npm run test

# 2. Build test (2 min)
npm run build
npm run preview

# 3. Load test (5 min)
node load-test.cjs

# 4. Manual testing (30 min)
# Follow checklist in Phase 3

# 5. Performance audit (5 min)
lighthouse http://localhost:4173
```

**Total Time: ~45 minutes for complete confidence**

---

## 📞 SUPPORT

If any test fails:
1. Check console for errors
2. Review Sentry dashboard
3. Check network tab
4. Review AUTH_FIX_SUMMARY.md
5. Review SESSION_MANAGEMENT_FIX.md

**Remember**: Minor issues are okay. Critical issues (auth failures, order failures, payment errors) must be fixed before deployment.
