import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateAIResponse(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    return '';
  } catch (error) {
    console.error('Error generating Claude response:', error);
    throw error;
  }
}
