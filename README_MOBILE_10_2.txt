A'S ARCADE GAMES MOBILE 10.2 — DIFFICULTY BALANCED EDITION
================================================================

WHAT THIS UPDATE FIXES
• Crossy Street cars and logs are much slower.
• Logs now carry the player while the player is standing on them.
• Early Crossy Street levels use fewer moving objects.
• A short safe-start period was added to Crossy Street and several action games.
• Every account now has a Game Pace setting:
    Relaxed / Comfortable / Standard / Challenge
• Comfortable is the default.
• Difficulty curves and impossible high-level targets were corrected in multiple games.
• The working logo setup remains unchanged and all PWA files use root-level paths.

UPLOAD TO GITHUB
1. Download and extract the ZIP.
2. Open the extracted folder.
3. Upload every file inside it to the ROOT of your existing GitHub repository.
4. Allow GitHub to replace the old matching files.
5. Commit with: Mobile 10.2 difficulty balance update
6. Wait for Actions → Pages build and deployment to show a green check.
7. Refresh with Ctrl+Shift+R on a computer.
8. On iPhone/iPad, close and reopen the Home Screen app. If it remains cached, delete the shortcut and add it again.

IMPORTANT ROOT FILES
index.html
app.js
avatar.js
games.js
games.json
game-engines.js
extra-engines.js
styles.css
manifest.webmanifest
service-worker.js
arcade-logo.png
icon-192.png
icon-512.png
maskable-192.png
maskable-512.png
favicon-32.png
apple-touch-icon.png
apple-touch-icon-v10.png

GAME PACE
After login:
Customize → Game pace

Relaxed: 72% real-time speed
Comfortable: 86% real-time speed (default)
Standard: 100% speed
Challenge: 112% speed

The setting affects real-time movement, timers, and physics. Turn-based board and puzzle games remain responsive because they do not depend heavily on continuous time.

TESTING
See MOBILE_10_2_DIFFICULTY_AUDIT.txt for the full game-by-game report.
