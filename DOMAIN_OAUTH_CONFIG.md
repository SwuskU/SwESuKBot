# 🌐 SwESuKBot - Domain & OAuth2 Konfiguration

## 🎯 **Projekt-Domain: SwESuKBot - GitHub Discord Integration**

### **Empfohlene Domains:**
- **GitHub Pages (Hauptdomain)**: `swusku.github.io/SwESuKBot/`
- **Alternative**: `swesukbot.com` oder `swesukbot.io`
- **Entwicklung**: `localhost:8080`

---

## 🔐 **GitHub OAuth2 Konfiguration**

### **1. GitHub OAuth App Settings:**
```
Application Name: SwESuKBot - GitHub Discord Integration
Homepage URL: https://swusku.github.io/SwESuKBot/
Application Description: Seamless GitHub-Discord integration bot for repository management and notifications
Authorization Callback URL: https://swusku.github.io/SwESuKBot/auth/github/callback
```

### **2. GitHub OAuth2 Scopes:**
```
user:email    - Benutzer E-Mail Adresse
read:user     - Grundlegende Benutzerinformationen
repo          - Repository-Zugriff (lesen/schreiben)
admin:repo_hook - Webhook-Management
notifications - Repository-Benachrichtigungen
```

### **3. GitHub OAuth2 URL Generator:**
```
Base URL: https://github.com/login/oauth/authorize
Client ID: Ov23li7uMkoqBS7qXldx
Redirect URI: https://swusku.github.io/SwESuKBot/auth/github/callback
Scopes: user:email,read:user,repo,admin:repo_hook,notifications
State: random_security_token

Vollständige URL:
https://github.com/login/oauth/authorize?client_id=Ov23li7uMkoqBS7qXldx&redirect_uri=https%3A//swusku.github.io/SwESuKBot/auth/github/callback&scope=user%3Aemail%2Cread%3Auser%2Crepo%2Cadmin%3Arepo_hook%2Cnotifications&state=random_security_token&response_type=code
```

---

## 🎮 **Discord OAuth2 Konfiguration**

### **1. Discord Application Settings:**
```
Application Name: SwESuKBot
Description: GitHub-Discord Integration Bot - Connect your repositories with Discord servers
Redirect URIs: 
  - https://swusku.github.io/SwESuKBot/auth/discord/callback
  - http://localhost:8080/auth/discord/callback (für Entwicklung)

Interactions Endpoint URL:
  - https://swusku.github.io/SwESuKBot/interactions (Produktion)
  - https://your-ngrok-url.ngrok.io/interactions (Entwicklung)
```

### **2. Discord OAuth2 Scopes:**
```
identify      - Grundlegende Benutzerinformationen
email         - E-Mail-Adresse
guilds        - Server-Liste des Benutzers
guilds.join   - Bot zu Servern hinzufügen
bot           - Bot-Berechtigungen
```

### **3. Discord Bot Permissions:**
```
Manage Webhooks     (536870912)   - Webhook-Erstellung
Send Messages       (2048)        - Nachrichten senden
Embed Links         (16384)       - Links einbetten
Read Message History (65536)      - Nachrichtenverlauf
Use Slash Commands  (2147483648)  - Slash-Commands
```

### **4. Discord OAuth2 URL Generator:**
```
Base URL: https://discord.com/api/oauth2/authorize
Client ID: YOUR_DISCORD_CLIENT_ID
Redirect URI: https://swusku.github.io/SwESuKBot/auth/discord/callback
Scopes: identify,email,guilds,guilds.join,bot
Permissions: 536936448 (kombinierte Bot-Berechtigungen)

Vollständige URL:
https://discord.com/api/oauth2/authorize?client_id=YOUR_DISCORD_CLIENT_ID&redirect_uri=https%3A//swusku.github.io/SwESuKBot/auth/discord/callback&response_type=code&scope=identify%20email%20guilds%20guilds.join%20bot&permissions=536936448
```

---

## ⚙️ **Umgebungsvariablen für verschiedene Domains**

### **Entwicklung (localhost):**
```env
# Domain Konfiguration
DOMAIN=localhost:8080
BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:8080

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23li7uMkoqBS7qXldx
GITHUB_CLIENT_SECRET=de14d2c6db3cf68126ceac2a1eeead32da1b42cb
GITHUB_REDIRECT_URI=http://localhost:8080/auth/github/callback

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:8080/auth/discord/callback
```

### **Produktion (Custom Domain):**
```env
# Domain Konfiguration
DOMAIN=swesukbot.com
BASE_URL=https://swusku.github.io/SwESuKBot
FRONTEND_URL=https://swusku.github.io/SwESuKBot

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23li7uMkoqBS7qXldx
GITHUB_CLIENT_SECRET=de14d2c6db3cf68126ceac2a1eeead32da1b42cb
GITHUB_REDIRECT_URI=https://swusku.github.io/SwESuKBot/auth/github/callback

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=https://swusku.github.io/SwESuKBot/auth/discord/callback
```

