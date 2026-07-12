#!/bin/bash

# Navigate to the correct directory
cd "/Users/wattanapongtabthanee/app บันทึกเงิน"

echo "Initializing Git repository..."
git init

echo "Adding files..."
git add index.html style.css script.js

echo "Committing..."
git commit -m "Initial commit: My Money App"

echo "Setting branch to main..."
git branch -M main

echo "Adding remote origin..."
# Using HTTPS; if it asks for a password, you might need a Personal Access Token or use SSH instead
git remote add origin https://github.com/watttab/mymoneyapp.git

echo "Pushing to GitHub..."
git push -u origin main

echo "Done! 🎉"
echo "You can now go to your GitHub repository settings and enable GitHub Pages from the 'main' branch to host the app."
