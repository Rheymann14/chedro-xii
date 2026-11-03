import { Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/public/page-header';
import { Button } from '@/components/ui/button';
import { statistics } from '@/routes';

const DASHBOARD_URL = 'https://chedro12.com/statistics/data-analytics';

export default function Statistics() {
    return (
        <>
            <Head title="Higher Education Statistics">
                <meta
                    name="description"
                    content="Higher education statistics, enrollment, and graduate data for Region XII."
                />
            </Head>

            <PageHeader
                title="Higher Education Statistics"
                description="Enrollment, graduates, and institutional data for Region XII."
                breadcrumbs={[{ title: 'Statistics', href: statistics() }]}
            >
                <Button variant="outline" size="sm" asChild>
                    <a
                        href={DASHBOARD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open full screen
                        <ExternalLink className="size-4" aria-hidden />
                    </a>
                </Button>
            </PageHeader>

            <div className="container-page py-6">
                <div className="h-[75svh] min-h-[32rem] overflow-hidden rounded-lg border bg-card shadow-xs">
                    <iframe
                        src={DASHBOARD_URL}
                        title="Region XII higher education statistics dashboard"
                        loading="lazy"
                        className="size-full"
                    />
                </div>
            </div>
        </>
    );
}
