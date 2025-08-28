
'use server';
import {initializeApp} from 'firebase-admin/app';
import {getDatabase} from 'firebase-admin/database';
import {onValueCreated} from 'firebase-functions/v2/database';

import {autoReply} from '@/ai/flows/auto-reply-flow';

initializeApp();

type Message = {
  id: string;
  text?: string;
  imageUrl?: string;
  type: 'text' | 'image';
  sender: 'user' | 'admin';
  timestamp: number;
  userName: string;
};

export const onNewMessage = onValueCreated(
  '/chats/{userId}/messages/{messageId}',
  async event => {
    const db = getDatabase();

    // Check if AI support is active
    const aiSupportSnapshot = await db.ref('settings/aiSupportActive').get();
    if (!aiSupportSnapshot.val()) {
      console.log('AI support is disabled.');
      return;
    }

    const messageData = event.data.val();
    // Only respond to user messages
    if (messageData.sender !== 'user') {
      console.log('Message not from user, skipping AI reply.');
      return;
    }

    const userId = event.params.userId;

    // Get conversation history
    const messagesSnapshot = await db
      .ref(`/chats/${userId}/messages`)
      .orderByChild('timestamp')
      .limitToLast(10) // Get last 10 messages for context
      .get();

    const messages: Message[] = [];
    messagesSnapshot.forEach(child => {
      messages.push(child.val());
    });

    const history = messages.map(m => ({
      sender: m.sender,
      message: m.text || (m.type === 'image' ? '[Image]' : ''),
    }));

    // Trigger AI flow
    try {
      const aiResult = await autoReply({
        message: messageData.text || '[Image]',
        history,
      });

      // Save AI response to chat
      const chatRef = db.ref(`chats/${userId}/messages`);
      const newMsgRef = chatRef.push();
      await newMsgRef.set({
        text: aiResult.response,
        type: 'text',
        sender: 'admin',
        timestamp: Date.now(),
        userName: 'AI Assistant',
      });

      // Update chat metadata
      const metadataRef = db.ref(`chats/${userId}/metadata`);
      await metadataRef.update({
        lastMessage: aiResult.response,
        lastMessageType: 'text',
        timestamp: Date.now(),
        unreadByAdmin: true, // Keep it unread so admin can see AI interaction
      });

      console.log('AI response sent successfully for user:', userId);
    } catch (error) {
      console.error('Error processing AI reply:', error);
    }
  }
);
