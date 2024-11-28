# Agent Voice Response - Typebot.io Integration

This repository contains the integration between **Agent Voice Response** ([agentvoiceresponse.com](https://www.agentvoiceresponse.com)) and **Typebot.io** ([typebot.io](https://typebot.io/)) highlighting the supported blocks and configurations for optimal performance.

Typebot is an Fair Source chatbot builder. It allows you to create advanced chatbots visually, embed them anywhere on your web/mobile apps, and collect results in real-time

This setup enables streaming real-time conversations between users and a Typebot instance, where user inputs are processed and responded to using Typebot’s chatbot system. The responses are then streamed back to the Agent Voice Response Core via Server-Sent Events (SSE).

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Supported Blocks](#supported-blocks)
- [Integration Workflow](#integration-workflow)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)

## Overview

The integration sets up an Express.js server that acts as a middle layer between Agent Voice Response and Typebot.io. It allows users to start or continue a chat session with Typebot, and real-time responses are streamed back using Server-Sent Events (SSE).

### Key Features

- Start a new chat session with Typebot.
- Continue a chat session by sending user messages.
- Stream Typebot’s responses in real-time using SSE.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/agentvoiceresponse/avr-llm-typebot.git
   cd avr-llm-typebot
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.example` file to `.env` and fill in the required values.

## Configuration

To set up this integration, you need an active Typebot project and API access.

## Supported Blocks

The following blocks are supported and recommended for creating a seamless user experience:

1. Bubbles

- **Text**: Display text bubbles to communicate information to the user.
- **Audio**: Play pre-recorded audio messages to provide a richer user interaction.

   > **Audio File Recommendation**:  
   If you are using the **Audio Bubble** block, it is important to ensure the audio files are in the correct format.  

   **Steps to Convert Audio to G.711:**

   1. Visit [https://g711.org/](https://g711.org/).
   2. Upload your audio file and keep the default configuration:  
      - **Standard Definition 16-bit WAV**  
      - **8kHz, Mono, 16-Bit PCM**  
      - **Volume Normal**  
      - Flag the checkbox: **Optimize Audio for Phone (Bandpass Filter)**.
   3. After conversion, you will be redirected to the download page. Download the converted file and upload it to Typebot.io.

### 2. **Inputs**

- **Text**: Collect freeform text input from the user.
- **Number**: Accept numerical input.
- **Email**: Validate and collect email addresses.
- **Website**: Collect URLs and validate their format.
- **Date**: Request and validate dates.
- **Phone**: Accept phone numbers in a structured format.

### 3. **Logic**

- **Set Variable**: Store dynamic data to variables for use in subsequent flows.
- **Condition**: Add decision-making logic to guide the conversation flow.

### 4. **Integrations**

- **HTTP request**

## Integration Workflow

1. **Plan the Flow**: Define the user journey and the logic required in Typebot.io.
2. **Prepare Resources**:
   - Text bubbles for simple information.
   - Audio bubbles for rich, interactive messages (convert audio files to G.711 as described).
3. **Configure Blocks**:
   - Use **Input** blocks to collect data from users.
   - Apply **Logic** blocks to handle dynamic scenarios or trigger external workflows.
4. **Test and Validate**:
   - Test the flow in Typebot.io to ensure smooth transitions between blocks.
   - Confirm that audio files play correctly and are optimized for telephony.

By following this guide, you can create engaging and efficient conversational flows that integrate **Agent Voice Response** with **Typebot.io**, enhancing user interaction and experience.

### Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

- **`PORT`**: The port on which the Express server will run (default: `6005`).
- **`TYPEBOT_PUBLIC_ID`**: The Typebot Public ID you want to integrate with. [How to find your publicId](https://docs.typebot.io/api-reference/how-to).

## Usage

Once the server is running, you can interact with it by sending HTTP POST requests to initiate or continue a chat session. The server forwards user messages to Typebot and streams back Typebot’s responses in real-time.

### Starting the Server

Run the server using:

```bash
npm start
```

The server will be available on the port defined in your `.env` file (default is `6005`).

### API Endpoints

#### 1. `/prompt-stream`

This endpoint receives user messages and interacts with Typebot to retrieve responses, streaming the conversation back in real-time using Server-Sent Events (SSE).

- **Method**: `POST`
- **Content-Type**: `application/json`
- **Description**: Handles user messages, starts or continues a Typebot chat session, and returns the responses via SSE.

**Example Request**:

```bash
curl -X POST http://localhost:6005/prompt-stream \
     -H "Content-Type: application/json" \
     -d '{
           "uuid": "user123",
           "message": "Hello, Typebot!"
         }'
```

**Request Body**:

- `uuid`: A unique identifier for the user session.
- `message`: The message sent by the user to Typebot.

**Response**:
The response will be streamed back to the client as a series of Server-Sent Events (SSE) containing Typebot's replies.

## Example Flow

1. **Start a new chat session**: When a user sends their first message, the server sends the message to Typebot, starting a new session and streaming the bot’s initial response.
2. **Continue a session**: If a session for the provided `uuid` exists, the server continues the session by sending the user’s message to Typebot and streaming the response.
3. **End the stream**: Once the response is fully sent, the server closes the connection.

By integrating **Agent Voice Response** with **Typebot.io**, you can create seamless, real-time AI-driven conversations where user inputs are processed and responded to dynamically using the powerful Typebot chatbot system.

For those who wish to contribute to the project, please send an email to <info@agentvoiceresponse.com>.
