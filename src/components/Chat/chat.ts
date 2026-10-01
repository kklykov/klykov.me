// Comportamiento del chat. Se carga con import() al abrirlo (ver Chat.astro y docs/diseno.md).
import { MAX_CHARS, MAX_MESSAGES, type ChatMessage, type ErrorCode } from '../../lib/chat/protocol';

interface Strings {
  greeting: string;
  errors: Record<ErrorCode, string>;
}

const initialized = new WeakSet<HTMLElement>();

export function openChat(root: HTMLElement) {
  const $ = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const trigger = $<HTMLButtonElement>('[data-chat-open]');
  const closed = $<HTMLElement>('[data-chat-closed]');
  const panel = $<HTMLElement>('[data-chat-panel]');
  const log = $<HTMLElement>('[data-chat-log]');
  const live = $<HTMLElement>('[data-chat-live]');
  const form = $<HTMLFormElement>('[data-chat-form]');
  const input = form.querySelector('input')!;
  const chapter = root.closest<HTMLElement>('[data-chapter]');
  const strings: Strings = JSON.parse(root.dataset.strings!);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // El historial solo vive en memoria mientras el chat está abierto.
  const history: ChatMessage[] = [];
  let busy = false;
  let request: AbortController | undefined;

  const scrollDown = () => (log.scrollTop = log.scrollHeight);

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
    panel.hidden = false;
    chapter?.toggleAttribute('data-chat-open', true);
    if (!log.childElementCount) addMessage('ai', strings.greeting);
    input.focus();
  }

  function close() {
    request?.abort(); // una respuesta a medias no debe acabar en una conversación nueva
    busy = false;
    form.removeAttribute('data-busy');
    panel.hidden = true;
    closed.hidden = false;
    chapter?.removeAttribute('data-chat-open');
    log.replaceChildren();
    live.textContent = '';
    history.length = 0;
    trigger.focus();
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
      // Como mucho 10 mensajes, empezando siempre por una pregunta.
      const messages = history.length > MAX_MESSAGES ? history.slice(-(MAX_MESSAGES - 1)) : history;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages, lang: root.dataset.lang }),
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

  // Móvil: al abrirse el teclado, el navegador centra el campo y deja un hueco debajo. El formulario
  // se coloca justo encima del teclado y, al cerrarse, la página vuelve a donde estaba.
  // En la línea temporal horizontal no: ahí desplazar la página mueve la pista.
  function followKeyboard() {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const timeline = root.closest<HTMLElement>('[data-timeline]');
    let full = 0; // alto visible antes de abrirse el teclado
    let before = 0; // desplazamiento de la página antes de abrirse el teclado
    let lifted = false;

    input.addEventListener('focus', () => {
      if (lifted) return;
      full = viewport.height;
      before = scrollY;
    });
    viewport.addEventListener('resize', () =>
      requestAnimationFrame(() => {
        if (timeline?.dataset.mode === 'horizontal') return;
        const keyboard = full - viewport.height > 150; // más que las barras del navegador
        if (keyboard && document.activeElement === input) {
          const gap = form.getBoundingClientRect().bottom + 16 - (viewport.offsetTop + viewport.height);
          if (Math.abs(gap) > 1) scrollBy({ top: gap, behavior: 'instant' });
          lifted = true;
        } else if (lifted && !keyboard) {
          scrollTo({ top: before, behavior: 'instant' });
          lifted = false;
        }
      }),
    );
  }

  if (!initialized.has(root)) {
    initialized.add(root);
    $('[data-chat-close]').addEventListener('click', close);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      ask(input.value);
    });
    for (const button of root.querySelectorAll<HTMLButtonElement>('[data-chat-suggestion]')) {
      button.addEventListener('click', () => ask(button.textContent ?? ''));
    }
    panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    followKeyboard();
  }
  open();
}
