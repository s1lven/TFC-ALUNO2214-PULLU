import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  console.log('\n🔔 ===== STRIPE WEBHOOK RECEIVED =====');
  
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✅ Webhook signature verified');
    console.log('📦 Event Type:', event.type);
    console.log('🆔 Event ID:', event.id);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Webhook signature verification failed:', errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  try {
    console.log('\n🔄 Processing webhook...');
    
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('\n💳 CHECKOUT SESSION COMPLETED');
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Session Data:', {
          session_id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          metadata: session.metadata,
          amount_total: session.amount_total,
          currency: session.currency,
        });
        
        // Get the user_id from metadata (we should add this when creating checkout)
        const userId = session.metadata?.user_id;
        
        if (!userId) {
          console.error('❌ No user_id in session metadata');
          console.log('Available metadata:', session.metadata);
          break;
        }

        console.log('👤 User ID:', userId);

        // Get subscription details
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;

        const subData = subscription as unknown as { current_period_start?: number; current_period_end?: number; trial_end?: number | null };
        console.log('📋 Subscription Details:', {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subData.current_period_start ? new Date(subData.current_period_start * 1000) : null,
          current_period_end: subData.current_period_end ? new Date(subData.current_period_end * 1000) : null,
          trial_end: subData.trial_end ? new Date(subData.trial_end * 1000) : null,
          price_id: subscription.items.data[0].price.id,
        });

        // Create subscription record in Supabase
        const subscriptionData = {
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          subscription_status: subscription.status,
          tier: subscription.items.data[0].price.id,
        };

        console.log('💾 Creating subscription in Supabase:', subscriptionData);

        const { error, data } = await supabase
          .from('subscriptions')
          .insert(subscriptionData)
          .select();

        if (error) {
          console.error('❌ Error creating subscription in Supabase:', error);
        } else {
          console.log('✅ Subscription created successfully!');
          console.log('Created record:', data);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        console.log(`\n🔄 SUBSCRIPTION ${event.type === 'customer.subscription.created' ? 'CREATED' : 'UPDATED'}`);
        const subscription = event.data.object as Stripe.Subscription;

        const subPeriodData = subscription as unknown as { current_period_start?: number; current_period_end?: number };
        console.log('Subscription Data:', {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          price_id: subscription.items.data[0].price.id,
          current_period_start: subPeriodData.current_period_start ? new Date(subPeriodData.current_period_start * 1000) : null,
          current_period_end: subPeriodData.current_period_end ? new Date(subPeriodData.current_period_end * 1000) : null,
        });

        const updateData = {
          subscription_status: subscription.status,
          tier: subscription.items.data[0].price.id,
        };

        console.log('💾 Updating subscription in Supabase:', updateData);

        // Update subscription in Supabase
        const { error, data } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id)
          .select();

        if (error) {
          console.error('❌ Error updating subscription:', error);
        } else {
          console.log('✅ Subscription updated successfully!');
          console.log('Updated record:', data);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        console.log('\n🗑️ SUBSCRIPTION DELETED');
        const subscription = event.data.object as Stripe.Subscription;

        console.log('Subscription Data:', {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        });

        console.log('💾 Marking subscription as cancelled in Supabase');

        // Mark subscription as cancelled
        const { error, data } = await supabase
          .from('subscriptions')
          .update({
            subscription_status: 'cancelled',
          })
          .eq('stripe_subscription_id', subscription.id)
          .select();

        if (error) {
          console.error('❌ Error cancelling subscription:', error);
        } else {
          console.log('✅ Subscription cancelled successfully!');
          console.log('Updated record:', data);
        }
        break;
      }

      case 'invoice.paid': {
        console.log('\n💰 INVOICE PAID');
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceData = invoice as unknown as { subscription?: string | Stripe.Subscription | null; period_start?: number | null; period_end?: number | null };

        console.log('Invoice Data:', {
          id: invoice.id,
          subscription: invoiceData.subscription,
          customer: invoice.customer,
          amount_paid: invoice.amount_paid / 100,
          currency: invoice.currency,
          status: invoice.status,
          period_start: invoiceData.period_start ? new Date(invoiceData.period_start * 1000) : null,
          period_end: invoiceData.period_end ? new Date(invoiceData.period_end * 1000) : null,
        });

        // Keep subscription active when invoice is paid
        const subscriptionId = typeof invoiceData.subscription === 'string' ? invoiceData.subscription : invoiceData.subscription?.id;
        if (subscriptionId) {
          console.log('💾 Updating subscription status to active');

          const { error, data } = await supabase
            .from('subscriptions')
            .update({
              subscription_status: 'active',
            })
            .eq('stripe_subscription_id', subscriptionId)
            .select();

          if (error) {
            console.error('❌ Error updating subscription after payment:', error);
          } else {
            console.log('✅ Subscription payment confirmed!');
            console.log('Updated record:', data);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        console.log('\n❌ INVOICE PAYMENT FAILED');
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceData = invoice as unknown as { subscription?: string | Stripe.Subscription | null };

        console.log('Invoice Data:', {
          id: invoice.id,
          subscription: invoiceData.subscription,
          customer: invoice.customer,
          amount_due: invoice.amount_due / 100,
          currency: invoice.currency,
          attempt_count: invoice.attempt_count,
        });

        // Mark subscription as past_due when payment fails
        const subscriptionId = typeof invoiceData.subscription === 'string' ? invoiceData.subscription : invoiceData.subscription?.id;
        if (subscriptionId) {
          console.log('💾 Updating subscription status to past_due');

          const { error, data } = await supabase
            .from('subscriptions')
            .update({
              subscription_status: 'past_due',
            })
            .eq('stripe_subscription_id', subscriptionId)
            .select();

          if (error) {
            console.error('❌ Error updating subscription after failed payment:', error);
          } else {
            console.log('⚠️ Subscription marked as past_due');
            console.log('Updated record:', data);
          }
        }
        break;
      }

      default:
        console.log(`\n⚪ Unhandled event type: ${event.type}`);
    }

    console.log('\n✅ ===== WEBHOOK PROCESSED SUCCESSFULLY =====\n');
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('\n❌ ===== WEBHOOK PROCESSING ERROR =====');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    console.log('=======================================\n');
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
