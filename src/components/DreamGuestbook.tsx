import React, { useState, useEffect } from 'react';
import { useAtelier } from '../context/AtelierContext';
import { playSparkle, playSnap } from '../utils/soundEngine';
import confetti from 'canvas-confetti';
import { BookOpen, Send, MessageSquare } from 'lucide-react';

export interface GuestbookWish {
  id: string;
  author: string;
  message: string;
  emotion: 'Hope' | 'Wonder' | 'Peace' | 'Courage';
  timestamp: string;
}

const STORAGE_GUESTBOOK = 'lumi_guestbook_wishes_v1';

const INITIAL_WISHES: GuestbookWish[] = [
  {
    id: 'wish-1',
    author: 'Lyra the Cloud Gardener',
    message: 'May phosphorescent orchids sing sweet lullabies to every sleeping baby tonight.',
    emotion: 'Peace',
    timestamp: 'Just before twilight',
  },
  {
    id: 'wish-2',
    author: 'Barnaby the Mist Watcher',
    message: 'No fog is too thick when a mended dream carries its own starlight beacon.',
    emotion: 'Hope',
    timestamp: 'Midnight chime',
  },
  {
    id: 'wish-3',
    author: 'Pip the Little Dreamer',
    message: 'I tucked my silver moonflower under my pillow so the stars never fade!',
    emotion: 'Wonder',
    timestamp: 'Bedtime hour',
  },
  {
    id: 'wish-4',
    author: 'Elder Thistle-Moth',
    message: 'Spun threads of starlight will always hold stronger than any nightmare.',
    emotion: 'Courage',
    timestamp: 'First star rise',
  },
];

const API_GUESTBOOK = '/api/guestbook';
const SESSION_VISIT = 'lumi_visit_counted_v1';

interface RemoteWish {
  id: string;
  author: string;
  message: string;
  emotion: GuestbookWish['emotion'];
  createdAt: number;
}

