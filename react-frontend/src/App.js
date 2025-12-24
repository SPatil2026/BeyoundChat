import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/articles`);
      setArticles(response.data);
    } catch (err) {
      setError('Failed to fetch articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchArticles}>Retry</button>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>BeyondChats Articles</h1>
          <p>Discover our latest insights and updates</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {articles.length === 0 ? (
            <div className="no-articles">
              <h2>No articles found</h2>
              <p>Check back later for new content!</p>
            </div>
          ) : (
            <div className="articles-grid">
              {articles.map((article) => (
                <article key={article.id} className={`article-card ${article.is_updated ? 'updated' : 'original'}`}>
                  <div className="article-header">
                    <h2 className="article-title">{article.title}</h2>
                    <div className="article-meta">
                      <span className="date">{formatDate(article.created_at)}</span>
                      <span className={`badge ${article.is_updated ? 'updated' : 'original'}`}>
                        {article.is_updated ? 'Updated' : 'Original'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="article-content">
                    <p>{truncateContent(article.content)}</p>
                  </div>
                  
                  {article.url && (
                    <div className="article-source">
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        View Source
                      </a>
                    </div>
                  )}
                  
                  {article.references && article.references.length > 0 && (
                    <div className="references">
                      <h4>References:</h4>
                      <ul>
                        {article.references.map((ref, index) => (
                          <li key={index}>
                            <a href={ref.url} target="_blank" rel="noopener noreferrer">
                              {ref.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 BeyondChats. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;