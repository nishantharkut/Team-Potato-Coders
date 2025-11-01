# PayU Integration Guide

## Overview

This document describes the PayU payment integration that has been added to the UPROOT platform. PayU is an excellent alternative to Razorpay for Indian payments and **does not require a website URL during onboarding**, making it easier to get started.

## Why PayU?

- ✅ **No Website Required**: Easier onboarding without website requirement
- ✅ **Non-Seamless Integration**: Simple redirect-based payment flow
- ✅ **All Indian Payment Methods**: UPI, Cards, Net Banking, Wallets
- ✅ **RBI Approved**: Fully compliant with Indian regulations
- ✅ **Low Transaction Fees**: Competitive pricing for Indian market

## What Has Been Implemented

### 1. Dependencies Installed

- `crypto-js@4.2.0` - For cryptographic operations (hash generation)

### 2. New Files Created

1. **`src/lib/payu.js`** - PayU utility library
   - Hash generation for payment requests
   - Hash verification for payment responses
   - USD to INR conversion
   - PayU configuration

2. **`src/app/api/payu/create-payment/route.js`** - Create PayU payment
   - Creates payment parameters
   - Generates hash for secure payment
   - Returns form data for redirect

3. **`src/app/api/payu/payment-success/route.js`** - Payment success handler
   - Verifies payment hash
   - Creates/updates subscription
   - Redirects to success page

4. **`src/app/api/payu/payment-failure/route.js`** - Payment failure handler
   - Handles failed payments
   - Redirects to cancel page

5. **`src/app/api/payu/payment-cancel/route.js`** - Payment cancel handler
   - Handles user cancellations
   - Redirects to cancel page

### 3. Updated Files

1. **`src/app/(main)/pricing/page.jsx`**
   - Added PayU payment option in payment method selection dialog
   - Added `processPayUPayment` function

2. **`src/actions/subscription.js`**
   - Updated to support PayU subscriptions

3. **`prisma/schema.prisma`**
   - Updated comment to include "payu"

## Features

### Payment Flow

1. **Choose Subscription**: User selects a subscription tier on `/pricing`
2. **Select Payment Method**: Dialog shows PayU option:
   - **UPI / Net Banking / Cards (PayU)**: Indian payment gateway
3. **PayU Payment Process**:
   - Create payment parameters with hash
   - Redirect user to PayU payment page
   - User completes payment (UPI, Cards, Net Banking, etc.)
   - PayU redirects back to success/failure/cancel URL
   - Verify payment hash
   - Create subscription record with paymentMethod: "payu"
   - Activate subscription

### Payment Methods Supported

- UPI (all UPI apps: Google Pay, PhonePe, Paytm, etc.)
- Credit/Debit Cards
- Net Banking (all major banks)
- Wallets
- EMI options

## Environment Variables Required

Add these to your `.env.local` file:

```env
# PayU Keys (Get from PayU Dashboard)
PAYU_KEY=your_payu_key
PAYU_SALT=your_payu_salt
PAYU_MERCHANT_ID=your_merchant_id  # Optional, but recommended

# Test Mode (set to "true" for testing)
PAYU_TEST_MODE=true

# USD to INR Exchange Rate (optional, defaults to 83)
USD_TO_INR_RATE=83

# Base URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Or in production:
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## PayU Dashboard Setup

1. **Create Account**:
   - Sign up at [PayU Dashboard](https://www.payu.in/)
   - Complete KYC verification (easier than Razorpay - no website required!)

2. **Get API Keys**:
   - Go to PayU Dashboard → Integration → API Keys
   - Copy **Merchant Key** and **Salt** to your `.env.local`
   - Set `PAYU_KEY` = Merchant Key
   - Set `PAYU_SALT` = Salt

3. **Test Mode**:
   - For testing, set `PAYU_TEST_MODE=true`
   - Use test credentials provided by PayU

4. **Production Mode**:
   - After testing, set `PAYU_TEST_MODE=false` or remove it
   - Use production keys from PayU Dashboard

## Database Schema

The existing `Subscription` model already supports PayU:
- `paymentMethod` field accepts "stripe", "razorpay", "payu", or "web3"
- `transactionHash` field stores PayU transaction ID
- No database migration required

## Testing

### Test Mode

1. **Set Test Mode**:
   ```env
   PAYU_TEST_MODE=true
   ```

2. **Use Test Credentials**:
   - PayU provides test credentials in their dashboard
   - Use test card: `5123 4567 8901 2346`
   - Use any future expiry date, any CVV

3. **Test Flow**:
   - Go to `/pricing`
   - Click "Subscribe Now" on Basic or Pro plan
   - Select "UPI / Net Banking / Cards (PayU)"
   - Complete payment with test credentials

### Production

1. **Complete KYC** in PayU Dashboard
2. **Get Production Keys** from PayU Dashboard
3. **Update Environment Variables** with production keys
4. **Set Test Mode to false** or remove it
5. **Test with real payment** (small amount)

## Payment Flow Details

### Hash Generation
- PayU uses SHA-512 hash for security
- Hash includes: key, transaction ID, amount, product info, customer details, and salt
- Ensures payment integrity

### Redirect Flow
- User is redirected to PayU hosted payment page
- After payment, PayU redirects back to your success/failure/cancel URLs
- Hash verification ensures payment authenticity

### Security
- All payments are hash-verified
- Transaction IDs are unique per payment
- User information is encrypted in transit

## Important Notes

1. **Exchange Rate**: The USD to INR conversion uses a default rate of 83. In production, use a real-time exchange rate API or update `USD_TO_INR_RATE` regularly.

2. **One-Time Payments**: Currently, PayU is implemented as one-time payments. For recurring subscriptions, you would need to implement PayU Recurring Payments API.

3. **Test vs Live Keys**: Use test keys in development and live keys in production. PayU provides test credentials in their dashboard.

4. **Payment Verification**: Always verify payment hashes to prevent fraud. This is done automatically in the success handler.

5. **Currency**: PayU payments are processed in INR (Indian Rupees). USD amounts are converted using the exchange rate.

6. **No Website Required**: Unlike Razorpay, PayU does not require a website URL during onboarding, making it easier to get started.

## Support

For PayU-specific issues:
- [PayU Documentation](https://docs.payu.in/)
- [PayU Support](https://www.payu.in/support/)

For integration issues:
- Check the payment logs in PayU Dashboard
- Check your application logs for errors
- Verify environment variables are set correctly

## Comparison: PayU vs Razorpay

| Feature | PayU | Razorpay |
|---------|------|----------|
| Website Required | ❌ No | ✅ Yes |
| Onboarding Difficulty | ⭐⭐ Easy | ⭐⭐⭐ Moderate |
| Payment Methods | All Indian methods | All Indian methods |
| Integration | Non-seamless | Seamless & Non-seamless |
| Transaction Fees | Competitive | Competitive |
| Best For | Quick setup, no website | Established businesses |

**Recommendation**: Use PayU if you don't have a website yet, or switch to Razorpay later if you prefer their seamless checkout experience.

