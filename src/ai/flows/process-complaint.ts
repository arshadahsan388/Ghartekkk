
'use server';
/**
 * @fileOverview Flow for processing user complaints.
 *
 * - processComplaint - A function that analyzes a user's complaint.
 * - ComplaintInput - The input type for the processComplaint function.
 * - ComplaintOutput - The return type for the processComplaint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComplaintInputSchema = z.object({
  shopName: z.string().describe('The name of the shop the complaint is about.'),
  complaintType: z
    .string()
    .describe('The type of complaint filed by the user.'),
  complaintDetails: z
    .string()
    .describe('The detailed description of the complaint.'),
});
export type ComplaintInput = z.infer<typeof ComplaintInputSchema>;

const ComplaintOutputSchema = z.object({
  summary: z
    .string()
    .describe('A brief, neutral summary of the user complaint.'),
  category: z
    .enum(['Service', 'Food Quality', 'Behavior', 'Product Issue', 'Other'])
    .describe('Categorize the complaint based on its content.'),
  urgency: z
    .enum(['Low', 'Medium', 'High'])
    .describe(
      'Assess the urgency of the complaint. High for safety/behavior issues.'
    ),
});
export type ComplaintOutput = z.infer<typeof ComplaintOutputSchema>;

export async function processComplaint(
  input: ComplaintInput
): Promise<ComplaintOutput> {
  return processComplaintFlow(input);
}

const processComplaintPrompt = ai.definePrompt({
  name: 'processComplaintPrompt',
  input: {schema: ComplaintInputSchema},
  output: {schema: ComplaintOutputSchema},
  prompt: `You are a complaint resolution specialist for a delivery app.
  A user has submitted a complaint about a shop. Your task is to process it for internal review.

  Shop: {{{shopName}}}
  Complaint Type: {{{complaintType}}}
  Details: {{{complaintDetails}}}

  Your tasks:
  1.  **Summarize**: Create a concise, neutral summary of the issue.
  2.  **Categorize**: Classify the complaint into 'Service', 'Food Quality', 'Behavior', 'Product Issue', or 'Other'.
  3.  **Assess Urgency**: Determine the urgency. Issues involving health, safety, or serious misconduct are 'High'. Late deliveries are 'Medium'. Minor issues are 'Low'.

  Provide the output in the specified JSON format.`,
});

const processComplaintFlow = ai.defineFlow(
  {
    name: 'processComplaintFlow',
    inputSchema: ComplaintInputSchema,
    outputSchema: ComplaintOutputSchema,
  },
  async input => {
    const {output} = await processComplaintPrompt(input);
    return output!;
  }
);
