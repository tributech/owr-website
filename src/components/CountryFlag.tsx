import { countryFlag } from '../lib/country-flag';

interface CountryFlagProps {
  code: string | null;
  className?: string;
}

export function CountryFlag({ code, className }: CountryFlagProps) {
  const emoji = countryFlag(code);
  if (!emoji) return null;

  return (
    <span className={className ?? 'text-base leading-none'} title={code ?? undefined}>
      {emoji}
    </span>
  );
}
