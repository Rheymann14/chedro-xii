import { Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/public/page-header';
import { Button } from '@/components/ui/button';
import { cavApplication } from '@/routes';

const ECAV_URL = 'https://ecav.ched.gov.ph/home';

const steps: {
    title: string;
    items: string[];
    images: { src: string; alt: string }[];
}[] = [
    {
        title: 'Account registration',
        items: [
            'Go to the eCAV portal and click the “Apply for eCAV” button. You will be redirected to the CHED One Touch login page.',
            'Click the “Sign Up” link, fill in all required fields, and click the “Sign up” button.',
            'Click the eCAV “Access” button, then click “Authorize” to proceed.',
            'Complete the registration form and select “Applicant/Graduate/Student” as your user type.',
            'Click the “Complete registration” button.',
        ],
        images: [
            { src: '/images/cav/img1.webp', alt: 'eCAV home page' },
            {
                src: '/images/cav/img2.webp',
                alt: 'CHED One Touch sign-up form',
            },
            {
                src: '/images/cav/img3.jpg',
                alt: 'eCAV access and authorization',
            },
            { src: '/images/cav/img4.jpg', alt: 'eCAV registration form' },
        ],
    },
    {
        title: 'eCAV evaluation',
        items: [
            'Open the “My Applications” tab and click the “New Application” button.',
            'Read the reminders and guidelines, tick the checkbox, and click “Continue”.',
            'Fill in all the required fields.',
            'Review your application before submitting it.',
        ],
        images: [
            { src: '/images/cav/ecav2.webp', alt: 'eCAV new application form' },
        ],
    },
    {
        title: 'Payment',
        items: [
            'Select “Landbank” and click the “Pay now” button. You will be redirected to Link.BizPortal to complete the payment.',
            'Select your payment mode (Landbank, ATM, GCash, ShopeePay, and others).',
            'Authorize the transaction using your ATM PIN, one-time password (OTP), or MPIN.',
            'View or print the payment confirmation receipt or electronic official receipt (eOR).',
        ],
        images: [
            {
                src: '/images/cav/pay1.webp',
                alt: 'Landbank Link.BizPortal payment page',
            },
        ],
    },
];

export default function CavApplication() {
    return (
        <>
            <Head title="CAV Application">
                <meta
                    name="description"
                    content="How to apply online for Certification, Authentication, and Verification (CAV) through the CHED eCAV portal."
                />
            </Head>

            <PageHeader
                title="CAV Application"
                description="Apply online for Certification, Authentication, and Verification (CAV) of academic records through the CHED eCAV portal."
                breadcrumbs={[
                    { title: 'Online Services', href: '/online-services' },
                    { title: 'CAV Application', href: cavApplication() },
                ]}
            >
                <Button asChild className="w-fit">
                    <a
                        href={ECAV_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Go to eCAV portal
                        <ExternalLink className="size-4" aria-hidden />
                    </a>
                </Button>
            </PageHeader>

            <div className="container-page py-8">
                <ol className="space-y-10">
                    {steps.map((step, index) => (
                        <li
                            key={step.title}
                            className="grid gap-6 lg:grid-cols-2"
                        >
                            <div className="space-y-4">
                                <h2 className="flex items-center gap-3 text-xl font-bold text-brand dark:text-primary">
                                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-base text-gold-foreground">
                                        {index + 1}
                                    </span>
                                    {step.title}
                                </h2>
                                <ul className="list-disc space-y-2 pl-6 text-muted-foreground marker:text-brand">
                                    {step.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {step.images.map((image) => (
                                    <a
                                        key={image.src}
                                        href={image.src}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={
                                            step.images.length === 1
                                                ? 'col-span-2'
                                                : undefined
                                        }
                                    >
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            loading="lazy"
                                            className="w-full rounded-md border shadow-xs hover:opacity-90"
                                        />
                                    </a>
                                ))}
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </>
    );
}
