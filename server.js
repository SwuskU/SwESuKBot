const express = require('express');
const axios = require('axios');
const path = require('path');
const session = require('express-session');
const { verifyDiscordSignature, handleInteraction } = require('./discord-interactions');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// GitHub OAuth Konfiguration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:8080/auth/github/callback';

// Discord OAuth Konfiguration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:8080/auth/discord/callback';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Session Konfiguration
app.use(session({
    secret: process.env.SESSION_SECRET || 'swesukbot-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Für HTTPS auf true setzen
        maxAge: 24 * 60 * 60 * 1000 // 24 Stunden
    }
}));

// Hilfsfunktionen
function generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Routes

// Hauptseite
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// GitHub OAuth Initiierung
app.get('/auth/github', (req, res) => {
    const state = generateState();
    req.session.githubState = state;
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${GITHUB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&` +
        `scope=user:email,repo&` +
        `state=${state}`;
    
    res.redirect(githubAuthUrl);
});

// GitHub OAuth Callback
app.get('/auth/github/callback', async (req, res) => {
    const { code, state } = req.query;
    
    // State validieren
    if (state !== req.session.githubState) {
        return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    try {
        // Access Token anfordern
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code: code,
            redirect_uri: GITHUB_REDIRECT_URI
        }, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const accessToken = tokenResponse.data.access_token;
        
        if (!accessToken) {
            throw new Error('No access token received');
        }
        
        // Benutzerinformationen abrufen
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'SwESuKBot'
            }
        });
        
        // E-Mail abrufen (falls nicht öffentlich)
        const emailResponse = await axios.get('https://api.github.com/user/emails', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'SwESuKBot'
            }
        });
        
        const primaryEmail = emailResponse.data.find(email => email.primary)?.email || userResponse.data.email;
        
        // Benutzer in Session speichern
        req.session.user = {
            id: userResponse.data.id,
            username: userResponse.data.login,
            name: userResponse.data.name || userResponse.data.login,
            email: primaryEmail,
            avatar: userResponse.data.avatar_url,
            provider: 'github',
            accessToken: accessToken
        };
        
        // Erfolgreich - Weiterleitung zur Hauptseite
        res.redirect('/?auth=success');
        
    } catch (error) {
        console.error('GitHub OAuth Error:', error.response?.data || error.message);
        res.redirect('/?auth=error');
    }
});

// Discord OAuth Initiierung
app.get('/auth/discord', (req, res) => {
    const state = generateState();
    req.session.discordState = state;
    
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?` +
        `client_id=${DISCORD_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=identify%20email&` +
        `state=${state}`;
    
    res.redirect(discordAuthUrl);
});

// Discord OAuth Callback
app.get('/auth/discord/callback', async (req, res) => {
    const { code, state } = req.query;
    
    // State validieren
    if (state !== req.session.discordState) {
        return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    try {
        // Access Token anfordern
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: DISCORD_REDIRECT_URI
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        const accessToken = tokenResponse.data.access_token;
        
        // Benutzerinformationen abrufen
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        // Benutzer in Session speichern
        req.session.user = {
            id: userResponse.data.id,
            username: userResponse.data.username,
            name: userResponse.data.global_name || userResponse.data.username,
            email: userResponse.data.email,
            avatar: userResponse.data.avatar ? 
                `https://cdn.discordapp.com/avatars/${userResponse.data.id}/${userResponse.data.avatar}.png` :
                `https://cdn.discordapp.com/embed/avatars/${userResponse.data.discriminator % 5}.png`,
            provider: 'discord',
            accessToken: accessToken
        };
        
        // Erfolgreich - Weiterleitung zur Hauptseite
        res.redirect('/?auth=success');
        
    } catch (error) {
        console.error('Discord OAuth Error:', error.response?.data || error.message);
        res.redirect('/?auth=error');
    }
});

// API Endpoints

// Aktueller Benutzer
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        // Sensible Daten entfernen
        const { accessToken, ...userInfo } = req.session.user;
        res.json({ user: userInfo });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// GitHub Repositories abrufen (nur für GitHub-Benutzer)
app.get('/api/github/repos', async (req, res) => {
    if (!req.session.user || req.session.user.provider !== 'github') {
        return res.status(401).json({ error: 'GitHub authentication required' });
    }
    
    try {
        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `Bearer ${req.session.user.accessToken}`,
                'User-Agent': 'SwESuKBot'
            },
            params: {
                sort: 'updated',
                per_page: 10
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('GitHub API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
});

// Discord Guilds abrufen (nur für Discord-Benutzer)
app.get('/api/discord/guilds', async (req, res) => {
    if (!req.session.user || req.session.user.provider !== 'discord') {
        return res.status(401).json({ error: 'Discord authentication required' });
    }
    
    try {
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                'Authorization': `Bearer ${req.session.user.accessToken}`
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Discord API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch guilds' });
    }
});

// Discord Interactions Endpoint
app.post('/interactions', verifyDiscordSignature, handleInteraction);

// GitHub Webhook Endpoint (für Repository Events)
app.post('/webhook/github/:channelId', express.raw({ type: 'application/json' }), (req, res) => {
    const channelId = req.params.channelId;
    const event = req.headers['x-github-event'];
    const payload = JSON.parse(req.body);
    
    console.log(`GitHub Webhook received: ${event} for channel ${channelId}`);
    
    // Hier würden Sie die Webhook-Daten an Discord weiterleiten
    // Beispiel: Push-Event verarbeiten
    if (event === 'push') {
        const commits = payload.commits || [];
        const repoName = payload.repository.full_name;
        
        // Discord Webhook senden (implementieren Sie dies basierend auf Ihren Anforderungen)
        console.log(`New push to ${repoName}: ${commits.length} commits`);
    }
    
    res.status(200).send('OK');
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Server starten
app.listen(PORT, () => {
    console.log(`🚀 SwESuKBot Server läuft auf http://localhost:${PORT}`);
    console.log(`📝 Stellen Sie sicher, dass die .env Datei konfiguriert ist`);
});

module.exports = app;
