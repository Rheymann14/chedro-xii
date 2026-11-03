<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    /**
     * Seed the editable static pages. Existing pages are left untouched so
     * edits made by administrators are never overwritten.
     */
    public function run(): void
    {
        foreach ($this->pages() as $slug => [$title, $description, $body]) {
            Page::query()->firstOrCreate(['slug' => $slug], [
                'title' => $title,
                'meta_description' => $description,
                'body' => $body,
                'is_published' => true,
            ]);
        }
    }

    /**
     * @return array<string, array{0: string, 1: string, 2: string}>
     */
    private function pages(): array
    {
        return [
            'historical-background' => [
                'Historical Background',
                'The history of the Commission on Higher Education, from Republic Act 7722 to the Higher Education Modernization Act of 1997.',
                <<<'HTML'
                <p>The Commission on Higher Education (CHED) was created on May 18, 1994 through the passage of <a href="https://ched.gov.ph/wp-content/uploads/2017/05/Republic-Act-7722.pdf" target="_blank">Republic Act 7722</a>, or the Higher Education Act of 1994. CHED, an attached agency to the Office of the President for administrative purposes, is headed by a chairperson and four commissioners, each having a term of office of four years. The Commission En Banc acts as a collegial body in formulating plans, policies and strategies relating to higher education and the operation of CHED.</p>
                <p>The creation of CHED was part of a broad agenda of reforms on the country’s education system outlined by the Congressional Commission on Education (EDCOM) in 1992. Part of the reforms was the trifocalization of the education sector into three governing bodies: the CHED for tertiary and graduate education, the Department of Education (DepEd) for basic education and the Technical Education and Skills Development Authority (TESDA) for technical-vocational and middle-level education.</p>
                <p>In 1997, <a href="https://ched.gov.ph/wp-content/uploads/2017/05/Republic-Act-No.-8292-The-Higher-Education-Modernization-Act-of-1997.pdf" target="_blank">Republic Act (RA) No. 8292</a>, otherwise known as the “Higher Education Modernization Act of 1997”, was passed to establish a complete, adequate and integrated system of higher education. The said law also modified and made uniform the composition of the Governing Boards of chartered state universities and colleges (SUCs) nationwide in order to:</p>
                <ol>
                <li>achieve a more coordinated and integrated system of higher education;</li>
                <li>render them more effective in the formulation and implementation of policies on higher education;</li>
                <li>provide for more relevant direction in their governance; and</li>
                <li>ensure the enjoyment of academic freedom as guaranteed by the Constitution.</li>
                </ol>
                HTML,
            ],
            'mandate' => [
                'Mandate',
                'The mandate of the Commission on Higher Education under Republic Act 7722.',
                <<<'HTML'
                <p>Given the national government’s commitment to transformational leadership that puts education as the central strategy for investing in the Filipino people, reducing poverty, and building national competitiveness and pursuant to Republic Act 7722, CHED shall:</p>
                <ol>
                <li>Promote relevant and quality higher education (i.e. higher education institutions and programs are at par with international standards and graduates and professionals are highly competent and recognized in the international arena);</li>
                <li>Ensure that quality higher education is accessible to all who seek it particularly those who may not be able to afford it;</li>
                <li>Guarantee and protect academic freedom for continuing intellectual growth, advancement of learning and research, development of responsible and effective leadership, education of high level professionals, and enrichment of historical and cultural heritages; and</li>
                <li>Commit to moral ascendancy that eradicates corrupt practices, institutionalizes transparency and accountability and encourages participatory governance in the Commission and the sub-sector.</li>
                </ol>
                HTML,
            ],
            'vision-and-mission' => [
                'Vision and Mission',
                'The vision and mission of the Commission on Higher Education.',
                <<<'HTML'
                <h2>Vision</h2>
                <p>A Philippine Higher Education system that is accessible, equitable and produces locally responsive, innovative and globally competitive graduates and lifelong learners.</p>
                <h2>Mission</h2>
                <p>To promote equitable access and ensure quality and relevance of higher education institutions and their programs.</p>
                HTML,
            ],
            'quality-policy' => [
                'Quality Policy Statement',
                'The quality policy statement of the Commission on Higher Education.',
                <<<'HTML'
                <p>We, at the Commission on Higher Education (CHED), shall lead the Philippine higher education sector to:</p>
                <ul>
                <li><strong>C</strong>ultivate an equitable and sustainable higher education landscape that produces locally responsive, innovative, globally competitive graduates, and lifelong learners;</li>
                <li><strong>H</strong>armonize mandates to promote inclusive access to higher education, ensure sustainable quality assurance of programs, and assert relevance of institutions;</li>
                <li><strong>E</strong>xemplify resilience and humility in service, integrity, excellence, and development-driven mindset; and,</li>
                <li><strong>D</strong>emonstrate commitment to fulfill statutory and regulatory requirements to maintain and achieve continual improvement in our Quality Management System to achieve our vision.</li>
                </ul>
                HTML,
            ],
            'citizens-charter' => [
                "Citizen's Charter",
                "The Citizen's Charter of CHED Regional Office XII, describing our frontline services and service standards.",
                '<p>The Citizen’s Charter lists the frontline services of CHED Regional Office XII, their requirements, processing steps, fees, and processing times. An updated copy will be published here.</p>',
            ],
            'transparency-seal' => [
                'Transparency Seal',
                'Transparency Seal disclosures of CHED Regional Office XII.',
                '<p>In compliance with the Transparency Seal requirement of the General Appropriations Act, CHED Regional Office XII publishes its mandates, officials, annual reports, budgets, and procurement information on this page.</p>',
            ],
            'privacy-notice' => [
                'Data Privacy Notice',
                'How CHED Regional Office XII collects and protects personal information.',
                '<p>CHED Regional Office XII is committed to protecting your personal information in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173). Information submitted through this website, such as inquiries sent through the contact form, is used only to respond to your request and is accessible only to authorized personnel.</p>',
            ],
            'accessibility' => [
                'Accessibility Statement',
                'Accessibility features of the CHED Regional Office XII website.',
                '<p>This website follows the Government Web Template accessibility guidelines. It supports keyboard navigation, a “Skip to main content” link, and a high-contrast mode that can be toggled from the top bar. If you encounter any difficulty using this website, please contact us.</p>',
            ],
        ];
    }
}
