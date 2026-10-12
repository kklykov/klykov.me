// Comportamiento del chat. Se carga con import() al abrirlo (ver Chat.astro y docs/diseno.md).
import {
  MAX_ASSISTANT_CHARS,
  MAX_BODY_BYTES,
  MAX_CHARS,
  MAX_MESSAGES,
  type ChatMessage,
  type ErrorCode,
} from '../../lib/chat/protocol';

interface Strings {
  greeting: string;
  errors: Record<ErrorCode, string>;
}

// Un chat por raíz: se prepara la primera vez y después solo se vuelve a abrir.
const chats = new WeakMap<HTMLElement, () => void>();

export function openChat(root: HTMLElement) {
  let open = chats.get(root);
  if (!open) {
    open = createChat(root);
    chats.set(root, open);
  }
  open();
}

function createChat(root: HTMLElement) {
  const $ = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const trigger = $<HTMLButtonElement>('[data-chat-open]');
  const closed = $<HTMLElement>('[data-chat-closed]');
  const panel = $<HTMLDialogElement>('[data-chat-panel]');
  const log = $<HTMLElement>('[data-chat-log]');
  const live = $<HTMLElement>('[data-chat-live]');
  const form = $<HTMLFormElement>('[data-chat-form]');
  const input = form.querySelector('input')!;
  const strings: Strings = JSON.parse(root.dataset.strings!);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // Móvil: modal a pantalla completa. Escritorio: en línea, dentro del capítulo.
  const mobile = matchMedia('(max-width: 63.999rem)');
  const encoder = new TextEncoder();

  // El historial solo vive en memoria mientras el chat está abierto.
  const history: ChatMessage[] = [];
  let busy = false;
  let request: AbortController | undefined;

  // Bajar al final una vez por frame, aunque lleguen varios trozos de respuesta en el mismo.
  let scrollFrame = 0;
  const scrollDown = () => {
    scrollFrame ||= requestAnimationFrame(() => {
      scrollFrame = 0;
      log.scrollTop = log.scrollHeight;
    });
  };

  function addMessage(role: 'user' | 'ai', text: string) {
    const p = document.createElement('p');
    p.className = role;
    if (role === 'user') {
      const prompt = document.createElement('span');
      prompt.textContent = '›';
      p.append(prompt, ` ${text}`);
    } else p.textContent = text;
    log.append(p);
    scrollDown();
    return p;
  }

  function open() {
    closed.hidden = true;
    if (mobile.matches) {
      panel.showModal();
      fit();
    } else panel.show();
    if (!log.childElementCount) addMessage('ai', strings.greeting);
    input.focus();
  }

  function close() {
    if (!panel.open) return;
    request?.abort(); // una respuesta a medias no debe acabar en una conversación nueva
    busy = false;
    form.removeAttribute('data-busy');
    panel.close();
    closed.hidden = false;
    log.replaceChildren();
    live.textContent = '';
    history.length = 0;
    trigger.focus();
  }

  // Como mucho 10 mensajes, empezando siempre por una pregunta, con las respuestas recortadas como
  // las recorta el servidor. Si aun así no cabe en el cuerpo, se quitan las preguntas más antiguas.
  function body() {
    let messages = (history.length > MAX_MESSAGES ? history.slice(-(MAX_MESSAGES - 1)) : history).map((m) =>
      m.role === 'assistant' ? { ...m, content: m.content.slice(0, MAX_ASSISTANT_CHARS) } : m,
    );
    for (;;) {
      const json = JSON.stringify({ messages, lang: root.dataset.lang });
      if (messages.length <= 1 || encoder.encode(json).length <= MAX_BODY_BYTES) return json;
      messages = messages.slice(2);
    }
  }

  async function ask(question: string) {
    const text = question.trim().slice(0, MAX_CHARS);
    if (!text || busy) return;
    busy = true;
    form.toggleAttribute('data-busy', true);
    input.value = '';
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    const reply = addMessage('ai', '');
    reply.toggleAttribute('data-typing', true);

    let answer = '';
    let failed = false;
    request = new AbortController();
    const { signal } = request;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body(),
        signal,
      });
      if (!response.ok || !response.body) {
        const { code } = await response.json().catch(() => ({ code: 'upstream' }));
        answer = strings.errors[code as ErrorCode] ?? strings.errors.upstream;
        failed = true;
      } else {
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          answer += value;
          // Se pinta mientras llega; con movimiento reducido, de una vez al final.
          if (!reduce.matches) {
            reply.textContent = answer;
            scrollDown();
          }
        }
        if (!answer.trim()) {
          answer = strings.errors.upstream;
          failed = true;
        }
      }
    } catch {
      // También si la respuesta se corta a medias: el servidor cierra la conexión con error.
      answer = strings.errors.upstream;
      failed = true;
    }
    if (signal.aborted) return;

    // Un error se muestra como una respuesta más, pero no entra en el historial.
    if (failed) history.pop();
    else history.push({ role: 'assistant', content: answer });
    reply.textContent = answer;
    reply.removeAttribute('data-typing');
    scrollDown();
    live.textContent = answer; // se anuncia una sola vez, completa
    busy = false;
    form.removeAttribute('data-busy');
  }

  // Móvil: el modal ocupa justo el área visible, que se encoge al abrirse el teclado (en iOS, además,
  // se desplaza). Así el campo queda siempre encima del teclado y la conversación, encima del campo.
  // Una vez por frame: iOS lanza varios eventos seguidos.
  let fitFrame = 0;
  function fit() {
    const viewport = window.visualViewport;
    if (!viewport || !panel.matches(':modal')) return;
    panel.style.setProperty('--chat-h', `${viewport.height}px`);
    panel.style.setProperty('--chat-top', `${viewport.offsetTop}px`);
    scrollDown();
  }
  const scheduleFit = () => {
    fitFrame ||= requestAnimationFrame(() => {
      fitFrame = 0;
      fit();
    });
  };
  window.visualViewport?.addEventListener('resize', scheduleFit);
  window.visualViewport?.addEventListener('scroll', scheduleFit);

  $('[data-chat-close]').addEventListener('click', close);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    ask(input.value);
  });
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-chat-suggestion]')) {
    button.addEventListener('click', () => ask(button.textContent ?? ''));
  }
  // Escape: en el modal llega como "cancel" (se cancela el cierre nativo para limpiar el chat);
  // en línea, como tecla.
  panel.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  return open;
}
