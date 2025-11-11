#!/bin/bash

# Script to build StPageFlip from local development copy

set -e  # Exit on error

echo "🔨 Building StPageFlip from local development copy..."

# Check if StPageFlip-dev exists, if not clone it
if [ ! -d "StPageFlip-dev" ]; then
    echo "📦 StPageFlip-dev not found, cloning repository..."
    git clone https://github.com/Alexey-Matjuk/StPageFlip.git StPageFlip-dev
    echo "✅ Repository cloned successfully"
fi

cd StPageFlip-dev

echo "📥 Installing/updating dependencies..."
npm install --legacy-peer-deps

# Install rollup if not present
if [ ! -f "node_modules/.bin/rollup" ]; then
    echo "📦 Installing rollup..."
    npm install --save-dev rollup --legacy-peer-deps
fi

echo "🔧 Building the library..."
./node_modules/.bin/rollup -c

echo "📋 Copying built files to src/lib..."
cd ..
mkdir -p src/lib
cp -r StPageFlip-dev/dist/* src/lib/

echo "✅ Done! Your local changes are now in src/lib/"
echo "📝 Make changes in StPageFlip-dev/src/ and run this script again to rebuild"
