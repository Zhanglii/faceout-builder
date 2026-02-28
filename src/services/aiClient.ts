// Placeholder for AI integration (e.g. OpenAI, local model, etc.)

export async function analyzeSnapshot(text: string): Promise<string> {
  // forward to local API server that talks to OpenAI
  const resp = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || 'server error');
  }
  const data = await resp.json();
  return data.result;
}
