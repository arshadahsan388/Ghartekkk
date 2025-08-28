
'use server';
/**
 * @fileOverview Flow for generating search suggestions.
 *
 * - getSearchSuggestions - A function that generates search suggestions based on a query.
 * - SearchSuggestionInput - The input type for the getSearchSuggestions function.
 * - SearchSuggestionOutput - The return type for the getSearchSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchSuggestionInputSchema = z.object({
  query: z.string().describe('The user\'s search query.'),
});
export type SearchSuggestionInput = z.infer<typeof SearchSuggestionInputSchema>;

const SearchSuggestionOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of 5 relevant search suggestions.'),
});
export type SearchSuggestionOutput = z.infer<
  typeof SearchSuggestionOutputSchema
>;

export async function getSearchSuggestions(
  input: SearchSuggestionInput
): Promise<SearchSuggestionOutput> {
  return getSearchSuggestionsFlow(input);
}

const getSearchSuggestionsPrompt = ai.definePrompt({
  name: 'getSearchSuggestionsPrompt',
  input: {schema: SearchSuggestionInputSchema},
  output: {schema: SearchSuggestionOutputSchema},
  prompt: `You are a helpful search assistant for "GharTek", a delivery app in Vehari, Pakistan. The app delivers food, groceries, medicine, and custom items.

Given the user's current search query, generate a list of 5 relevant and likely search suggestions. The suggestions should be concise and cover common items users might order.

User's query: {{{query}}}

Provide the output in the specified JSON format.`,
});

const getSearchSuggestionsFlow = ai.defineFlow(
  {
    name: 'getSearchSuggestionsFlow',
    inputSchema: SearchSuggestionInputSchema,
    outputSchema: SearchSuggestionOutputSchema,
  },
  async input => {
    const {output} = await getSearchSuggestionsPrompt(input);
    return output!;
  }
);
