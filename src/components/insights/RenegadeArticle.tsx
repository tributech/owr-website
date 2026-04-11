import { useEffect, useState, useRef } from 'react';
import './charts/ChartRegistration';
import {
  AdoptionChart, RegionChart,
  DiversityLineChart, PlayerShareLineChart,
  VCDoughnut, VCStackChart, VCCompareChart,
  FactionPresenceChart, WinRateChart, SkavenTimelineChart,
} from './charts';
import { factionData } from './charts/data';

const SLIDE_IDS = ['hook','landscape','regions','first-look','vc-reveal','without-vc','factions','skaven','data-nerd','conclusions'] as const;
const SLIDE_LABELS = ['The Hook','Landscape','Regions','First Look','VC Reveal','Without VC','Factions','Skaven','Data Nerd','Conclusions'];

/* ── Helpers ── */
function Stat({ label, value, detail, color = 'text-owr-gold' }: { label: string; value: string; detail: string; color?: string }) {
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
      <h2 className="text-3xl md:text-4xl font-bold text-owr-gold mb-4 font-sans">{title}</h2>
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
        <div className="mb-6">
          <img src="/images/owr_logo_white.png" alt="OWR" className="h-12 inline-block mr-3 drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]" />
          <span className="text-sm uppercase tracking-[0.12em] text-[#9a7b30] align-middle">Old World Rankings</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-owr-gold mb-6">The Renegade Effect</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          The community-authored <strong className="text-gray-700 dark:text-gray-200">Renegade army lists</strong> have become one of the most debated topics in competitive Old World.
          With Val&apos;s <strong className="text-gray-700 dark:text-gray-200">Renegades v2.0</strong> on the horizon, there&apos;s never been more discussion about whether community rulesets belong in competitive play.
        </p>
        <Callout color="gold" title="Important context">
          Renegades v1.0 was <strong>not a balance pass</strong>. It was a patch &mdash; fixing things that were totally broken in the Legacy army lists.
          No grand rebalancing goal. What you&apos;re about to see is the effect of <strong>minimal intervention</strong>.
        </Callout>
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mt-6 mb-4">
          If Legacy factions aren&apos;t viable at competitive events, those players either don&apos;t attend or play something else.
          That&apos;s lost players, not just lost factions.
        </p>
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-4">
          And it&apos;s hard not to wonder whether fewer people playing a faction competitively means <a href="https://bloodandpigment.com/2024/05/22/its-competitive-but-is-it-fun-play-mindsets-in-tabletop-miniature-gaming/" target="_blank" rel="noopener noreferrer" className="text-owr-gold-dark dark:text-owr-gold hover:underline">fewer people playing it casually too</a>.
        </p>

        <div className="bg-gray-100 dark:bg-[#12151c] border-l-4 border-owr-gold rounded-r-xl p-5 max-w-3xl mb-4">
          <div className="text-xs uppercase tracking-[0.15em] text-[#9a7b30] mb-2 font-semibold">Our Hypothesis</div>
          <p className="text-lg text-owr-gold font-semibold leading-relaxed">
            &ldquo;When renegade rules are available, more people bring Legacy factions to tournaments &mdash;
            meaning community rulesets are actively growing the competitive player base.&rdquo;
          </p>
        </div>

        <p className="text-sm text-gray-500 max-w-3xl">
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
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          Renegade adoption has surged. In March 2025, zero events accepted renegade lists.
          By late 2025, renegade-accepting events regularly <strong className="text-gray-700 dark:text-gray-200">outnumbered official-only ones</strong>.
          Today, roughly <strong className="text-gray-700 dark:text-gray-200">40% of all tracked events</strong> allow renegade army lists.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Official-Only Events" value="657" detail="9,106 players" color="text-[#6b8acd]" />
          <Stat label="Renegade-Accepting" value="440" detail="6,550 players" color="text-[#c95c4c]" />
          <Stat label="Legacy Share — Official" value="19.2%" detail="1,761 legacy players" color="text-[#6b8acd]" />
          <Stat label="Legacy Share — Renegade" value="26.8%" detail="1,653 legacy players" color="text-[#c95c4c]" />
        </div>
        <ChartBox><AdoptionChart /></ChartBox>
      </Slide>

      {/* ══ SLIDE 3: REGIONAL ══ */}
      <Slide id="regions">
        <ChapterLabel num="Chapter I (cont.)" title="A Global Phenomenon" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          This isn&apos;t one region driving the numbers. <strong className="text-gray-700 dark:text-gray-200">Every single region</strong> with enough data
          shows higher Legacy player share at renegade-accepting events. Not a single exception.
        </p>
        <ChartBox><RegionChart /></ChartBox>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Stat label="Biggest Uplift" value="+12.9pp" detail="Netherlands (13.9% → 26.8%)" color="text-green-400" />
          <Stat label="Largest Volume" value="+11.3pp" detail="United States (145 + 95 events)" color="text-green-400" />
          <Stat label="Most Renegade Events" value="54" detail="Poland (54 renegade vs 35 official)" color="text-[#c95c4c]" />
          <Stat label="Regions Showing Uplift" value="17/17" detail="100% consistency" color="text-owr-gold" />
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
          <ChartBox className="min-h-[350px]"><DiversityLineChart /></ChartBox>
          <ChartBox className="min-h-[350px]"><PlayerShareLineChart /></ChartBox>
        </div>
        <Callout color="blue" title="Initial Reading">
          Faction <em>diversity</em> is nearly identical: ~3.1 vs ~3.2 distinct Legacy factions per GT.
          Player share differs by <strong>+3.4pp</strong> (23.4% vs 20.0%) — smaller than the +7.6pp gap across all events.
          That makes sense: GTs are more competitive, so players gravitate toward stronger lists. Legacy factions &mdash;
          even with renegade rules &mdash; lack the subfaction variety, expanded magic items, and updated options that core factions enjoy.
          But there&apos;s more to this story...
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
          <ChartBox><VCStackChart /></ChartBox>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Official Legacy (no VC)" value="12.2%" detail="Player share at GTs" color="text-[#6b8acd]" />
          <Stat label="Renegade Legacy (no VC)" value="18.2%" detail="Player share at GTs" color="text-[#c95c4c]" />
          <Stat label="Gap" value="+6.0pp" detail="+49% relative growth" color="text-green-400" />
          <Stat label="Diversity Gap" value="+0.44" detail="2.15 vs 2.59 distinct factions" color="text-owr-gold" />
        </div>
        <ChartBox><VCCompareChart /></ChartBox>
        <Callout color="gold" title="The Twist">
          Without the VC safety blanket, the renegade effect <strong>doubles</strong>.
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
        <div className="grid md:grid-cols-2 gap-4">
          <ChartBox><FactionPresenceChart /></ChartBox>
          <ChartBox><WinRateChart /></ChartBox>
        </div>
      </Slide>

      {/* ══ SLIDE 8: THE SKAVEN STORY ══ */}
      <Slide id="skaven">
        <ChapterLabel num="Chapter VI" title="The Skaven Story" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-4">
          Of all seven Legacy factions, Skaven are the most dramatic beneficiary of community rulesets.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Stat label="GT Presence Growth" value="+80%" detail="30.6% → 55.0% of GTs" color="text-[#c95c4c]" />
          <Stat label="Win Rate Improvement" value="+11.6pp" detail="27.9% → 39.5%" color="text-green-400" />
          <Stat label="Peak Month (Feb 26)" value="83.3%" detail="10 of 12 renegade GTs" color="text-owr-gold" />
          <Stat label="Worst Official Win%" value="27.9%" detail="Lowest of any Legacy faction at official GTs" color="text-[#6b8acd]" />
        </div>
        <ChartBox><SkavenTimelineChart /></ChartBox>
        <Callout color="red" title="Important Caveat">
          The <strong>v1.5 TOW errata/FAQ</strong> (Games Workshop&apos;s own update) also helped infantry and horde armies.
          Skaven, being a horde army, likely got a <strong>double boost</strong> &mdash; renegade rules plus errata buffs.
          Lizardmen (also infantry-heavy) show a similar but smaller pattern, while Daemons and Ogres (more elite/monster-heavy) didn&apos;t benefit as much from the errata.
          We can&apos;t fully separate the two effects, but the direction is clear.
        </Callout>
      </Slide>

      {/* ══ SLIDE 9: DATA NERD ══ */}
      <Slide id="data-nerd">
        <ChapterLabel num="Chapter VII" title="A Note on the Numbers" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          Before we draw conclusions, let&apos;s be honest about what this data can and can&apos;t tell us.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-owr-gold uppercase tracking-wider mb-3">Limitations</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4">
              <li><strong className="text-gray-700 dark:text-gray-200">Selection bias:</strong> TOs who allow renegades aren&apos;t randomly assigned &mdash; they choose to. Communities that already have Legacy interest are more likely to adopt renegade rules. We&apos;re measuring the <em>type of community</em> as much as the ruleset itself.</li>
              <li><strong className="text-gray-700 dark:text-gray-200">No causal inference:</strong> This is observational data, not an experiment. We describe <em>associations</em>, not causes. We can&apos;t prove renegade rules caused higher Legacy attendance.</li>
              <li><strong className="text-gray-700 dark:text-gray-200">Confounded timeline:</strong> The v1.5 TOW errata landed during our window and independently buffed infantry/horde Legacy armies. We cannot cleanly separate the errata effect from the renegade effect.</li>
              <li><strong className="text-gray-700 dark:text-gray-200">No significance tests:</strong> These are descriptive statistics without formal hypothesis testing. The differences we report may fall within normal sampling variation, particularly for smaller subgroups.</li>
              <li><strong className="text-gray-700 dark:text-gray-200">Unweighted averages:</strong> Our per-tournament averages aren&apos;t weighted by event size or adjusted for region or time period. Larger tournaments and regional metas could shift these numbers.</li>
              <li><strong className="text-gray-700 dark:text-gray-200">Multi-army players:</strong> We can&apos;t determine if renegade events attract <em>new</em> Legacy players or if existing players switch to Legacy armies when the option is available. Both explanations fit the data.</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">What the data does show</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4">
              <li><strong className="text-gray-700 dark:text-gray-200">Consistent direction:</strong> Across all 17 regions, every month, and every tournament size, the association points the same way. While regions aren&apos;t fully independent (shared temporal trends), the consistency is notable.</li>
              <li><strong className="text-gray-700 dark:text-gray-200">Meaningful volume:</strong> 1,097 events and 15,697 results across 13 months is a substantial dataset for this hobby, even if individual subgroups are small.</li>
              <li><strong className="text-gray-700 dark:text-gray-200">Faction-level coherence:</strong> The factions that benefit most from renegade rules (Skaven, Lizardmen) are exactly the ones considered weakest under official rules. This pattern is harder to explain by selection bias alone.</li>
              <li><strong className="text-gray-700 dark:text-gray-200">Platform coverage:</strong> OWR tracks events globally, though events on other platforms are not included. The direction of any platform bias is unknown.</li>
            </ul>
          </div>
        </div>

        <Callout color="gold" title="The Plain English Version">
          We&apos;re not claiming this is peer-reviewed science, and we&apos;re not trying to claim authority by numbers alone.
          We can&apos;t prove that renegade rules <em>cause</em> more Legacy players &mdash; TOs who allow renegades may just run events
          in communities that already like Legacy factions. The v1.5 errata muddies the waters further for horde armies like Skaven.
          <br /><br />
          But here&apos;s what we <em>can</em> say: across a thousand events, seventeen regions, and thirteen months,
          tournaments where renegade lists were used <strong>consistently show higher Legacy representation</strong> than those where they weren&apos;t.
          Whether that&apos;s because renegade rules unlock demand, or because Legacy-friendly communities adopt renegade rules, or both &mdash; the association is real.
          What it means is up for debate.
        </Callout>
      </Slide>

      {/* ══ PRO BANNER ══ */}
      <section className="py-10 px-6 md:px-12 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#0f1118] dark:via-[#12151c] dark:to-[#0f1118]">
        <div className="max-w-[900px] mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-owr-gold/20 to-owr-gold/5 border border-owr-gold-dark/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-owr-gold" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="text-xs font-semibold uppercase tracking-widest text-owr-gold-dark mb-1">OWR Pro</div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">Support OWR &amp; unlock more</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Going Pro supports the project and helps us produce more analysis like this. You also get deeper faction stats, matchup data, meta trends &mdash;
              and AI Smart Convert, which turns every army list on OWR into a fully interactive Battle Builder list, ready to tweak and take to the table.
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
      </section>

      {/* ══ SLIDE 10: CONCLUSIONS ══ */}
      <Slide id="conclusions">
        <ChapterLabel num="Conclusions" title="What v1.0 Actually Did" />
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          After 13 months and over a thousand events, the data paints a clear picture.
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
          <p className="text-lg text-owr-gold-dark dark:text-owr-gold font-semibold leading-relaxed max-w-3xl mx-auto">
            v1.0 was a patch, not a balance pass. It fixed broken things. Even with minimal intervention,
            the weakest factions saw massive improvements. v2.0 is aiming to go further &mdash; actually balancing
            Legacy factions rather than just fixing what was broken. If minimal fixes produced these results,
            imagine what real balance work could do.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Excluding players from playing by leaving their army faction broken isn&apos;t good for anyone.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-sm mb-4">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Renegades v2.0 Resources</h3>
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
            <li>Data: Old World Rankings global database — <a href="https://oldworldrankings.com" className="text-owr-gold-dark hover:text-owr-gold">oldworldrankings.com</a></li>
          </ul>
        </div>

        <footer className="text-center text-xs text-gray-600 mt-8 pb-4">
          Old World Rankings · oldworldrankings.com · Data as of March 2026
        </footer>
      </Slide>
    </div>
  );
}
