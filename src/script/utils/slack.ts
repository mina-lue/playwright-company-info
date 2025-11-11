

/*
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs"
import { Block, KnownBlock, WebClient } from "@slack/web-api"

const sqs = new SQSClient();

async function getSlackClient() {
  //const slackBotTokens = (await parameters.get("SlackBotTokens")).split(",")
  const slackBotTokens = ['random_token_1', 'random_token_2', 'random_token_3']

  const randomToken = slackBotTokens[Math.floor(Math.random() * slackBotTokens.length)]
  return new WebClient(randomToken, { rejectRateLimitedCalls: true })
}

export type SlackMessageType = {
  token: string
  ts: string
  channel: string
}

export async function putSlackMessage(message: SlackMessageType) {
  const slackSqsResponse = await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.SLACK_SQS || "slack-sqs",
      DelaySeconds: 2,
      MessageBody: JSON.stringify(message),
    }),
  )
  console.log({ slackSqsResponse })
}

export async function sendSlackMessage(channel: string, blocks: (Block | KnownBlock)[]): Promise<string> {
  const slack = await getSlackClient()

  try {
    const result = await slack.chat.postMessage({
      channel,
      blocks,
    })

    console.log("Slack message sent. ts:", result.ts)
    return result.ts || ""
  } catch (error) {
    console.error("Error posting to Slack:", error)
    return ""
  }
}

*/

import { WebClient } from "@slack/web-api";
import { config } from "dotenv";

config(); // Load environment variables from .env file

export async function sendSlackMessage( text: string): Promise<string> {
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID!;
  
  const slack = new WebClient(slackBotToken);

  try {
    const result = await slack.chat.postMessage({
      channel,
      text,
    });

    console.log("Slack message sent. ts:", result.ts);
    return result.ts || "";
  } catch (error) {
    console.error("Error posting to Slack:", error);
    return "";
  }
}

