import { useState, useRef, useEffect, useMemo } from 'react';
import { APP_URL, type SearchPlayer, type SearchTournament } from '../lib/api';
import { CountryFlag } from './CountryFlag';
import { useSearch } from '../hooks/useSearch';

function PlayerResult({ player, isActive }: { player: SearchPlayer; isActive: boolean }) {
  return (
    <a
      href={`${APP_URL}${player.url}`}
      className={`flex items-center justify-between px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer ${isActive ? 'bg-white/10' : ''}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-white truncate">{player.name}</span>
        {player.nickname && (
          <span className="text-white/50 text-sm">(@{player.nickname})</span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <CountryFlag code={player.region} />
        <span className="text-sm text-[#FFD700] whitespace-nowrap">
          View profile &rarr;
        </span>
      </div>
    </a>
  );
}

function TournamentResult({ tournament, isActive }: { tournament: SearchTournament; isActive: boolean }) {
  return (
    <a
      href={`${APP_URL}${tournament.url}`}
      className={`flex items-center justify-between px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer ${isActive ? 'bg-white/10' : ''}`}
    >
      <span className="text-sm text-white truncate">{tournament.name}</span>
      <div className="flex items-center gap-3 shrink-0">
        <CountryFlag code={tournament.region} />
        <span className="text-sm text-[#FFD700] whitespace-nowrap">
          View tournament &rarr;
        </span>
      </div>
    </a>
  );
}

export default function GlobalSearch() {
  const { results, isOpen, search, close } = useSearch();
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const players = results?.players ?? [];
  const tournaments = results?.tournaments ?? [];
  const hasResults = players.length > 0 || tournaments.length > 0;

  const allUrls = useMemo(
    () => [...players.map((p) => p.url), ...tournaments.map((t) => t.url)],
    [players, tournaments],
  );

  // Reset active index when results change
  useEffect(() => setActiveIndex(-1), [results]);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [close]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || allUrls.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % allUrls.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? allUrls.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      window.location.href = `${APP_URL}${allUrls[activeIndex]}`;
    } else if (e.key === 'Escape') {
      close();
      setActiveIndex(-1);
    }
  }

  return (
    <div className="max-w-xl mx-auto" ref={wrapperRef}>
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FFD700] pointer-events-none z-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search for players or tournaments..."
          onChange={(e) => search(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-12 pl-12 pr-4 bg-black/60 backdrop-blur border border-[#FFD700] rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/60"
        />

        {isOpen && results && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1C] rounded-lg shadow-2xl border border-[#FFD700]/30 overflow-hidden z-50">
            {!hasResults ? (
              <p className="px-4 py-3 text-sm text-white/50">No results found</p>
            ) : (
              <>
                {players.length > 0 && (
                  <div className="py-2 px-2">
                    <div className="text-xs text-[#FFD700] uppercase tracking-widest font-semibold mb-1 px-2">
                      Players
                    </div>
                    {players.map((player, i) => (
                      <PlayerResult key={player.id} player={player} isActive={activeIndex === i} />
                    ))}
                  </div>
                )}

                {players.length > 0 && tournaments.length > 0 && (
                  <div className="border-t border-white/10" />
                )}

                {tournaments.length > 0 && (
                  <div className="py-2 px-2">
                    <div className="text-xs text-[#FFD700] uppercase tracking-widest font-semibold mb-1 px-2">
                      Tournaments
                    </div>
                    {tournaments.map((tournament, i) => (
                      <TournamentResult
                        key={tournament.id}
                        tournament={tournament}
                        isActive={activeIndex === players.length + i}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
