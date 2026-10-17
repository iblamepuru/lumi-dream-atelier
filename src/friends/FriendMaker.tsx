import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Dices, Download, Heart, Wand2, X } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { playChime, playSnap, playSparkle } from '../utils/soundEngine';
import { DreamFriend, type DreamFriendHandle } from './DreamFriend';
import {
  ACCESSORIES,
  COLORS,
  DEFAULT_FRIEND,
  DEFAULT_KIND_COLOR,
  KINDS,
  MOODS,
  SKIN_TONES,
  randomFriend,
  type FriendConfig,
} from './friendOptions';

const CURRENT_KEY = 'lumi_dream_friend_v1';
const SHELF_KEY = 'lumi_friend_shelf_v1';
const SHELF_SIZE = 6;
const HAIR_COLORS = ['#5C4033', '#2A2340', '#C77D4A', '#E8C07A', '#B9A5E8', '#D995B7'];

interface ShelfFriend extends FriendConfig {
  id: string;
}

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
};

const loadShelf = (): ShelfFriend[] => {
  try {
    const raw = localStorage.getItem(SHELF_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, SHELF_SIZE) : [];
  } catch {
    return [];
  }
};

const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable: the maker still works for this visit
  }
};

const chipClass = (active: boolean) =>
  `px-3 py-2 rounded-xl border text-xs font-bold transition-all min-h-[40px] ${
    active
      ? 'border-[#F4C96B] bg-[#F4C96B]/20 text-[var(--text-primary)] shadow-sm'
      : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-glow)]'
  }`;

