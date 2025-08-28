
'use server';
/**
 * @fileOverview Flow for processing custom orders.
 *
 * - processCustomOrder - A function that processes a user's custom order request.
 * - CustomOrderInput - The input type for the processCustomOrder function.
 * - CustomOrderOutput - The return type for the processCustomOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomOrderInputSchema = z.object({
  description: z
    .string()
    .describe('A detailed description of the items the user wants to order.'),
  budget: z.number().describe('The maximum amount the user is willing to pay.'),
  address: z.string().describe('The delivery address for the order.'),
  additionalNote: z.string().optional().describe('Any additional notes or special instructions from the user.')
});
export type CustomOrderInput = z.infer<typeof CustomOrderInputSchema>;

const CustomOrderOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the parsed order.'),
  suggestedShop: z
    .string()
    .describe(
      'A suggested shop type (e.g., Grocery Store, Pharmacy, Restaurant) based on the order description.'
    ),
  isFeasible: z
    .boolean()
    .describe(
      'Whether the order seems feasible within the given budget and description.'
    ),
  estimatedCost: z.number().describe('An estimated cost for the items.'),
});
export type CustomOrderOutput = z.infer<typeof CustomOrderOutputSchema>;

export async function processCustomOrder(
  input: CustomOrderInput
): Promise<CustomOrderOutput> {
  return processCustomOrderFlow(input);
}

const processCustomOrderPrompt = ai.definePrompt({
  name: 'processCustomOrderPrompt',
  input: {schema: CustomOrderInputSchema},
  output: {schema: CustomOrderOutputSchema},
  prompt: `You are an intelligent order processing agent for a delivery app in Vehari, Pakistan.
  A user has submitted a custom order. Your task is to analyze the order description, budget, and address to determine its feasibility and suggest a course of action.

  User's Order:
  - Description: {{{description}}}
  - Budget: Rs. {{{budget}}}
  - Delivery Address: {{{address}}}
  {{#if additionalNote}}- Additional Note: {{{additionalNote}}}{{/if}}

  Your tasks:
  1.  **Summarize the order**: Create a concise summary of what the user is asking for.
  2.  **Suggest a Shop Type**: Based on the items, classify the order into "Grocery", "Medical", "Restaurant", or "General Store".
  3.  **Estimate Cost**: Based on common prices in a city like Vehari, estimate the total cost of the items.
  4.  **Assess Feasibility**: Compare your estimated cost with the user's budget. If the budget is sufficient, mark 'isFeasible' as true. Otherwise, mark it as false.

  Provide the output in the specified JSON format.`,
});

const processCustomOrderFlow = ai.defineFlow(
  {
    name: 'processCustomOrderFlow',
    inputSchema: CustomOrderInputSchema,
    outputSchema: CustomOrderOutputSchema,
  },
  async input => {
    const {output} = await processCustomOrderPrompt(input);
    return output!;
  }
);
