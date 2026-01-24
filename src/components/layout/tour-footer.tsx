
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserRole } from '@/lib/definitions';
import { useRouter } from 'next/navigation';

const tourRoles: { label: string; value: UserRole }[] = [
  { label: 'Sales Consultant', value: 'Sales Consultant' },
  { label: 'Service Writer', value: 'Service Writer' },
  { label: 'Sales Manager', value: 'manager' },
  { label: 'Owner', value: 'Owner' },
];

export function TourFooter() {
  const { user, switchTourRole, logout } = useAuth();
  const router = useRouter();

  const handleEndTour = () => {
    logout();
    router.push('/register');
  };

  if (!user) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Viewing as:</span>
            <Select onValueChange={(role) => switchTourRole(role as UserRole)} value={user.role}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                    {tourRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                            {role.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <Button onClick={handleEndTour} size="lg">
          End Tour & Sign Up
        </Button>
      </div>
    </footer>
  );
}
