
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { ref, onValue, push, set, serverTimestamp, update } from 'firebase/database';
import { cn } from '@/lib/utils';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import { Badge } from '@/components/ui/badge';
import type { User as FirebaseUser } from 'firebase/auth';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: number;
  userName: string;
};

type ChatMetadata = {
    id: string;
    lastMessage: string;
    timestamp: number;
    unreadByAdmin: boolean;
    customerName: string;
}

export default function AdminSupportPage() {
  const [chats, setChats] = useState<ChatMetadata[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatMetadata | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [adminUser, setAdminUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setAdminUser(user);
    });
    return () => unsubscribeAuth();
  }, [])

  useEffect(() => {
    const chatsRef = ref(db, 'chats');
    const unsubscribeChats = onValue(chatsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const chatList: ChatMetadata[] = Object.keys(data)
            .map(key => ({ id: key, ...data[key].metadata }))
            .sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));
            setChats(chatList);
        } else {
            setChats([]);
        }
    });
    return () => unsubscribeChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      const messagesRef = ref(db, `chats/${selectedChat.id}/messages`);
      const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.keys(data)
            .map(key => ({ id: key, ...data[key] }))
            .sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messageList);
        } else {
          setMessages([]);
        }
      });

      // Mark as read
      const metadataRef = ref(db, `chats/${selectedChat.id}/metadata`);
      update(metadataRef, { unreadByAdmin: false });

      return () => unsubscribeMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser || !selectedChat || newMessage.trim() === '') return;

    const chatRef = ref(db, `chats/${selectedChat.id}/messages`);
    const newMsgRef = push(chatRef);
    await set(newMsgRef, {
      text: newMessage,
      sender: 'admin',
      timestamp: serverTimestamp(),
      userName: 'Admin',
    });

    const metadataRef = ref(db, `chats/${selectedChat.id}/metadata`);
    await update(metadataRef, {
        lastMessage: newMessage,
        timestamp: serverTimestamp(),
        unreadByAdmin: false, // Admin sent a message, so it's read by admin
    })

    setNewMessage('');
  };

  const handleSelectChat = (chat: ChatMetadata) => {
    setSelectedChat(chat);
    // Optimistically mark as read in the UI
    const updatedChats = chats.map(c => 
        c.id === chat.id ? { ...c, unreadByAdmin: false } : c
    );
    setChats(updatedChats);
    const metadataRef = ref(db, `chats/${chat.id}/metadata`);
    update(metadataRef, { unreadByAdmin: false });
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 h-[calc(100vh-80px)]">
        <AdminHeader title="Support Chat" description="Respond to live customer queries." />
        <div className="grid md:grid-cols-[300px_1fr] gap-8 h-full">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-2">
                    <div className="flex flex-col gap-2">
                        {chats.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => handleSelectChat(chat)}
                                className={cn(
                                    "w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex flex-col gap-1",
                                    selectedChat?.id === chat.id && "bg-muted"
                                )}
                            >
                               <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm">{chat.customerName}</p>
                                    {chat.unreadByAdmin && <Badge className="bg-primary h-2.5 w-2.5 p-0" />}
                               </div>
                               <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                            </button>
                        ))}
                         {chats.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center p-4">No conversations yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col h-full">
                <Card className="flex flex-col flex-1">
                    {!selectedChat ? (
                         <div className="flex flex-1 items-center justify-center h-full">
                            <p className="text-muted-foreground">Select a conversation to start chatting.</p>
                         </div>
                    ) : (
                        <>
                         <CardHeader>
                            <CardTitle>Chat with {selectedChat.customerName}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                             {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn('flex items-end gap-2', 
                                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    {message.sender === 'admin' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>A</AvatarFallback>
                                    </Avatar>
                                    )}
                                    <div
                                    className={cn('max-w-xs md:max-w-md rounded-lg px-4 py-2',
                                        message.sender === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    )}
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
                        </>
                    )}
                   
                </Card>
            </div>
        </div>
    </main>
  );
}

    