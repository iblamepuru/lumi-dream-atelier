import React, { useState } from 'react';
import { Sun, Moon, Menu, X, Sparkles, Zap } from 'lucide-react';
import { useAtelier } from '../context/AtelierContext';
import { SoundToggle } from './SoundToggle';
import { playChime } from '../utils/soundEngine';
import { PAGES, goToSection, navigate, usePath } from '../router';

export const Navigation: React.FC = () => {
  const { state, toggleTheme, prefs, setPref } = useAtelier();

  const toggleChaos = () => {
    setPref('chaosMode', !prefs.chaosMode);
    playChime(state.isMuted, prefs.chaosMode ? 440 : 880);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const starCount = state.discoveredStars.length;

  const path = usePath();

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    playChime(state.isMuted, 783.99); // G5 note
    if (href.startsWith('#')) goToSection(href.slice(1));
    else navigate(href);
  };

  // Let Ctrl/Cmd/middle clicks open a page in a new tab like a normal link.
  const isNewTabClick = (e: React.MouseEvent) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

  // Every page of the site except Home (the logo goes home).
  const navLinks = PAGES.filter((p) => p.path !== '/').map((p) => ({ label: p.label, href: p.path }));

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--nav-bg)] border-b border-[var(--border-color)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              if (isNewTabClick(e)) return;
              e.preventDefault();
              handleNavClick('/');
            }}
            className="group flex items-center gap-2 text-base sm:text-lg font-bold font-serif text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-gold)] rounded-lg p-1"
          >
            <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface-badge)] border border-[var(--border-color)]">
              {/* Little moth icon */}
              <svg viewBox="0 0 24 24" width="18" height="18" className="text-[var(--accent-gold)]">
                <path
                  d="M12 7C9 3 5 4 6 9C7 12 10 13 12 14C14 13 17 12 18 9C19 4 15 3 12 7Z"
                  fill="currentColor"
                  opacity="0.85"
                />
                <circle cx="12" cy="14" r="2.5" fill="#5C4033" />
                <path d="M11 5 Q 9 2 7 3" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path d="M13 5 Q 15 2 17 3" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
            </span>
            <span className="tracking-tight font-serif whitespace-nowrap">
              {/* Short brand on phones keeps the mute switch on-screen */}
              <span className="hidden sm:inline">Lumi's Little Atelier</span>
              <span className="sm:hidden">Lumi</span>{' '}
              <span className="text-[var(--accent-gold)] font-sans">✦</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={path === link.href ? 'page' : undefined}
                onClick={(e) => {
                  if (isNewTabClick(e)) return;
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="whitespace-nowrap text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--accent-gold)] hover:after:w-full after:transition-all aria-[current=page]:text-[var(--accent-gold)] aria-[current=page]:after:w-full"
              >
                {link.label}
              </a>
            ))}

            {/* Constellation Discovery Badge (Unlocked after finding ≥1 star) */}
            {starCount > 0 && (
              <a
                href="#constellation"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#constellation');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  starCount === 5
                    ? 'bg-[#F4C96B]/25 border-[#F4C96B] text-[var(--text-primary)] shadow-[0_0_12px_rgba(244,201,107,0.4)] animate-pulse'
                    : 'bg-[var(--surface-badge)] border-[var(--border-color)] text-[var(--accent-gold)] hover:border-[var(--accent-gold)]'
                }`}
                title="View your discovered constellation stars"
              >
                <Sparkles className="w-3 h-3 text-[#F4C96B]" />
                <span>Stars: {starCount}/5</span>
              </a>
            )}
          </nav>

          {/* Right Controls: Audio + Theme + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sound Toggle */}
            <SoundToggle />

            {/* Responsive Chaos Mode switch (phones get it in the menu) */}
            <button
              type="button"
              onClick={toggleChaos}
              aria-pressed={prefs.chaosMode}
              aria-label={prefs.chaosMode ? 'Turn off 90s chaos mode' : 'Turn on 90s chaos mode'}
              title="90s Chaos Mode"
              className={`hidden sm:inline-flex p-2 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                prefs.chaosMode
                  ? 'border-pink-400 bg-pink-500/20 text-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.5)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--border-glow)]'
              }`}
            >
              <Zap className="w-4 h-4" />
            </button>

            {/* Theme Toggle (Twilight vs Midnight) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={state.theme === 'midnight'}
              aria-label={
                state.theme === 'midnight'
                  ? 'Switch to Twilight mode (warm daylight storybook)'
                  : 'Switch to Midnight mode (deep starry dreamscape)'
              }
              title={state.theme === 'midnight' ? 'Switch to Twilight' : 'Switch to Midnight'}
              className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--border-glow)] transition-all hover:scale-105 active:scale-95"
            >
              {state.theme === 'midnight' ? (
                <Moon className="w-4 h-4 text-[#F4C96B]" />
              ) : (
                <Sun className="w-4 h-4 text-[#DCA334]" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile menu"
              className="xl:hidden p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--border-glow)]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[var(--border-color)] bg-[var(--bg-glass)] px-4 pt-3 pb-6 space-y-3 backdrop-blur-xl">
          <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={path === link.href ? 'page' : undefined}
                onClick={(e) => {
                  if (isNewTabClick(e)) return;
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2.5 rounded-lg text-base font-medium text-[var(--text-primary)] hover:bg-[var(--surface-badge)] transition-colors min-h-[44px] flex items-center aria-[current=page]:text-[var(--accent-gold)] aria-[current=page]:bg-[var(--surface-badge)]"
              >
                {link.label}
              </a>
            ))}

            {starCount > 0 && (
              <a
                href="#constellation"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#constellation');
                }}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-[var(--accent-gold)] bg-[var(--surface-badge)] border border-[var(--border-color)] flex items-center gap-2 min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-[#F4C96B]" />
                <span>Constellation Stars ({starCount}/5 Found)</span>
              </a>
            )}
            <button
              type="button"
              onClick={toggleChaos}
              aria-pressed={prefs.chaosMode}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-pink-300 bg-pink-500/10 border border-pink-400/40 flex items-center gap-2 min-h-[44px]"
            >
              <Zap className="w-4 h-4" />
              <span>90s Chaos Mode: {prefs.chaosMode ? 'ON' : 'OFF'}</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
