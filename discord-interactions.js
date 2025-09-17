const crypto = require('crypto');
const express = require('express');

/**
 * Discord Interactions Handler für SwESuKBot
 * Verarbeitet Slash Commands über HTTP-Endpunkte
 */

// Discord Interaction Types
const InteractionType = {
    PING: 1,
    APPLICATION_COMMAND: 2,
    MESSAGE_COMPONENT: 3,
    APPLICATION_COMMAND_AUTOCOMPLETE: 4,
    MODAL_SUBMIT: 5
};

// Discord Interaction Response Types
const InteractionResponseType = {
    PONG: 1,
    CHANNEL_MESSAGE_WITH_SOURCE: 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
    DEFERRED_UPDATE_MESSAGE: 6,
    UPDATE_MESSAGE: 7,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
    MODAL: 9
};

/**
 * Verifiziert Discord Interaction Signature
 */
function verifyDiscordSignature(req, res, next) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    const body = req.body;

    if (!signature || !timestamp) {
        return res.status(401).send('Missing signature headers');
    }

    const publicKey = process.env.DISCORD_PUBLIC_KEY;
    if (!publicKey) {
        console.error('DISCORD_PUBLIC_KEY not configured');
        return res.status(500).send('Server configuration error');
    }

    try {
        const isValidRequest = crypto.verify(
            'ed25519',
            Buffer.from(timestamp + JSON.stringify(body)),
            {
                key: Buffer.from(publicKey, 'hex'),
                format: 'raw'
            },
            Buffer.from(signature, 'hex')
        );

        if (!isValidRequest) {
            return res.status(401).send('Invalid signature');
        }

        next();
    } catch (error) {
        console.error('Signature verification error:', error);
        return res.status(401).send('Signature verification failed');
    }
}

/**
 * SwESuKBot Slash Commands
 */
const commands = {
    // Repository-Management Commands
    'repo-status': {
        name: 'repo-status',
        description: 'Zeigt den Status eines GitHub Repositories',
        options: [
            {
                name: 'repository',
                description: 'Repository Name (z.B. owner/repo)',
                type: 3, // STRING
                required: true
            }
        ],
        handler: async (interaction, options) => {
            const repoName = options.repository;
            
            try {
                // GitHub API Call (hier würden Sie echte GitHub API Calls machen)
                const repoInfo = await getGitHubRepoInfo(repoName);
                
                return {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        embeds: [{
                            title: `📊 Repository Status: ${repoName}`,
                            color: 0x00ff00,
                            fields: [
                                { name: '⭐ Stars', value: repoInfo.stars.toString(), inline: true },
                                { name: '🍴 Forks', value: repoInfo.forks.toString(), inline: true },
                                { name: '🐛 Issues', value: repoInfo.issues.toString(), inline: true },
                                { name: '📝 Language', value: repoInfo.language || 'N/A', inline: true },
                                { name: '📅 Updated', value: repoInfo.updated, inline: true }
                            ],
                            footer: { text: 'SwESuKBot - GitHub Integration' }
                        }]
                    }
                };
            } catch (error) {
                return {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `❌ Fehler beim Abrufen der Repository-Informationen: ${error.message}`,
                        flags: 64 // EPHEMERAL
                    }
                };
            }
        }
    },

    'setup-webhook': {
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
        ],
        handler: async (interaction, options) => {
            const repoName = options.repository;
            const events = options.events || 'push,issues,pull_request';
            
            try {
                // Webhook Setup Logic
                const webhookUrl = `${process.env.BASE_URL}/webhook/github/${interaction.channel_id}`;
                await setupGitHubWebhook(repoName, webhookUrl, events.split(','));
                
                return {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        embeds: [{
                            title: '✅ Webhook erfolgreich eingerichtet!',
                            description: `GitHub Webhook für **${repoName}** wurde konfiguriert.`,
                            color: 0x00ff00,
                            fields: [
                                { name: '📡 Events', value: events, inline: true },
                                { name: '📍 Kanal', value: `<#${interaction.channel_id}>`, inline: true }
                            ],
                            footer: { text: 'SwESuKBot - Webhook Integration' }
                        }]
                    }
                };
            } catch (error) {
                return {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `❌ Fehler beim Einrichten des Webhooks: ${error.message}`,
                        flags: 64 // EPHEMERAL
                    }
                };
            }
        }
    },

    'github-user': {
        name: 'github-user',
        description: 'Zeigt Informationen über einen GitHub Benutzer',
        options: [
            {
                name: 'username',
                description: 'GitHub Benutzername',
                type: 3, // STRING
                required: true
            }
        ],
        handler: async (interaction, options) => {
            const username = options.username;
            
            try {
                const userInfo = await getGitHubUserInfo(username);
                
                return {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        embeds: [{
                            title: `👤 GitHub User: ${userInfo.login}`,
                            url: userInfo.html_url,
                            thumbnail: { url: userInfo.avatar_url },
                            color: 0x238636,
                            fields: [
                                { name: '📝 Name', value: userInfo.name || 'N/A', inline: true },
                                { name: '📍 Location', value: userInfo.location || 'N/A', inline: true },
                                { name: '🏢 Company', value: userInfo.company || 'N/A', inline: true },
                                { name: '📊 Public Repos', value: userInfo.public_repos.toString(), inline: true },
                                { name: '👥 Followers', value: userInfo.followers.toString(), inline: true },
                                { name: '👤 Following', value: userInfo.following.toString(), inline: true }
                            ],
                            footer: { text: 'SwESuKBot - GitHub Integration' }
                        }]
                    }
                };
            } catch (error) {
                return {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `❌ Benutzer nicht gefunden: ${username}`,
                        flags: 64 // EPHEMERAL
                    }
                };
            }
        }
    },

    'help': {
        name: 'help',
        description: 'Zeigt alle verfügbaren SwESuKBot Commands',
        handler: async (interaction, options) => {
            return {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    embeds: [{
                        title: '🤖 SwESuKBot - Hilfe',
                        description: 'Verfügbare Commands für GitHub-Discord Integration:',
                        color: 0x5865f2,
                        fields: [
                            {
                                name: '📊 `/repo-status <repository>`',
                                value: 'Zeigt Repository-Statistiken und Informationen'
                            },
                            {
                                name: '📡 `/setup-webhook <repository> [events]`',
                                value: 'Richtet GitHub Webhook für diesen Kanal ein'
                            },
                            {
                                name: '👤 `/github-user <username>`',
                                value: 'Zeigt GitHub Benutzerinformationen'
                            },
                            {
                                name: '❓ `/help`',
                                value: 'Zeigt diese Hilfe-Nachricht'
                            }
                        ],
                        footer: { text: 'SwESuKBot v1.0 - GitHub Discord Integration' }
                    }]
                }
            };
        }
    }
};

