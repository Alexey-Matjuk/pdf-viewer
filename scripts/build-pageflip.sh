#!/bin/bash

# Script to build StPageFlip

set -e  # Exit on error

echo "📦 Cloning StPageFlip..."
git clone https://github.com/Alexey-Matjuk/StPageFlip.git temp-pageflip

cd temp-pageflip

echo "📥 Installing dependencies..."
npm install

echo "🔨 Building the library..."
npm run build

echo "📋 Copying built files to src/lib..."
cd ..
mkdir -p src/lib
cp -r temp-pageflip/dist/* src/lib/

echo "🧹 Cleaning up temporary files..."
rm -rf temp-pageflip

echo "✅ Done! StPageFlip built and copied to src/lib/"
echo "📁 Files available at: src/lib/"
ls -la src/lib/
