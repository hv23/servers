#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

[... rest of the unchanged file ...]

// Only modifying the getChannelHistory method:
  async getChannelHistory(channel_id: string, limit: number = 10): Promise<any> {
    const params = new URLSearchParams({
      channel: channel_id,
      limit: limit.toString(),
    });

    // First try to get history
    let response = await fetch(
      `https://slack.com/api/conversations.history?${params}`,
      { headers: this.botHeaders },
    );

    let result = await response.json();
    
    // If we get not_in_channel error, try joining first
    if (!result.ok && result.error === 'not_in_channel') {
      // Join the channel
      const joinResponse = await fetch('https://slack.com/api/conversations.join', {
        method: 'POST',
        headers: this.botHeaders,
        body: JSON.stringify({ channel: channel_id })
      });

      const joinResult = await joinResponse.json();
      if (joinResult.ok) {
        // Retry getting history after successful join
        response = await fetch(
          `https://slack.com/api/conversations.history?${params}`,
          { headers: this.botHeaders },
        );
        result = await response.json();
      }
    }

    return result;
  }

[... rest of the unchanged file ...]