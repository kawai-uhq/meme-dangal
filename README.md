# Meme Dangal

A desi meme fighting game in the browser. Fight the CPU, or play a friend online with a 4-letter room code.

## Files
- `index.html` – the whole game (no build step)
- `server.js` – small Node server: serves the game and connects online players
- `package.json` – tells Railway how to start the server
- `.gitignore` – keeps `node_modules` out of GitHub

## Push from Termux
First time:
```bash
pkg install git -y
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
cd meme-dangal
git init -b main
git add .
git commit -m "Meme Dangal v2: online rooms, new fighters"
git remote add origin https://github.com/YOUR_USERNAME/meme-dangal.git
git push -u origin main
```
Already pushed v1? Replace the files in your folder, then:
```bash
git add .
git commit -m "Meme Dangal v2: online rooms, new fighters"
git push
```
When GitHub asks for a password, paste a Personal Access Token (GitHub > Settings > Developer settings > Tokens).

## Deploy on Railway (needed for online play)
1. Railway > New Project > Deploy from GitHub repo > pick `meme-dangal`.
2. Railway sees `package.json` and runs `npm start` by itself.
3. Open the service > Settings > Networking > Generate Domain.
4. Open that link. Single player and online rooms both work from it.

Every `git push` redeploys automatically.

## Optional: keep the page on Netlify or Cloudflare Pages
Static hosts can't run the online server, so the page has to know where Railway is.
In `index.html`, find `const ONLINE_SERVER="";` and put your Railway address in it, with `wss://` instead of `https://`:
```js
const ONLINE_SERVER="wss://your-app.up.railway.app";
```
Then deploy the repo on Netlify/Cloudflare Pages with no build command and the root folder as the publish directory.

## Playing online
1. Tap PLAY WITH FRIEND > HOST A ROOM. You get a code and a WhatsApp share button.
2. Your friend opens the link (or taps PLAY WITH FRIEND and types the code) and taps JOIN.
3. Both pick fighters. The host picks the arena and taps FIGHT.

The host's phone runs the match, so the host gets the smoothest feel. Keep the game open in front; switching apps pauses it.

## Controls
Keyboard: A/D move, W jump, S crouch, hold back to block, J punch, K kick, L special, Space super, Esc pause.
Combos: punch, punch, kick, then special or super. Down + kick is a sweep that knocks down.
Phone: joystick + buttons. Tap the timer to pause.

## Run locally
```bash
npm install
npm start
```
Then open http://localhost:8080
