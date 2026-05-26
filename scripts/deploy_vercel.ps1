# Deploy ReviewShield to Vercel (PowerShell)
# Requirements: Install Vercel CLI: npm i -g vercel
# Set environment variable VERCEL_TOKEN with your personal token (from https://vercel.com/account/tokens)

if (-not $env:VERCEL_TOKEN) {
  Write-Error "Please set the VERCEL_TOKEN environment variable before running this script."
  exit 1
}

Write-Output "Deploying to Vercel (production)..."
# Using npx vercel to avoid needing global install
npx vercel --prod --token $env:VERCEL_TOKEN --confirm

if ($LASTEXITCODE -eq 0) {
  Write-Output "Deploy finished. Check your Vercel dashboard for logs and the production URL."
} else {
  Write-Error "Deploy command failed with exit code $LASTEXITCODE"
}
