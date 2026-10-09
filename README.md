# Discord Honeypot Bot

A simple honeypot bot that catches scammers and rule-breakers by luring them into posting in a trap channel.

## How It Works
1. Create a channel that looks like a normal chat (e.g. `#general-chat-2`)
2. Only bots/admins can see it in the sidebar, but anyone with the link can post
3. When a user posts there, the bot logs their message and takes action (kick/ban/timeout)

## Setup
1. Clone repo
2. `npm install`
3. Copy `.env.example` → `.env` and fill in your bot token
4. Edit `config.json` with your channel ID and punishment
5. `node index.js`

## ⚠️ Disclaimer
Use responsibly. Only deploy in servers where you have permission.
