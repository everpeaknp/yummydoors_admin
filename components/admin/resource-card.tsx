import { ReactNode } from "react";

type Props = {
  title: string;
  meta?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function ResourceCard({ title, meta, children, action }: Props) {
  return (
    <article className="rounded-3xl border border-line bg-panel p-5 shadow-panel">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          {meta ? <p className="mt-1 text-sm text-mute">{meta}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </article>
  );
}
