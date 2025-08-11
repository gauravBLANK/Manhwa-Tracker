#!/bin/bash

# Fast Git Commit Script
# Usage: ./fast-commit.sh "commit message"

echo "⚡ Fast Git Commit Starting..."

# Check if message provided
if [ -z "$1" ]; then
    echo "❌ Please provide a commit message"
    echo "Usage: ./fast-commit.sh 'your commit message'"
    exit 1
fi

# Quick status check
echo "📋 Checking status..."
git status --porcelain

# Add all changes
echo "➕ Adding changes..."
git add .

# Commit with message
echo "💾 Committing..."
git commit -m "$1"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Done! Changes pushed successfully."