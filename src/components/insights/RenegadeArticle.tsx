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
        <div className="mb-6">
          <img src="/images/owr_logo_white.png" alt="OWR" className="h-12 inline-block mr-3 drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]" />
          <span className="text-sm uppercase tracking-[0.12em] text-[#9a7b30] align-middle">Old World Rankings</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-owr-gold-dark dark:text-owr-gold mb-6">The Renegade Effect</h1>
        <div className="relative">
          <a href="https://www.squarebased.com/" target="_blank" rel="noopener noreferrer" className="hidden md:block float-right ml-8 mb-4">
            <img
              src="https://cdn.prod.website-files.com/67c6636b090576483bf4aaed/68f059448d47d72a99ac5f22_Renegade_Legacy_Pack_Banner.png"
              alt="Renegade Legacy Pack"
              className="w-72 lg:w-80 object-contain rounded-xl opacity-90 hover:opacity-100 transition-opacity"
            />
          </a>
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
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-6">
          Renegade v1.0 launched in March 2025. Within months, adoption grew rapidly &mdash;
          by late 2025, renegade-accepting events regularly <strong className="text-gray-700 dark:text-gray-200">outnumbered official-only ones</strong>.
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
          <ul className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-2 list-disc pl-4 mb-3">
            <li>If we stop playing Legacy factions, we give Games Workshop every reason to never support them again. Keeping them on the table keeps the pressure on GW to bring them back properly.</li>
            <li>Renegade lists aren&apos;t breaking the game. This isn&apos;t homebrew Amazonians or a Halfling army &mdash; these are core Warhammer Fantasy factions that belong in The Old World.</li>
            <li>There&apos;s a perception that &ldquo;official&rdquo; means &ldquo;tested and balanced&rdquo; &mdash; Grand Cathay shows us that&apos;s simply not the case. Even with playtesters, the best playtesting comes from thousands of players across thousands of games. OWR has that data, and it shows what&apos;s balanced and what isn&apos;t.</li>
            <li>The data suggests renegade rules are bringing Legacy players to the table. We think that&apos;s worth supporting.</li>
          </ul>
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
