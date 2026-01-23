
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Spinner } from '@/components/ui/spinner';
import { BottomNav } from '@/components/layout/bottom-nav';
import { UserRole, LessonLog, Badge as BadgeType } from '@/lib/definitions';
import { getConsultantActivity, getEarnedBadgesByUserId } from '@/lib/data';
import { ScoreCard } from '@/components/profile/score-card';

export default function ScoreCardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activity, setActivity] = useState<LessonLog[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      async function fetchData() {
        setDataLoading(true);
        const [fetchedActivity, fetchedBadges] = await Promise.all([
          getConsultantActivity(user!.userId),
          getEarnedBadgesByUserId(user!.userId),
        ]);
        setActivity(fetchedActivity);
        setBadges(fetchedBadges);
        setDataLoading(false);
      }
      fetchData();
    }
  }, [user]);

  if (loading || dataLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const managerialRoles: UserRole[] = ['manager', 'Service Manager', 'Parts Manager', 'Finance Manager', 'Owner', 'Trainer', 'Admin', 'General Manager'];
  const isManager = managerialRoles.includes(user.role);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6 lg:p-8 pb-24 md:pb-6 lg:pb-8">
        <ScoreCard user={user} activity={activity} badges={badges} />
      </main>
      {!isManager && <BottomNav />}
    </div>
  );
}
