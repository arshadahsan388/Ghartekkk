
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: number;
  userName: string;
};

export default function SupportPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setIsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (user) {
      const chatRef = ref(db, `chats/${user.uid}/messages`);
      const unsubscribeMessages = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.keys(data)
            .map((key) => ({ id: key, ...data[key] }))
            .sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messageList);
        } else {
          setMessages([]);
        }
      });
      return () => unsubscribeMessages();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newMessage.trim() === '') return;

    const chatRef = ref(db, `chats/${user.uid}/messages`);
    const newMsgRef = push(chatRef);
    await set(newMsgRef, {
      text: newMessage,
      sender: 'user',
      timestamp: serverTimestamp(),
      userName: user.displayName || user.email,
    });

    const metadataRef = ref(db, `chats/${user.uid}/metadata`);
    await set(metadataRef, {
        lastMessage: newMessage,
        timestamp: serverTimestamp(),
        unreadByAdmin: true,
        customerName: user.displayName || user.email
    })

    setNewMessage('');
  };
  
  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
             <Card>
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-4 h-96">
                    <Skeleton className="h-12 w-2/3" />
                    <Skeleton className="h-12 w-2/3 ml-auto" />
                </CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
             </Card>
        </div>
    )
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="flex flex-col h-[calc(100vh-12rem)]">
          <CardHeader>
            <CardTitle>Support Chat</CardTitle>
            <CardDescription>
              Have a question or issue? Chat with us live.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'admin' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                 {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
