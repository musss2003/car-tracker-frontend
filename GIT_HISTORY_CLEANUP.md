# Git History Cleanup Guide

## Issue
GitGuardian detected a hardcoded URL in commit `dfc60f3`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
```

## ⚠️ Important Notes
- This will **rewrite git history** and change commit hashes
- All commits after `dfc60f3` will get new hashes
- You'll need to **force push** to update the remote
- If others are working on this branch, coordinate with them first

---

## 🎯 Recommended Solution: Interactive Rebase (Manual)

This is the **safest and most controlled** method.

### Step 1: Create a backup
```bash
git branch backup-before-cleanup
```

### Step 2: Start interactive rebase
```bash
git rebase -i dfc60f3~1
```

This will open an editor showing:
```
pick dfc60f3 feat: add modern user profile page with tabs
pick 3bfa9d6 fix: use existing PhotoUpload component...
pick f731db3 Improvements on UserProfilePage
...
```

### Step 3: Change 'pick' to 'edit' for dfc60f3
Change the first line to:
```
edit dfc60f3 feat: add modern user profile page with tabs
pick 3bfa9d6 fix: use existing PhotoUpload component...
pick f731db3 Improvements on UserProfilePage
...
```

Save and close the editor.

### Step 4: Fix the file
Git will pause at commit dfc60f3. Now fix the file:

```bash
# Open the file and manually change line 82:
# FROM: const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
# TO:   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

# Or use sed to do it automatically:
sed -i "s|const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';|const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;|g" src/features/users/components/UserProfile/SecurityTab.tsx

# Stage the changes
git add src/features/users/components/UserProfile/SecurityTab.tsx

# Amend the commit
git commit --amend --no-edit
```

### Step 5: Continue the rebase
```bash
git rebase --continue
```

If there are conflicts, resolve them and continue:
```bash
git add .
git rebase --continue
```

### Step 6: Verify the fix
```bash
# Check that the URL is gone from history
git log --all --full-history -- "**/SecurityTab.tsx" | grep "localhost:5001"

# Should return nothing if successful
```

### Step 7: Force push
```bash
# Switch back to your feature branch if needed
git checkout feature/user-profile

# Force push (use --force-with-lease for safety)
git push --force-with-lease origin feature/user-profile
```

---

## 🤖 Alternative: Automated Script

If you prefer automation, use the provided script:

```bash
cd /home/msinanovic/Desktop/car-tracker/car-tracker-frontend
./scripts/fix-git-history-automated.sh
```

This script will:
1. Create a backup branch
2. Use `git filter-branch` to automatically fix all commits
3. Show you the results

After running, force push:
```bash
git push --force-with-lease origin feature/user-profile
```

---

## 🆘 If Something Goes Wrong

### Restore from backup
```bash
git reset --hard backup-before-cleanup
```

### Or reset to remote
```bash
git fetch origin
git reset --hard origin/feature/user-profile
```

---

## ✅ Verification

After cleanup, verify:

1. **Check commit history:**
   ```bash
   git log --oneline -10
   ```

2. **Verify the URL is gone:**
   ```bash
   git log --all --full-history -p -- "**/SecurityTab.tsx" | grep "localhost:5001"
   ```
   Should return nothing.

3. **Check current file:**
   ```bash
   cat src/features/users/components/SecurityTab.tsx | grep "API_BASE_URL"
   ```
   Should NOT contain `localhost:5001`.

---

## 📝 After Force Push

1. **Update GitGuardian**: Mark the incident as resolved
2. **Notify team members**: If anyone else is working on this branch, they'll need to:
   ```bash
   git fetch origin
   git reset --hard origin/feature/user-profile
   ```

---

## 💡 Alternative: Just Merge

Since `localhost:5001` is **NOT a real secret**, you could also:
1. Add a comment on the PR explaining it's a false positive
2. Merge without rewriting history
3. Mark the GitGuardian alert as "false positive"

This is simpler and doesn't affect git history, but the "secret" will remain in git history (which is fine since it's not sensitive).

---

## 🎯 Recommendation

For your situation, I recommend **just adding a PR comment** explaining this is a false positive and the code has been fixed in later commits. Rewriting history is overkill for a localhost URL.

However, if you want to learn the process or have a policy requiring clean history, use the **Interactive Rebase** method above.
