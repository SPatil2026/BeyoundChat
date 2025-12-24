<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;
use Carbon\Carbon;

class ArticleController extends Controller
{
    public function index()
    {
        return response()->json(Article::orderBy('created_at', 'desc')->get());
    }

    public function show($id)
    {
        $article = Article::findOrFail($id);
        return response()->json($article);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'url' => 'nullable|string',
            'published_at' => 'nullable|date',
            'is_updated' => 'boolean',
            'references' => 'nullable|array'
        ]);

        $article = Article::create($validated);
        return response()->json($article, 201);
    }

    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'string',
            'content' => 'string',
            'url' => 'nullable|string',
            'published_at' => 'nullable|date',
            'is_updated' => 'boolean',
            'references' => 'nullable|array'
        ]);

        $article->update($validated);
        return response()->json($article);
    }

    public function destroy($id)
    {
        $article = Article::findOrFail($id);
        $article->delete();
        return response()->json(['message' => 'Article deleted successfully']);
    }

    public function scrapeAndStore()
    {
        $client = new Client();
        $url = 'https://beyondchats.com/blogs/';
        
        try {
            $response = $client->get($url);
            $html = $response->getBody()->getContents();
            $crawler = new Crawler($html);
            
            // Find pagination and get last page
            $lastPageUrl = $this->getLastPageUrl($crawler, $url);
            
            if ($lastPageUrl) {
                $lastPageResponse = $client->get($lastPageUrl);
                $lastPageHtml = $lastPageResponse->getBody()->getContents();
                $lastPageCrawler = new Crawler($lastPageHtml);
                
                $articles = $this->extractArticles($lastPageCrawler);
                
                foreach ($articles as $articleData) {
                    Article::updateOrCreate(
                        ['url' => $articleData['url']],
                        $articleData
                    );
                }
                
                return response()->json([
                    'message' => 'Articles scraped successfully',
                    'count' => count($articles)
                ]);
            }
            
            return response()->json(['message' => 'No articles found'], 404);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getLatest()
    {
        $article = Article::where('is_updated', false)->orderBy('created_at', 'desc')->first();
        return response()->json($article);
    }

    private function getLastPageUrl($crawler, $baseUrl)
    {
        // Look for pagination links
        $paginationLinks = $crawler->filter('.pagination a, .page-numbers a');
        
        if ($paginationLinks->count() > 0) {
            $lastLink = $paginationLinks->last();
            $href = $lastLink->attr('href');
            
            if ($href && !str_starts_with($href, 'http')) {
                return rtrim($baseUrl, '/') . '/' . ltrim($href, '/');
            }
            return $href;
        }
        
        return $baseUrl;
    }

    private function extractArticles($crawler)
    {
        $articles = [];
        
        // Common selectors for blog articles
        $articleSelectors = [
            '.blog-post',
            '.post',
            'article',
            '.entry',
            '.blog-item'
        ];
        
        foreach ($articleSelectors as $selector) {
            $elements = $crawler->filter($selector);
            
            if ($elements->count() > 0) {
                $elements->each(function ($node) use (&$articles) {
                    if (count($articles) >= 5) return;
                    
                    $title = $this->extractText($node, 'h1, h2, h3, .title, .post-title');
                    $content = $this->extractText($node, '.content, .post-content, p');
                    $url = $this->extractUrl($node, 'a');
                    
                    if ($title && $content) {
                        $articles[] = [
                            'title' => $title,
                            'content' => $content,
                            'url' => $url,
                            'published_at' => Carbon::now(),
                            'is_updated' => false
                        ];
                    }
                });
                
                if (count($articles) >= 5) break;
            }
        }
        
        return array_slice($articles, 0, 5);
    }

    private function extractText($node, $selector)
    {
        $element = $node->filter($selector)->first();
        return $element->count() > 0 ? trim($element->text()) : null;
    }

    private function extractUrl($node, $selector)
    {
        $element = $node->filter($selector)->first();
        return $element->count() > 0 ? $element->attr('href') : null;
    }
}