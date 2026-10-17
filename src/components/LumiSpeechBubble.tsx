import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { LumiCharacter } from './LumiCharacter';

// Shows whatever Lumi says via lumiSay() (guestbook thanks, game scores, chaos-mode quips...)
// as a small speech bubble in the bottom-left corner, clear of the Ask Lumi chat button.
export const LumiSpeechBubble: React.FC = () => {
  const { lumiMessage, state } = useAtelier();
  const [hiddenId, setHiddenId] = useState<number | null>(null);

  useEffect(() => {
    if (!lumiMessage) return;
    // Longer lines stay up a little longer.
    const ms = Math.min(9000, 3500 + lumiMessage.text.length * 45);
    const timer = window.setTimeout(() => setHiddenId(lumiMessage.id), ms);
    return () => window.clearTimeout(timer);
  }, [lumiMessage]);

  const visible = lumiMessage && lumiMessage.id !== hiddenId;

  return (
    <div aria-live="polite" className="fixed bottom-6 left-4 sm:left-6 z-40 pointer-events-none max-w-[calc(100vw-7rem)] sm:max-w-sm">
      {visible && (
        <div
          key={lumiMessage.id}
          className="lumi-bubble-in pointer-events-auto flex items-end gap-2"
        >
          <div className="shrink-0 -mb-1" aria-hidden="true">
            <LumiCharacter mood={lumiMessage.mood} size={52} lanternColor={state.lanternConfig.color} enableEyeTracking={false} />
          </div>
          <div className="relative rounded-2xl rounded-bl-sm px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 border-[var(--border-glow)] shadow-2xl text-xs sm:text-sm text-[var(--text-primary)]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--accent-gold)] mb-0.5">Lumi says</span>
            <span className="block pr-4">{lumiMessage.text}</span>
            <button
              type="button"
              onClick={() => setHiddenId(lumiMessage.id)}
              aria-label="Dismiss Lumi's message"
              className="absolute top-1.5 right-1.5 p-0.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
