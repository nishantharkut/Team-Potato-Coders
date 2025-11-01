# MetaMask Wallet Integration Guide

## Overview

This document describes the MetaMask wallet integration that has been added to the UPROOT platform. Users can now connect their MetaMask wallets, link them to their accounts, and use cryptocurrency (ETH) as a payment method for subscriptions alongside the existing Stripe payment option.

## What Has Been Implemented

### 1. Database Schema Updates

**Prisma Schema Changes:**
- Added `walletAddress` field to `User` model (unique, optional)
- Added `paymentMethod` field to `Subscription` model ("stripe" or "web3")
- Added `walletAddress` field to `Subscription` model (for Web3 payments)
- Added `transactionHash` field to `Subscription` model (to track blockchain transactions)

**Migration Required:**
```bash
npx prisma migrate dev --name add_wallet_and_web3_payment_support
```

### 2. Dependencies Installed

- `ethers@6.15.0` - For Ethereum blockchain interactions

### 3. New Files Created

1. **`src/hooks/useWeb3.js`** - React hook for MetaMask wallet connection
   - Manages wallet connection state
   - Handles account changes and network switching
   - Provides provider and signer instances

2. **`src/lib/web3.js`** - Web3 utility functions
   - Address formatting and validation
   - USD to ETH conversion helpers
   - Network configuration

3. **`src/components/wallet-connection.jsx`** - Wallet connection UI component
   - Connect/disconnect wallet
   - Link/unlink wallet to user account
   - Display wallet status and balance
   - Signature verification for wallet ownership

4. **`src/app/api/wallet/link/route.js`** - Wallet linking API endpoints
   - `POST /api/wallet/link` - Link wallet to user account (with signature verification)
   - `DELETE /api/wallet/link` - Unlink wallet from account
   - `GET /api/wallet/link` - Get user's linked wallet address

5. **`src/app/api/subscription/web3/route.js`** - Web3 subscription payment API
   - `POST /api/subscription/web3` - Process Web3 subscription payment
   - `GET /api/subscription/web3/verify` - Verify transaction (placeholder for future implementation)

### 4. Updated Files

1. **`src/app/(main)/pricing/page.jsx`**
   - Added payment method selection dialog (Stripe vs MetaMask)
   - Added Web3 payment processing flow
   - Shows ETH equivalent prices for subscription tiers

2. **`src/app/(main)/settings/subscription/page.jsx`**
   - Added `WalletConnection` component
   - Users can manage their wallet connection in settings

## Features

### Wallet Connection Flow

1. **Connect Wallet**: User clicks "Connect Wallet" button, MetaMask prompts for connection
2. **Link Wallet**: User signs a message to prove wallet ownership, wallet is linked to account
3. **Unlink Wallet**: User can unlink wallet (prevents unlinking if active Web3 subscription exists)

### Payment Flow

1. **Choose Subscription**: User selects a subscription tier on `/pricing`
2. **Select Payment Method**: Dialog shows two options:
   - **Credit/Debit Card (Stripe)**: Traditional Stripe checkout
   - **Pay with Crypto (MetaMask)**: Web3 payment option
3. **Web3 Payment Process**:
   - Verify wallet is connected and linked
   - Show ETH equivalent amount
   - User confirms transaction
   - Transaction sent to blockchain
   - Wait for confirmation
   - Create subscription record with transaction hash

## Environment Variables

Add the following to your `.env.local`:

```env
# Web3 Payment Configuration
NEXT_PUBLIC_WEB3_PAYMENT_ADDRESS=0x...  # Your platform's Ethereum wallet address to receive payments
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY  # Optional: For transaction verification
```

**Note**: In production, you should:
- Set up a secure wallet for receiving payments
- Implement proper ETH/USD price oracles (currently uses placeholder)
- Add transaction verification on the backend

## User Experience

### Settings Page (`/settings/subscription`)

- Wallet connection card shows:
  - Connection status (connected/disconnected)
  - Linked wallet address (if linked)
  - Wallet balance in ETH
  - Buttons to connect, link, or unlink wallet

### Pricing Page (`/pricing`)

- "Subscribe" buttons now show a payment method selection dialog
- Web3 option shows:
  - ETH amount for the selected tier
  - Connected wallet address
  - Warning if wallet not linked
  - Automatic wallet connection prompt if not connected

## Security Considerations

1. **Wallet Ownership Verification**: Users must sign a message to link their wallet, proving ownership
2. **Transaction Verification**: Backend should verify transactions on-chain (currently placeholder)
3. **Address Validation**: All addresses are validated and normalized to checksum format
4. **Prevent Unlinking**: Users cannot unlink wallet if they have an active Web3 subscription

## Important Notes

### Transaction Verification (TODO)

The current implementation accepts transaction hashes, but **does not verify transactions on-chain**. You should implement:

1. Backend transaction verification using a blockchain provider (Infura, Alchemy, etc.)
2. Verify transaction:
   - Exists on blockchain
   - Was sent from correct wallet
   - Amount matches subscription price
   - Transaction status is successful
   - Not already used for another subscription

### ETH/USD Price Oracle (TODO)

Currently uses a placeholder price ($2000/ETH). In production:

1. Integrate with a price oracle (CoinGecko, Chainlink, etc.)
2. Update prices periodically or fetch on-demand
3. Handle price fluctuations (consider slippage tolerance)

### Recurring Payments (Future Enhancement)

Current Web3 subscriptions are one-time payments. For recurring subscriptions:

1. Consider implementing a subscription smart contract
2. Use payment streaming (e.g., Superfluid)
3. Or require manual renewal each month

## Testing

### Local Testing

1. Install MetaMask browser extension
2. Connect to a test network (Sepolia, Goerli, etc.)
3. Get test ETH from a faucet
4. Test the wallet connection and payment flow

### Test Networks

For testing, update `NETWORKS` in `src/lib/web3.js` and use test network RPC URLs.

## Migration Steps

1. **Run Database Migration**:
   ```bash
   npx prisma migrate dev --name add_wallet_and_web3_payment_support
   npx prisma generate
   ```

2. **Set Environment Variables**:
   - Add `NEXT_PUBLIC_WEB3_PAYMENT_ADDRESS` to `.env.local`

3. **Test the Integration**:
   - Connect wallet in Settings
   - Try subscribing with Web3 payment on Pricing page

## Troubleshooting

### "MetaMask not installed"
- User needs to install MetaMask browser extension
- Component shows install link

### "Wallet not linked"
- User needs to connect wallet and then link it in Settings
- Linking requires signing a message

### "Transaction failed"
- Check MetaMask for error details
- Verify wallet has sufficient ETH balance
- Check network (should be on correct network)

### "Payment recipient address not configured"
- Set `NEXT_PUBLIC_WEB3_PAYMENT_ADDRESS` in environment variables

## Future Enhancements

1. **On-chain Transaction Verification**: Implement proper blockchain verification
2. **Price Oracle Integration**: Real-time ETH/USD pricing
3. **Multi-network Support**: Support for Polygon, Arbitrum, etc.
4. **Smart Contract Subscriptions**: Automated recurring payments
5. **Payment History**: Display Web3 payment transactions
6. **Refund System**: Handle refunds for Web3 payments
7. **Gas Price Optimization**: Estimate and display gas fees

## Support

For issues or questions:
1. Check browser console for errors
2. Verify MetaMask is connected and on correct network
3. Ensure wallet has sufficient ETH balance
4. Check backend logs for API errors

