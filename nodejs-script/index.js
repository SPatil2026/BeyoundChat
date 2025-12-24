const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const LARAVEL_API_BASE = process.env.LARAVEL_API_BASE || 'http://localhost:8000/api';

class ArticleProcessor {
  async fetchLatestArticle() {
    try {
      const response = await axios.get(`${LARAVEL_API_BASE}/articles/latest`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest article:', error.message);
      return null;
    }
  }

  async searchGoogle(query) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
      await page.waitForSelector('div[data-ved]');
      
      const results = await page.evaluate(() => {
        const links = [];
        const elements = document.querySelectorAll('div[data-ved] a[href^="/url?q="]');
        
        for (let i = 0; i < Math.min(elements.length, 5); i++) {
          const element = elements[i];
          const href = element.getAttribute('href');
          const url = new URLSearchParams(href.split('?')[1]).get('q');
          
          if (url && !url.includes('google.com') && !url.includes('youtube.com')) {
            const title = element.querySelector('h3')?.textContent || '';
            links.push({ url, title });
          }
        }
        
        return links;
      });
      
      await browser.close();
      return results.slice(0, 2);
    } catch (error) {
      await browser.close();
      console.error('Error searching Google:', error.message);
      return [];
    }
  }

  async scrapeArticleContent(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .advertisement').remove();
      
      // Try different selectors for main content
      const contentSelectors = [
        'article',
        '.post-content',
        '.entry-content',
        '.content',
        'main',
        '.article-body'
      ];
      
      let content = '';
      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          if (content.length > 200) break;
        }
      }
      
      // Fallback to paragraphs
      if (!content || content.length < 200) {
        content = $('p').map((i, el) => $(el).text()).get().join('\n').trim();
      }
      
      return {
        title: $('title').text() || $('h1').first().text() || '',
        content: content.substring(0, 3000), // Limit content length
        url
      };
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return null;
    }
  }

  async generateUpdatedArticle(originalArticle, referenceArticles) {
    const prompt = `
You are a content writer. Update the following article to match the style and formatting of the reference articles while keeping the core message intact.

Original Article:
Title: ${originalArticle.title}
Content: ${originalArticle.content}

Reference Articles:
${referenceArticles.map((ref, i) => `
Reference ${i + 1}:
Title: ${ref.title}
Content: ${ref.content}
URL: ${ref.url}
`).join('\n')}

Instructions:
1. Rewrite the original article to match the tone, style, and formatting of the reference articles
2. Keep the core message and key points of the original article
3. Improve readability and engagement
4. Make it SEO-friendly
5. Return only the updated content, no additional commentary

Updated Article:`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating updated article:', error.message);
      return null;
    }
  }

  async publishUpdatedArticle(originalId, updatedContent, references) {
    try {
      const updatedArticle = {
        content: updatedContent,
        is_updated: true,
        references: references.map(ref => ({
          title: ref.title,
          url: ref.url
        }))
      };

      const response = await axios.put(`${LARAVEL_API_BASE}/articles/${originalId}`, updatedArticle);
      return response.data;
    } catch (error) {
      console.error('Error publishing updated article:', error.message);
      return null;
    }
  }

  async processArticle() {
    console.log('Starting article processing...');
    
    // Step 1: Fetch latest article
    const article = await this.fetchLatestArticle();
    if (!article) {
      console.log('No article found to process');
      return;
    }
    
    console.log(`Processing article: ${article.title}`);
    
    // Step 2: Search Google
    const searchResults = await this.searchGoogle(article.title);
    if (searchResults.length === 0) {
      console.log('No search results found');
      return;
    }
    
    console.log(`Found ${searchResults.length} search results`);
    
    // Step 3: Scrape reference articles
    const referenceArticles = [];
    for (const result of searchResults) {
      const scraped = await this.scrapeArticleContent(result.url);
      if (scraped && scraped.content) {
        referenceArticles.push(scraped);
      }
    }
    
    if (referenceArticles.length === 0) {
      console.log('No reference articles could be scraped');
      return;
    }
    
    console.log(`Scraped ${referenceArticles.length} reference articles`);
    
    // Step 4: Generate updated article
    const updatedContent = await this.generateUpdatedArticle(article, referenceArticles);
    if (!updatedContent) {
      console.log('Failed to generate updated content');
      return;
    }
    
    // Step 5: Add references and publish
    const contentWithReferences = `${updatedContent}

## References
${referenceArticles.map((ref, i) => `${i + 1}. [${ref.title}](${ref.url})`).join('\n')}`;
    
    const published = await this.publishUpdatedArticle(article.id, contentWithReferences, referenceArticles);
    
    if (published) {
      console.log('Article updated and published successfully!');
      console.log(`Updated article ID: ${published.id}`);
    } else {
      console.log('Failed to publish updated article');
    }
  }
}

// Run the processor
const processor = new ArticleProcessor();
processor.processArticle().catch(console.error);