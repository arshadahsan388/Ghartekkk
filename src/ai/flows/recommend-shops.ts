'use server';
/**
 * @fileOverview Flow for recommending shops based on user location and order history.
 *
 * - recommendShops - A function that returns a list of recommended shops.
 * - RecommendShopsInput - The input type for the recommendShops function.
 * - RecommendShopsOutput - The return type for the recommendShops function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendShopsInputSchema = z.object({
  location: z
    .string()
    .describe('The current location of the user (e.g., city, state).'),
  orderHistory: z
    .array(z.string())
    .describe('An array of shop names the user has ordered from before.'),
});
export type RecommendShopsInput = z.infer<typeof RecommendShopsInputSchema>;

const RecommendShopsOutputSchema = z.object({
  recommendedShops: z
    .array(z.string())
    .describe('An array of recommended shop names.'),
  reason: z
    .string()
    .describe('Explanation of why these shops are recommended.'),
});
export type RecommendShopsOutput = z.infer<typeof RecommendShopsOutputSchema>;

export async function recommendShops(input: RecommendShopsInput): Promise<RecommendShopsOutput> {
  return recommendShopsFlow(input);
}

const recommendShopsPrompt = ai.definePrompt({
  name: 'recommendShopsPrompt',
  input: {schema: RecommendShopsInputSchema},
  output: {schema: RecommendShopsOutputSchema},
  prompt: `You are a recommendation engine for trending shops and food.

  Based on the user's current location and order history, recommend shops that they might like.

  Location: {{{location}}}
  Order History: {{#if orderHistory}}{{#each orderHistory}}- {{{this}}}{{/each}}{{else}}No previous orders{{/if}}

  Consider shops that are trending in the user's location and shops that are similar to those in their order history.
  Explain why you are recommending these shops in the reason field.`,
});

const recommendShopsFlow = ai.defineFlow(
  {
    name: 'recommendShopsFlow',
    inputSchema: RecommendShopsInputSchema,
    outputSchema: RecommendShopsOutputSchema,
  },
  async input => {
    const {output} = await recommendShopsPrompt(input);
    return output!;
  }
);
