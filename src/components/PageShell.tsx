import { ReactNode } from "react";

const PageShell = ({ children, title }: { children: ReactNode; title?: string }) => (
  <div className="page-enter min-h-screen pb-20 bg-background">
    {title && (
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <h1 className="font-display text-2xl text-foreground tracking-wider">{title}</h1>
      </header>
    )}
    <main className="max-w-lg mx-auto px-4">{children}</main>
  </div>
);

export default PageShell;
