# BeyondChats Article Management System

A complete web scraping and content management system with Laravel API, NodeJS processing script, and React frontend.

## Project Structure

```
BeyoundChat/
├── laravel-api/          # Phase 1: Laravel CRUD API
├── nodejs-script/        # Phase 2: Google Search & LLM Processing
├── react-frontend/       # Phase 3: React UI
└── setup.bat            # Automated setup script
```

## Quick Setup

1. Run the setup script:
```bash
setup.bat
```

2. Configure environment:
   - Set up MySQL database named `beyondchats`
   - Add OpenAI API key to `nodejs-script/.env`
   - Update database credentials in `laravel-api/.env`

## Manual Setup

### Phase 1: Laravel API

```bash
cd laravel-api
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

### Phase 2: NodeJS Script

```bash
cd nodejs-script
npm install
# Add OPENAI_API_KEY to .env
npm start
```

### Phase 3: React Frontend

```bash
cd react-frontend
npm install
npm start
```

## API Endpoints

- `GET /api/articles` - List all articles
- `GET /api/articles/latest` - Get latest unprocessed article
- `GET /api/articles/{id}` - Get specific article
- `POST /api/articles` - Create new article
- `PUT /api/articles/{id}` - Update article
- `DELETE /api/articles/{id}` - Delete article
- `POST /api/scrape` - Scrape articles from BeyondChats

## Usage

1. **Scrape Articles**: `POST /api/scrape` to fetch articles from BeyondChats
2. **Process Article**: Run NodeJS script to enhance articles with Google search and LLM
3. **View Articles**: Access React frontend at http://localhost:3000

## Features

- Web scraping from BeyondChats blog
- Google search integration
- LLM-powered content enhancement
- CRUD API for article management
- Responsive React frontend
- Article versioning (original vs updated)
- Reference tracking