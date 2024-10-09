/**
 * index.js
 * This file is the main entrypoint for the application.
 * @author  Giuseppe Careri
 * @see https://www.gcareri.com
 */
const express = require('express');
const axios = require('axios');

require('dotenv').config();

const app = express();

app.use(express.json());

let calls = {};

/**
 * Handles a prompt stream from the client and uses the OpenAI API to generate
 * a response stream. The response stream is sent back to the client as a
 * series of Server-Sent Events.
 *
 * @param {Object} req - The Express request object
 * @param {Object} res - The Express response object
 */
const handlePromptStream = async (req, res) => {
    const { uuid, message } = req.body;

    if (!uuid) {
        return res.status(400).json({ message: 'Uuid is required' });
    }

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        if (!calls[uuid]) {
            // Start a new chat session
            const start = await axios.post(`https://typebot.io/api/v1/typebots/${process.env.TYPEBOT_PUBLIC_ID}/startChat`, {
                // isStreamEnabled: true,
                textBubbleContentFormat: 'markdown'
            });
            calls[uuid] = start.data.sessionId;
            // Send the initial messages to the client
            for (const message of start.data.messages) {
                if (message.type === 'text') {
                    console.log(message.content.markdown)
                    res.write(message.content.markdown);
                }
            }
        } else {
            // Continue the chat session
            const chat = await axios.post(`https://typebot.io/api/v1/sessions/${calls[uuid]}/continueChat`, {
                message: {
                    type: 'text',
                    text: message
                },
                textBubbleContentFormat: 'markdown'
            });
            // Send the new messages to the client
            for (const message of chat.data.messages) {
                if (message.type === 'text') {
                    console.log(message.content.markdown)
                    res.write(message.content.markdown);
                }
            }
        }

        res.end();
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

app.post('/prompt-stream', handlePromptStream);

const port = process.env.PORT || 6005;
app.listen(port, () => {
    console.log(`Botpress listening on port ${port}`);
});
