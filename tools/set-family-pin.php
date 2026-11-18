<?php
/*
 * Set Finn's or Oskar's PIN (the start screen asks for it once on a new
 * device) in api/config.php. Only its hash is stored. From the repo root:
 *     php tools/set-family-pin.php finn          (asks for the PIN, hidden)
 *     php tools/set-family-pin.php finn 123456
 * Then deploy (tools/deploy.sh study-den) — that uploads config.php.
 */

if (PHP_SAPI !== 'cli') exit(1);
$path = __DIR__ . '/../api/config.php';
if (!is_file($path)) { fwrite(STDERR, "api/config.php not found\n"); exit(1); }

$child = strtolower((string) ($argv[1] ?? ''));
if (!in_array($child, ['finn', 'oskar'], true)) { fwrite(STDERR, "Usage: php tools/set-family-pin.php finn|oskar [pin]\n"); exit(1); }
$pin = (string) ($argv[2] ?? '');
if ($pin === '') {
  echo "PIN for {$child} (4–8 digits): ";
  @system('stty -echo');
  $pin = trim((string) fgets(STDIN));
  @system('stty echo');
  echo "\n";
}
if (!preg_match('/^\d{4,8}$/', $pin)) { fwrite(STDERR, "A PIN is 4–8 digits — nothing changed.\n"); exit(1); }

$config = include $path;
$pins = is_array($config['family_pin_hashes'] ?? null) ? $config['family_pin_hashes'] : [];
$pins[$child] = password_hash($pin, PASSWORD_DEFAULT);
ksort($pins);
$line = "  'family_pin_hashes' => [" . implode(', ', array_map(
  fn($k, $v) => var_export($k, true) . ' => ' . var_export($v, true), array_keys($pins), $pins)) . '],';

$src = file_get_contents($path);
$re = "/^\\s*'family_pin_hashes'\\s*=>.*$/m";
if (preg_match($re, $src)) {
  $src = preg_replace($re, str_replace(['\\', '$'], ['\\\\', '\\$'], $line), $src, 1);
} else {
  $pos = strrpos($src, '];');
  $src = substr($src, 0, $pos) . "  // Finn's and Oskar's start-screen PINs (php tools/set-family-pin.php)\n" . $line . "\n" . substr($src, $pos);
}

$check = tempnam(sys_get_temp_dir(), 'cfg');
file_put_contents($check, $src);
$parsed = include $check;
unlink($check);
if (!is_array($parsed) || !password_verify($pin, $parsed['family_pin_hashes'][$child] ?? '')) {
  fwrite(STDERR, "Something went wrong editing config.php — nothing changed.\n"); exit(1);
}
file_put_contents($path, $src);
echo "Saved {$child}'s PIN. Now deploy: tools/deploy.sh study-den\n";
