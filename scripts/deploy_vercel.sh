#!/usr/bin/env bash
# Simple helper to deploy this project to Vercel from your local machine.
# IMPORTANT: You must run `vercel login` interactively to authenticate before using this script.

set -euo pipefail

# Check for vercel CLI
if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Installing globally..."
  npm install -g vercel
fi

echo "Please ensure you have run 'vercel login' in this terminal and are authenticated."
read -p "Have you run 'vercel login' already? (y/n) " yn
if [ "$yn" != "y" ]; then
  echo "Running 'vercel login' now..."
  vercel login
fi

# Prompt to add GEMINI_API_KEY to Vercel envs
echo
echo "Next we'll add the GEMINI_API_KEY to Vercel environment (production and preview)."
read -p "Add GEMINI_API_KEY to Vercel now? (y/n) " addkey
if [ "$addkey" = "y" ]; then
  vercel env add GEMINI_API_KEY production
  vercel env add GEMINI_API_KEY preview
fi

# Deploy (production)
echo
echo "Deploying to Vercel (production)..."
vercel --prod --yes

echo "Deployment complete. Visit the URL printed above to view the live site."
