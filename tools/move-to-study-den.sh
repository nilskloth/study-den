#!/bin/sh
# One-off: move the live site from /sats-trainer/ to /study-den/ (Nov 2026).
#   1. tools/deploy.sh study-den          (the app in its new folder)
#   2. tools/move-to-study-den.sh         (this script)
# Moves the server-only data (activity logs, AI usage, security log, upload
# backups in api/state/; uploaded word lists in data/uploads/) into the new
# folder, removes the old copy of config.php (API key) and makes the old
# address forward to the new one. The old app files stay, unused, for rollback.
# Credentials: ~/.netrc, like deploy.sh.
set -e
cd "$(dirname "$0")/.."
HOST=5186167.ssh.w1.strato.hosting
USER=stu698771234
OLD=sats-trainer
NEW=study-den

lftp "sftp://$USER@$HOST" <<LFTP
set sftp:auto-confirm yes
set cmd:fail-exit yes
cls $NEW/index.html
mv $OLD/api/state $NEW/api/state-moved
rm -r $NEW/api/state
mv $NEW/api/state-moved $NEW/api/state
set cmd:fail-exit no
mkdir -p $NEW/data
mv $OLD/data/uploads $NEW/data/uploads
rm $OLD/api/config.php
set cmd:fail-exit yes
put tools/redirect-old/.htaccess -o $OLD/.htaccess
put tools/redirect-old/index.html -o $OLD/index.html
cls -l $NEW/api/state
LFTP
echo "Moved. Old address now forwards: https://6oclock.net/$OLD/ → https://6oclock.net/$NEW/"
