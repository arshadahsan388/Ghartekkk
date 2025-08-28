import {initializeApp} from 'firebase-admin/app';
import {getDatabase} from 'firebase-admin/database';
import {onValueCreated} from 'firebase-functions/v2/database';

import {autoReply} from '@/ai/flows/auto-reply-flow';
import {supportChat} from '@/ai/flows/support-chat-flow';

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

const isAfterHours = () => {
    const now = new Date();
    // PKT is UTC+5, so we adjust the client's UTC time.
    const pktHour = (now.getUTCHours() + 5) % 24;
    return pktHour < 9 || pktHour >= 21; // 9 AM to 9 PM PKT
};

export const onNewMessage = onValueCreated(
  '/chats/{userId}/messages/{messageId}',
  async event => {
    const db = getDatabase();
    const messageData = event.data.val();
    
    // Only respond to user messages
    if (messageData.sender !== 'user') {
      console.log('Message not from user, skipping AI reply.');
      return;
    }

    const userId = event.params.userId;
    const aiSupportSnapshot = await db.ref('settings/aiSupportActive').get();
    const isAiSupportActive = aiSupportSnapshot.val();
    
    let aiFlow;
    let aiUsername = 'AI Assistant';

    if (isAiSupportActive) {
        aiFlow = autoReply;
    } else if (isAfterHours()) {
        aiFlow = supportChat;
        aiUsername = 'AI Support'
    } else {
        console.log('AI support is not required at this time.');
        return;
    }


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
      const aiResult = await aiFlow({
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
        userName: aiUsername,
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
