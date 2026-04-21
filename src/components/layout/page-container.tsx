import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className = "" }: Props) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 pb-20 pt-12 sm:pb-24 sm:pt-16 ${className}`}>
      {children}
    </div>
  );
}
