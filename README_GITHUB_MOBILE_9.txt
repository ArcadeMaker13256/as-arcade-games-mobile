A'S ARCADE GAMES — MOBILE EDITION 9.0
75 UNIQUE GAME FORMATS

WHAT CHANGED
• The repeated survival/dodge catalog was removed.
• The launcher now contains 75 games with 75 separate engine IDs.
• Each title has mechanics, objectives, instructions, and controls that match its name.
• Examples: Snake grows by eating fruit; Brick Breaker uses a paddle and bricks; Sudoku uses row/column/region rules; Tower Defense uses placed towers and waves; Fishing uses casting, bites, reeling, and line tension; Cooking Rush uses ingredient order tickets; Robot Programmer executes a command sequence.
• No catalog entry uses “survive as long as possible” as a generic substitute for its named gameplay.

CONTROLS
Phones/tablets:
• Touch controls remain fixed at the bottom of the screen.
• Games that need direct selection, dragging, drawing, aiming, boards, or cards also accept touches on the game canvas.

Computers:
• Keyboard controls work at the same time.
• A supported browser gamepad can also work.
• The touchscreen dock automatically hides on a mouse/keyboard computer, but the Touch Controls button can show it.

UPLOAD TO GITHUB PAGES
1. Extract this ZIP.
2. Open the extracted folder until index.html is visible.
3. Open the existing GitHub repository.
4. Choose Add file > Upload files.
5. Upload every file and folder from inside this project folder.
6. Replace the older files and commit the changes.
7. Wait for Actions > Pages build and deployment to show a green check.
8. Open the site and refresh it.
9. On iPhone/iPad, remove the old Home Screen shortcut and add the site again if Safari keeps the previous cached edition.

IMPORTANT FILES
index.html
app.js
games.js
games.json
game-engines.js
extra-engines.js
styles.css
service-worker.js
manifest.webmanifest
assets/arcade-logo.png
icons/icon-192.png
icons/icon-512.png

LOCAL SAVES
Accounts and progress remain in browser local storage on that device. They are not uploaded to GitHub and do not automatically sync between devices.

TESTING LIMITS
Automated testing opened all 75 games and exercised basic pointer and keyboard input. This does not equal manually completing every level or every possible move sequence. The package includes validation and browser QA scripts so testing can be repeated.
