
'use client';

import { useState } from 'react';
import { User } from '@/lib/definitions';
import { updateUserDealerships } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

interface RemoveUserFormProps {
  manageableUsers: User[];
  onUserRemoved?: () => void;
}

export function RemoveUserForm({ manageableUsers, onUserRemoved }: RemoveUserFormProps) {
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  async function handleRemove() {
    if (!userToRemove) return;

    setIsRemoving(true);
    try {
      await updateUserDealerships(userToRemove.userId, []);
      toast({
        title: 'User Unassigned',
        description: `${userToRemove.name} has been removed from all their dealerships.`,
      });
      onUserRemoved?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Removal Failed',
        description: (error as Error).message || 'Could not remove user from dealerships.',
      });
    } finally {
      setIsRemoving(false);
      setUserToRemove(null);
      setConfirmationInput('');
    }
  }
  
  if (userToRemove) {
    return (
        <div className="space-y-4 rounded-lg border bg-background p-6 shadow-sm">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <h2 className="text-lg font-semibold leading-none tracking-tight">Are you absolutely sure?</h2>
                <p className="text-sm text-muted-foreground">
                    This action will remove <strong>{userToRemove.name}</strong> from all their assigned dealerships. They will become "unassigned". This action cannot be undone, but they can be reassigned later.
                    <br /><br />
                    To confirm, please type <strong>remove</strong> in the box below.
                </p>
            </div>
            <Input 
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder="remove"
                autoFocus
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => { setUserToRemove(null); setConfirmationInput(''); }}>Cancel</Button>
                <Button 
                    onClick={handleRemove} 
                    disabled={confirmationInput.toLowerCase() !== 'remove' || isRemoving}
                    variant="destructive"
                >
                    {isRemoving ? <Spinner size="sm" /> : 'Confirm Removal'}
                </Button>
            </div>
        </div>
    );
  }

  return (
    <ScrollArea className="max-h-[60vh] -mx-6">
      <div className="space-y-2 px-6">
        {manageableUsers.length > 0 ? (
          manageableUsers.map(user => (
            <div key={user.userId} className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button variant="destructive" onClick={() => setUserToRemove(user)}>
                Remove
              </Button>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">
            No users available to remove.
          </p>
        )}
      </div>
    </ScrollArea>
  );
}
