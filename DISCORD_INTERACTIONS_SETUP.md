# 🎮 Discord Interactions Setup für SwESuKBot

## 📋 **Übersicht**

Discord Interactions ermöglichen es SwESuKBot, Slash Commands über HTTP-Endpunkte zu empfangen, anstatt eine permanente Gateway-Verbindung zu benötigen. Dies ist effizienter und einfacher zu implementieren.

---

## 🚀 **Schritt-für-Schritt Setup**

### **1. Discord Application konfigurieren**

1. **Discord Developer Portal öffnen**: https://discord.com/developers/applications
2. **Ihre SwESuKBot Application auswählen**
3. **Bot-Sektion konfigurieren**:
   - Gehen Sie zu "Bot" im linken Menü
   - Kopieren Sie den **Bot Token** (für `.env`)
   - Aktivieren Sie "MESSAGE CONTENT INTENT" (falls benötigt)

4. **Interactions Endpoint konfigurieren**:
   - Gehen Sie zu "General Information"
   - Scrollen Sie zu **"Interactions Endpoint URL"**
   - Für **Entwicklung**: `https://your-ngrok-url.ngrok.io/interactions`
   - Für **Produktion**: `https://swusku.github.io/SwESuKBot/interactions`

5. **Public Key kopieren**:
   - Auf der "General Information" Seite
   - Kopieren Sie den **"Public Key"** (für Signature-Verifikation)

---

## ⚙️ **Umgebungsvariablen konfigurieren**

Fügen Sie diese Variablen zu Ihrer `.env` Datei hinzu:

```env
# Discord Bot Konfiguration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_PUBLIC_KEY=your_discord_public_key_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Optional: Guild ID für schnellere Command-Registrierung
DISCORD_GUILD_ID=your_test_guild_id_here

# Interactions Endpoint
INTERACTIONS_ENDPOINT=https://swusku.github.io/SwESuKBot/interactions
```

---

## 🔧 **Entwicklung mit ngrok**

Für lokale Entwicklung benötigen Sie ngrok, um Ihren localhost für Discord erreichbar zu machen:

### **1. ngrok installieren:**
```bash
# Windows (mit Chocolatey)
choco install ngrok

# Oder direkt von https://ngrok.com/download
```

### **2. ngrok starten:**
```bash
# Terminal 1: Server starten
npm run dev

# Terminal 2: ngrok tunnel erstellen
ngrok http 8080
```

### **3. Interactions Endpoint aktualisieren:**
- Kopieren Sie die ngrok URL (z.B. `https://abc123.ngrok.io`)
- Gehen Sie zu Discord Developer Portal
- Setzen Sie Interactions Endpoint URL: `https://abc123.ngrok.io/interactions`

---

## 📝 **Slash Commands registrieren**

### **Commands registrieren:**
```bash
node register-commands.js register
```

### **Commands auflisten:**
```bash
node register-commands.js list
```

### **Commands löschen:**
```bash
node register-commands.js delete
```

---

## 🤖 **Verfügbare Slash Commands**

Nach der Registrierung stehen folgende Commands zur Verfügung:

### **`/repo-status <repository>`**
- **Beschreibung**: Zeigt GitHub Repository-Statistiken
- **Parameter**: `repository` (z.B. "microsoft/vscode")
- **Beispiel**: `/repo-status microsoft/vscode`

### **`/setup-webhook <repository> [events]`**
- **Beschreibung**: Richtet GitHub Webhook für den aktuellen Discord-Kanal ein
- **Parameter**: 
  - `repository` (erforderlich): Repository Name
  - `events` (optional): Komma-getrennte Events (Standard: "push,issues,pull_request")
- **Beispiel**: `/setup-webhook myuser/myrepo push,issues`

### **`/github-user <username>`**
- **Beschreibung**: Zeigt GitHub Benutzerinformationen
- **Parameter**: `username` (GitHub Benutzername)
- **Beispiel**: `/github-user octocat`

### **`/help`**
- **Beschreibung**: Zeigt alle verfügbaren Commands
- **Parameter**: Keine
- **Beispiel**: `/help`

---

