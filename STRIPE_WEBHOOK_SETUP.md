# Stripe Webhook Setup Guide

## ✅ What's Been Created

1. **Webhook Handler**: `/app/api/webhooks/stripe/route.ts`
   - Handles all subscription lifecycle events
   - Automatically updates Supabase when subscriptions change

2. **Updated Checkout**: `/app/api/create-checkout-session/route.ts`
   - Now includes user_id in metadata
   - Required for webhook to link subscriptions to users

## 🔧 Setup Steps

### 1. Add Environment Variable

Add to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx  # You'll get this from Stripe
SUPABASE_SERVICE_ROLE_KEY=xxx    # Get from Supabase dashboard
```

### 2. Configure Stripe Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - **Development**: Use Stripe CLI (see below)
   - **Production**: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
5. Copy the **Signing secret** and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 3. Testing Locally (Development)

Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook secret starting with `whsec_` - use this in `.env.local`

Test a payment:
```bash
stripe trigger checkout.session.completed
```

## 📊 What the Webhook Does

### On Subscription Creation (`checkout.session.completed`)
- Creates a new record in `subscriptions` table
- Links subscription to user
- Stores Stripe customer & subscription IDs

### On Subscription Update (`customer.subscription.updated`)
- Updates subscription status (active, past_due, etc.)
- Updates tier if plan changes

### On Subscription Cancellation (`customer.subscription.deleted`)
- Marks subscription as cancelled
- User loses access to dashboard features

### On Payment Success (`invoice.paid`)
- Keeps subscription active
- Confirms payment received

### On Payment Failure (`invoice.payment_failed`)
- Marks subscription as past_due
- You can add email notifications here later

## 🗄️ Database Schema

Make sure your `subscriptions` table has these columns:
- `id` (int8, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `stripe_customer_id` (text, indexed)
- `stripe_subscription_id` (text, indexed, unique)
- `subscription_status` (text)
- `tier` (text)
- `created_at` (timestamptz)

## 🚨 Important Notes

1. **Service Role Key**: The webhook uses the service role key to bypass RLS policies when updating subscriptions
2. **Webhook Security**: The webhook signature is verified to ensure requests come from Stripe
3. **Error Handling**: All errors are logged but return 200 to prevent Stripe from retrying
4. **Idempotency**: Stripe may send the same webhook multiple times - upsert operations handle this

## 🧪 Test Flow

1. User clicks "Start 7-Day Free Trial"
2. Redirected to Stripe checkout
3. Completes payment (use test card: `4242 4242 4242 4242`)
4. Stripe sends `checkout.session.completed` webhook
5. Subscription created in Supabase
6. User can now access dashboard

## 📝 Next Steps

- [ ] Add email notifications for failed payments
- [ ] Add grace period for past_due subscriptions
- [ ] Add subscription analytics/reporting
- [ ] Handle plan upgrades/downgrades
