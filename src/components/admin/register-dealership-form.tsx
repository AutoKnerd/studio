'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerDealership } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

interface RegisterDealershipFormProps {
  onDealershipRegistered?: () => void;
}

const registerSchema = z.object({
  dealershipName: z.string().min(3, 'Dealership name must be at least 3 characters long.'),
  ownerEmail: z.string().email('Please enter a valid email address for the owner.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterDealershipForm({ onDealershipRegistered }: RegisterDealershipFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationCode, setActivationCode] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dealershipName: '',
      ownerEmail: '',
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsSubmitting(true);
    setActivationCode(null);
    try {
      const result = await registerDealership(data.dealershipName, data.ownerEmail);
      
      setActivationCode(result.activationCode);
      toast({
        title: 'Dealership Registered!',
        description: `${data.dealershipName} has been created.`,
      });
      
      onDealershipRegistered?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: (error as Error).message || 'An error occurred while registering the dealership.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (activationCode) {
    return (
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Registration Successful!</AlertTitle>
            <AlertDescription>
                <p className="mb-2">The dealership has been created. Provide the following one-time activation code to the new owner.</p>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                    <p>Email: {form.getValues('ownerEmail')}</p>
                    <p>Activation Code: <span className="font-bold text-primary">{activationCode}</span></p>
                </div>
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="dealershipName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Dealership Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., AutoDrive North" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ownerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owner's Email Address</FormLabel>
              <FormControl>
                <Input placeholder="owner@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : 'Generate Activation Code'}
        </Button>
      </form>
    </Form>
  );
}
