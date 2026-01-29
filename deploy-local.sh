#!/usr/bin/env bash
# Ganti variabel berikut sebelum dijalankan:
USERNAME="GITHUB_USERNAME"
REPO="pengumuman-himasta-2026"
GITHUB_TOKEN="ghp_your_personal_access_token_here"  # simpan aman, atau gunakan environment variable
EMAIL="you@example.com"
NAME="Your Name"

# Optional: buat repo via API (jika belum ada)
curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
     -d "{\"name\":\"${REPO}\",\"private\":false}" \
     https://api.github.com/user/repos

# Siapkan git lokal dan push
git init
git config user.email "${EMAIL}"
git config user.name "${NAME}"
git add .
git commit -m "Initial commit: pengumuman HIMASTA-ITS 2026"
git branch -M main
git remote add origin "https://github.com/${USERNAME}/${REPO}.git"
git push -u origin main

# Aktifkan GitHub Pages (serve from main / root)
curl -X PUT -H "Authorization: token ${GITHUB_TOKEN}" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/${USERNAME}/${REPO}/pages \
     -d '{"source":{"branch":"main","path":"/"}}'

# Tampilkan status Pages
curl -H "Authorization: token ${GITHUB_TOKEN}" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/${USERNAME}/${REPO}/pages