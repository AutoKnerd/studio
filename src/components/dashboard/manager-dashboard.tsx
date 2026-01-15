'use client';

import { useState, useEffect } from 'react';
import type { User, LessonLog, Lesson, LessonRole } from '@/lib/definitions';
import { getManagerStats, getTeamActivity, getLessons } from '@/lib/data';
import { StatCard } from './stat-card';
import { BarChart, BookOpen, CheckCircle, Smile, Star, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { Badge } from '../ui/badge';

interface ManagerDashboardProps {
  user: User;
}

type TeamMemberStats = {
  consultant: User;
  lessonsCompleted: number;
  totalXp: number;
  avgScore: number;
};

export function ManagerDashboard({ user }: ManagerDashboardProps) {
  const [stats, setStats] = useState<{ totalLessons: number, avgEmpathy: number } | null>(null);
  const [teamActivity, setTeamActivity] = useState<TeamMemberStats[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const promises = [
        getManagerStats(user.dealershipId, user.role),
        getTeamActivity(user.dealershipId, user.role),
      ];

      if (user.role !== 'Owner') {
        promises.push(getLessons(user.role as LessonRole));
      }

      const [managerStats, activity, fetchedLessons] = await Promise.all(promises);
      
      setStats(managerStats as { totalLessons: number, avgEmpathy: number });
      setTeamActivity(activity as TeamMemberStats[]);
      if (fetchedLessons) {
        setLessons(fetchedLessons as Lesson[]);
      }

      setLoading(false);
    }
    fetchData();
  }, [user.dealershipId, user.role]);
  
  return (
    <>
      {user.role !== 'Owner' && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              My Available Lessons
            </CardTitle>
            <CardDescription>Complete these lessons to improve your own skills.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : lessons.length > 0 ? (
              <div className="space-y-4">
                {lessons.map(lesson => (
                  <Link key={lesson.lessonId} href={`/lesson/${lesson.lessonId}`} className="block rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{lesson.title}</p>
                      <Badge variant="secondary">{lesson.category}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
                <p className="text-sm text-muted-foreground">No lessons available for your role.</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
            Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32"/>)
        ) : (
          <>
            <StatCard 
              title="Total Lessons Completed"
              value={stats?.totalLessons.toString() || '0'}
              description="Across your entire team"
              Icon={CheckCircle}
            />
            <StatCard 
              title="Team Members"
              value={teamActivity.length.toString()}
              description="Active team members"
              Icon={Users}
            />
            <StatCard 
              title="Average Empathy Score"
              value={`${stats?.avgEmpathy || 0}%`}
              description="Team-wide average"
              Icon={Smile}
            />
            <StatCard 
              title="Total XP Gained"
              value={teamActivity.reduce((sum, member) => sum + member.totalXp, 0).toLocaleString()}
              description="Team's collective experience"
              Icon={Star}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Team Performance Summary
          </CardTitle>
          <CardDescription>
            Performance overview of staff at your dealership.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Lessons Completed</TableHead>
                  <TableHead className="text-center">Total XP</TableHead>
                  <TableHead className="text-right">Average Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamActivity.length > 0 ? teamActivity.map(member => (
                  <TableRow key={member.consultant.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.consultant.avatarUrl} data-ai-hint="person portrait" />
                          <AvatarFallback>{member.consultant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.consultant.name}</p>
                          <p className="text-sm text-muted-foreground">{member.consultant.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{member.consultant.role}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">{member.lessonsCompleted}</TableCell>
                    <TableCell className="text-center font-medium">{member.totalXp.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-medium">{member.avgScore}%</span>
                        <Progress value={member.avgScore} className="h-2 w-20" />
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No team activity found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
