<?php
// Test if the hash from the database actually matches admin123
$hashFromDB = '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

echo "Testing hash from database:\n";
echo "Hash: " . $hashFromDB . "\n";
echo "Password 'admin123': " . (password_verify('admin123', $hashFromDB) ? 'MATCH' : 'NO MATCH') . "\n";
echo "Password 'password': " . (password_verify('password', $hashFromDB) ? 'MATCH' : 'NO MATCH') . "\n";

echo "\n--- Generating NEW hash for 'admin123' ---\n";
$newHash = password_hash('admin123', PASSWORD_BCRYPT);
echo "New Hash: " . $newHash . "\n";
echo "Length: " . strlen($newHash) . "\n";
echo "Verify 'admin123': " . (password_verify('admin123', $newHash) ? 'MATCH' : 'NO MATCH') . "\n";

echo "\n--- SQL to update database ---\n";
echo "UPDATE users SET password_hash = '$newHash' WHERE email = 'admin@ehub.com';\n";
?>
