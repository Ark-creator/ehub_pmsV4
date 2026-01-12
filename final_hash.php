<?php
$hash = password_hash('admin123', PASSWORD_BCRYPT);
file_put_contents('final_sql.txt', "UPDATE users SET password_hash = '$hash' WHERE email = 'admin@ehub.com';");
echo "DONE";
?>