/**
 * Verarbeitet Discord Interactions
 */
async function handleInteraction(req, res) {
    const interaction = req.body;

    // PING Response für Discord Verification
    if (interaction.type === InteractionType.PING) {
        return res.json({ type: InteractionResponseType.PONG });
    }

    // Slash Command Verarbeitung
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        const commandName = interaction.data.name;
        const command = commands[commandName];

        if (!command) {
            return res.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `❌ Unbekannter Command: ${commandName}`,
                    flags: 64 // EPHEMERAL
                }
            });
        }

        try {
            // Command Options parsen
            const options = {};
            if (interaction.data.options) {
                interaction.data.options.forEach(option => {
                    options[option.name] = option.value;
                });
            }

            // Command ausführen
            const response = await command.handler(interaction, options);
            return res.json(response);

        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            return res.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: '❌ Ein Fehler ist aufgetreten beim Ausführen des Commands.',
                    flags: 64 // EPHEMERAL
                }
            });
        }
    }

    // Unbekannter Interaction Type
    return res.status(400).json({ error: 'Unknown interaction type' });
}

/**
 * GitHub API Helper Functions
 */
async function getGitHubRepoInfo(repoName) {
    // Hier würden Sie echte GitHub API Calls implementieren
    // Für Demo-Zwecke Mock-Daten:
    return {
        stars: 42,
        forks: 15,
        issues: 3,
        language: 'JavaScript',
        updated: new Date().toLocaleDateString('de-DE')
    };
}

async function getGitHubUserInfo(username) {
    // Mock GitHub User Info
    return {
        login: username,
        name: 'Demo User',
        avatar_url: 'https://github.com/identicons/demo.png',
        html_url: `https://github.com/${username}`,
        location: 'Germany',
        company: 'SwESuK',
        public_repos: 25,
        followers: 100,
        following: 50
    };
}

async function setupGitHubWebhook(repoName, webhookUrl, events) {
    // Hier würden Sie GitHub Webhook API implementieren
    console.log(`Setting up webhook for ${repoName} with events: ${events.join(', ')}`);
    console.log(`Webhook URL: ${webhookUrl}`);
    return true;
}

module.exports = {
    verifyDiscordSignature,
    handleInteraction,
    commands,
    InteractionType,
    InteractionResponseType
};
