/**
 * index.js
 * This file is the main entrypoint for the application.
 * @author  Giuseppe Careri
 * @see https://www.gcareri.com
 */
const express = require('express');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');

require('dotenv').config();

const app = express();

app.use(express.json());

let calls = {};

/*
* Processes an array of messages and sends the appropriate response to the client.
*
* @param {Array} messages - An array of message objects to process.
* @param {Object} res - The Express response object used to send data back to the client.
* @returns {Promise<void>} - A promise that resolves when all messages have been processed.
*/
const processMessages = async (messages, res) => {
    for (const message of messages) {
        switch (message.type) {
            case 'text':
                console.log('text', message.content.markdown);
                res.write(JSON.stringify({ type: 'text', content: message.content.markdown }));
                break;
            case 'audio':
                console.log('audio', message.content.url);
                try {
                    await new Promise(async (resolve, reject) => {
                        const audioResponse = await axios.get(message.content.url, { responseType: 'stream' });
                        const passThrough = new PassThrough();

                        ffmpeg(audioResponse.data)
                            .audioChannels(1)        // Convert to mono
                            .audioFrequency(8000)     // Set sample rate to 8kHz
                            .audioCodec('pcm_s16le')  // Set codec to 16-bit linear PCM
                            .format('wav')            // Output format as WAV
                            .on('error', reject)
                            .pipe(passThrough);

                        passThrough.on('data', (chunk) => {
                            res.write(JSON.stringify({ type: 'audio', content: chunk }));
                        });
                        passThrough.on('end', resolve);
                        passThrough.on('error', reject);
                    });
                } catch (error) {
                    console.error('Error fetching audio:', error.message);
                    res.status(500).json({ message: 'Error fetching audio with Typebot' });
                }
                break;
            default:
                console.log('Unknown message type:', message.type);
                break;
        }
    }
};

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
            console.log('Starting new chat session', uuid);
            const start = await axios.post(`https://typebot.io/api/v1/typebots/${process.env.TYPEBOT_PUBLIC_ID}/startChat`, {
                // isStreamEnabled: true,
                prefilledVariables: {
                    uuid
                },
                textBubbleContentFormat: 'markdown'
            });
            calls[uuid] = start.data.sessionId;
            // Send the initial messages to the client
            await processMessages(start.data.messages, res);
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
            await processMessages(chat.data.messages, res);
        }
        console.log('END');
        res.end();
    } catch (error) {
        console.error('Error calling Typebot API:', error.message);
        res.status(500).json({ message: 'Error communicating with Typebot' });
    }
}

app.post('/prompt-stream', handlePromptStream);

const port = process.env.PORT || 6005;
app.listen(port, () => {
    console.log(`Typebot listening on port ${port}`);
});
