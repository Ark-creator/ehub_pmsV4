<?php
// Generate a fresh bcrypt hash for password: admin123
$password = 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);

echo "New password hash for 'admin123':\n";
echo $hash . "\n\n";

echo "SQL to update admin user:\n";
echo "UPDATE users SET password_hash = '" . $hash . "' WHERE email = 'admin@ehub.com';\n\n";

// Verify it works
if (password_verify($password, $hash)) {
    echo "✓ Hash verification successful!\n";
} else {
    echo "✗ Hash verification failed!\n";
}
?>
