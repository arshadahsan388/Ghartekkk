
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Image as ImageIcon, Paperclip, X, File as FileIcon } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { ref, onValue, push, set, serverTimestamp, update } from 'firebase/database';
import { cn } from '@/lib/utils';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import { Badge } from '@/components/ui/badge';
import type { User as FirebaseUser } from 'firebase/auth';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Message = {
  id: string;
  text?: string;
  imageUrl?: string;
  type: 'text' | 'image';
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
    lastMessageType: 'text' | 'image';
}

type FileToSend = {
    name: string;
    type: string;
    dataUrl: string;
}

export default function AdminSupportPage() {
  const [chats, setChats] = useState<ChatMetadata[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatMetadata | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adminUser, setAdminUser] = useState<FirebaseUser | null>(null);
  const [isAiSupportActive, setIsAiSupportActive] = useState(false);
  const { toast } = useToast();
  const [fileToSend, setFileToSend] = useState<FileToSend | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [viewedImageUrl, setViewedImageUrl] = useState<string | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setAdminUser(user);
    });

    const aiSupportRef = ref(db, 'settings/aiSupportActive');
    const unsubscribeAi = onValue(aiSupportRef, (snapshot) => {
        setIsAiSupportActive(snapshot.val() ?? false);
    });

    return () => {
        unsubscribeAuth();
        unsubscribeAi();
    };
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
    if (!adminUser || !selectedChat || (newMessage.trim() === '' && !fileToSend)) return;

    setIsSending(true);

    const chatRef = ref(db, `chats/${selectedChat.id}/messages`);
    const newMsgRef = push(chatRef);
    const metadataRef = ref(db, `chats/${selectedChat.id}/metadata`);
    
    const messageData = {
      sender: 'admin',
      timestamp: serverTimestamp(),
      userName: 'Admin',
    };
    
    const metadataUpdate = {
        timestamp: serverTimestamp(),
        unreadByAdmin: false,
        unreadByUser: true,
    };
    
    if(fileToSend) {
        if (fileToSend.type.startsWith('image/')) {
            await set(newMsgRef, { ...messageData, imageUrl: fileToSend.dataUrl, type: 'image' });
            await update(metadataRef, { ...metadataUpdate, lastMessage: 'Image', lastMessageType: 'image' });
        } else {
            // For documents, we send the name as text.
            const docMessage = `Sent a file: ${fileToSend.name}`;
            await set(newMsgRef, { ...messageData, text: docMessage, type: 'text' });
            await update(metadataRef, { ...metadataUpdate, lastMessage: docMessage, lastMessageType: 'text' });
        }
    } else {
        await set(newMsgRef, { ...messageData, text: newMessage, type: 'text' });
        await update(metadataRef, { ...metadataUpdate, lastMessage: newMessage, lastMessageType: 'text' });
    }

    setNewMessage('');
    setFileToSend(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    setIsSending(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            variant: 'destructive',
            title: 'File too large',
            description: 'Please select an image or document smaller than 2MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
         setFileToSend({
            name: file.name,
            type: file.type,
            dataUrl: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
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
  
  const handleAiToggle = async (checked: boolean) => {
      const aiSupportRef = ref(db, 'settings/aiSupportActive');
      try {
          await set(aiSupportRef, checked);
          setIsAiSupportActive(checked);
          toast({
              title: `AI Support ${checked ? 'Enabled' : 'Disabled'}`,
              description: `The AI assistant will now ${checked ? 'automatically reply to customers' : 'be inactive'}.`
          });
      } catch (error) {
          console.error("Failed to toggle AI support:", error);
           toast({
              variant: 'destructive',
              title: 'Update Failed',
          });
      }
  }

  const renderLastMessage = (chat: ChatMetadata) => {
    if (chat.lastMessageType === 'image') {
        return (
            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                <ImageIcon className="w-3 h-3" />
                <span>Image</span>
            </div>
        )
    }
    return <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>;
  }

  const handleViewImage = (url: string) => {
    setViewedImageUrl(url);
    setIsImageViewerOpen(true);
  }

  const clearAttachment = () => {
    setFileToSend(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }


  return (
    <>
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 h-[calc(100vh-80px)]">
        <div className="flex items-center justify-between">
            <AdminHeader title="Support Chat" description="Respond to live customer queries." />
            <div className="flex items-center space-x-2">
              <Switch id="ai-support" checked={isAiSupportActive} onCheckedChange={handleAiToggle} />
              <Label htmlFor="ai-support">Enable AI Assistant</Label>
            </div>
        </div>
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
                               {renderLastMessage(chat)}
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
                                        message.sender === 'user' ? 'justify-start' : 'justify-end'
                                    )}
                                >
                                    {message.sender === 'user' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                    </Avatar>
                                    )}
                                    <div
                                    className={cn('max-w-xs md:max-w-md rounded-lg px-4 py-2',
                                        message.sender === 'user'
                                        ? 'bg-muted'
                                        : 'bg-primary text-primary-foreground'
                                    )}
                                    >
                                     {message.type === 'image' && message.imageUrl ? (
                                        <button onClick={() => handleViewImage(message.imageUrl!)}>
                                            <Image src={message.imageUrl} alt="User upload" width={200} height={200} className="rounded-md cursor-pointer" />
                                        </button>
                                    ) : (
                                        <p className="text-sm break-words">{message.text}</p>
                                    )}
                                    </div>
                                    {message.sender === 'admin' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>A</AvatarFallback>
                                    </Avatar>
                                    )}
                                </div>
                                ))}
                                <div ref={messagesEndRef} />
                        </CardContent>
                         <CardFooter className="p-4 border-t flex flex-col items-start gap-2">
                             {fileToSend && (
                                <div className="relative p-2 border rounded-md bg-muted">
                                    {fileToSend.type.startsWith('image/') ? (
                                        <Image src={fileToSend.dataUrl} alt="Preview" width={80} height={80} className="rounded-md" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <FileIcon className="w-6 h-6" />
                                            <span className="text-sm text-muted-foreground">{fileToSend.name}</span>
                                        </div>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                        onClick={clearAttachment}
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
                                    disabled={!!fileToSend || isSending}
                                />
                                <Button type="submit" disabled={isSending}>
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

    <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            {viewedImageUrl && (
                <div className="flex justify-center items-center">
                    <Image src={viewedImageUrl} alt="Full size preview" width={800} height={600} style={{ objectFit: 'contain', maxHeight: '80vh', width: 'auto' }} />
                </div>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}
