#!/usr/bin/env sh

npm run docs:build

cd ./packages/argdown-core

npm run docs:build

cd ../argdown-node

npm run docs:build

cd ../argdown-sandbox

npm run build

cd ../../

cp ./packages/argdown-core/CHANGELOG.md ./docs/changes/argdown-core.md

cp ./packages/argdown-node/CHANGELOG.md ./docs/changes/argdown-node.md

cp ./packages/argdown-cli/CHANGELOG.md ./docs/changes/argdown-cli.md

cp ./packages/argdown-language-server/CHANGELOG.md ./docs/changes/argdown-language-server.md

cp ./packages/argdown-vscode/CHANGELOG.md ./docs/changes/argdown-vscode.md

cp ./packages/argdown-sandbox/CHANGELOG.md ./docs/changes/argdown-sandbox.md