// Contrato de /api/chat, compartido por el cliente y el servidor (docs/chat-ia.md → "Contrato del endpoint").

export const MAX_MESSAGES = 10;
/** Máximo por pregunta. */
export const MAX_CHARS = 500;
/** Las respuestas anteriores del asistente se recortan a esto al reenviarlas. */
const MAX_ASSISTANT_CHARS = 2000;
export const MAX_BODY_BYTES = 8 * 1024;

export type ChatRole = 'user' | 'assistant';
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type ErrorCode = 'invalid' | 'limit_user' | 'limit_global' | 'upstream';

/** Quita HTML y colapsa espacios. */
export const sanitize = (text: string) =>
  text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Valida el historial: alterna usuario/asistente, empieza y acaba en usuario, dentro de los límites. */
export function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;
  const messages: ChatMessage[] = [];
  for (const [i, item] of value.entries()) {
    const role = (item as ChatMessage)?.role;
    const raw = (item as ChatMessage)?.content;
    if (role !== (i % 2 === 0 ? 'user' : 'assistant') || typeof raw !== 'string') return null;
    const content = sanitize(raw);
    if (!content || (role === 'user' && content.length > MAX_CHARS)) return null;
    messages.push({ role, content: content.slice(0, MAX_ASSISTANT_CHARS) });
  }
  return messages.at(-1)!.role === 'user' ? messages : null;
}
