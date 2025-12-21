import { subscriptionModel, SubscriptionEntity } from '../models/Subscription';
import { planModel } from '../models/Plan';
import { paginationService } from './PaginationService';

export class SubscriptionService {
    async createSubscription(userId: string, planId: string): Promise<SubscriptionEntity> {
        const plan = await planModel.findById(planId);
        if (!plan || !plan.is_active) {
            throw new Error('Plan not found or inactive');
        }

        return await subscriptionModel.create({
            user_id: userId,
            plan_id: planId,
            status: 'pending',
            start_date: null,
            end_date: null
        });
    }

    async activateSubscription(subscriptionId: string): Promise<SubscriptionEntity | null> {
        const subscription = await subscriptionModel.findById(subscriptionId);
        if (!subscription) return null;

        const plan = await planModel.findById(subscription.plan_id);
        if (!plan) return null;

        const startDate = new Date();
        const endDate = this.calculateEndDate(startDate, plan.billing_cycle);

        return await subscriptionModel.update(subscriptionId, {
            status: 'active',
            start_date: startDate,
            end_date: endDate
        });
    }

    async failSubscription(subscriptionId: string): Promise<SubscriptionEntity | null> {
        return await subscriptionModel.update(subscriptionId, {
            status: 'expired'
        });
    }

    async cancelSubscription(subscriptionId: string): Promise<SubscriptionEntity | null> {
        const subscription = await subscriptionModel.findById(subscriptionId);
        if (!subscription || subscription.status !== 'active') {
            throw new Error('Subscription not found or not active');
        }

        return await subscriptionModel.update(subscriptionId, {
            status: 'cancelled',
            cancelled_at: new Date()
        });
    }

    async getActiveSubscriptionOrNull(userId: string): Promise<SubscriptionEntity | null> {
        return await subscriptionModel.findActiveByUserId(userId);
    }

    async renewSubscription(subscriptionId: string): Promise<{ success: boolean; subscription: SubscriptionEntity } | null> {
        const subscription = await subscriptionModel.findById(subscriptionId);
        if (!subscription || subscription.status !== 'active') return null;

        const plan = await planModel.findById(subscription.plan_id);
        if (!plan) return null;

        const success = await this.mockCharge(subscription.user_id, plan.price);

        let updatedSubscription: SubscriptionEntity | null;
        if (success) {
            const newStartDate = subscription.end_date || new Date();
            const newEndDate = this.calculateEndDate(newStartDate, plan.billing_cycle);
            updatedSubscription = await subscriptionModel.update(subscriptionId, {
                start_date: newStartDate,
                end_date: newEndDate
            });
        } else {
            updatedSubscription = await subscriptionModel.update(subscriptionId, {
                status: 'expired'
            });
        }

        return { success, subscription: updatedSubscription! };
    }

    async findActiveSoonToExpire(callback: (subs: SubscriptionEntity[]) => Promise<void> | void): Promise<SubscriptionEntity[]> {
        return await paginationService.fetchAllRecursive(
            subscriptionModel,
            callback,
            100,
            null,
            "status = 'active' AND end_date <= NOW()"
        );
    }

    async findCancelledSoonToExpire(callback: (subs: SubscriptionEntity[]) => Promise<void> | void): Promise<SubscriptionEntity[]> {
        return await paginationService.fetchAllRecursive(
            subscriptionModel,
            callback,
            100,
            null,
            "status = 'cancelled' AND end_date <= NOW()"
        );
    }

    async expireCancelledSubscription(subscriptionId: string): Promise<SubscriptionEntity | null> {
        return await subscriptionModel.update(subscriptionId, {
            status: 'expired'
        });
    }

    private calculateEndDate(startDate: Date, billingCycle: 'monthly' | 'yearly'): Date {
        const endDate = new Date(startDate);
        if (billingCycle === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }
        return endDate;
    }

    // for now just add mock charge for testing 
    private async mockCharge(userId: string, amount: number): Promise<boolean> {
        console.log(`[MockPayment] Charging user ${userId} amount ${amount}`);
        return Math.random() > 0.1;
    }
}

export const subscriptionService = new SubscriptionService();