## 🔒 **Sicherheit**

### **Signature Verification**
SwESuKBot verifiziert alle eingehenden Discord Interactions mit Ed25519-Signaturen:

```javascript
// Automatische Verifikation in discord-interactions.js
function verifyDiscordSignature(req, res, next) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    // ... Verifikationslogik
}
```

### **Wichtige Sicherheitshinweise:**
- ✅ **Public Key** muss korrekt in `.env` gesetzt sein
- ✅ **Bot Token** niemals öffentlich teilen
- ✅ **HTTPS** in Produktion verwenden
- ✅ **Signature Verification** ist aktiviert

---

## 🌐 **Bot zu Discord Server hinzufügen**

### **1. Invite URL generieren:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=536936448&scope=bot%20applications.commands
```

### **2. Erforderliche Berechtigungen:**
- **Send Messages** (2048)
- **Embed Links** (16384)
- **Read Message History** (65536)
- **Use Slash Commands** (2147483648)
- **Manage Webhooks** (536870912)

### **3. Bot einladen:**
1. Öffnen Sie die generierte URL
2. Wählen Sie Ihren Discord Server
3. Bestätigen Sie die Berechtigungen
4. Bot ist jetzt auf Ihrem Server!

---

## 🔍 **Testing & Debugging**

### **1. Interactions Endpoint testen:**
```bash
# Discord sendet PING-Request zur Verifikation
curl -X POST https://swusku.github.io/SwESuKBot/interactions \
  -H "Content-Type: application/json" \
  -d '{"type": 1}'

# Erwartete Antwort: {"type": 1}
```

### **2. Server-Logs überwachen:**
```bash
npm run dev
# Achten Sie auf Discord Interaction-Logs
```

### **3. Häufige Probleme:**

**❌ "Invalid signature"**
- Überprüfen Sie `DISCORD_PUBLIC_KEY` in `.env`
- Stellen Sie sicher, dass ngrok URL korrekt ist

**❌ "Unknown interaction"**
- Commands müssen registriert sein: `node register-commands.js register`
- Warten Sie bis zu 1 Stunde für globale Commands

**❌ "Missing Access"**
- Bot muss auf dem Server sein
- Überprüfen Sie Bot-Berechtigungen

---

## 📊 **Monitoring & Logs**

### **Server-Logs:**
```javascript
// Automatisches Logging in server.js
console.log(`Discord Interaction received: ${interaction.type}`);
console.log(`Command executed: ${commandName}`);
```

### **Discord Developer Portal:**
- Gehen Sie zu Ihrer App → "Analytics"
- Überwachen Sie Interaction-Statistiken
- Überprüfen Sie Fehler-Logs

---

## 🚀 **Produktions-Deployment**

### **1. Vercel Deployment:**
```bash
# Umgebungsvariablen in Vercel Dashboard setzen
vercel env add DISCORD_BOT_TOKEN
vercel env add DISCORD_PUBLIC_KEY
vercel env add DISCORD_CLIENT_ID

# Deployen
vercel --prod
```

### **2. Interactions Endpoint aktualisieren:**
- Discord Developer Portal öffnen
- Interactions Endpoint URL: `https://your-vercel-app.vercel.app/interactions`
- Speichern und testen

### **3. Commands neu registrieren:**
```bash
# Mit Produktions-URLs
BASE_URL=https://your-vercel-app.vercel.app node register-commands.js register
```

---

## 📚 **Weitere Ressourcen**

- **Discord Developer Docs**: https://discord.com/developers/docs/interactions/receiving-and-responding
- **Discord.js Guide**: https://discordjs.guide/interactions/slash-commands.html
- **ngrok Documentation**: https://ngrok.com/docs

---

## 🎯 **Nächste Schritte**

Nach erfolgreichem Setup können Sie:

1. **Weitere Commands hinzufügen** in `discord-interactions.js`
2. **GitHub API Integration** erweitern
3. **Webhook-Funktionalität** implementieren
4. **Database-Integration** für persistente Daten
5. **Advanced Features** wie Buttons und Select Menus

---

**🎉 Viel Erfolg mit SwESuKBot Discord Interactions!**
