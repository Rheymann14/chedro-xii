import type { ReactNode } from 'react';
import { MainNav } from '@/components/public/main-nav';
import { Masthead } from '@/components/public/masthead';
import { SiteFooter } from '@/components/public/site-footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            <a
                href="#main-content"
                className="sr-only z-50 rounded-md bg-gold px-4 py-2 font-semibold text-gold-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
            >
                Skip to main content
            </a>
            <header>
                <Masthead />
            </header>
            <MainNav />
            <main
                id="main-content"
                tabIndex={-1}
                className="flex-1 outline-none"
            >
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
