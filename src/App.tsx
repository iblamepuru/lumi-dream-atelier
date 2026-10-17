import React, { Suspense, lazy, useState, useEffect, useLayoutEffect } from 'react';
import { AtelierProvider, useAtelier } from './context/AtelierContext';
import { LanternLightField } from './components/LanternLightField';
import { SparkleTrail } from './components/SparkleTrail';
import { Navigation } from './components/Navigation';
import { HeroScene } from './components/HeroScene';
import { CharacterSheet } from './components/CharacterSheet';
import { DeferredSection } from './components/DeferredSection';
import { Footer } from './components/Footer';
import { Webring } from './components/Webring';
import { ChaosMode } from './components/ChaosMode';
import { LumiSpeechBubble } from './components/LumiSpeechBubble';
import { PAGES, PROJECT_PAGES, usePath } from './router';
import { Link } from './components/Link';
import { Sparkles, X } from 'lucide-react';

// Below-the-fold sections are split into their own chunks and mounted as "islands"
// once the browser is idle or the visitor scrolls near them (see DeferredSection).
const StorySection = lazy(() => import('./components/StorySection').then((m) => ({ default: m.StorySection })));
const ProjectShowcase = lazy(() => import('./components/ProjectShowcase').then((m) => ({ default: m.ProjectShowcase })));
const NightPlayroom = lazy(() => import('./playroom/NightPlayroom').then((m) => ({ default: m.NightPlayroom })));
const FriendMaker = lazy(() => import('./friends/FriendMaker').then((m) => ({ default: m.FriendMaker })));
const DreamGuestbook = lazy(() => import('./components/DreamGuestbook').then((m) => ({ default: m.DreamGuestbook })));
const SecretConstellation = lazy(() =>
  import('./components/SecretConstellation').then((m) => ({ default: m.SecretConstellation }))
);
const FinalGoodnight = lazy(() => import('./components/FinalGoodnight').then((m) => ({ default: m.FinalGoodnight })));
const LumiChat = lazy(() => import('./components/LumiChat').then((m) => ({ default: m.LumiChat })));

const ReturningVisitorBanner: React.FC = () => {
  const { state } = useAtelier();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if there is saved memory from previous visits
    try {
      const stored = localStorage.getItem('lumi_atelier_state_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lanternConfig?.cardCreated || parsed.crystalRepaired || parsed.deliveriesCompleted?.length > 0) {
          setShowBanner(true);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Welcome back message"
      className="bg-gradient-to-r from-[#F4C96B]/20 via-[#D995B7]/20 to-[#B9A5E8]/20 border-b border-[var(--border-glow)] px-4 py-2.5 text-xs text-[var(--text-primary)] backdrop-blur-md transition-all flex items-center justify-between"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#F4C96B] flex-shrink-0" />
          <span>
            Welcome back to Workshop No. 07! Your dream{' '}
            <strong className="text-[var(--accent-gold)]">
              "{state.lanternConfig.dreamName || 'The Starlight Voyager'}"
            </strong>{' '}
            is still glowing softly in the night sky.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowBanner(false)}
          aria-label="Dismiss welcome banner"
          className="p-1 rounded-full hover:bg-[var(--surface-badge)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const SectionFallback: React.FC = () => (
  <div role="status" className="py-32 text-center text-sm font-semibold text-[var(--text-muted)] animate-pulse">
    Lumi is fetching this page by lantern light…
  </div>
);

const PageHeader: React.FC<{ path: string }> = ({ path }) => {
  const page = PAGES.find((pg) => pg.path === path);
  if (!page) return null;
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 -mb-10 relative z-10">
      <nav aria-label="Breadcrumb" className="text-xs font-semibold text-[var(--text-muted)]">
        <Link to="/" className="hover:text-[var(--accent-gold)] underline underline-offset-2">
          Home
        </Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page" className="text-[var(--accent-gold)]">
          {page.label}
        </span>
      </nav>
    </div>
  );
};

const NotFound: React.FC = () => (
  <section className="py-28 px-4 text-center max-w-xl mx-auto space-y-4">
    <p className="text-6xl" aria-hidden="true">☾</p>
    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">404: This dream got lost</h1>
    <p className="text-[var(--text-secondary)]">
      Lumi searched every cloud, but this page drifted away before sunrise. Let's fly you somewhere cozy.
    </p>
    <div className="flex flex-wrap justify-center gap-2 pt-2">
      {PAGES.map((pg) => (
        <Link
          key={pg.path}
          to={pg.path}
          className="px-3 py-1.5 rounded-full text-xs font-bold border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]"
        >
          {pg.label}
        </Link>
      ))}
    </div>
  </section>
);

