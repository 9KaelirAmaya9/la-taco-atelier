# Webhook Configuration Verification Checklist

## ✅ Pre-Test Checklist

### 1. Stripe Dashboard Configuration
- [ ] Webhook endpoint created at: `https://kivdqjyvahabsgqtszie.supabase.co/functions/v1/stripe-webhook`
- [ ] Events enabled: `payment_intent.succeeded` and `checkout.session.completed`
- [ ] Webhook secret copied (starts with `whsec_`)
- [ ] Webhook is in TEST mode (if testing) or LIVE mode (if production)

### 2. Local Environment (.env file)
- [ ] STRIPE_WEBHOOK_SECRET updated with complete secret (not just "tes")
- [ ] STRIPE_SECRET_KEY is present
- [ ] STRIPE_PUBLISHABLE_KEY is present

### 3. Supabase Edge Functions Secrets
- [ ] STRIPE_SECRET_KEY added to Supabase
- [ ] STRIPE_PUBLISHABLE_KEY added to Supabase
- [ ] STRIPE_WEBHOOK_SECRET added to Supabase
- [ ] All secrets saved successfully in Supabase Dashboard

---

## 🧪 Testing Process

### Test 1: Verify Webhook Endpoint is Reachable

Run this curl command to test if your webhook endpoint exists:

```bash
curl -X POST https://kivdqjyvahabsgqtszie.supabase.co/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "ping"}'
```

**Expected Response**: Should return an error about missing signature (this is good - means endpoint exists)
```json
{"error": "No signature provided"}
```

### Test 2: Create a Test Payment

1. Go to your website cart page
2. Add items to cart
3. Fill out checkout form with test data:
   - Name: Test Customer
   - Email: test@example.com
   - Phone: 5551234567
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
5. Complete payment

### Test 3: Check Stripe Webhook Logs

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Check the "Recent deliveries" section
4. Look for `payment_intent.succeeded` event
5. Click on it to see:
   - ✅ Status should be "Succeeded" (green checkmark)
   - ❌ If "Failed", click to see error details

### Test 4: Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to "Edge Functions" → "stripe-webhook"
3. Click "Logs"
4. Look for recent invocations
5. Check for errors or success messages

### Test 5: Verify Order in Database

1. Go to Supabase Dashboard → Table Editor → orders
2. Find your test order
3. Verify:
   - Order exists
   - Status is "pending" or updated based on webhook
   - Payment details are correct

---

## 🐛 Common Issues and Solutions

### Issue: "No signature provided"
**Cause**: Webhook request missing Stripe signature header
**Solution**: This is normal for manual curl tests. Real Stripe webhooks will include the signature.

### Issue: "Webhook signature verification failed"
**Cause**: STRIPE_WEBHOOK_SECRET doesn't match the one in Stripe Dashboard
**Solution**:
1. Re-copy the secret from Stripe Dashboard
2. Update both .env and Supabase secrets
3. Make sure there are no extra spaces or quotes

### Issue: "Missing STRIPE_SECRET_KEY"
**Cause**: Secrets not deployed to Supabase Edge Functions
**Solution**: Follow Step 3 above to add secrets to Supabase Dashboard

### Issue: Orders stuck in "pending" status
**Cause**: Webhook not being called or failing
**Solution**:
1. Check Stripe webhook logs
2. Check Supabase function logs
3. Verify webhook secret is correct
4. Ensure webhook endpoint URL is correct

### Issue: No email confirmations sent
**Cause**: Email function failing or not being called
**Solution**: Check Supabase logs for `send-order-confirmation` function

---

## 📊 Success Indicators

You'll know everything is working when:

✅ Payment completes successfully
✅ Order appears in database with correct status
✅ Stripe webhook shows "Succeeded" status
✅ Supabase logs show webhook received and processed
✅ Email confirmation sent (if configured)
✅ Order appears in kitchen/admin dashboard

---

## 🆘 Still Having Issues?

If checkout still fails after following all steps:

1. **Check Browser Console** (F12 → Console tab)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Check Supabase Logs**
   - Edge Functions → Function Name → Logs
   - Look for error messages

3. **Check Stripe Dashboard**
   - Webhooks → Your Endpoint → Recent Deliveries
   - Check for failed webhook attempts

4. **Verify Environment Variables**
   - Make sure all secrets are set correctly
   - No typos or extra spaces
   - Secrets are deployed to Supabase (not just local .env)

5. **Test with Stripe CLI** (advanced)
   ```bash
   stripe listen --forward-to https://kivdqjyvahabsgqtszie.supabase.co/functions/v1/stripe-webhook
   ```