### **GitHub Pages:**
```env
# Domain Konfiguration
DOMAIN=swusku.github.io
BASE_URL=https://swusku.github.io/SwESuKBot
FRONTEND_URL=https://swusku.github.io/SwESuKBot

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23li7uMkoqBS7qXldx
GITHUB_CLIENT_SECRET=de14d2c6db3cf68126ceac2a1eeead32da1b42cb
GITHUB_REDIRECT_URI=https://swusku.github.io/SwESuKBot/auth/github/callback

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=https://swusku.github.io/SwESuKBot/auth/discord/callback
```

---

## 🚀 **OAuth2 Flow Implementierung**

### **1. GitHub OAuth Flow:**
```javascript
// 1. Benutzer zu GitHub weiterleiten
window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email,read:user,repo,admin:repo_hook,notifications&state=${generateState()}`;

// 2. Callback verarbeiten (server.js)
app.get('/auth/github/callback', async (req, res) => {
    const { code, state } = req.query;
    // Token austauschen und Benutzer authentifizieren
});
```

### **2. Discord OAuth Flow:**
```javascript
// 1. Benutzer zu Discord weiterleiten
window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify email guilds guilds.join bot&permissions=536936448`;

// 2. Callback verarbeiten (server.js)
app.get('/auth/discord/callback', async (req, res) => {
    const { code } = req.query;
    // Token austauschen und Benutzer authentifizieren
});
```

---

## 🔧 **Server-Konfiguration für verschiedene Domains**

### **server.js Anpassungen:**
```javascript
// Domain-basierte Konfiguration
const isDevelopment = process.env.NODE_ENV === 'development';
const baseUrl = process.env.BASE_URL || (isDevelopment ? 'http://localhost:8080' : 'https://swesukbot.com');

// CORS Konfiguration
app.use(cors({
    origin: [
        'http://localhost:8080',
        'https://swesukbot.com',
        'https://swusku.github.io'
    ],
    credentials: true
}));

// Session Konfiguration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: !isDevelopment, // HTTPS in Produktion
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 Stunden
    }
}));
```

---

## 📱 **Frontend-Integration**

### **script.js Anpassungen:**
```javascript
// Domain-basierte API-Calls
const API_BASE = window.location.origin;

// GitHub Login
async function handleGitHubLogin() {
    const clientId = 'Ov23li7uMkoqBS7qXldx';
    const redirectUri = `${API_BASE}/auth/github/callback`;
    const scope = 'user:email,read:user,repo,admin:repo_hook,notifications';
    const state = generateRandomState();
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    window.location.href = authUrl;
}

// Discord Login
async function handleDiscordLogin() {
    const clientId = 'YOUR_DISCORD_CLIENT_ID';
    const redirectUri = `${API_BASE}/auth/discord/callback`;
    const scope = 'identify email guilds guilds.join bot';
    const permissions = '536936448';
    
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&permissions=${permissions}`;
    
    window.location.href = authUrl;
}
```

---

## 🌍 **Deployment-Optionen**

### **1. Vercel (Empfohlen):**
```bash
# Vercel CLI installieren
npm i -g vercel

# Projekt deployen
vercel

# Custom Domain hinzufügen
vercel domains add swesukbot.com
```

### **2. Netlify:**
```bash
# Netlify CLI installieren
npm i -g netlify-cli

# Projekt deployen
netlify deploy --prod

# Custom Domain in Netlify Dashboard konfigurieren
```

### **3. GitHub Pages + Backend auf Heroku:**
```bash
# Frontend auf GitHub Pages
# Backend auf Heroku deployen
heroku create swesukbot-api
git push heroku main
```

---

## 🔍 **Testing URLs**

### **GitHub OAuth Test:**
```
https://github.com/login/oauth/authorize?client_id=Ov23li7uMkoqBS7qXldx&redirect_uri=http%3A//localhost%3A8080/auth/github/callback&scope=user%3Aemail%2Cread%3Auser%2Crepo&state=test123
```

### **Discord OAuth Test:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http%3A//localhost%3A8080/auth/discord/callback&response_type=code&scope=identify%20email%20guilds&permissions=536936448
```

---

## 📋 **Checkliste für Domain-Setup**

- [ ] Domain registriert (swesukbot.com)
- [ ] DNS konfiguriert
- [ ] SSL-Zertifikat eingerichtet
- [ ] GitHub OAuth App mit neuer Domain aktualisiert
- [ ] Discord OAuth App mit neuer Domain aktualisiert
- [ ] Umgebungsvariablen für Produktion gesetzt
- [ ] CORS-Konfiguration angepasst
- [ ] Session-Cookies für HTTPS konfiguriert
- [ ] Frontend API-URLs aktualisiert
- [ ] Deployment getestet

---

**🎉 Mit dieser Konfiguration haben Sie eine vollständige OAuth2-Integration für SwESuKBot!**
