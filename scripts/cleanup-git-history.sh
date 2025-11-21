#!/bin/bash

# Git History Cleanup Script
# This script removes the hardcoded localhost URL from commit dfc60f3

set -e  # Exit on error

echo "🔧 Git History Cleanup Script"
echo "================================"
echo ""
echo "⚠️  WARNING: This will rewrite git history!"
echo "This should be done BEFORE merging the PR to main."
echo ""
echo "What this script does:"
echo "1. Creates a backup branch"
echo "2. Uses interactive rebase to edit the problematic commit"
echo "3. Removes the hardcoded URL from SecurityTab.tsx"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "📋 Step 1: Creating backup branch..."
git branch backup-before-history-cleanup 2>/dev/null || echo "Backup branch already exists"

echo ""
echo "📋 Step 2: Finding the problematic commit..."
COMMIT_HASH="dfc60f3d2885a7f8981ffa3711eeda17a3ac8e9a"
echo "Commit to fix: $COMMIT_HASH"

echo ""
echo "📋 Step 3: Creating temporary fix file..."
cat > /tmp/fix-security-tab.sh << 'FIXSCRIPT'
#!/bin/bash
# This script runs during git rebase to fix the SecurityTab.tsx file

FILE="src/features/users/components/UserProfile/SecurityTab.tsx"

if [ -f "$FILE" ]; then
    echo "Fixing $FILE..."
    
    # Replace the hardcoded URL with just the env variable
    sed -i "s|const API_BASE_URL = import.meta.env.VITE_API_BASE_URL \|\| 'http://localhost:5001';|const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;|g" "$FILE"
    
    # Stage the changes
    git add "$FILE"
    
    echo "✅ Fixed hardcoded URL in $FILE"
else
    echo "⚠️  File $FILE not found in this commit"
fi
FIXSCRIPT

chmod +x /tmp/fix-security-tab.sh

echo ""
echo "📋 Step 4: Starting interactive rebase..."
echo ""
echo "INSTRUCTIONS:"
echo "1. Change 'pick' to 'edit' for commit dfc60f3 (the first one)"
echo "2. Save and close the editor"
echo "3. The script will automatically fix the file"
echo ""
read -p "Press Enter to continue..."

# Start interactive rebase
git rebase -i dfc60f3~1

echo ""
echo "✅ Git history has been rewritten!"
echo ""
echo "📋 Next steps:"
echo "1. Verify the changes: git log --oneline"
echo "2. Force push to your branch: git push --force-with-lease origin feature/user-profile"
echo ""
echo "⚠️  IMPORTANT:"
echo "- This changes commit hashes, so coordinate with your team"
echo "- Anyone who has pulled this branch will need to reset their local copy"
echo ""
