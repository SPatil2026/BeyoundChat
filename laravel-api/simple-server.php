<?php
// Simple PHP server for Laravel API without Composer
// Run with: php -S localhost:8000 -t public

// Basic autoloader
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/app/' . str_replace('\\', '/', str_replace('App\\', '', $class)) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

// Simple routing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// CORS headers
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($method === 'OPTIONS') {
    exit(0);
}

// Database connection
function getDB() {
    $host = '127.0.0.1';
    $db = 'beyondchats';
    $user = 'root';
    $pass = '';
    
    try {
        return new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
}

// Routes
if ($uri === '/api/articles' && $method === 'GET') {
    $pdo = getDB();
    $stmt = $pdo->query('SELECT * FROM articles ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    
} elseif ($uri === '/api/articles/latest' && $method === 'GET') {
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT * FROM articles WHERE is_updated = 0 ORDER BY created_at DESC LIMIT 1');
    $stmt->execute();
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    
} elseif (preg_match('/\/api\/articles\/(\d+)/', $uri, $matches) && $method === 'GET') {
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT * FROM articles WHERE id = ?');
    $stmt->execute([$matches[1]]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    
} elseif ($uri === '/api/articles' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo = getDB();
    $stmt = $pdo->prepare('INSERT INTO articles (title, content, url, published_at, is_updated, references) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $data['title'],
        $data['content'],
        $data['url'] ?? null,
        $data['published_at'] ?? date('Y-m-d H:i:s'),
        $data['is_updated'] ?? false,
        json_encode($data['references'] ?? [])
    ]);
    echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Article created']);
    
} elseif (preg_match('/\/api\/articles\/(\d+)/', $uri, $matches) && $method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo = getDB();
    $stmt = $pdo->prepare('UPDATE articles SET content = ?, is_updated = ?, references = ? WHERE id = ?');
    $stmt->execute([
        $data['content'],
        $data['is_updated'] ?? true,
        json_encode($data['references'] ?? []),
        $matches[1]
    ]);
    echo json_encode(['message' => 'Article updated']);
    
} elseif ($uri === '/api/scrape' && $method === 'POST') {
    // Simple scraping simulation
    $articles = [
        [
            'title' => 'Sample Article 1',
            'content' => 'This is sample content for testing purposes.',
            'url' => 'https://beyondchats.com/blog/sample-1',
            'published_at' => date('Y-m-d H:i:s'),
            'is_updated' => false,
            'references' => '[]'
        ],
        [
            'title' => 'Sample Article 2', 
            'content' => 'Another sample article for demonstration.',
            'url' => 'https://beyondchats.com/blog/sample-2',
            'published_at' => date('Y-m-d H:i:s'),
            'is_updated' => false,
            'references' => '[]'
        ]
    ];
    
    $pdo = getDB();
    $count = 0;
    foreach ($articles as $article) {
        $stmt = $pdo->prepare('INSERT IGNORE INTO articles (title, content, url, published_at, is_updated, references) VALUES (?, ?, ?, ?, ?, ?)');
        if ($stmt->execute(array_values($article))) {
            $count++;
        }
    }
    
    echo json_encode(['message' => 'Articles scraped successfully', 'count' => $count]);
    
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}
?>