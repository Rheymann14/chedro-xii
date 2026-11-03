import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import PublicLayout from '@/layouts/public-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('public/'):
                return PublicLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    defaults: {
        // Animate page-to-page navigation, but not form posts, partial reloads, or query-only changes like filters.
        visitOptions: (href, options) => {
            const isPageNavigation =
                (options.method ?? 'get') === 'get' &&
                !options.only?.length &&
                !options.except?.length &&
                new URL(href, window.location.href).pathname !==
                    window.location.pathname;

            return {
                viewTransition: options.viewTransition ?? isPageNavigation,
            };
        },
    },
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#FCD116',
    },
});

// This will set light / dark mode on load...
initializeTheme();
