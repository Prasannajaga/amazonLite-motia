import Stripe from 'stripe';

export class StripeService {
    private stripe: Stripe;

    constructor() {
        const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
        this.stripe = new Stripe(secretKey, {
            apiVersion: '2024-12-18.acacia' as any,
        });
    }

    async createPaymentIntent(amount: number, metadata: Record<string, string>) {
        return await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });
    }

    constructEvent(payload: string | Buffer, sig: string, webhookSecret: string) {
        return this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    }
}

export const stripeService = new StripeService();
