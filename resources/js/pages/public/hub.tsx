import { Head } from '@inertiajs/react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { EmptyState } from '@/components/public/empty-state';
import { PageHeader } from '@/components/public/page-header';
import { SmartLink } from '@/components/public/smart-link';
import type { MenuLink } from '@/types';

export default function Hub({ hub }: { hub: MenuLink }) {
    return (
        <>
            <Head title={hub.label}>
                {hub.description && (
                    <meta name="description" content={hub.description} />
                )}
            </Head>

            <PageHeader
                title={hub.label}
                description={hub.description}
                breadcrumbs={[{ title: hub.label, href: hub.url }]}
            />

            <div className="container-page py-8">
                {hub.children.length > 0 ? (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {hub.children.map((link) => (
                            <li key={link.id}>
                                <SmartLink
                                    href={link.url}
                                    newTab={link.opens_in_new_tab}
                                    prefetch
                                    className="group flex h-full flex-col gap-2 rounded-lg border border-t-4 border-t-brand bg-card p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md dark:border-t-primary"
                                >
                                    <span className="flex items-start justify-between gap-2 font-semibold group-hover:text-primary">
                                        {link.label}
                                        {link.opens_in_new_tab ? (
                                            <ExternalLink
                                                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                                aria-label="Opens in a new tab"
                                            />
                                        ) : (
                                            <ArrowRight
                                                className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                                                aria-hidden
                                            />
                                        )}
                                    </span>
                                    {link.description && (
                                        <span className="text-sm text-muted-foreground">
                                            {link.description}
                                        </span>
                                    )}
                                </SmartLink>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState title="No links yet" />
                )}
            </div>
        </>
    );
}
