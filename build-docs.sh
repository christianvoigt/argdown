#!/usr/bin/env sh

npm run docs:build

cd ./packages/argdown-core

npm run docs:build

cd ../argdown-node

npm run docs:build

cd ../argdown-sandbox

npm run build