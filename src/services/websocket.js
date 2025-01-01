const WebSocket = require('ws');
const Participant = require('../models/Participant');

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'join') {
                    const participant = new Participant({
                        roomId: data.roomId,
                        userId: data.userId,
                        name: data.name
                    });
                    await participant.save();
                    
                    // Broadcast to all clients
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'participant_joined',
                                participant
                            }));
                        }
                    });
                } else if (data.type === 'leave') {
                    await Participant.findOneAndUpdate(
                        { userId: data.userId, roomId: data.roomId },
                        { active: false }
                    );
                    
                    // Broadcast to all clients
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'participant_left',
                                userId: data.userId,
                                roomId: data.roomId
                            }));
                        }
                    });
                }
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        });
    });

    return wss;
}

module.exports = setupWebSocket; 