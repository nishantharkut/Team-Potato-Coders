# Razorpay Integration Guide

## Overview

This document describes the Razorpay payment integration that has been added to the UPROOT platform. Users can now pay for subscriptions using Razorpay (supporting UPI, Net Banking, Cards, and more payment methods) alongside the existing Stripe and MetaMask payment options.

## What Has Been Implemented

### 1. Dependencies Installed

- `razorpay@2.9.6` - Official Razorpay Node.js SDK

### 2. New Files Created

1. **`src/lib/razorpay.js`** - Razorpay utility library
   - Razorpay client initialization
   - Webhook signature verification
   - USD to INR conversion helper

2. **`src/app/api/razorpay/create-order/route.js`** - Create Razorpay order
   - Creates a Razorpay order for subscription payment
   - Returns order details for frontend checkout

3. **`src/app/api/razorpay/webhook/route.js`** - Razorpay webhook handler
   - Handles payment.captured, order.paid events
   - Updates subscription status in database

4. **`src/app/api/razorpay/verify-payment/route.js`** - Payment verification
   - Verifies payment signature after successful payment
   - Creates/updates subscription in database

### 3. Updated Files

1. **`src/app/(main)/pricing/page.jsx`**
   - Added Razorpay payment option in payment method selection dialog
   - Added `processRazorpayPayment` function
   - Dynamically loads Razorpay checkout script

2. **`src/actions/subscription.js`**
   - Updated `cancelSubscription` to support Razorpay subscriptions
   - Updated `reactivateSubscription` to support Razorpay subscriptions

3. **`prisma/schema.prisma`**
   - Updated comment on `paymentMethod` field to include "razorpay"

## Features

### Payment Flow

1. **Choose Subscription**: User selects a subscription tier on `/pricing`
2. **Select Payment Method**: Dialog shows three options:
   - **Credit/Debit Card (Stripe)**: Traditional Stripe checkout
   - **UPI / Net Banking / Cards (Razorpay)**: Razorpay payment option
   - **Pay with Crypto (MetaMask)**: Web3 payment option
3. **Razorpay Payment Process**:
   - Create Razorpay order via API
   - Open Razorpay checkout modal
   - User completes payment (UPI, Cards, Net Banking, etc.)
   - Verify payment signature
   - Create subscription record with paymentMethod: "razorpay"
   - Activate subscription

### Subscription Management

- **Cancellation**: For Razorpay subscriptions (one-time payments), cancellation is handled by setting `cancelAtPeriodEnd` flag
- **Reactivation**: Remove cancellation flag to reactivate
- **Webhooks**: Razorpay webhooks handle payment confirmations automatically

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...  # Same as RAZORPAY_KEY_ID

# Razorpay Webhook Secret
RAZORPAY_WEBHOOK_SECRET=whsec_...

# USD to INR Exchange Rate (optional, defaults to 83)
USD_TO_INR_RATE=83

# Base URL (for webhooks and redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Or in production:
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Razorpay Dashboard Setup

1. **Create Account**:
   - Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
   - Complete KYC verification

2. **Get API Keys**:
   - Go to Razorpay Dashboard → Settings → API Keys
   - Generate test keys for development
   - Copy Key ID and Key Secret to your `.env.local`

3. **Configure Webhooks**:
   - Go to Razorpay Dashboard → Settings → Webhooks
   - Add webhook endpoint: `https://yourdomain.com/api/razorpay/webhook`
   - Select events to listen to:
     - `payment.captured`
     - `order.paid`
     - `subscription.created` (optional, for recurring subscriptions)
     - `subscription.charged` (optional, for recurring subscriptions)
     - `subscription.cancelled` (optional, for recurring subscriptions)
   - Copy the webhook signing secret to `RAZORPAY_WEBHOOK_SECRET`

4. **Payment Methods**:
   - Razorpay automatically supports UPI, Cards, Net Banking, Wallets, etc.
   - No additional configuration needed

## Database Schema

The existing `Subscription` model already supports Razorpay:
- `paymentMethod` field accepts "stripe", "razorpay", or "web3"
- `transactionHash` field stores Razorpay order ID and payment ID
- No database migration required

## Testing

1. **Test Checkout Flow**:
   - Go to `/pricing`
   - Click "Subscribe Now" on Basic or Pro plan
   - Select "UPI / Net Banking / Cards (Razorpay)"
   - Complete payment with Razorpay test cards:
     - **Success**: `4111 1111 1111 1111`
     - **Failure**: `5104 0600 0000 0008`
     - Use any future expiry date, any CVV
     - Use any name

2. **Test Webhook (Local)**:
   - Use ngrok or similar tool to expose your local server:
     ```bash
     ngrok http 3000
     ```
   - Update webhook URL in Razorpay Dashboard with ngrok URL
   - Test payments and verify webhook events

## Payment Flow Details

### Order Creation
- Amount is converted from USD to INR (paise)
- Order is created with user and tier metadata
- Order ID is returned to frontend

### Payment Processing
- Razorpay checkout modal opens
- User completes payment
- Payment signature is verified
- Subscription is created/updated in database

### Webhook Handling
- Payment confirmation events are handled automatically
- Subscription status is updated via webhooks
- Provides redundancy if payment verification fails

## Important Notes

1. **Exchange Rate**: The USD to INR conversion uses a default rate of 83. In production, use a real-time exchange rate API or update `USD_TO_INR_RATE` regularly.

2. **One-Time Payments**: Currently, Razorpay is implemented as one-time payments (like Web3). For recurring subscriptions, you would need to implement Razorpay Subscriptions API.

3. **Test vs Live Keys**: Use test keys in development and live keys in production. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` accordingly.

4. **Payment Verification**: Always verify payment signatures on both frontend (in handler) and backend (webhook) to prevent fraud.

5. **Currency**: Razorpay payments are processed in INR (Indian Rupees). USD amounts are converted using the exchange rate.

## Support

For Razorpay-specific issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For integration issues:
- Check the webhook logs in Razorpay Dashboard
- Check your application logs for errors
- Verify environment variables are set correctly

