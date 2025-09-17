# 🔐 OAuth2 Setup Guide für SwESuKBot - GitHub Discord Integration

Diese Anleitung führt Sie durch die vollständige Einrichtung von GitHub und Discord OAuth2 für Ihr SwESuKBot Projekt mit Domain-Konfiguration.

## 📋 Voraussetzungen

- Node.js (Version 16 oder höher)
- GitHub Account
- Discord Account (für Discord OAuth)

## 🚀 Schritt-für-Schritt Setup

### 1. Dependencies installieren

```bash
cd SwESuKBot
npm install
```

### 2. GitHub OAuth App erstellen

1. **GitHub öffnen**: Gehen Sie zu [GitHub Settings](https://github.com/settings/developers)
2. **OAuth Apps**: Klicken Sie auf "OAuth Apps" → "New OAuth App"
3. **App-Details ausfüllen**:
   ```
   Application name: SwESuKBot
   Homepage URL: http://localhost:8080
   Application description: GitHub Discord Integration Bot
   Authorization callback URL: http://localhost:8080/auth/github/callback
   ```
4. **App erstellen**: Klicken Sie "Register application"
5. **Credentials notieren**: Kopieren Sie `Client ID` und `Client Secret`

### 3. Discord OAuth App erstellen (Optional)

1. **Discord Developer Portal**: Gehen Sie zu [Discord Applications](https://discord.com/developers/applications)
2. **New Application**: Klicken Sie "New Application"
3. **App-Name**: Geben Sie "SwESuKBot" ein
4. **OAuth2 Settings**:
   - Gehen Sie zu "OAuth2" → "General"
   - **Redirects**: Fügen Sie `http://localhost:8080/auth/discord/callback` hinzu
5. **Credentials notieren**: Kopieren Sie `Client ID` und `Client Secret`

### 4. Umgebungsvariablen konfigurieren

1. **Kopieren Sie die Beispiel-Datei**:
   ```bash
   copy .env.example .env
   ```

2. **Bearbeiten Sie die .env Datei**:
   ```env
   # GitHub OAuth (ERFORDERLICH)
   GITHUB_CLIENT_ID=your_actual_github_client_id
   GITHUB_CLIENT_SECRET=your_actual_github_client_secret
   GITHUB_REDIRECT_URI=http://localhost:8080/auth/github/callback

   # Discord OAuth (OPTIONAL)
   DISCORD_CLIENT_ID=your_actual_discord_client_id
   DISCORD_CLIENT_SECRET=your_actual_discord_client_secret
   DISCORD_REDIRECT_URI=http://localhost:8080/auth/discord/callback

   # Session Secret (WICHTIG: Ändern Sie dies!)
   SESSION_SECRET=your_super_secret_random_string_here

   # Server Konfiguration
   PORT=8080
   NODE_ENV=development
   ```

### 5. Server starten

```bash
# Entwicklungsmodus (mit Auto-Reload)
npm run dev

# Oder normaler Start
npm start
```

### 6. Testen

1. **Browser öffnen**: Gehen Sie zu `http://localhost:8080`
2. **Login testen**: Klicken Sie auf "Login" → "Login with GitHub"
3. **OAuth Flow**: Sie werden zu GitHub weitergeleitet
4. **Autorisierung**: Klicken Sie "Authorize" für Ihre App
5. **Rückkehr**: Sie werden zurück zur Website geleitet

## 🔧 Erweiterte Konfiguration

### GitHub Scopes

Die App fordert folgende GitHub-Berechtigungen an:
- `user:email` - Zugriff auf E-Mail-Adresse
- `repo` - Zugriff auf Repositories (für Repository-Management)

### Discord Scopes

Die App fordert folgende Discord-Berechtigungen an:
- `identify` - Grundlegende Benutzerinformationen
- `email` - E-Mail-Adresse

### Session-Sicherheit

**Wichtig**: Ändern Sie `SESSION_SECRET` in der `.env` Datei zu einem zufälligen, sicheren String:

```bash
# Generieren Sie einen sicheren Session-Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🌐 Produktions-Deployment

### Heroku Deployment

1. **Heroku App erstellen**:
   ```bash
   heroku create swesukbot
   ```

2. **Umgebungsvariablen setzen**:
   ```bash
   heroku config:set GITHUB_CLIENT_ID=your_client_id
   heroku config:set GITHUB_CLIENT_SECRET=your_client_secret
   heroku config:set SESSION_SECRET=your_session_secret
   ```

3. **OAuth URLs aktualisieren**:
   - GitHub: `https://your-app.herokuapp.com/auth/github/callback`
   - Discord: `https://your-app.herokuapp.com/auth/discord/callback`

4. **Deploy**:
   ```bash
   git push heroku main
   ```

### Vercel Deployment

1. **Vercel CLI installieren**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Umgebungsvariablen**: Setzen Sie diese im Vercel Dashboard

## 🔍 Troubleshooting

### Häufige Probleme

1. **"Invalid client_id"**
   - Überprüfen Sie die `GITHUB_CLIENT_ID` in der `.env` Datei
   - Stellen Sie sicher, dass keine Leerzeichen vorhanden sind

2. **"Redirect URI mismatch"**
   - Überprüfen Sie die Callback-URL in den GitHub/Discord App-Einstellungen
   - Stellen Sie sicher, dass die URL exakt übereinstimmt

3. **"Session not found"**
   - Überprüfen Sie den `SESSION_SECRET`
   - Starten Sie den Server neu

4. **CORS-Fehler**
   - Stellen Sie sicher, dass Sie `http://localhost:8080` verwenden
   - Nicht `127.0.0.1` oder andere Varianten

### Debug-Modus

Aktivieren Sie Debug-Logs:

```bash
DEBUG=* npm run dev
```

## 📚 API-Endpunkte

Nach erfolgreicher Authentifizierung stehen folgende APIs zur Verfügung:

- `GET /api/user` - Aktuelle Benutzerinformationen
- `POST /api/logout` - Benutzer abmelden
- `GET /api/github/repos` - GitHub Repositories (nur GitHub-Benutzer)
- `GET /api/discord/guilds` - Discord Server (nur Discord-Benutzer)

## 🔒 Sicherheitshinweise

1. **Niemals Secrets committen**: Die `.env` Datei sollte in `.gitignore` stehen
2. **HTTPS in Produktion**: Verwenden Sie immer HTTPS für OAuth-Callbacks
3. **Session-Secret**: Verwenden Sie einen starken, zufälligen Session-Secret
4. **Scope-Minimierung**: Fordern Sie nur die benötigten OAuth-Scopes an

## 📞 Support

Bei Problemen:
1. Überprüfen Sie die Konsolen-Logs
2. Testen Sie die OAuth-URLs manuell
3. Überprüfen Sie die GitHub/Discord App-Einstellungen
4. Erstellen Sie ein GitHub Issue mit Details

---

**Viel Erfolg mit SwESuKBot! 🚀**