export const FriendMaker: React.FC = () => {
  const { state, lumiSay } = useAtelier();
  const [friend, setFriend] = useState<FriendConfig>(() => load(CURRENT_KEY, DEFAULT_FRIEND));
  const [shelf, setShelf] = useState<ShelfFriend[]>(loadShelf);
  const [wiggle, setWiggle] = useState(0);
  const friendRef = useRef<DreamFriendHandle>(null);

  useEffect(() => save(CURRENT_KEY, friend), [friend]);
  useEffect(() => save(SHELF_KEY, shelf), [shelf]);

  const kindInfo = KINDS.find((k) => k.id === friend.kind) ?? KINDS[0];

  const update = (patch: Partial<FriendConfig>) => {
    setFriend((prev) => ({ ...prev, ...patch }));
    setWiggle((w) => w + 1);
    playSnap(state.isMuted);
  };

  const chooseKind = (kind: FriendConfig['kind']) => update({ kind, color: DEFAULT_KIND_COLOR[kind] });

  const surprise = () => {
    setFriend(randomFriend());
    setWiggle((w) => w + 1);
    playChime(state.isMuted, 880);
  };

  const adopt = () => {
    const entry: ShelfFriend = { ...friend, name: friend.name.trim() || 'Little Dreamer', id: `friend-${Date.now()}` };
    setShelf((prev) => [entry, ...prev].slice(0, SHELF_SIZE));
    playSparkle(state.isMuted);
    lumiSay?.(`${entry.name} the ${kindInfo.label} is tucked into the nursery shelf. Sweet dreams, little one!`, 'celebrating');
    try {
      confetti({ particleCount: 50, spread: 65, colors: ['#F4C96B', '#D995B7', '#B9A5E8', '#FFF8F1'] });
    } catch {
      // confetti unavailable
    }
  };

  const downloadCard = () => {
    const svg = friendRef.current?.svg;
    if (!svg) return;
    const markup = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 760;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const sky = ctx.createLinearGradient(0, 0, 0, 760);
      sky.addColorStop(0, '#1d1730');
      sky.addColorStop(1, '#3a2c55');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 600, 760);
      ctx.fillStyle = 'rgba(255,248,241,0.7)';
      for (let i = 0; i < 40; i++) ctx.fillRect((i * 137) % 600, (i * 89) % 520, 2, 2);
      ctx.strokeStyle = '#F4C96B';
      ctx.lineWidth = 6;
      ctx.strokeRect(18, 18, 564, 724);
      ctx.drawImage(img, 70, 50, 460, 460);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFF8F1';
      ctx.font = 'bold 44px Fraunces, Georgia, serif';
      ctx.fillText(friend.name.trim() || 'Little Dreamer', 300, 580);
      ctx.fillStyle = '#F4C96B';
      ctx.font = '600 24px Fredoka, sans-serif';
      ctx.fillText(kindInfo.label, 300, 622);
      ctx.fillStyle = 'rgba(255,248,241,0.75)';
      ctx.font = 'italic 20px Georgia, serif';
      ctx.fillText('A Dream Friend sewn in Lumi’s Atelier', 300, 690);
      const link = document.createElement('a');
      link.download = `${(friend.name.trim() || 'dream-friend').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      playChime(state.isMuted, 1046.5);
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  };

  return (
    <section id="friend-maker" aria-labelledby="friend-maker-heading" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-badge)] border border-[var(--border-color)] text-[var(--accent-gold)]">
          <Wand2 className="w-3.5 h-3.5" />
          <span>Sew Your Own Baby</span>
        </div>
        <h2 id="friend-maker-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)]">
          The Dream Friend Maker
        </h2>
        <p className="text-base text-[var(--text-secondary)]">
          Every sleeper deserves a buddy. Pick a ghost, cloud, robot, alien, monster or a dreamy you, and Lumi will stitch them
          together with moonlight thread.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#1d1730] to-[#3a2c55] border-2 border-[#F4C96B]/50 shadow-xl flex flex-col items-center gap-4">
          <div key={wiggle} className="friend-pop">
            <div className="animate-float-moth">
              <DreamFriend ref={friendRef} friend={friend} size={230} />
            </div>
          </div>
          <div className="text-center" aria-live="polite">
            <p className="text-2xl font-serif font-bold text-[#FFF8F1]">{friend.name.trim() || 'Little Dreamer'}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#F4C96B]">
              {kindInfo.icon} {kindInfo.label}
            </p>
            <p className="text-xs text-[#FFF8F1]/70 mt-1 max-w-xs">{kindInfo.blurb}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full text-xs font-bold">
            <button
              type="button"
              onClick={surprise}
              className="py-2.5 rounded-full border border-[#FFF8F1]/30 bg-[#FFF8F1]/10 text-[#FFF8F1] hover:bg-[#FFF8F1]/20 active:scale-95 transition-all inline-flex items-center justify-center gap-1.5"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Surprise</span>
            </button>
            <button
              type="button"
              onClick={adopt}
              className="py-2.5 rounded-full bg-gradient-to-r from-[#F4C96B] to-[#E5B548] text-[#453026] shadow-md hover:shadow-lg active:scale-95 transition-all inline-flex items-center justify-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Adopt</span>
            </button>
            <button
              type="button"
              onClick={downloadCard}
              className="py-2.5 rounded-full border border-[#FFF8F1]/30 bg-[#FFF8F1]/10 text-[#FFF8F1] hover:bg-[#FFF8F1]/20 active:scale-95 transition-all inline-flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-glow)] shadow-xl space-y-5">
          <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">1. What kind of baby?</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {KINDS.map((k) => (
                <button key={k.id} type="button" aria-pressed={friend.kind === k.id} onClick={() => chooseKind(k.id)} className={chipClass(friend.kind === k.id)}>
                  <span aria-hidden="true" className="mr-1">
                    {k.icon}
                  </span>
                  {k.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              2. {friend.kind === 'you' ? 'Hair colour' : 'Colour'}
            </legend>
            <div className="flex flex-wrap gap-2">
              {(friend.kind === 'you' ? HAIR_COLORS : COLORS).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Colour ${c}`}
                  aria-pressed={friend.color === c}
                  onClick={() => update({ color: c })}
                  className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 ${
                    friend.color === c ? 'border-[#F4C96B] scale-110 shadow-[0_0_10px_rgba(244,201,107,0.6)]' : 'border-[var(--border-color)]'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
            {friend.kind === 'you' && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] mr-1">Skin:</span>
                {SKIN_TONES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Skin tone ${c}`}
                    aria-pressed={friend.skin === c}
                    onClick={() => update({ skin: c })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      friend.skin === c ? 'border-[#F4C96B] scale-110' : 'border-[var(--border-color)]'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">3. Mood</legend>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map((m) => (
                <button key={m.id} type="button" aria-pressed={friend.mood === m.id} onClick={() => update({ mood: m.id })} className={chipClass(friend.mood === m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">4. Something special</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACCESSORIES.map((a) => (
                <button key={a.id} type="button" aria-pressed={friend.accessory === a.id} onClick={() => update({ accessory: a.id })} className={chipClass(friend.accessory === a.id)}>
                  {a.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="friend-name" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
              5. Name your friend
            </label>
            <input
              id="friend-name"
              type="text"
              value={friend.name}
              maxLength={18}
              onChange={(e) => setFriend((prev) => ({ ...prev, name: e.target.value.slice(0, 18) }))}
              placeholder="e.g. Mochi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold text-sm focus:border-[var(--accent-gold)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Nursery shelf of adopted friends */}
      <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-[var(--text-primary)]">The Nursery Shelf</h3>
          <span className="text-[11px] text-[var(--text-muted)]">
            {shelf.length}/{SHELF_SIZE} friends adopted
          </span>
        </div>
        {shelf.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">
            No friends tucked in yet. Press <strong className="text-[var(--accent-gold)]">Adopt</strong> to keep your creation here.
          </p>
        ) : (
          <ul className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {shelf.map((f) => (
              <li key={f.id} className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    const { id: _id, ...config } = f;
                    void _id;
                    setFriend(config);
                    setWiggle((w) => w + 1);
                    playChime(state.isMuted, 783.99);
                  }}
                  className="w-full p-2 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent-gold)] flex flex-col items-center gap-1 transition-colors"
                  aria-label={`Bring back ${f.name}`}
                >
                  <DreamFriend friend={f} size={64} track={false} />
                  <span className="text-[11px] font-bold text-[var(--text-primary)] truncate max-w-full">{f.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShelf((prev) => prev.filter((x) => x.id !== f.id))}
                  aria-label={`Let ${f.name} float away`}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center opacity-80 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
