
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Paperclip, X, Bot } from 'lucide-react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ref, onValue, push, set, serverTimestamp, update } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { supportChat } from '@/ai/flows/support-chat-flow';

type Message = {
  id: string;
  text?: string;
  imageUrl?: string;
  type: 'text' | 'image';
  sender: 'user' | 'admin';
  timestamp: number;
  userName: string;
};

export default function SupportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isAfterHours, setIsAfterHours] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setIsLoading(false);
      }
    });
    
    // Determine if it's after hours
    const now = new Date();
    // PKT is UTC+5, so we adjust the client's UTC time.
    const pktHour = (now.getUTCHours() + 5) % 24;
    setIsAfterHours(pktHour < 9 || pktHour >= 21); // 9 AM to 9 PM PKT

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
            // No messages yet, send initial AI greeting if after hours
             if (isAfterHours) {
                sendInitialAiGreeting();
            }
        }
      });

      // Mark chat as read when component mounts or user changes
      const metadataRef = ref(db, `chats/${user.uid}/metadata`);
      update(metadataRef, { unreadByUser: false });

      return () => unsubscribeMessages();
    }
  }, [user, isAfterHours]);

  const sendInitialAiGreeting = async () => {
    if (!user) return;
     const conversationHistory = messages.map(m => ({
        sender: m.sender,
        message: m.text || (m.type === 'image' ? 'Image' : '')
    }));

     if(conversationHistory.length > 0) return; // Don't send if history exists

    const aiResponse = await supportChat({
        message: "User just opened the chat.",
        history: conversationHistory
    });

    const chatRef = ref(db, `chats/${user.uid}/messages`);
    const aiMsgRef = push(chatRef);
    await set(aiMsgRef, {
        text: aiResponse.response,
        type: 'text',
        sender: 'admin',
        timestamp: serverTimestamp(),
        userName: 'AI Support',
    });
     const metadataRef = ref(db, `chats/${user.uid}/metadata`);
     await update(metadataRef, {
        lastMessage: aiResponse.response,
        lastMessageType: 'text',
        timestamp: serverTimestamp(),
        unreadByAdmin: true,
        unreadByUser: true,
    });
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (newMessage.trim() === '' && !imagePreview)) return;

    setIsSending(true);

    try {
        const chatRef = ref(db, `chats/${user.uid}/messages`);
        const newMsgRef = push(chatRef);
        const metadataRef = ref(db, `chats/${user.uid}/metadata`);

        if (imagePreview) {
             await set(newMsgRef, {
                imageUrl: imagePreview,
                type: 'image',
                sender: 'user',
                timestamp: serverTimestamp(),
                userName: user.displayName || user.email,
            });
             await set(metadataRef, {
                lastMessage: 'Image',
                lastMessageType: 'image',
                timestamp: serverTimestamp(),
                unreadByAdmin: true,
                customerName: user.displayName || user.email,
                userId: user.uid,
                unreadByUser: false,
            });
        } else {
             await set(newMsgRef, {
                text: newMessage,
                type: 'text',
                sender: 'user',
                timestamp: serverTimestamp(),
                userName: user.displayName || user.email,
            });
            await set(metadataRef, {
                lastMessage: newMessage,
                lastMessageType: 'text',
                timestamp: serverTimestamp(),
                unreadByAdmin: true,
                customerName: user.displayName || user.email,
                userId: user.uid,
                unreadByUser: false,
            });
        }
        
        setNewMessage('');
        setImagePreview(null);
    } catch(error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error sending message'});
    } finally {
        setIsSending(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            variant: 'destructive',
            title: 'File too large',
            description: 'Please select an image smaller than 2MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
              Have a question or issue? Chat with us live. Our support hours are 9am - 9pm PKT.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.sender === 'user' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs md:max-w-md rounded-lg p-2 ${
                    message.sender === 'user'
                      ? 'bg-muted'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {message.type === 'image' && message.imageUrl ? (
                    <Image src={message.imageUrl} alt="User upload" width={200} height={200} className="rounded-md" />
                  ) : (
                    <p className="text-sm px-2 py-1">{message.text}</p>
                  )}
                </div>
                 {message.sender === 'admin' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{message.userName === 'AI Support' ? <Bot /> : 'A'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-4 border-t flex flex-col items-start gap-2">
            {imagePreview && (
                <div className="relative">
                    <Image src={imagePreview} alt="Preview" width={80} height={80} className="rounded-md" />
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => setImagePreview(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                >
                    <Paperclip className="h-5 w-5" />
                    <span className="sr-only">Attach file</span>
                </Button>
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!!imagePreview || isSending}
              />
              <Button type="submit" disabled={isSending}>
                {isSending ? <Skeleton className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
