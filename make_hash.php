<?php
$hash = password_hash('admin123', PASSWORD_BCRYPT);
echo "Hash: " . $hash . "\n";
echo "Length: " . strlen($hash) . "\n";
echo "Verify: " . (password_verify('admin123', $hash) ? 'TRUE' : 'FALSE') . "\n";
echo "\nSQL to run in phpMyAdmin:\n";
echo "UPDATE users SET password_hash = '" . $hash . "' WHERE email = 'admin@ehub.com';\n";
?>
