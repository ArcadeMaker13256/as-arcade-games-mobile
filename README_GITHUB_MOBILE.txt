A'S ARCADE GAMES — GITHUB MOBILE EDITION
========================================
Version: 7.1-web — Game Name and Avatar Fix
Games listed: 190

WHAT THIS PACKAGE IS
--------------------
This is a separate touch-friendly browser/PWA edition for phones, tablets, and
computers. It is not the Windows EXE and does not run the Python/Tkinter source.
It contains browser adaptations of all 190 launcher entries using reusable
HTML5 Canvas game engines. Because of that, some mobile games use simplified
mobile mechanics rather than being exact copies of their Windows counterparts.

FEATURES
--------
• Accounts protected by local PINs
• Separate Parental Controls PIN
• Favorites, categories, search, progress, high scores, XP and achievements
• AG Coins: 1 coin for each newly completed level and 5 for game completion
• Daily challenges, AG Store, customization and local leaderboards
• Original layered avatar studio with face, hair, eyes, clothing and accessories
• Synchronized game catalog to prevent mixed titles and descriptions
• Touch controls remain at the bottom of the webpage; no separate popup
• Responsive game canvas for iPhone, iPad, Android and desktop browsers
• Offline caching after the first complete successful load
• All saved data stays in that browser on that device

UPLOAD TO GITHUB PAGES
----------------------
1. Sign in to GitHub and create a new PUBLIC repository.
2. Give it a name such as as-arcade-games-mobile.
3. Open the new repository and choose Add file > Upload files.
4. Upload the CONTENTS of this folder, not the enclosing folder itself.
   index.html must appear at the top level of the repository.
5. Commit the files.
6. Open repository Settings > Pages.
7. Under Build and deployment, choose Deploy from a branch.
8. Select branch: main and folder: / (root), then Save.
9. Wait a few minutes. GitHub will show the published website address.

INSTALL ON IPHONE OR IPAD
-------------------------
1. Open the GitHub Pages link in Safari.
2. Wait until the launcher has fully loaded once.
3. Tap Safari's Share button.
4. Tap Add to Home Screen.
5. Enable Open as Web App when the option is shown.
6. Tap Add.

The Home Screen icon opens the arcade in a standalone app-style window.

FIRST-TIME SETUP
----------------
1. Tap Create Account.
2. Enter a username, display name and at least a four-digit PIN.
3. Choose an account type and build a custom avatar using the live preview.
4. Log in with the new account.
5. Open Parental Controls to create the separate administrator PIN.

PLAYING A GAME
--------------
1. Search or browse the game cards.
2. Tap a game to open its details page.
3. Read Objective, How to Play, Controls and Rewards.
4. Tap Start New Game or Resume.
5. Use the controls at the bottom of the page.
6. Use Pause to pause or resume and Launcher to return.

DATA AND BACKUPS
----------------
The web edition stores accounts and progress in the browser's localStorage.
The data does not automatically sync between devices. Clearing Safari website
data can remove it. GitHub Pages hosts only the app files and does not receive
player PINs, account data or progress.

UPDATING THE APP
----------------
Upload changed files to the same repository and commit them. The service worker
uses a versioned cache and refreshes JavaScript/game data from the network first.
This prevents an old game-name list from being mixed with a newer launcher.

TROUBLESHOOTING
---------------
• Blank page: confirm index.html is at the repository root.
• Old version or mixed names: upload every file from this package, then open the
  site in Safari and refresh. The new service worker will replace the old cache.
  If the old Home Screen app remains, remove its icon and add it again.
• No offline play: open the complete site once while online before disconnecting.
• No sound: tap anywhere in the page first; mobile browsers require interaction
  before they allow audio.
• Lost progress: check that Safari website data was not cleared and that Private
  Browsing was not used.
