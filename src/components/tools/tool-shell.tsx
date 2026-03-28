import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ToolShell({ title, description, children }: Props) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm shadow-ink/[0.04] sm:p-8">
      <div className="mb-8 space-y-2 border-b border-ink/10 pb-6">
        <h2 className="font-serif text-2xl font-medium text-ink">{title}</h2>
        <p className="text-sm leading-relaxed text-ink/65">{description}</p>
      </div>
      {children}
    </div>
  );
}
