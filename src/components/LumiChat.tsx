import React, { useState, useEffect, useRef } from 'react';
import { useAtelier } from '../context/AtelierContext';
import { playChime, playSparkle } from '../utils/soundEngine';
import { X, Send, Sparkles, Moon, Star, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'lumi';
  text: string;
  timestamp: string;
}

const AI_CHAT_ENDPOINT = '/api/lumi-chat';

const QUICK_PROMPTS = [
  'How did you find your first star?',
  'Why do dreams break?',
  'What does moonlight thread feel like?',
  'Can you repair scary nightmares?',
  'What is your secret bedtime recipe?',
  'Tell me about Workshop No. 07!',
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    sender: 'lumi',
    text: "Hullo! I'm Lumi, the apprentice dream mender of Workshop No. 07. If a dream of yours feels a little torn or cloudy tonight, we can mend it together. What's on your mind?",
    timestamp: 'Just now',
  },
];

function generateLumiResponse(query: string, visitorName: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('first star') || lower.includes('find') || lower.includes('polara')) {
    return "I found my first star caught inside an old brass teacup on a misty Tuesday! It had fallen through a cloud seam. When I polished it with my rose scarf, it hummed in G-minor. That's when Master Barnaby told me I had the touch of a mender.";
  }

  if (lower.includes('break') || lower.includes('fragile') || lower.includes('torn')) {
    return 'Dreams break when waking worries blow through open bedroom windows like cold draft wind. A forgotten teddy bear, a math test tomorrow, or a sudden clap of thunder. But the good news is: dream porcelain mends stronger than before when joined with starlight dust!';
  }

  if (lower.includes('thread') || lower.includes('moonlight') || lower.includes('loom')) {
    return 'Moonlight thread feels like cold silver silk, yet warm against your fingers—just like hot cocoa on a winter sill. We spin it from midnight dew harvested from phosphorescent moonflowers!';
  }

  if (lower.includes('nightmare') || lower.includes('scary') || lower.includes('fear') || lower.includes('monster')) {
    return "Even the tallest nightmares are just tiny fears wearing big shadows. I simply tuck a warm sprig of dream-lavender beneath their pillows and tune their lantern to rose-gold. Shadows always melt into friendly lullabies when faced with gentle warmth.";
  }

  if (lower.includes('recipe') || lower.includes('sleep') || lower.includes('bedtime') || lower.includes('tired')) {
    return 'My bedtime recipe: two drops of chamomile starlight, one warm cup of honey-milk, your softest blanket tucked right up to your chin, and counting three slow deep breaths. Try it tonight!';
  }

  if (lower.includes('workshop') || lower.includes('atelier') || lower.includes('no. 07') || lower.includes('no 7')) {
    return 'Workshop No. 07 sits nestled between the third and fourth rings of Saturn! We have a celestial loom, three rows of glowing crystal jars, and a copper kettle that hums lullabies whenever the stars align.';
  }

  if (lower.includes('lantern') || lower.includes('glow') || lower.includes('color')) {
    return 'Each lantern color carries its own lullaby frequency: Gold radiates cozy courage, Lavender brings tranquil sleep, Rose wraps you in sweet love, and Ice brings crystalline clarity to cluttered thoughts. Which is your favorite?';
  }

  if (lower.includes('moth') || lower.includes('wings') || lower.includes('antennae')) {
    return "My wings are powdered with celestial stardust! They flutter soft as a sigh so I never wake sleeping infants when delivering dreams to their cribs. And my crescent antennae can sense a child's smile from two star-systems away!";
  }

  if (lower.includes('hax') || lower.includes('hackathon') || lower.includes('baby') || lower.includes('judge')) {
    return `Oh! Welcome honored traveler${visitorName ? ` ${visitorName}` : ''}! The haX.baby Bedtime universe is my absolute favorite place. Every tiny code line you see here was woven with love, procedural audio, and zero runtime bloat so your dreams never crash!`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('hullo')) {
    return `Hullo${visitorName ? ` ${visitorName}` : ''}! The stars are shining especially bright over the atelier tonight. Are you getting ready for bed, or tinkering on a dream of your own?`;
  }

  if (lower.includes('thank') || lower.includes('thanks')) {
    return "You're ever so welcome! May your sleep be as soft as moth velvet and your pillows always stay on the cool side tonight.";
  }

  // Poetic Apprentice Fallback
  const fallbacks = [
    `That is such a thoughtful question${visitorName ? `, ${visitorName}` : ''}. In the atelier we say that every wonder begins with a single speck of dust that decided to shine. Keep that wonder close tonight!`,
    'I will write that down in my apprentice pocketbook with silver ink! Even the smallest thoughts can guide a lantern through the night fog.',
    'When the night gets deep, words like that turn into starlight. Breathe easy, rest your eyelids, and let the dream wind carry you home safely.',
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export const LumiChat: React.FC = () => {
  const { state, visitor } = useAtelier();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // null until the first reply: true = Claude-powered Lumi, false = rule-based pocketbook replies
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem('lumi_chat_history_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_MESSAGES;
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('lumi_chat_history_v1', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isTyping]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    playChime(state.isMuted, 659.25); // E5

    setIsTyping(true);

    const deliver = (replyText: string) => {
      const lumiMsg: ChatMessage = {
        id: `lumi-${Date.now()}`,
        sender: 'lumi',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, lumiMsg]);
      setIsTyping(false);
      playSparkle(state.isMuted);
    };

    // Ask the AI moth first; if the backend is missing, busy or offline, Lumi's
    // rule-based pocketbook answers instead so the chat never breaks.
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(AI_CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          visitorName: visitor.visitorName,
          messages: history
            .filter((m) => !m.id.startsWith('msg-init'))
            .map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        }),
      });
      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) throw new Error(`status ${res.status}`);
      const data: { reply?: string } = await res.json();
      if (!data.reply) throw new Error('empty');
      setAiOnline(true);
      deliver(data.reply);
    } catch {
      setAiOnline(false);
      window.setTimeout(() => deliver(generateLumiResponse(query, visitor.visitorName)), 400);
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    playChime(state.isMuted, 440);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            playChime(state.isMuted, 587.33);
          }}
          aria-expanded={isOpen}
          aria-controls="lumi-chat-dialog"
          aria-label={isOpen ? 'Close chat with Lumi' : 'Open chat with Lumi'}
          className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-[#1E2342] to-[#2B1B48] border-2 border-[#F4C96B]/50 hover:border-[#F4C96B] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(244,201,107,0.3)] hover:scale-105 active:scale-95 transition-all text-[var(--text-primary)]"
        >
          {/* Glowing Moth Antennae Avatar Indicator */}
          <div className="relative w-8 h-8 rounded-full bg-[#F4C96B]/20 border border-[#F4C96B] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#F4C96B] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#1E2342] animate-pulse" />
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold font-serif flex items-center gap-1.5 text-[var(--accent-gold)]">
              <span>Ask Lumi</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F4C96B]/20 text-[#F4C96B] font-mono" title={aiOnline === false ? 'AI is resting, so Lumi answers from the pocketbook of stories' : 'Powered by Claude'}>
                {aiOnline === false ? 'Story Moth' : 'AI Moth'}
              </span>
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Workshop No. 07</div>
          </div>
        </button>
      </div>

      {/* Chat Window Dialog */}
      {isOpen && (
        <div
          id="lumi-chat-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Chat with Lumi the Moon Moth"
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[580px] h-[540px] flex flex-col rounded-3xl bg-[var(--bg-card)]/95 border border-[var(--border-glow)] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(244,201,107,0.2)] backdrop-blur-xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-color)] bg-gradient-to-r from-[#F4C96B]/15 via-transparent to-[#B9A5E8]/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F4C96B] to-[#D995B7] p-[2px] shadow-sm">
                <div className="w-full h-full rounded-full bg-[#12162E] flex items-center justify-center">
                  <Moon className="w-5 h-5 text-[#F4C96B]" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold font-serif text-[var(--text-primary)] flex items-center gap-1.5">
                  Lumi the Moon Moth
                  <Star className="w-3.5 h-3.5 fill-[#F4C96B] text-[#F4C96B]" />
                </h3>
                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Mending dreams at Workshop No. 07
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation"
                aria-label="Reset conversation"
                className="p-1.5 rounded-full hover:bg-[var(--surface-badge)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close dialogue drawer"
                className="p-1.5 rounded-full hover:bg-[var(--surface-badge)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-[#D995B7] to-[#B9A5E8] text-[#12162E] font-medium rounded-tr-none shadow-md'
                      : 'bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[var(--accent-gold)] p-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span className="italic">Lumi is spinning a starlight thought...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 border-t border-[var(--border-color)] bg-[var(--bg-glass)] overflow-x-auto flex gap-1.5 no-scrollbar">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] bg-[var(--surface-badge)] hover:bg-[#F4C96B]/20 border border-[var(--border-color)] hover:border-[#F4C96B]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lumi about stars, dreams, lanterns..."
              className="flex-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message to Lumi"
              className="p-2 rounded-xl bg-gradient-to-r from-[#F4C96B] to-[#D995B7] text-[#12162E] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