const PageContent: React.FC<{ path: string }> = ({ path }) => {
  const page = PAGES.find((pg) => pg.path === path);
  const project = PROJECT_PAGES.find((pg) => pg.path === path);

  useEffect(() => {
    const named = project ?? (page && page.path !== '/' ? page : null);
    document.title = named
      ? `${named.title} · LUMI — The Dream Repair Atelier`
      : page
        ? 'LUMI — The Dream Repair Atelier | haX.baby'
        : 'Lost dream (404) · LUMI';
  }, [page, project]);

  // New page: start at the top, or at #section once its (lazy) content has arrived.
  useLayoutEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    let raf = 0;
    let tries = 0;
    const seek = () => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else if (tries++ < 180) raf = requestAnimationFrame(seek);
    };
    seek();
    return () => cancelAnimationFrame(raf);
  }, [path]);

  if (project) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 -mb-8 relative z-10">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-[var(--text-muted)]">
            <Link to="/" className="hover:text-[var(--accent-gold)] underline underline-offset-2">
              Home
            </Link>
            <span aria-hidden="true"> › </span>
            <Link to="/workshop" className="hover:text-[var(--accent-gold)] underline underline-offset-2">
              Workshop
            </Link>
            <span aria-hidden="true"> › </span>
            <span aria-current="page" className="text-[var(--accent-gold)]">
              {project.label}
            </span>
          </nav>
        </div>
        <Suspense fallback={<SectionFallback />}>
          <ProjectShowcase focus={project.tab} />
        </Suspense>
        <Webring path="/workshop" />
      </>
    );
  }

  if (!page) return <NotFound />;

  if (path === '/') {
    return (
      <>
        {/* Section B: Cinematic Hero */}
        <HeroScene />

        {/* Section C: Character Dossier & Official Sheet (with 2D/3D WebGL switch) */}
        <CharacterSheet />

        {/* Section D: 4-Scene Interactive Origin Story */}
        <DeferredSection id="story" minHeight={1800}>
          <StorySection />
        </DeferredSection>

        {/* Section E & F: Interactive Projects & Dream Lab */}
        <DeferredSection id="projects" minHeight={1200}>
          <ProjectShowcase />
        </DeferredSection>

        {/* Tier 2: Lullaby Lab music box + Catch the Falling Dreams mini-game */}
        <DeferredSection id="playroom" minHeight={900}>
          <NightPlayroom />
        </DeferredSection>

        {/* Dream Friend Maker: visitors design their own original baby */}
        <DeferredSection id="friend-maker" minHeight={1100}>
          <FriendMaker />
        </DeferredSection>

        {/* Live Dream Guestbook & Vintage Odometer Counter */}
        <DeferredSection id="guestbook" minHeight={900}>
          <DreamGuestbook />
        </DeferredSection>

        {/* Section G: Secret Constellation Easter Egg */}
        <DeferredSection id="constellation" minHeight={500}>
          <SecretConstellation />
        </DeferredSection>

        {/* Section H: Final Goodnight Scene */}
        <DeferredSection id="goodnight" minHeight={600}>
          <FinalGoodnight />
        </DeferredSection>

        <Webring path={path} />
      </>
    );
  }

  return (
    <>
      <PageHeader path={path} />
      <Suspense fallback={<SectionFallback />}>
        {path === '/meet-lumi' && <CharacterSheet />}
        {path === '/story' && <StorySection />}
        {path === '/workshop' && <ProjectShowcase />}
        {path === '/playroom' && <NightPlayroom />}
        {path === '/dream-friends' && <FriendMaker />}
        {path === '/guestbook' && <DreamGuestbook />}
        {path === '/goodnight' && (
          <>
            <SecretConstellation />
            <FinalGoodnight />
          </>
        )}
      </Suspense>
      <Webring path={path} />
    </>
  );
};

const AtelierContent: React.FC = () => {
  const path = usePath();
  return (
    <div className="min-h-screen flex flex-col relative selection:bg-[#F4C96B]/30 selection:text-[var(--text-primary)]">
      {/* 4-Point Star Cursor Sparkle Trail (+2 pts) */}
      <SparkleTrail />

      {/* Dynamic Cursor Light Field */}
      <LanternLightField />

      {/* Sticky Storybook Navigation */}
      <Navigation />

      {/* Responsive Chaos Mode marquee (only while chaos mode is on) */}
      <ChaosMode />

      {/* Returning Visitor Toast Banner */}
      <ReturningVisitorBanner />

      {/* Each page of Lumi's site (home = the whole storybook on one page) */}
      <main id="main-content" className="flex-grow">
        <PageContent key={path} path={path} />
      </main>

      {/* Lumi's speech bubble for in-page reactions */}
      <LumiSpeechBubble />

      {/* In-Character Floating Dialogue Companion */}
      <DeferredSection minHeight={0}>
        <LumiChat />
      </DeferredSection>

      {/* Section I: Honest Footer & Judge Controls */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AtelierProvider>
      <AtelierContent />
    </AtelierProvider>
  );
};

export default App;
