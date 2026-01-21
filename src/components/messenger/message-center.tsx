
'use client';

import { useState, useEffect } from 'react';
import { User, Message } from '@/lib/definitions';
import { getMessagesForUser } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Megaphone, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageCenterProps {
  user: User;
}

function MessageItem({ message }: { message: Message }) {
    return (
        <div key={message.id} className="flex items-start gap-3">
            <Avatar className="h-9 w-9 border">
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
    );
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

  const mostRecentMessage = messages[0];

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
          <Skeleton className="h-16 w-full" />
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            <MessageItem message={mostRecentMessage} />
            {messages.length > 1 && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            View All {messages.length} Messages
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>All Messages</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-6">
                                {messages.map((message) => (
                                    <MessageItem key={message.id} message={message} />
                                ))}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">No messages yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
