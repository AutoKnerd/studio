
'use client';

import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { UserNav } from './user-nav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/lib/definitions';
import { allRoles } from '@/lib/definitions';


function DevRoleSwitcher() {
  const { user, setUser, originalUser } = useAuth();
  
  if (!user || !originalUser || originalUser.role !== 'Developer') {
    return null;
  }
  
  const handleSwitchRole = (newRole: UserRole) => {
    setUser({ ...originalUser, role: newRole });
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">View as:</span>
      <Select onValueChange={(role) => handleSwitchRole(role as UserRole)} value={user.role}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue />
          </SelectTrigger>
          <SelectContent>
              {allRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                      {role === 'manager' ? 'Sales Manager' : role}
                  </SelectItem>
              ))}
          </SelectContent>
      </Select>
    </div>
  );
}

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <Link href="/" className="flex items-center font-semibold">
        <Logo variant="full" width={146} height={48} />
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <DevRoleSwitcher />
        {user && (
          <UserNav user={user} avatarClassName="h-8 w-8" />
        )}
      </div>
    </header>
  );
}
