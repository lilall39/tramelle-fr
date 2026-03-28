import type { ContentBlock } from "@/lib/content/types";

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => {
        const key = `${b.type}-${i}`;
        switch (b.type) {
          case "p":
            return (
              <p key={key} className="text-[1.05rem] leading-[1.75] text-ink/90">
                {b.text}
              </p>
            );
          case "h2":
            return (
              <h2
                key={key}
                className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-[1.65rem]"
              >
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={key}
                className="font-sans text-lg font-semibold tracking-tight text-ink"
              >
                {b.text}
              </h3>
            );
          case "ul":
            return (
              <ul
                key={key}
                className="list-inside list-disc space-y-2 pl-1 text-[1.05rem] leading-relaxed text-ink/90 marker:text-accent"
              >
                {b.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "blockquote":
            return (
              <blockquote
                key={key}
                className="border-l-2 border-accent/50 pl-5 font-serif text-lg italic leading-relaxed text-ink/85"
              >
                {b.text}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
