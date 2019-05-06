#!/bin/bash
echo 'generate service-worker.js'
npm run precache

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"
REF=$(git rev-parse --verify HEAD)
MSG="Deployed to Github pages: ${REF}"

mkdir -p .gh-pages-tmp
cp www/** .gh-pages-tmp -r

cd .gh-pages-tmp
git init
git add .
git commit -m "${MSG}"

git push "https://github.com/vandeurenglenn/crypto-slots" $SOURCE_BRANCH:$TARGET_BRANCH -f > /dev/null 2>&1
cd ../