const timeAgo = (createdAt: number) => {
  const mins = Math.round((Date.now() - createdAt) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} nights ago`;
};

const toWish = (w: RemoteWish): GuestbookWish => ({
  id: w.id,
  author: w.author,
  message: w.message,
  emotion: w.emotion,
  timestamp: timeAgo(w.createdAt),
});

const loadLocalWishes = (): GuestbookWish[] => {
  try {
    const stored = localStorage.getItem(STORAGE_GUESTBOOK);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_WISHES;
};

export const DreamGuestbook: React.FC = () => {
  const { state, lumiSay } = useAtelier();
  const [wishes, setWishes] = useState<GuestbookWish[]>(loadLocalWishes);
  // 'live' once the Netlify Blobs backend answers; 'offline' keeps the wall in this browser only.
  const [backend, setBackend] = useState<'connecting' | 'live' | 'offline'>('connecting');
  const [visits, setVisits] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [authorInput, setAuthorInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<'Hope' | 'Wonder' | 'Peace' | 'Courage'>('Hope');
  const [filter, setFilter] = useState<string>('All');

  // Vintage hit counter odometer: real global visits when live, otherwise a cozy local estimate
  const baseCount = 1204;
  const deliveredCount = state.deliveriesCompleted.length * 3;
  const totalCount = visits !== null ? baseCount + visits : baseCount + deliveredCount + wishes.length;

  useEffect(() => {
    let cancelled = false;
    const connect = async () => {
      try {
        const res = await fetch(API_GUESTBOOK, { headers: { accept: 'application/json' } });
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) throw new Error('offline');
        const data: { wishes: RemoteWish[]; visits: number } = await res.json();
        if (cancelled) return;
        // Seeded neighbours stay pinned at the bottom of the shared wall.
        setWishes([...data.wishes.map(toWish), ...INITIAL_WISHES]);
        setVisits(data.visits);
        setBackend('live');

        if (!sessionStorage.getItem(SESSION_VISIT)) {
          sessionStorage.setItem(SESSION_VISIT, '1');
          const visitRes = await fetch(`${API_GUESTBOOK}?visit=1`, { method: 'POST' });
          if (visitRes.ok && !cancelled) setVisits((await visitRes.json()).visits);
        }
      } catch {
        if (!cancelled) setBackend('offline');
      }
    };
    connect();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (backend !== 'offline') return;
    try {
      localStorage.setItem(STORAGE_GUESTBOOK, JSON.stringify(wishes));
    } catch {
      // storage full
    }
  }, [wishes, backend]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    let newWish: GuestbookWish = {
      id: `wish-${Date.now()}`,
      author: authorInput.trim() || 'A Gentle Dreamer',
      message: messageInput.trim().slice(0, 120),
      emotion: selectedEmotion,
      timestamp: 'Just now',
    };

    if (backend === 'live') {
      setIsSending(true);
      try {
        const res = await fetch(API_GUESTBOOK, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ author: newWish.author, message: newWish.message, emotion: newWish.emotion }),
        });
        if (!res.ok) throw new Error('rejected');
        newWish = toWish((await res.json()).wish);
      } catch {
        setIsSending(false);
        lumiSay?.('The starlight thread snapped on the way to the wall. Could you try pinning it again?', 'sleepy');
        return;
      }
      setIsSending(false);
    }

    setWishes((prev) => [newWish, ...prev]);
    setAuthorInput('');
    setMessageInput('');
    playSparkle(state.isMuted);

    lumiSay?.(`A new dream wish from ${newWish.author} has been hung on the atelier wall!`, 'celebrating');

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        colors: ['#F4C96B', '#D995B7', '#B9A5E8', '#FFF8F1'],
      });
    } catch {
      // fallback
    }
  };

  const filteredWishes = filter === 'All' ? wishes : wishes.filter((w) => w.emotion === filter);

  return (
    <section
      id="guestbook"
      aria-labelledby="guestbook-heading"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12"
    >
      {/* Header & Vintage Odometer Counter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)] mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Community Dream Registry</span>
          </div>
          <div
            role="status"
            className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--text-muted)] mb-2"
          >
            <span
              aria-hidden="true"
              className={`w-2 h-2 rounded-full ${
                backend === 'live' ? 'bg-emerald-400 animate-pulse' : backend === 'connecting' ? 'bg-[#F4C96B] animate-pulse' : 'bg-[var(--text-muted)]'
              }`}
            />
            <span>
              {backend === 'live' ? 'Live · shared with every dreamer' : backend === 'connecting' ? 'Connecting to the wall…' : 'Offline · saved in this browser'}
            </span>
          </div>
          <h2 id="guestbook-heading" className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
            The Sleepers' Guestbook Wall
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Leave a bedtime wish or message for the sleeping world before sunrise.
          </p>
        </div>

        {/* Vintage Odometer Hit Counter (+1 pt side quest) */}
        <div className="p-3.5 rounded-2xl bg-[#191326] border-2 border-[#F4C96B]/50 shadow-xl flex flex-col items-center select-none">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#F4C96B] mb-1">
            ✦ Dreams Delivered Worldwide ✦
          </span>
          <div className="flex items-center gap-1">
            {String(totalCount)
              .padStart(5, '0')
              .split('')
              .map((digit, i) => (
                <span
                  key={i}
                  className="w-7 h-9 flex items-center justify-center bg-[#29213F] text-[#F4C96B] text-lg font-mono font-bold rounded border border-[#F4C96B]/30 shadow-inner"
                >
                  {digit}
                </span>
              ))}
          </div>
          <span className="text-[9px] font-mono text-[var(--text-muted)] mt-1">
            {visits !== null ? 'Live visitor odometer' : 'Vintage Mechanical Counter Odometer'}
          </span>
        </div>
      </div>

      {/* Main Grid: Leave Wish Form + Wish List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Submit Wish Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-glow)] shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
            <MessageSquare className="w-4 h-4 text-[#F4C96B]" />
            <span>Hang a Wish on the Wall</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="wish-author" className="font-bold text-[var(--text-muted)] uppercase block mb-1">
                Your Name / Dreamer Handle:
              </label>
              <input
                id="wish-author"
                type="text"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value.slice(0, 24))}
                placeholder="e.g. Starlight Traveler"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold text-xs focus:border-[var(--accent-gold)] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="wish-message" className="font-bold text-[var(--text-muted)] uppercase block mb-1">
                Your Bedtime Wish (Max 120 chars):
              </label>
              <textarea
                id="wish-message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value.slice(0, 120))}
                rows={3}
                placeholder="Write a sweet wish for someone sleeping across the night sky..."
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium text-xs focus:border-[var(--accent-gold)] focus:outline-none resize-none"
              />
              <span className="text-[10px] text-[var(--text-muted)] text-right block mt-0.5">
                {messageInput.length}/120
              </span>
            </div>

            <div>
              <span className="font-bold text-[var(--text-muted)] uppercase block mb-1.5">
                Emotion Seal:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Hope', 'Wonder', 'Peace', 'Courage'] as const).map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => {
                      setSelectedEmotion(emotion);
                      playSnap(state.isMuted);
                    }}
                    className={`p-2 rounded-xl border font-bold text-[11px] transition-all text-center ${
                      selectedEmotion === emotion
                        ? 'border-[#F4C96B] bg-[#F4C96B]/20 text-[var(--text-primary)] shadow-sm'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)]'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="disabled:opacity-60 disabled:cursor-wait w-full py-3.5 rounded-full font-bold text-xs bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow-md hover:shadow-lg hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Pinning to the wall…' : 'Pin Wish with Starlight Thread'}</span>
            </button>
          </form>
        </div>

        {/* Right: Wishes Wall Display */}
        <div className="lg:col-span-7 space-y-4">
          {/* Emotion Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[var(--text-muted)] font-semibold text-[11px]">Filter:</span>
            {['All', 'Hope', 'Wonder', 'Peace', 'Courage'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFilter(tag)}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  filter === tag
                    ? 'bg-[var(--accent-gold)] text-[#453026] shadow-sm'
                    : 'bg-[var(--surface-badge)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
            {filteredWishes.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:border-[var(--border-glow)] transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[var(--text-primary)]">
                      {w.author}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
                      {w.emotion}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {w.timestamp}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] font-serif italic leading-relaxed">
                  "{w.message}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
