import { useEffect, useState, useRef } from 'react';
import './charts/ChartRegistration';
import {
  AdoptionChart, RegionChart,
  DiversityLineChart, PlayerShareLineChart,
  VCDoughnut, VCStackChart, VCCompareChart,
  FactionPresenceChart, WinRateChart, SkavenTimelineChart,
} from './charts';
import { factionData } from './charts/data';

const SLIDE_IDS = ['hook','landscape','regions','first-look','vc-reveal','without-vc','factions','skaven','data-nerd','conclusions','resources'] as const;
const SLIDE_LABELS = ['The Hook','Landscape','Regions','First Look','VC Reveal','Without VC','Factions','Skaven','Data Nerd','Conclusions','Resources'];

/* ── Helpers ── */
function Stat({ label, value, detail, color = 'text-owr-gold-dark dark:text-owr-gold' }: { label: string; value: string; detail: string; color?: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="text-[0.65rem] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className={`text-3xl font-bold font-sans ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{detail}</div>
    </div>
  );
}

function Callout({ color, title, children }: { color: 'gold' | 'blue' | 'red' | 'purple'; title: string; children: React.ReactNode }) {
  const styles = {
    gold:   'from-[rgba(201,168,76,0.12)] border-[#9a7b30] [&_h3]:text-[#9a7b30] dark:[&_h3]:text-owr-gold [&_strong]:text-[#9a7b30] dark:[&_strong]:text-owr-gold',
    blue:   'from-[rgba(107,138,205,0.12)] border-[rgba(107,138,205,0.3)] [&_h3]:text-[#4a6ba5] dark:[&_h3]:text-[#6b8acd] [&_strong]:text-[#4a6ba5] dark:[&_strong]:text-[#6b8acd]',
    red:    'from-[rgba(201,92,76,0.12)] border-[rgba(201,92,76,0.3)] [&_h3]:text-[#a8453a] dark:[&_h3]:text-[#c95c4c] [&_strong]:text-[#a8453a] dark:[&_strong]:text-[#c95c4c]',
    purple: 'from-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.3)] [&_h3]:text-[#6d3fc7] dark:[&_h3]:text-[#8b5cf6] [&_strong]:text-[#6d3fc7] dark:[&_strong]:text-[#8b5cf6]',
  };
  return (
    <div className={`rounded-xl p-5 border bg-gradient-to-br ${styles[color]} to-transparent`}>
      <h3 className="font-semibold text-xs uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{children}</p>
    </div>
  );
}

function ChartBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[#12151c] border border-[#1e2330] rounded-xl p-4 ${className}`}>{children}</div>; /* Charts always dark */
}

function CopyButton({ text, label, icon }: { text: string; label: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <button title={label} onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
        {icon}
      </button>
      {copied && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap pointer-events-none">
          Copied!
        </span>
      )}
    </div>
  );
}

function Slide({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <section id={id} className="min-h-screen flex flex-col justify-center py-12 px-6 md:px-12 border-b border-gray-200 dark:border-gray-700 snap-start">
      <div className="max-w-[1200px] mx-auto w-full">{children}</div>
    </section>
  );
}

function ChapterLabel({ num, title }: { num: string; title: string }) {
  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-[#9a7b30] mb-1">{num}</div>
      <h2 className="text-3xl md:text-4xl font-bold text-owr-gold-dark dark:text-owr-gold mb-4 font-sans">{title}</h2>
    </>
  );
}

const sorted = [...factionData].sort((a, b) => (b.renPres - b.offPres) - (a.renPres - a.offPres));

