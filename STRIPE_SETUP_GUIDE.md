# Stripe Payment Setup Guide

This guide will help you set up Stripe payment integration for the Social Justice Institute registration.

## Prerequisites

- A Stripe account (sign up at https://stripe.com)
- Stripe dependencies installed

## Installation

1. Install required packages:

```bash
pnpm add stripe @stripe/stripe-js
```

## Configuration

### 1. Get Stripe API Keys

1. Go to https://dashboard.stripe.com
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
   - For testing, use the **Test mode** keys
   - For production, use the **Live mode** keys

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# App URL (important for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change in production
```

⚠️ **Important**: Never commit your `.env.local` file to version control!

### 3. Test Your Setup

1. Start your development server:

```bash
pnpm dev
```

2. Go to the onboarding page
3. Fill out the form with a classification that requires payment (e.g., "Alumni", "Community Member", "Educator")
4. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - Any future expiration date (e.g., 12/34)
   - Any 3-digit CVC
   - Any 5-digit ZIP code

## Payment Flow

### Classifications That DON'T Require Payment (Free)

- High School Student
- Undergraduate/Graduate Student
- Caldwell University Faculty/Staff
- Sister of St. Dominic
- Speaker/Presenter

### Classifications That Require Payment ($39)

- Alumni
- Community Member
- Educator

### How It Works

1. User fills out the onboarding form
2. Form data is saved to Clerk's `unsafeMetadata`
3. System checks if user's classification requires payment
4. **If payment required**:
   - Creates a Stripe checkout session
   - Redirects to Stripe's hosted checkout page
   - After successful payment, redirects to success page
   - Updates user metadata with `paymentComplete: true`
5. **If no payment required**:
   - Completes onboarding immediately
   - Redirects to home page

## Files Created

- `/app/api/create-checkout-session/route.ts` - API endpoint to create Stripe checkout sessions
- `/app/onboarding/success/page.tsx` - Payment success confirmation page
- Updated `/app/onboarding/page.tsx` - Main onboarding form with payment logic

## Production Considerations

### 1. Use Live Keys in Production

Replace test keys with live keys in your production environment:

```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Set Up Webhooks (Optional but Recommended)

For production, consider setting up Stripe webhooks to handle payment confirmations more securely:

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Customize Success Page

Update the success page (`/app/onboarding/success/page.tsx`) with:

- Your event branding
- Specific event details
- Contact information
- Any additional instructions

## Testing

### Test Card Numbers

| Scenario                | Card Number         | Details                  |
| ----------------------- | ------------------- | ------------------------ |
| Successful payment      | 4242 4242 4242 4242 | Any CVC, any future date |
| Requires authentication | 4000 0027 6000 3184 | Tests 3D Secure          |
| Card declined           | 4000 0000 0000 0002 | Generic decline          |
| Insufficient funds      | 4000 0000 0000 9995 | Insufficient funds       |

Use any future expiration date, any 3-digit CVC, and any 5-digit ZIP code.

## Troubleshooting

### Payment not processing

- Check that Stripe keys are correctly set in `.env.local`
- Ensure you're using test keys in development
- Check browser console for errors

### Redirect not working

- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check that the success URL in the API route matches your domain

### User metadata not updating

- Check Clerk configuration
- Verify user permissions in Clerk Dashboard
- Check browser console and server logs

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test Cards: https://stripe.com/docs/testing
