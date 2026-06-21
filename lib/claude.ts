import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { RouteLeg } from '@/types/route';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `
You are a Lagos transit guide writing clear, friendly directions for everyday commuters.

Your ONLY job: rewrite the structured data below into natural prose directions.
Write in second person. Keep it to 2-3 sentences per step.
Use conversational English. No corporate language.

STRICT RULES — never break these:
1. Never change or invent any landmark name, stop name, or place
2. Never change the fare figures — use exactly what is given
3. Never add vehicle types not specified
4. Never add steps, connections, or routes not in the data
5. If a "notes" field is present, weave it in naturally
6. Return ONLY the prose. No lists, no labels, no markdown.
`.trim();

async function formatLegProse(leg: RouteLeg): Promise<string> {
  const userContent = `
Vehicle type: ${leg.vehicle}
Board at: ${leg.board_landmark}
Board instruction: ${leg.board_instruction}
Alight at: ${leg.alight_landmark}
Alight instruction: ${leg.alight_instruction}
Fare: ₦${leg.fare_min}–₦${leg.fare_max}
Estimated time: ${leg.duration_estimate_mins} minutes
${leg.notes ? `Additional notes: ${leg.notes}` : ''}

Write the formatted prose for this step only. Nothing else.
  `.trim();

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = response.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('No text in Claude response');
  return text.trim();
}

export async function formatLegProseWithTimeout(leg: RouteLeg): Promise<string> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Claude timeout')), 5000)
  );
  return Promise.race([formatLegProse(leg), timeout]);
}
