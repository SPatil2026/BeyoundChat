const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'beyondchats'
};

// Get all articles
app.get('/api/articles', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM articles ORDER BY created_at DESC');
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get latest unprocessed article
app.get('/api/articles/latest', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM articles WHERE is_updated = 0 ORDER BY created_at DESC LIMIT 1');
    await connection.end();
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific article
app.get('/api/articles/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    await connection.end();
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create article
app.post('/api/articles', async (req, res) => {
  try {
    const { title, content, url, published_at, is_updated, references } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO articles (title, content, url, published_at, is_updated, `references`) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, url || null, published_at || new Date(), is_updated || false, JSON.stringify(references || [])]
    );
    await connection.end();
    res.status(201).json({ id: result.insertId, message: 'Article created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update article
app.put('/api/articles/:id', async (req, res) => {
  try {
    const { content, is_updated, references } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE articles SET content = ?, is_updated = ?, `references` = ? WHERE id = ?',
      [content, is_updated || true, JSON.stringify(references || []), req.params.id]
    );
    await connection.end();
    res.json({ message: 'Article updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete article
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM articles WHERE id = ?', [req.params.id]);
    await connection.end();
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scrape articles from BeyondChats
app.post('/api/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('https://beyondchats.com/blogs/');
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Get page content
    const content = await page.content();
    const $ = cheerio.load(content);
    
    const articles = [];
    
    // Try different selectors for articles
    const selectors = ['.blog-post', '.post', 'article', '.entry', '.blog-item'];
    
    for (const selector of selectors) {
      $(selector).each((i, element) => {
        if (articles.length >= 5) return false;
        
        const title = $(element).find('h1, h2, h3, .title').first().text().trim();
        const content = $(element).find('.content, p').first().text().trim();
        const url = $(element).find('a').first().attr('href');
        
        if (title && content) {
          articles.push({
            title,
            content: content.substring(0, 500),
            url: url ? (url.startsWith('http') ? url : `https://beyondchats.com${url}`) : null,
            published_at: new Date(),
            is_updated: false,
            references: []
          });
        }
      });
      
      if (articles.length >= 5) break;
    }
    
    await browser.close();
    
    // If no articles found, create sample data
    if (articles.length === 0) {
      articles.push(
        {
          title: 'Getting Started with BeyondChats',
          content: 'Learn how to use BeyondChats platform for better customer engagement and support.',
          url: 'https://beyondchats.com/blog/getting-started',
          published_at: new Date(),
          is_updated: false,
          references: []
        },
        {
          title: 'Advanced Chat Features',
          content: 'Explore advanced features of BeyondChats including automation and analytics.',
          url: 'https://beyondchats.com/blog/advanced-features',
          published_at: new Date(),
          is_updated: false,
          references: []
        }
      );
    }
    
    // Save to database
    const connection = await mysql.createConnection(dbConfig);
    let count = 0;
    
    for (const article of articles) {
      try {
        await connection.execute(
          'INSERT INTO articles (title, content, url, published_at, is_updated, `references`) VALUES (?, ?, ?, ?, ?, ?)',
          [article.title, article.content, article.url, article.published_at, article.is_updated, JSON.stringify(article.references)]
        );
        count++;
      } catch (err) {
        // Skip duplicates
      }
    }
    
    await connection.end();
    
    res.json({ message: 'Articles scraped successfully', count });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`BeyondChats API server running on http://localhost:${PORT}`);
});