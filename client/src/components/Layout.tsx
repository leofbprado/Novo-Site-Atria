import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-atria-dark flex flex-col font-barlow">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
