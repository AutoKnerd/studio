'use client';

import { useState, useEffect } from 'react';
import { Lesson } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Bot, Send } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { conductLesson } from '@/ai/flows/lesson-flow';
import { Spinner } from '../ui/spinner';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface LessonViewProps {
  lesson: Lesson;
}

export function LessonView({ lesson }: LessonViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function startLesson() {
      if (messages.length > 0) return;
      
      setIsLoading(true);
      const initialResponse = await conductLesson({
        lessonId: lesson.lessonId,
        lessonTitle: lesson.title,
        history: [],
        userMessage: 'Start the lesson.',
      });

      setMessages([
        { sender: 'ai', text: initialResponse },
      ]);
      setIsLoading(false);
    }
    startLesson();
  }, [lesson.lessonId, lesson.title, messages.length]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    const userMessage: Message = { sender: 'user', text: currentInput };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const response = await conductLesson({
        lessonId: lesson.lessonId,
        lessonTitle: lesson.title,
        history: newMessages,
        userMessage: currentInput,
    });
    
    const aiMessage: Message = { sender: 'ai', text: response };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-3xl h-[80vh] flex flex-col">
            <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                            {message.sender === 'ai' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`rounded-lg p-3 text-sm ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p style={{whiteSpace: 'pre-wrap'}}>{message.text}</p>
                            </div>
                            {message.sender === 'user' && user && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatarUrl} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-4">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg p-3 bg-muted flex items-center">
                                    <Spinner size="sm" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                    <Input
                        id="message"
                        placeholder="Type your response..."
                        className="flex-1"
                        autoComplete="off"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    </div>
  );
}
