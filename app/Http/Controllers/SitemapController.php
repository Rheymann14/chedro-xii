<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Post;
use Carbon\CarbonInterface;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $xml = Cache::remember('sitemap.xml', now()->addHour(), function (): string {
            $staticUrls = [
                route('home'),
                route('announcements.index'),
                route('careers.index'),
                route('awards.index'),
                route('issuances.index'),
                route('downloads.index'),
                route('heis.index'),
                route('statistics'),
                route('cav-application'),
                route('contact.show'),
                ...array_map(fn (string $hub) => route('hubs.show', $hub), ['about', 'online-services', 'hemis', 'resources']),
            ];

            $entries = array_map(fn (string $url): string => $this->entry($url), $staticUrls);

            foreach (Page::query()->published()->get(['slug', 'updated_at']) as $page) {
                $entries[] = $this->entry(route('pages.show', $page), $page->updated_at);
            }

            foreach (Post::query()->published()->latest('published_at')->limit(500)->get(['slug', 'updated_at']) as $post) {
                $entries[] = $this->entry(route('posts.show', $post), $post->updated_at);
            }

            return '<?xml version="1.0" encoding="UTF-8"?>'
                .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                .implode('', $entries)
                .'</urlset>';
        });

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    private function entry(string $url, ?CarbonInterface $lastModified = null): string
    {
        $lastmod = $lastModified === null ? '' : '<lastmod>'.$lastModified->toAtomString().'</lastmod>';

        return '<url><loc>'.e($url).'</loc>'.$lastmod.'</url>';
    }
}
