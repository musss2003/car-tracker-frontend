#!/bin/bash

# Automated Git History Cleanup
# Removes hardcoded localhost URL from SecurityTab.tsx in commit dfc60f3

set -e

echo "🔧 Automated Git History Fix"
echo "============================="
echo ""

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

if [[ "$CURRENT_BRANCH" != "feature/user-profile" && "$CURRENT_BRANCH" != "feature/notifications" ]]; then
    echo "❌ Please run this script from feature/user-profile or feature/notifications branch"
    exit 1
fi

echo "⚠️  This will:"
echo "  1. Rewrite commit dfc60f3 to remove hardcoded URL"
echo "  2. Change all commit hashes after that point"
echo "  3. Require force-push to update remote"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "📦 Creating backup..."
git branch backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

echo ""
echo "🔨 Applying fix using git filter-branch..."

# Use git filter-branch to rewrite the specific file in all commits
git filter-branch --force --tree-filter '
    FILE="src/features/users/components/UserProfile/SecurityTab.tsx"
    if [ -f "$FILE" ]; then
        # Check if file contains the hardcoded URL
        if grep -q "http://localhost:5001" "$FILE" 2>/dev/null; then
            echo "Fixing $FILE in commit $(git rev-parse --short HEAD)..."
            sed -i "s|const API_BASE_URL = import.meta.env.VITE_API_BASE_URL \|\| '\''http://localhost:5001'\'';|const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;|g" "$FILE"
        fi
    fi
' --prune-empty -- dfc60f3~1..HEAD

echo ""
echo "✅ History rewritten successfully!"
echo ""
echo "📋 Summary:"
git log --oneline -10
echo ""
echo "🚀 Next step: Force push to remote"
echo "   git push --force-with-lease origin $CURRENT_BRANCH"
echo ""
echo "⚠️  WARNING: After force push, other developers will need to:"
echo "   git fetch origin"
echo "   git reset --hard origin/$CURRENT_BRANCH"
echo ""
