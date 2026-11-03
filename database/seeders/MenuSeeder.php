<?php

namespace Database\Seeders;

use App\Enums\MenuLocation;
use App\Models\MenuItem;
use App\Support\SiteMenus;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Seed the default site navigation, carried over from the previous site.
     * A top-level header item whose URL is a hub path (for example "/about")
     * also powers that hub's landing page, using its children as cards.
     */
    public function run(): void
    {
        if (MenuItem::query()->exists()) {
            return;
        }

        $header = [
            ['Home', '/', null, []],
            ['About', '/about', 'Learn about the history, mandate, and vision of CHED Regional Office XII.', [
                ['Historical Background', '/pages/historical-background', "Learn about the Commission's history and development."],
                ['Mandate', '/pages/mandate', 'Our official mandate and responsibilities.'],
                ['Vision and Mission', '/pages/vision-and-mission', 'Our vision and mission statement.'],
                ['Quality Policy Statement', '/pages/quality-policy', 'Our commitment to quality and excellence.'],
                ["Citizen's Charter", '/pages/citizens-charter', 'Service standards for our frontline services.'],
            ]],
            ['News & Updates', '/announcements', null, [
                ['Announcements', '/announcements', 'News, advisories, and postings.'],
                ['Career Opportunities', '/careers', 'Job vacancies at CHED Regional Office XII.'],
                ['Awards & Commendations', '/awards', 'Recognitions received by the office and HEIs.'],
            ]],
            ['Online Services', '/online-services', 'Apply for certifications and access CHED online systems.', [
                ['CAV Application', '/online-services/cav-application', 'Apply online for Certification, Authentication, and Verification (CAV).'],
                ['Program Evaluation Self-Assessment', 'https://monitoring.chedro12.com/', 'Submit your program evaluation self-assessment through the official portal.', true],
            ]],
            ['HEMIS', '/hemis', 'Higher Education Management Information System: statistics, institutions, and verification services.', [
                ['Statistics', '/statistics', 'Higher education statistics, reports, and data insights.'],
                ['Higher Education Institutions', '/heis', 'Directory of recognized higher education institutions in Region XII.'],
                ['Curriculum Verification', 'https://curriculum-verification.chedro12.com/', 'Verify that a curriculum meets official CHED standards.', true],
                ['Check with CHED', 'https://cwc.chedro12.com/', 'Check your records with CHED.', true],
            ]],
            ['Resources', '/resources', 'Issuances, regional memoranda, and downloadable forms.', [
                ['Regional Memoranda', '/issuances', 'Regional memoranda and advisories.'],
                ['Downloadable Forms', '/downloads', 'Forms and templates for HEIs and the public.'],
                ['CHED Issuances', 'https://ched.gov.ph/issuances/', 'Memorandum orders and issuances from the CHED Central Office.', true],
            ]],
            ['Contact Us', '/contact', null, []],
        ];

        foreach ($header as $position => [$label, $url, $description, $children]) {
            $parent = MenuItem::query()->create([
                'menu' => MenuLocation::Header,
                'label' => $label,
                'url' => $url,
                'description' => $description,
                'sort_order' => $position,
            ]);

            foreach ($children as $childPosition => $child) {
                MenuItem::query()->create([
                    'menu' => MenuLocation::Header,
                    'parent_id' => $parent->id,
                    'label' => $child[0],
                    'url' => $child[1],
                    'description' => $child[2],
                    'opens_in_new_tab' => $child[3] ?? false,
                    'sort_order' => $childPosition,
                ]);
            }
        }

        $flat = [
            MenuLocation::QuickLinks->value => [
                ['CHED Central Office', 'https://ched.gov.ph', true],
                ['UniFAST', 'https://unifast.gov.ph', true],
                ['eCAV Portal', 'https://ecav.ched.gov.ph/home', true],
                ['Regional Memoranda', '/issuances', false],
                ['Higher Education Institutions', '/heis', false],
            ],
            MenuLocation::Footer->value => [
                ['Transparency Seal', '/pages/transparency-seal', false],
                ['Data Privacy Notice', '/pages/privacy-notice', false],
                ['Accessibility Statement', '/pages/accessibility', false],
                ['Contact Us', '/contact', false],
            ],
        ];

        foreach ($flat as $menu => $items) {
            foreach ($items as $position => [$label, $url, $newTab]) {
                MenuItem::query()->create([
                    'menu' => $menu,
                    'label' => $label,
                    'url' => $url,
                    'opens_in_new_tab' => $newTab,
                    'sort_order' => $position,
                ]);
            }
        }

        SiteMenus::flush();
    }
}
