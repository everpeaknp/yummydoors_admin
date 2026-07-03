type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeader({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-6">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-accentDark">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-ink">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-mute">{description}</p>
    </div>
  );
}
