const axios = require('axios');
require('dotenv').config();

/**
 * Discord Slash Commands Registrierung für SwESuKBot
 * Führen Sie dieses Skript aus, um die Commands bei Discord zu registrieren
 */

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID; // Optional: Für Guild-spezifische Commands

// SwESuKBot Slash Commands Definition
const commands = [
    {
        name: 'repo-status',
        description: 'Zeigt den Status eines GitHub Repositories',
        options: [
            {
                name: 'repository',
                description: 'Repository Name (z.B. owner/repo)',
                type: 3, // STRING
                required: true
            }
        ]
    },
    {
        name: 'setup-webhook',
        description: 'Richtet einen GitHub Webhook für diesen Discord-Kanal ein',
        options: [
            {
                name: 'repository',
                description: 'Repository Name (z.B. owner/repo)',
                type: 3, // STRING
                required: true
            },
            {
                name: 'events',
                description: 'Webhook Events (push, issues, pull_request)',
                type: 3, // STRING
                required: false
            }
        ]
    },
    {
        name: 'github-user',
        description: 'Zeigt Informationen über einen GitHub Benutzer',
        options: [
            {
                name: 'username',
                description: 'GitHub Benutzername',
                type: 3, // STRING
                required: true
            }
        ]
    },
    {
        name: 'help',
        description: 'Zeigt alle verfügbaren SwESuKBot Commands'
    }
];

async function registerCommands() {
    if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
        console.error('❌ DISCORD_BOT_TOKEN und DISCORD_CLIENT_ID müssen in der .env Datei gesetzt sein');
        process.exit(1);
    }

    try {
        console.log('🔄 Registriere Discord Slash Commands...');

        // URL für Command-Registrierung
        const url = GUILD_ID 
            ? `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/guilds/${GUILD_ID}/commands`
            : `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/commands`;

        const response = await axios.put(url, commands, {
            headers: {
                'Authorization': `Bot ${DISCORD_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Commands erfolgreich registriert!');
        console.log(`📊 ${response.data.length} Commands wurden registriert:`);
        
        response.data.forEach(command => {
            console.log(`   • /${command.name} - ${command.description}`);
        });

        if (GUILD_ID) {
            console.log(`🏠 Commands wurden für Guild ${GUILD_ID} registriert (sofort verfügbar)`);
        } else {
            console.log('🌍 Commands wurden global registriert (kann bis zu 1 Stunde dauern)');
        }

        console.log('\n📋 Nächste Schritte:');
        console.log('1. Stellen Sie sicher, dass Ihr Bot zu einem Discord Server hinzugefügt wurde');
        console.log('2. Konfigurieren Sie die Interactions Endpoint URL in der Discord App:');
        console.log(`   ${process.env.BASE_URL || 'https://your-domain.com'}/interactions`);
        console.log('3. Starten Sie Ihren Server: npm run dev');

    } catch (error) {
        console.error('❌ Fehler beim Registrieren der Commands:');
        
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        
        process.exit(1);
    }
}

async function deleteCommands() {
    if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
        console.error('❌ DISCORD_BOT_TOKEN und DISCORD_CLIENT_ID müssen in der .env Datei gesetzt sein');
        process.exit(1);
    }

    try {
        console.log('🗑️ Lösche alle Discord Slash Commands...');

        const url = GUILD_ID 
            ? `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/guilds/${GUILD_ID}/commands`
            : `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/commands`;

        await axios.put(url, [], {
            headers: {
                'Authorization': `Bot ${DISCORD_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Alle Commands wurden gelöscht!');
    } catch (error) {
        console.error('❌ Fehler beim Löschen der Commands:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function listCommands() {
    if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
        console.error('❌ DISCORD_BOT_TOKEN und DISCORD_CLIENT_ID müssen in der .env Datei gesetzt sein');
        process.exit(1);
    }

    try {
        console.log('📋 Lade registrierte Commands...');

        const url = GUILD_ID 
            ? `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/guilds/${GUILD_ID}/commands`
            : `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/commands`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bot ${DISCORD_TOKEN}`
            }
        });

        if (response.data.length === 0) {
            console.log('📭 Keine Commands registriert');
        } else {
            console.log(`📊 ${response.data.length} registrierte Commands:`);
            response.data.forEach(command => {
                console.log(`   • /${command.name} (ID: ${command.id}) - ${command.description}`);
            });
        }
    } catch (error) {
        console.error('❌ Fehler beim Laden der Commands:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Command Line Interface
const action = process.argv[2];

switch (action) {
    case 'register':
        registerCommands();
        break;
    case 'delete':
        deleteCommands();
        break;
    case 'list':
        listCommands();
        break;
    default:
        console.log('SwESuKBot - Discord Commands Manager\n');
        console.log('Verwendung:');
        console.log('  node register-commands.js register  - Registriert alle Slash Commands');
        console.log('  node register-commands.js delete    - Löscht alle Slash Commands');
        console.log('  node register-commands.js list      - Zeigt alle registrierten Commands');
        console.log('\nStellen Sie sicher, dass DISCORD_BOT_TOKEN und DISCORD_CLIENT_ID in der .env Datei gesetzt sind.');
        break;
}
