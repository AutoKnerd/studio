
'use client';

import { useState, useEffect } from 'react';
import { User, Message } from '@/lib/definitions';
import { getMessagesForUser } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Megaphone } from 'lucide-react';

interface MessageCenterProps {
  user: User;
}

export function MessageCenter({ user }: MessageCenterProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      const userMessages = await getMessagesForUser(user);
      setMessages(userMessages);
      setLoading(false);
    }
    fetchMessages();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Message Center
        </CardTitle>
        <CardDescription>Recent announcements from your leadership team.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.slice(0, 3).map((message) => (
              <div key={message.id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9 border">
                  {/* In a real app, you'd fetch the sender's avatar */}
                  <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold">{message.senderName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">No messages yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
