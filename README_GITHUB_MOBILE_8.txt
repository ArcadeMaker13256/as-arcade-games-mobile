A'S ARCADE GAMES — GITHUB MOBILE EDITION 8.0
================================================

WHAT CHANGED
------------
• The repeated 190-title catalog was replaced by 36 genuinely different games.
• Every listed game has its own named gameplay engine and mechanics matching its title.
• Touch controls stay fixed at the bottom on phones and tablets.
• Keyboard controls work at the same time on desktop/laptop computers.
• Browser gamepad support maps the D-pad/left stick, A, B, and Start buttons.
• Desktop computers hide the touch dock initially; press “Show Touch Controls” to display it.
• The supplied A's Arcade logo is now stored at assets/arcade-logo.png.
• The logo has a versioned URL and an icon fallback if the main image cannot load.
• PWA icons were regenerated from the supplied logo.
• Cache version 8.0 removes older mixed game catalogs and missing-logo cache entries.

GITHUB UPLOAD INSTRUCTIONS
--------------------------
1. Extract this ZIP.
2. Open the extracted project folder until index.html is visible.
3. Open your existing GitHub repository.
4. Choose Add file → Upload files.
5. Upload ALL files and folders inside this project folder.
6. Replace the existing files when GitHub asks.
7. Commit with a message such as:
   Update mobile arcade to unique games version 8.0
8. Open Repository → Actions and wait for Pages deployment to show a green check.
9. Open the GitHub Pages site in Safari or Chrome and refresh it.

IMPORTANT FILES THAT MUST BE UPLOADED
-------------------------------------
index.html
app.js
game-engines.js
games.js
games.json
styles.css
avatar.js
service-worker.js
manifest.webmanifest
assets/arcade-logo.png
icons/icon-192.png
icons/icon-512.png

IF THE OLD LOGO OR OLD GAMES STILL APPEAR
-----------------------------------------
1. Wait for the GitHub Pages deployment to finish.
2. Refresh the website in Safari/Chrome.
3. Close the Home Screen app completely and reopen it.
4. If necessary, delete the old Home Screen icon and add the site again.
5. On a computer, use Ctrl+F5 for a full refresh.

CONTROLS
--------
Phone/tablet:
• The touch dock remains fixed at the bottom of the game screen.
• Direct canvas taps and drag gestures also work in pointer-based games.

Computer:
• Arrow keys or WASD move, depending on the game.
• Space is Player 1 action A.
• Enter is Player 1 action B.
• Player 2 uses WASD plus F and G when applicable.
• Escape pauses.
• Use “Show Touch Controls” if you also want the button dock visible.

Gamepad:
• Left stick/D-pad moves.
• A = primary action.
• B = secondary action.
• Start = pause.
• A second connected gamepad controls Player 2 in two-player games.

SAVED ACCOUNTS
--------------
Existing accounts, avatars, AG Coins, XP, and settings continue to use the same local browser database.
Progress belonging to removed duplicate game entries remains stored but is no longer displayed.

Run these checks locally when Python and Node are installed:
  python validate_mobile.py
  node --check app.js
  node --check game-engines.js

The included run_browser_qa.py performs automated Chromium tests when Playwright and Chromium are available.
