'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { sendInvitation } from '@/lib/data';
import { UserRole } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { MailCheck } from 'lucide-react';

interface RegisterDealershipFormProps {
  onDealershipRegistered?: () => void;
}

const registrationRoles: UserRole[] = ['Owner', 'manager', 'Service Manager', 'Parts Manager', 'Finance Manager', 'consultant', 'Service Writer', 'Parts Consultant'];

const registerSchema = z.object({
  dealershipName: z.string().min(3, 'Dealership name must be at least 3 characters long.'),
  userEmail: z.string().email('Please enter a valid email address for the intended user.'),
  role: z.enum(registrationRoles as [UserRole, ...UserRole[]]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterDealershipForm({ onDealershipRegistered }: RegisterDealershipFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dealershipName: '',
      userEmail: '',
      role: 'Owner',
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsSubmitting(true);
    setInvitationSent(false);
    try {
      await sendInvitation(data.dealershipName, data.userEmail, data.role);
      
      setInvitationSent(true);
      toast({
        title: 'Invitation Sent!',
        description: `An invitation has been sent to ${data.userEmail}.`,
      });
      
      onDealershipRegistered?.();
      form.reset();

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Invitation Failed',
        description: (error as Error).message || 'An error occurred while sending the invitation.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (invitationSent) {
    return (
      <div className="text-center">
        <Alert>
          <MailCheck className="h-4 w-4" />
          <AlertTitle>Invitation Sent Successfully!</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              An invitation email has been sent to <span className="font-semibold">{form.getValues('userEmail')}</span>. They can use the link in the email to create their account.
            </p>
          </AlertDescription>
        </Alert>
        <Button onClick={() => setInvitationSent(false) } className="mt-4">
            Send Another Invitation
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="dealershipName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dealership Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., AutoDrive North" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
            control={form.control}
            name="userEmail"
            render={({ field }) => (
                <FormItem>
                <FormLabel>New User's Email</FormLabel>
                <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>New User's Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {registrationRoles.map(role => (
                            <SelectItem key={role} value={role}>
                                {role === 'manager' ? 'Sales Manager' : role}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : 'Send Invitation'}
        </Button>
      </form>
    </Form>
  );
}
