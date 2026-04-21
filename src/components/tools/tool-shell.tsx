import type { ReactNode } from "react";

type Props = {
  title: string;
  description: ReactNode;
  children: ReactNode;
};

export function ToolShell({ title, description, children }: Props) {
  return (
    <div className="rounded-2xl border border-ink/[0.08] bg-paper-elevated p-6 shadow-sm shadow-ink/[0.03] sm:p-8">
      <div className="mb-8 space-y-2 border-b border-ink/[0.08] pb-6">
        <h2 className="font-editorial-serif text-2xl font-bold text-outil-title">{title}</h2>
        <div
          className={
            typeof description === "string"
              ? "text-sm font-bold leading-relaxed text-ink/65"
              : "text-sm leading-relaxed"
          }
        >
          {description}
        </div>
      </div>
      {children}
    </div>
  );
}
