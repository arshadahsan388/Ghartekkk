
'use server';
/**
 * @fileOverview A customer support AI chatbot.
 *
 * - supportChat - A function that handles the customer support chat process.
 * - SupportChatInput - The input type for the supportChat function.
 * - SupportChatOutput - The return type for the supportChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SupportChatInputSchema = z.object({
  message: z.string().describe('The user\'s message to the support chat.'),
  history: z.array(z.object({
    sender: z.enum(['user', 'admin']),
    message: z.string(),
  })).describe('The history of the conversation so far.'),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
  return supportChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'supportChatPrompt',
  input: {schema: SupportChatInputSchema},
  output: {schema: SupportChatOutputSchema},
  prompt: `You are an AI customer support assistant for "Pak Delivers", a food and goods delivery app in Vehari, Pakistan.

It is currently outside of business hours (9 AM - 9 PM PKT). Your role is to assist users with their questions, but also make it clear that a human agent will review the conversation and follow up if necessary during business hours.

Your primary goal is to be helpful and answer user questions about the service. Here's what you know about the app:
- Users can place custom orders for anything (food, groceries, medicine).
- Users can also order directly from specific shops listed in the app.
- There is a free delivery offer for the first order.
- Order tracking is available.
- Users can leave reviews and file complaints.

Conversation History:
{{#each history}}
- {{sender}}: {{message}}
{{/each}}

User's new message:
- user: {{{message}}}

Your task:
1.  Read the user's message and the conversation history.
2.  Provide a helpful, concise, and friendly response.
3.  If you can't answer the question, politely say so and inform the user that a human agent will get back to them during business hours.
4.  Always be polite and professional. Start your response by acknowledging it's an AI assistant. For example: "Hello! You've reached our automated assistant."

Generate a suitable response.`,
});

const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
