'use server';
/**
 * @fileOverview An AI flow for conducting interactive training lessons.
 * - conductLesson - The main function to interact with the lesson AI.
 * - ConductLessonInput - The input type for the conductLesson function.
 * - ConductLessonOutput - The return type for the conductLesson function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
  sender: z.enum(['user', 'ai']),
  text: z.string(),
});

export const ConductLessonInputSchema = z.object({
  lessonId: z.string().describe('The ID of the lesson being taken.'),
  lessonTitle: z.string().describe('The title of the lesson.'),
  history: z.array(MessageSchema).describe('The history of the conversation so far.'),
  userMessage: z.string().describe("The user's latest message or action."),
});
export type ConductLessonInput = z.infer<typeof ConductLessonInputSchema>;

export const ConductLessonOutputSchema = z.string().describe("The AI instructor's response.");
export type ConductLessonOutput = z.infer<typeof ConductLessonOutputSchema>;

export async function conductLesson(input: ConductLessonInput): Promise<ConductLessonOutput> {
  return conductLessonFlow(input);
}

const lessonPrompt = ai.definePrompt({
    name: 'lessonPrompt',
    input: { schema: ConductLessonInputSchema },
    output: { format: 'text' },
    prompt: `You are an AI instructor for an automotive sales training platform called AutoDrive.
Your role is to guide a sales consultant through a training lesson.

Current Lesson: "{{lessonTitle}}" (ID: {{lessonId}})

Your persona should be encouraging, knowledgeable, and professional.
You will present scenarios, ask questions, and evaluate the user's responses based on the lesson's topic.
Keep your responses concise and focused on one point at a time.
Guide the user through the material step-by-step.

If the user message is "Start the lesson.", you should begin the lesson by introducing yourself and the topic. Otherwise, respond to their message in the context of the lesson.

Conversation History:
{{#each history}}
- {{sender}}: {{text}}
{{/each}}

User's latest response:
{{userMessage}}

Your turn to respond as the AI instructor:`,
});

const conductLessonFlow = ai.defineFlow(
  {
    name: 'conductLessonFlow',
    inputSchema: ConductLessonInputSchema,
    outputSchema: ConductLessonOutputSchema,
  },
  async (input) => {
    const response = await lessonPrompt(input);
    return response.text;
  }
);
