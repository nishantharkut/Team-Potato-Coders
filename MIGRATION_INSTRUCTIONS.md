# Migration Instructions for MetaMask Integration

## IMPORTANT: Run These Steps Before Using Wallet Features

The wallet integration requires database migrations. Follow these steps:

### Step 1: Stop Your Dev Server
Stop your Next.js development server (Ctrl+C in the terminal where it's running)

### Step 2: Run Database Migration
```bash
npx prisma migrate dev --name add_wallet_and_web3_payment_support
```

This will:
- Create the migration file
- Apply changes to your database
- Add `walletAddress` field to User table
- Add `paymentMethod`, `walletAddress`, and `transactionHash` fields to Subscription table

**Note**: If prompted, type `y` to confirm the migration.

### Step 3: Regenerate Prisma Client
```bash
npx prisma generate
```

This updates the Prisma client to include the new fields.

### Step 4: Restart Your Dev Server
```bash
pnpm dev
# or
npm run dev
```

## Troubleshooting

### If migration fails with "file in use" error:
1. Make sure the dev server is completely stopped
2. Close any database connection tools (pgAdmin, DBeaver, etc.)
3. Try again

### If you see "Unknown argument `walletAddress`" error:
- This means Prisma client hasn't been regenerated
- Run `npx prisma generate` again
- Make sure dev server is stopped first

### If migration warns about existing data:
- The migration is safe - it only adds new optional fields
- Existing users won't be affected

## After Migration

Once the migration is complete, you can:
1. Connect your MetaMask wallet via the header button
2. Link your wallet to your account in Settings
3. Use Web3 payments on the Pricing page