/* ── Nav Dots ── */
function NavDots({ activeIndex }: { activeIndex: number }) {
  return (
    <>
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 hidden md:flex">
        {SLIDE_IDS.map((id, i) => (
          <button
            key={id}
            title={SLIDE_LABELS[i]}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-all duration-300 ${
              i === activeIndex
                ? 'bg-owr-gold shadow-[0_0_8px_rgba(201,168,76,0.4)] scale-130'
                : 'bg-gray-300 dark:bg-[#1e2330] hover:bg-[#9a7b30]'
            }`}
          />
        ))}
      </nav>
      <div className="fixed bottom-4 right-4 z-50 text-xs text-gray-600 tracking-widest font-sans">
        {activeIndex + 1} / {SLIDE_IDS.length}
      </div>
    </>
  );
}

/* ── Main Component ── */
export default function RenegadeArticle() {
  const [activeSlide, setActiveSlide] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = SLIDE_IDS.indexOf(entry.target.id as typeof SLIDE_IDS[number]);
            if (idx >= 0) setActiveSlide(idx);
          }
        });
      },
      { threshold: 0.4 }
    );
    SLIDE_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-200" style={{ scrollSnapType: 'y proximity' }}>
      <NavDots activeIndex={activeSlide} />

      {/* ══ SLIDE 1: THE HOOK ══ */}
      <Slide id="hook">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <a href="https://oldworldrankings.com/@gommo" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="https://images.ctfassets.net/ry0ysk99xuno/3zvzdJ9JtoxywnvM9wnSsu/229b9ac4718e23b1bf129b58144c1b30/gommo-avatar.jpg" alt="gommo" className="w-7 h-7 rounded-full ring-1 ring-owr-gold/30" />
              <span className="text-sm text-gray-600 dark:text-gray-400">@gommo</span>
            </a>
            <span className="text-gray-300 dark:text-gray-600">&middot;</span>
            <span className="text-sm text-gray-500 dark:text-gray-500">12 Apr 2026</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { label: 'Bluesky', href: `https://bsky.app/intent/compose?text=${encodeURIComponent('The Renegade Effect — data on Legacy factions in competitive Old World\nhttps://www.oldworldrankings.com/insights/renegade-effect')}`, icon: 'M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026' },
              { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.oldworldrankings.com/insights/renegade-effect')}`, icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              { label: 'Reddit', href: `https://reddit.com/submit?url=${encodeURIComponent('https://www.oldworldrankings.com/insights/renegade-effect')}&title=${encodeURIComponent('The Renegade Effect — 1,097 tournaments of Old World data')}`, icon: 'M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 0-.463.327.327 0 0 0-.462 0c-.545.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.231-.094z' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={`Share on ${s.label}`}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d={s.icon} /></svg>
              </a>
            ))}
            <CopyButton
              text="The Renegade Effect — data on Legacy factions in competitive Old World&#10;https://www.oldworldrankings.com/insights/renegade-effect"
              label="Copy for Discord"
              icon={<svg className="w-4 h-4 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>}
            />
            <CopyButton
              text="https://www.oldworldrankings.com/insights/renegade-effect"
              label="Copy link"
              icon={<svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {['Renegades', 'Legacy Factions', 'Tournament Data', 'Competitive', 'Vampire Counts', 'Skaven'].map(tag => (
            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">{tag}</span>
          ))}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-owr-gold-dark dark:text-owr-gold mb-6">The Renegade Effect</h1>
        <div className="relative">
          <div className="hidden md:block float-right ml-8 mb-4 w-72 lg:w-96">
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg bg-gray-100 dark:bg-gray-800">
              <div className="relative pb-[56.25%]">
                <iframe
                  src="https://www.youtube.com/embed/oSeSN0AP8no"
                  title="The Renegade Effect — Old World Rankings"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">Why I Think Renegades Matter</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Old World Fanatics</div>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-4">
            Warhammer: The Old World launched with seven <strong className="text-gray-700 dark:text-gray-200">Legacy factions</strong> &mdash;
            older armies carried forward from previous editions with minimal updates. While playable, many of their rules were incomplete or uncompetitive
            compared to the fully supported core factions.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-4">
            Enter the <strong className="text-gray-700 dark:text-gray-200">Renegade army lists</strong>: community-authored rule patches
            published through <a href="https://www.squarebased.com/" target="_blank" rel="noopener noreferrer" className="text-owr-gold-dark dark:text-owr-gold hover:underline">Square Based</a>,
            led by Val Heffelfinger with input from the competitive community. These aren&apos;t homebrew wishlists &mdash; they&apos;re focused fixes for the most broken elements of each Legacy faction.
            With <strong className="text-gray-700 dark:text-gray-200">Renegades v2.0</strong> on the horizon, there&apos;s never been more debate about whether community rulesets belong in competitive play.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-4">
            So what happens when Legacy factions aren&apos;t viable at competitive events? Do those players just not attend, or switch to something else?
            If so, are we losing players &mdash; or just factions?
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
            And it&apos;s hard not to wonder whether fewer people playing a faction competitively means <a href="https://bloodandpigment.com/2024/05/22/its-competitive-but-is-it-fun-play-mindsets-in-tabletop-miniature-gaming/" target="_blank" rel="noopener noreferrer" className="text-owr-gold-dark dark:text-owr-gold hover:underline">fewer people playing it casually too</a>.
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-[#12151c] border-l-4 border-owr-gold rounded-r-xl p-5 max-w-3xl mb-6">
          <div className="text-xs uppercase tracking-[0.15em] text-[#9a7b30] mb-2 font-semibold">Our Hypothesis</div>
          <p className="text-lg text-owr-gold-dark dark:text-owr-gold font-semibold leading-relaxed">
            &ldquo;When renegade rules are available, more people bring Legacy factions to tournaments &mdash;
            meaning community rulesets are actively growing the competitive player base.&rdquo;
          </p>
        </div>

        <Callout color="gold" title="Important context">
          As far as we understand, Val has stated that Renegades v1.0 was <strong>not a balance pass</strong>.
          It was a patch &mdash; fixing things that were totally broken in the Legacy army lists.
          No grand rebalancing goal. What you&apos;re about to see is the effect of <strong>minimal intervention</strong>.
        </Callout>

        <p className="text-sm text-gray-500 max-w-3xl mt-6">
          We used <strong className="text-gray-600 dark:text-gray-400">13 months of global tournament data</strong> to test this. Let&apos;s see what the numbers say.
        </p>
        <div className="flex flex-wrap gap-4 mt-8 text-xs uppercase tracking-widest text-gray-500">
          <span>Mar 2025 &ndash; Mar 2026</span>
          <span>1,097 Events</span>
          <span>15,697 Player Results</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6b8acd] inline-block" /> Official</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c95c4c] inline-block" /> Renegade</span>
        </div>
      </Slide>

      {/* ══ SLIDE 2: THE LANDSCAPE ══ */}
      <Slide id="landscape">
        <ChapterLabel num="Chapter I" title="The Landscape" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-4">
          Renegade v1.0 launched in March 2025. Within months, adoption grew rapidly &mdash;
          by late 2025, renegade-accepting events regularly <strong className="text-gray-700 dark:text-gray-200">outnumbered official-only ones</strong>.
          Today, roughly <strong className="text-gray-700 dark:text-gray-200">40% of all tracked events</strong> allow renegade army lists.
        </p>
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          Legacy factions make up <strong className="text-gray-700 dark:text-gray-200">7 of 17 factions</strong> (41%) &mdash;
          yet at official-only events they account for just <strong className="text-gray-700 dark:text-gray-200">19.2% of players</strong>.
          Less than half the representation you&apos;d expect if factions were played equally.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Official-Only Events" value="657" detail="9,106 players" color="text-[#6b8acd]" />
          <Stat label="Renegade-Accepting" value="440" detail="6,550 players" color="text-[#c95c4c]" />
          <Stat label="Legacy Share — Official" value="19.2%" detail="Expected: 41% (7/17 factions)" color="text-[#6b8acd]" />
          <Stat label="Legacy Share — Renegade" value="26.8%" detail="Closer, but still under-represented" color="text-[#c95c4c]" />
        </div>
        <ChartBox><AdoptionChart /></ChartBox>
      </Slide>

      {/* ══ SLIDE 3: REGIONAL ══ */}
      <Slide id="regions">
        <ChapterLabel num="Chapter I (cont.)" title="A Global Phenomenon" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          This isn&apos;t one region driving the numbers. <strong className="text-gray-700 dark:text-gray-200">Every single region</strong> with enough data
          shows higher Legacy player share at renegade-accepting events.
        </p>
        <ChartBox className="max-h-[55vh] flex items-center justify-center"><RegionChart /></ChartBox>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Stat label="Biggest Uplift" value="+12.9pp" detail="Netherlands (13.9% → 26.8%)" color="text-green-400" />
          <Stat label="Largest Volume" value="+11.3pp" detail="United States (145 + 95 events)" color="text-green-400" />
          <Stat label="Most Renegade Events" value="54" detail="Poland (54 renegade vs 35 official)" color="text-[#c95c4c]" />
          <Stat label="Regions Showing Uplift" value="17/17" detail="100% consistency" color="text-owr-gold-dark dark:text-owr-gold" />
        </div>
      </Slide>

      {/* ══ SLIDE 4: FIRST LOOK ══ */}
      <Slide id="first-look">
        <ChapterLabel num="Chapter II" title="First Look — All Legacy Factions" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          Zooming into Grand Tournaments (5+ rounds), let&apos;s compare faction diversity and player share.
          The initial data is... interesting, but not as dramatic as we might expect.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <ChartBox className="min-h-[40vh]"><DiversityLineChart /></ChartBox>
          <ChartBox className="min-h-[40vh]"><PlayerShareLineChart /></ChartBox>
        </div>
        <Callout color="blue" title="Initial Reading">
          Faction <em>diversity</em> is nearly identical: ~3.1 vs ~3.2 distinct Legacy factions per GT.
          Player share differs by <strong>+3.4pp</strong> (23.4% vs 20.0%) — smaller than the +7.6pp gap across all events.
          That makes sense: GTs are more competitive, so players gravitate toward stronger lists. Legacy factions &mdash;
          even with renegade rules &mdash; lack the subfaction variety, expanded magic items, and updated options that core factions enjoy.
          But is there more to this story?
        </Callout>
      </Slide>

      {/* ══ SLIDE 5: VC REVELATION ══ */}
      <Slide id="vc-reveal">
        <ChapterLabel num="Chapter III" title="The Vampire Counts Problem" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          Vampire Counts make up <strong className="text-gray-700 dark:text-gray-200">35.7% of all Legacy GT players</strong> &mdash; 237 out of 548 at official events.
          They appear at <strong className="text-gray-700 dark:text-gray-200">71.3% of official GTs</strong>, nearly double any other Legacy faction.
          With a 48.3% win rate, they&apos;re already competitive without any community help.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <ChartBox><VCDoughnut /></ChartBox>
          <ChartBox className="min-h-[40vh]"><VCStackChart /></ChartBox>
        </div>
        <Callout color="purple" title="The Realisation">
          Vampire Counts aren&apos;t really a &ldquo;Legacy&rdquo; faction in any meaningful competitive sense.
          They&apos;re a <strong>core faction wearing a Legacy label</strong>. They&apos;re popular, competitive, and don&apos;t need community rules to thrive.
          So what happens when we strip them out?
        </Callout>
      </Slide>

      {/* ══ SLIDE 6: RE-WALK WITHOUT VC ══ */}
      <Slide id="without-vc">
        <ChapterLabel num="Chapter IV" title="The Real Renegade Effect" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          Treating Vampire Counts as the core faction they effectively are, the picture shifts <strong className="text-gray-700 dark:text-gray-200">dramatically</strong>.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Stat label="Expected Share (6/17)" value="35.3%" detail="If all factions represented equally" color="text-gray-500" />
          <Stat label="Official Legacy (no VC)" value="12.2%" detail="~⅓ of expected" color="text-[#6b8acd]" />
          <Stat label="Renegade Legacy (no VC)" value="18.2%" detail="~½ of expected" color="text-[#c95c4c]" />
          <Stat label="Gap" value="+6.0pp" detail="+49% relative growth" color="text-green-400" />
          <Stat label="Diversity Gap" value="+0.44" detail="2.15 vs 2.59 distinct factions" color="text-owr-gold-dark dark:text-owr-gold" />
        </div>
        <ChartBox><VCCompareChart /></ChartBox>
        <Callout color="gold" title="The Twist">
          Without VC inflating the numbers, the renegade effect <strong>doubles</strong>.
          The player share gap widens from +3.4pp to <strong>+6.0pp</strong>. A diversity gap emerges.
          For the six non-VC Legacy factions, renegade rules clearly correlate with significantly higher tournament representation.
        </Callout>
      </Slide>

      {/* ══ SLIDE 7: FACTION BY FACTION ══ */}
      <Slide id="factions">
        <ChapterLabel num="Chapter V" title="Faction by Faction" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          Not all Legacy factions benefit equally. The factions that need help the most, benefit the most.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-2">Faction</th>
                <th className="text-right p-2">Official %</th>
                <th className="text-right p-2">Renegade %</th>
                <th className="text-right p-2">+/- pp</th>
                <th className="text-right p-2">Rel. Change</th>
                <th className="text-right p-2">Win% Off</th>
                <th className="text-right p-2">Win% Ren</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(f => {
                const d = f.renPres - f.offPres;
                const g = (d / f.offPres) * 100;
                return (
                  <tr key={f.name} className="border-b border-gray-200 dark:border-[#1e2330] hover:bg-gray-50 dark:hover:bg-[#1a1e28]">
                    <td className="p-2 font-medium text-gray-900 dark:text-gray-200">{f.name}</td>
                    <td className="p-2 text-right text-[#6b8acd] font-semibold">{f.offPres}%</td>
                    <td className="p-2 text-right text-[#c95c4c] font-semibold">{f.renPres}%</td>
                    <td className={`p-2 text-right font-semibold ${d > 0 ? 'text-green-400' : d < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {d > 0 ? '+' : ''}{d.toFixed(1)}pp
                    </td>
                    <td className={`p-2 text-right font-semibold ${g > 0 ? 'text-green-400' : g < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {g > 0 ? '+' : ''}{g.toFixed(0)}%
                    </td>
                    <td className="p-2 text-right text-gray-600 dark:text-gray-400">{f.offWin}%</td>
                    <td className="p-2 text-right text-gray-600 dark:text-gray-400">{f.renWin}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <ChartBox><FactionPresenceChart /></ChartBox>
          <ChartBox><WinRateChart /></ChartBox>
        </div>
        <div className="space-y-3">
          <Callout color="red" title="The Droppers: Dark Elves &amp; Daemons of Chaos">
            Both show a slight dip in presence at renegade events. Neither are infantry or horde armies, so the v1.5 errata that
            boosted Skaven and Lizardmen didn&apos;t help them. Dark Elves share the broader &ldquo;elf problem&rdquo; &mdash;
            competing for attention with High Elves and Wood Elves who have fuller, more modern army lists.
            Daemons face a similar squeeze. The renegade rules may not have addressed their core issues yet.
          </Callout>
          <Callout color="purple" title="The VC Drop">
            Vampire Counts actually see <strong>lower</strong> presence at renegade events (71.3% &rarr; 65.0%).
            This likely reflects community comp doing its job &mdash; restrictions like removing their Battle Standard Bearer
            and other targeted nerfs. VC were already strong enough to attract comp attention, and that&apos;s exactly what happened.
          </Callout>
        </div>
      </Slide>

      {/* ══ SLIDE 8: THE SKAVEN STORY ══ */}
      <Slide id="skaven">
        <ChapterLabel num="Chapter VI" title="The Skaven Story" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-4">
          Of all seven Legacy factions, Skaven are the most dramatic beneficiary of community rulesets.
          Look at the timeline &mdash; from around June 2025, when the v1.5 infantry rule changes landed, even official GT presence started to pick up.
          With renegade events there&apos;s a clear lag as players realised Skaven could actually be competitive, building steadily through late 2025
          before peaking in early 2026.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Stat label="GT Presence Growth" value="+80%" detail="30.6% → 55.0% of GTs" color="text-[#c95c4c]" />
          <Stat label="Win Rate Improvement" value="+11.6pp" detail="27.9% → 39.5%" color="text-green-400" />
          <Stat label="Peak Month (Feb 26)" value="83.3%" detail="10 of 12 renegade GTs" color="text-owr-gold-dark dark:text-owr-gold" />
          <Stat label="Worst Official Win%" value="27.9%" detail="Lowest of any Legacy faction at official GTs" color="text-[#6b8acd]" />
        </div>
        <ChartBox><SkavenTimelineChart /></ChartBox>
        <Callout color="red" title="Important Caveat">
          The <strong>v1.5 TOW errata/FAQ</strong> (Games Workshop&apos;s own update) also helped infantry and horde armies.
          Skaven, being a horde army, likely got a <strong>double boost</strong> &mdash; renegade rules plus errata buffs.
          Lizardmen (also infantry-heavy) show a similar but smaller pattern, while Daemons and Ogres (more elite/monster-heavy) didn&apos;t benefit as much from the errata.
          We can&apos;t fully separate the two effects, but the direction is consistent with the pattern across all Legacy factions.
          It&apos;ll be interesting to see what happens with Renegades v2.0, which aims to add much more of the flavour back to Skaven.
        </Callout>
      </Slide>

      {/* ══ SLIDE 9: DATA NERD ══ */}
      <Slide id="data-nerd">
        <ChapterLabel num="Chapter VII" title="A Note on the Numbers" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          Let&apos;s be upfront about what this data can and can&apos;t tell us.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Callout color="red" title="What we can't claim">
            <strong>Correlation, not causation.</strong> TOs who allow renegades may already run Legacy-friendly communities.
            The v1.5 errata confounds horde army results. No formal significance tests were run.
            We can&apos;t tell if renegade events attract <em>new</em> Legacy players or existing players switching armies.
          </Callout>
          <Callout color="blue" title="What the data does show">
            <strong>17 out of 17 regions</strong> show the same direction. 1,097 events across 13 months.
            The weakest factions (Skaven, Lizardmen) benefit most &mdash; harder to explain by selection bias alone.
          </Callout>
        </div>

        <div className="mt-4">
          <Callout color="gold" title="How we detect renegades">
            We classify a tournament as &ldquo;renegade-accepting&rdquo; when at least one submitted army list uses a renegade faction.
            We&apos;re <strong>not</strong> currently trawling player packs to check if renegades were allowed &mdash; so events where renegades were
            permitted but nobody brought one won&apos;t show up. This likely <strong>understates</strong> renegade adoption.
            Parsing player packs at scale is something OWR is working towards.
          </Callout>
        </div>

        <div className="mt-4">
          <Callout color="gold" title="Plain English">
            This isn&apos;t peer-reviewed science. We can&apos;t prove renegade rules <em>cause</em> more Legacy players.
            But across a thousand events, seventeen regions, and thirteen months,
            renegade-accepting tournaments <strong>consistently show higher Legacy representation</strong>.
            Whether that&apos;s the rules, the communities, or both &mdash; the association is real. What it means is up for debate.
          </Callout>
        </div>

        <div className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-owr-gold/20 to-owr-gold/5 border border-owr-gold-dark/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-owr-gold" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="text-xs font-semibold uppercase tracking-widest text-owr-gold-dark mb-1">OWR Pro</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Going Pro supports the project and helps us produce more analysis like this &mdash; including parsing player packs at scale.
                You also get deeper faction stats, matchup data, and AI Smart Convert.
              </p>
            </div>
            <a
              href="https://oldworldrankings.com/purchase"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-owr-gold hover:bg-owr-gold-dark text-gray-900 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
            >
              Get OWR Pro
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </Slide>

      {/* ══ SLIDE 10: CONCLUSIONS ══ */}
      <Slide id="conclusions">
        <ChapterLabel num="Conclusions" title="What We Found" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          After 13 months and over a thousand events, here&apos;s what the data shows.
        </p>

        <div className="space-y-4 mb-6">
          <Callout color="gold" title="More Legacy Players? — The Data Says Yes">
            Tournaments accepting renegade lists show <strong>+7.6pp higher Legacy player share</strong> across all formats (26.8% vs 19.2%).
            Zooming into non-VC Legacy factions at GTs, the gap is <strong>+6.0pp</strong> (18.2% vs 12.2%).
            The direction is consistent across every region and time period in our data.
          </Callout>
          <Callout color="blue" title="Greater Diversity? — Not quite, but...">
            The same factions appear regardless of ruleset. But more players are <strong>willing to bring them</strong>.
            Community rules don&apos;t change which Legacy factions show up — they change how many people play them.
          </Callout>
          <Callout color="purple" title="VC Distortion? — Absolutely">
            Remove Vampire Counts and the effect <strong>doubles</strong>. VC are functionally core — the other six
            Legacy factions need community rules far more.
          </Callout>
        </div>

        <div className="bg-owr-gold/5 dark:bg-[#12151c] border border-owr-gold-dark rounded-xl p-6 text-center mb-6">
          <p className="text-xl md:text-2xl text-owr-gold-dark dark:text-owr-gold font-semibold">
            Excluding players from playing by leaving their army faction broken isn&apos;t good for anyone.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6">
          <h3 className="text-xs font-semibold text-[#9a7b30] uppercase tracking-wider mb-3">Our Take</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            Coming from the team behind Old World Rankings &mdash; and as hosts of <strong className="text-gray-900 dark:text-gray-100">Old World Fanatics</strong> &mdash;
            we&apos;re community builders first. We know that can sometimes sit uncomfortably alongside the competitive scene.
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            But with seven Legacy factions &mdash; six of which can&apos;t compete on an even footing &mdash; it feels like it demands an exception.
            And honestly? Community rulesets in competitive play aren&apos;t new. German comp, WTC &mdash; nearly every major competitive
            scene we&apos;ve seen runs some form of comp. At the end of the day, that&apos;s community rules too.
          </p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-2 list-disc pl-4 mb-4">
            <li><strong className="text-gray-900 dark:text-gray-100">Stop playing Legacy and GW has no reason to support them.</strong> Keeping them on the table keeps the pressure on Games Workshop to bring them back properly.</li>
            <li><strong className="text-gray-900 dark:text-gray-100">Renegade lists aren&apos;t breaking the game.</strong> This isn&apos;t homebrew Amazonians or a Halfling army &mdash; these are core Warhammer Fantasy factions that belong in The Old World.</li>
            <li><strong className="text-gray-900 dark:text-gray-100">&ldquo;Official&rdquo; doesn&apos;t mean &ldquo;tested and balanced.&rdquo;</strong> Grand Cathay shows us that. Even with playtesters, the best playtesting comes from thousands of players across thousands of games. OWR has that data, and it shows what&apos;s balanced and what isn&apos;t.</li>
          </ul>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            The data suggests renegade rules are bringing Legacy players to the table. We think that&apos;s worth supporting.
          </p>
        </div>

      </Slide>

      {/* ══ SLIDE 11: RESOURCES & METHODOLOGY ══ */}
      <Slide id="resources">
        <ChapterLabel num="" title="Resources &amp; Methodology" />

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-sm mb-4">
          <h3 className="text-xs font-semibold text-[#9a7b30] uppercase tracking-wider mb-3">Renegades v2.0 Resources</h3>
          <ul className="space-y-2 list-none pl-0">
            <li><a href="https://www.squarebased.com/" target="_blank" rel="noopener noreferrer" className="text-owr-gold-dark dark:text-owr-gold hover:underline font-medium">Square Based</a> <span className="text-gray-500 dark:text-gray-400">&mdash; Val&apos;s Renegades project home</span></li>
            <li><a href="https://docs.google.com/document/u/0/d/1QAt19do6rdvZgE8E6wLxUBkxfLBwdWYncAiof01vFHQ/mobilebasic" target="_blank" rel="noopener noreferrer" className="text-owr-gold-dark dark:text-owr-gold hover:underline font-medium">Skaven v2.0 Beta</a> <span className="text-gray-500 dark:text-gray-400">&mdash; Latest draft rules</span></li>
            <li><a href="https://docs.google.com/document/d/1DxVMfxgaDnemxkmqxatHZwGNv0i1rRoekbsmVKgmRmA/edit?tab=t.0" target="_blank" rel="noopener noreferrer" className="text-owr-gold-dark dark:text-owr-gold hover:underline font-medium">Dark Elves v2.0 Beta</a> <span className="text-gray-500 dark:text-gray-400">&mdash; Latest draft rules</span></li>
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-xs text-gray-500 leading-relaxed">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Methodology</h3>
          <ul className="space-y-1 list-disc pl-4">
            <li><strong>Period:</strong> March 2025 – March 2026 (April 2026 excluded — incomplete).</li>
            <li><strong>Official-only:</strong> every result uses a GW-published faction list. <strong>Renegade-accepting:</strong> at least one &ldquo;(Renegades)&rdquo; list present.</li>
            <li><strong>GT:</strong> 5+ rounds. <strong>Legacy factions:</strong> Chaos Dwarfs, Daemons of Chaos, Dark Elves, Lizardmen, Ogre Kingdoms, Skaven, Vampire Counts.</li>
            <li>Renegade subfactions collapsed to parent for diversity counts. Win rate = avg(wins/rounds) per player.</li>
            <li>Data: Old World Rankings global database — <a href="https://oldworldrankings.com" className="text-owr-gold-dark hover:text-owr-gold">oldworldrankings.com</a>. Explore live faction data on our <a href="https://oldworldrankings.com/faction_stats" className="text-owr-gold-dark hover:text-owr-gold">Faction Stats</a> page.</li>
          </ul>
        </div>

        <footer className="text-center text-xs text-gray-600 mt-8 pb-4">
          Old World Rankings · oldworldrankings.com · Data as of March 2026
        </footer>
      </Slide>
    </div>
  );
}
