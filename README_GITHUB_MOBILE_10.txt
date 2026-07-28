A'S ARCADE GAMES — GITHUB MOBILE EDITION 10.0
================================================

WHAT IS NEW
-----------
• Crossy Street was slowed down and given a short safety grace period after each move.
• Other fast games were rebalanced with capped speed increases instead of unlimited speed growth.
• 68 compatible one-player games now contain 40 campaign levels.
• Losing automatically restarts the same current level after a short delay. It does not reset the campaign.
• Touch controls can be Normal, Large, or Extra Large.
• Added Normal/Large launcher text and Compact/Normal/Large game cards.
• Expanded to 12 themes, 12 wallpapers, 16 banners, and 16 avatar presets.
• Added the Feedback and request simple games link:
  https://sites.google.com/view/agsarcadegames/home
• Rebuilt the PWA and Apple Home Screen icons from the supplied blue A's Arcade logo.
• Added standard and maskable PWA icons plus a dedicated 180×180 Apple touch icon.

UPLOAD TO GITHUB
----------------
1. Extract this ZIP.
2. Open the extracted folder until index.html is visible.
3. Open your existing GitHub repository.
4. Choose Add file > Upload files.
5. Upload EVERYTHING inside this folder, replacing the old files.
6. Commit the changes.
7. Wait for Actions > pages build and deployment to show a green check.

Important new files that must be uploaded:
• apple-touch-icon-v10.png
• icons/apple-touch-icon.png
• icons/icon-192.png
• icons/icon-512.png
• icons/maskable-192.png
• icons/maskable-512.png

FIX THE IPHONE/IPAD HOME SCREEN ICON
-----------------------------------
Apple devices can keep an old Home Screen icon cached.

1. Upload the complete Version 10 package.
2. Wait for GitHub Pages to finish deploying.
3. Open the website in Safari and refresh it.
4. Delete the old A's Arcade Home Screen icon.
5. In Safari, tap Share > Add to Home Screen.
6. Add the app again.

CONTROLS
--------
Phone/iPad:
• Touch buttons remain fixed at the bottom.
• Direct taps and drags work on board, card, drawing, aiming, and puzzle games.
• Change button size under Customize > Touch control size.

Computer:
• Keyboard controls work at the same time.
• Browser-supported gamepads are supported.
• Use Show Touch Controls to display the touch dock on a computer.

LEVELS AND LOSSES
-----------------
• 68 compatible one-player games have 40 levels.
• Creative/open-play games and local multiplayer games keep their appropriate structure.
• A loss restarts the same level automatically after about two seconds.
• The player can also tap Restart Now or return to the launcher.

TESTING
-------
Run these from the extracted folder when Python, Node.js, Playwright, and Chromium are available:

  python validate_mobile_v10.py
  python run_browser_qa_v10.py

See MOBILE_10_QA_REPORT.txt for the completed test results.
