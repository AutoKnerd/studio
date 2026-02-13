'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/app/actions/stripe'; // supports billingCycle: 'monthly' | 'annual'
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';


export default function SubscribePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    // Note: subscription gating will be moved to Stripe entitlements/webhook.
    // Keeping this page accessible so users can manage billing.
  }, [user, loading, router]);
  
  const handleSubscribe = async () => {
    if (!user || !user.userId) {
      toast({
        variant: 'destructive',
        title: 'Account not ready',
        description: 'Please log in again. If this continues, your user profile has not finished provisioning.',
      });
      router.push('/login');
      return;
    }
    setIsSubmitting(true);
    try {
      await createCheckoutSession(user.userId, billingCycle);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: (e as Error).message || 'Could not initiate subscription. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6 lg:p-8">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-3xl">AutoDrive Pro</CardTitle>
                <CardDescription>Unlock your full potential with unlimited access to all features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${billingCycle === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setBillingCycle('monthly')}
                  disabled={isSubmitting}
                  aria-pressed={billingCycle === 'monthly'}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${billingCycle === 'annual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setBillingCycle('annual')}
                  disabled={isSubmitting}
                  aria-pressed={billingCycle === 'annual'}
                >
                  Annual
                </button>
              </div>

              <div className="text-4xl font-bold">
                {billingCycle === 'monthly' ? (
                  <>
                    $49 <span className="text-lg font-normal text-muted-foreground">/ month</span>
                  </>
                ) : (
                  <>
                    $499 <span className="text-lg font-normal text-muted-foreground">/ year</span>
                  </>
                )}
              </div>

              {billingCycle === 'annual' ? (
                <p className="text-sm text-muted-foreground">
                  Pay annually for best value.
                </p>
              ) : null}

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited lesson access</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> In-depth performance analytics</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Personal dashboard & progress tracking</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Role-based lesson path</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Need a manager + team plan (with seats)? That’s a separate subscription.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled={isSubmitting} onClick={handleSubscribe}>
                {isSubmitting ? <Spinner size="sm" /> : billingCycle === 'monthly' ? 'Subscribe Monthly' : 'Subscribe Annually'}
              </Button>
            </CardFooter>
        </Card>
      </main>
    </div>
  );
}
