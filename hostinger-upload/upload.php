<?php
/**
 * DataForge — Profile Photo Upload API
 * Upload this file to your Hostinger shared hosting public_html/api/upload.php
 *
 * Set NEXT_PUBLIC_HOSTINGER_UPLOAD_URL=https://yourdomain.com/api/upload.php
 * in your Vercel environment variables and .env.local
 *
 * CORS: update ALLOWED_ORIGIN to match your Vercel deployment URL.
 */

define('ALLOWED_ORIGIN', 'https://dataforge-omega.vercel.app');
define('UPLOAD_DIR', __DIR__ . '/avatars/');
define('MAX_SIZE',   5 * 1024 * 1024); // 5 MB
define('SECRET_KEY', 'CHANGE_THIS_TO_A_RANDOM_SECRET'); // Must match HOSTINGER_UPLOAD_SECRET env var

header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Upload-Secret');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Optional secret key check for security
// $secret = $_SERVER['HTTP_X_UPLOAD_SECRET'] ?? '';
// if ($secret !== SECRET_KEY) {
//     http_response_code(403);
//     echo json_encode(['error' => 'Forbidden']);
//     exit;
// }

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];
$uid  = preg_replace('/[^a-zA-Z0-9\-]/', '', $_POST['uid'] ?? 'unknown');

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload error: ' . $file['error']]);
    exit;
}

if ($file['size'] > MAX_SIZE) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Max 5 MB.']);
    exit;
}

$allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Only JPEG, PNG, GIF, WebP, AVIF images allowed.']);
    exit;
}

$ext       = pathinfo($file['name'], PATHINFO_EXTENSION);
$ext       = strtolower($ext);
$filename  = 'avatar_' . $uid . '_' . time() . '.' . $ext;
$dest      = UPLOAD_DIR . $filename;

if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Remove old avatars for this user
foreach (glob(UPLOAD_DIR . 'avatar_' . $uid . '_*') as $old) {
    unlink($old);
}

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit;
}

$protocol  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host      = $_SERVER['HTTP_HOST'];
$folder    = str_replace(__DIR__, '', UPLOAD_DIR);
$url       = $protocol . '://' . $host . $folder . $filename;

echo json_encode([
    'success'  => true,
    'url'      => $url,
    'filename' => $filename,
]);
