
'use server';
/**
 * @fileOverview A customer support AI chatbot for automated replies.
 *
 * - autoReply - A function that handles the AI auto-reply process.
 * - AutoReplyInput - The input type for the autoReply function.
 * - AutoReplyOutput - The return type for the autoReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoReplyInputSchema = z.object({
  message: z.string().describe('The user\'s message to the support chat.'),
  history: z.array(z.object({
    sender: z.enum(['user', 'admin']),
    message: z.string(),
  })).describe('The history of the conversation so far.'),
});
export type AutoReplyInput = z.infer<typeof AutoReplyInputSchema>;

const AutoReplyOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
});
export type AutoReplyOutput = z.infer<typeof AutoReplyOutputSchema>;

export async function autoReply(input: AutoReplyInput): Promise<AutoReplyOutput> {
  return autoReplyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoReplyPrompt',
  input: {schema: AutoReplyInputSchema},
  output: {schema: AutoReplyOutputSchema},
  prompt: `You are an AI customer support assistant for "Pak Delivers", a food and goods delivery app in Vehari, Pakistan.

Your role is to provide helpful, friendly, and immediate assistance to users.

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
3.  If you can't answer the question, politely say so and inform the user that a human agent will review the conversation and get back to them.
4.  Always be polite and professional.

Generate a suitable response.`,
});

const autoReplyFlow = ai.defineFlow(
  {
    name: 'autoReplyFlow',
    inputSchema: AutoReplyInputSchema,
    outputSchema: AutoReplyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
