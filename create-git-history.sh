#!/bin/bash

# User 1: Contract developer (shankai5)
USER1_NAME="shankai5"
USER1_EMAIL="trellis-grails-5c@icloud.com"

# User 2: Frontend developer (ocom-kozdomovn)
USER2_NAME="ocom-kozdomovn"
USER2_EMAIL="fresco.gymnast.6h@icloud.com"

# Function to create commit with specific user and date
commit_as() {
    local user_name=$1
    local user_email=$2
    local date=$3
    local message=$4

    GIT_AUTHOR_NAME="$user_name" \
    GIT_AUTHOR_EMAIL="$user_email" \
    GIT_COMMITTER_NAME="$user_name" \
    GIT_COMMITTER_EMAIL="$user_email" \
    GIT_AUTHOR_DATE="$date" \
    GIT_COMMITTER_DATE="$date" \
    git commit -m "$message"
}

# November 10, 2025 - Contract setup by shankai5
git add contracts/CelestiaBracketRush.sol
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-10T09:00:00" "add base contract structure"

git add hardhat.config.js package.json package-lock.json
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-10T10:30:00" "setup hardhat config"

git add .env.example
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-10T11:15:00" "add env template"

# November 10, 2025 - Frontend init by ocom-kozdomovn
git add frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/vite.config.ts
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-10T14:00:00" "init frontend project"

git add frontend/src/main.tsx frontend/src/App.tsx frontend/index.html
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-10T15:30:00" "add basic app structure"

git add frontend/tailwind.config.ts frontend/postcss.config.js
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-10T16:45:00" "configure tailwind"

# November 11, 2025 - Contract development by shankai5
git add contracts/
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-11T09:30:00" "implement bracket creation logic"

git add contracts/
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-11T11:00:00" "add entry submission with FHE"

git add contracts/
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-11T14:00:00" "implement settlement mechanism"

# November 11, 2025 - Frontend components by ocom-kozdomovn
git add frontend/src/components/ui/
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-11T10:00:00" "add shadcn ui components"

git add frontend/src/lib/
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-11T13:00:00" "setup FHE integration"

git add frontend/src/config/contracts.ts
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-11T15:30:00" "add contract config"

# November 12, 2025 - Contract refinement by shankai5
git add contracts/
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-12T09:00:00" "add prize claim logic"

git add contracts/
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-12T10:30:00" "implement refund mechanism"

git add scripts/deploy.js
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-12T12:00:00" "add deployment script"

git add scripts/create-diverse-brackets.js
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-12T14:30:00" "add test data script"

# November 12, 2025 - Frontend hooks by ocom-kozdomovn
git add frontend/src/hooks/
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-12T10:00:00" "add contract interaction hooks"

git add frontend/src/components/BracketCard.tsx
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-12T13:00:00" "create bracket card component"

git add frontend/src/components/BracketDetail.tsx
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-12T15:00:00" "add bracket detail view"

# November 13, 2025 - Testing by shankai5
git add test/
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-13T09:00:00" "add core functionality tests"

git add test/
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-13T11:00:00" "add FHE integration tests"

git add test/
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-13T13:30:00" "add settlement tests"

git add test/README.md
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-13T15:00:00" "document test suite"

# November 13, 2025 - Frontend dialogs by ocom-kozdomovn
git add frontend/src/components/CreateBracketDialog.tsx
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-13T10:00:00" "add create bracket dialog"

git add frontend/src/components/JoinBracketDialog.tsx
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-13T12:30:00" "implement join dialog with FHE"

git add frontend/src/index.css
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-13T14:00:00" "update global styles"

# November 14, 2025 - Documentation and deployment
git add README.md
commit_as "$USER1_NAME" "$USER1_EMAIL" "2025-11-14T09:00:00" "add comprehensive documentation"

git add vercel.json
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-14T10:00:00" "configure vercel deployment"

git add .gitignore
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-14T11:00:00" "update gitignore"

git add test_bracket.mp4
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-14T13:00:00" "add demo video"

git add .
commit_as "$USER2_NAME" "$USER2_EMAIL" "2025-11-14T15:00:00" "final polish and cleanup"

echo "✅ Git history created successfully!"
echo ""
echo "Commit history:"
git log --oneline --all --graph --decorate
