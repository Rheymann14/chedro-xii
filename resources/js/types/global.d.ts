import type { Auth } from '@/types/auth';
import type { Site } from '@/types/site';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            site: Site;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
