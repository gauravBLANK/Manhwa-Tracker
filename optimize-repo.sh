#!/bin/bash

echo "🔧 Optimizing repository for faster Git operations..."

# 1. Clean up Git repository
echo "Cleaning up Git repository..."
git gc --aggressive --prune=now

# 2. Optimize Git configuration for speed
echo "Optimizing Git configuration..."
git config core.preloadindex true
git config core.fscache true
git config gc.auto 256

# 3. Check for large files
echo "Checking for large files..."
find . -type f -size +50k -not -path "./.git/*" -exec ls -lh {} \;

echo "✅ Repository optimization complete!"
echo "💡 Consider compressing large images or using Git LFS for files >100KB"