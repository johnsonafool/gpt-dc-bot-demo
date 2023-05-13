import {
  Client,
  Events,
  GatewayIntentBits,
  Message,
  // PartialMessage,
  Partials,
} from "discord.js";

import { Configuration, OpenAIApi } from "openai";
import "dotenv/config";

const openAIConfiguration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(openAIConfiguration);

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

const handleMessage = async (message) => {
  console.log("handleMessage", {
    channelId: message.channelId,
    guildId: message.guildId,
    id: message.id,
    content: message.content,
    author: message?.author?.username,
    authorId: message?.author?.id,
  });
  const author = message?.author;
  if (author) {
    const { id: authorId } = author;
    // if (authorId !== "1106629774559936593") {
    if (authorId !== process.env.DC_BOT_ID) {
      const prompt = message.content;
      let completion;
      let responseText;
      try {
        completion = await openai.createCompletion({
          prompt,
          model: process.env.GPT_MODEL,
          max_tokens: 2048,
        });
        responseText = completion.data?.choices?.[0]?.text || "";
      } catch (e) {
        console.error(e);
        responseText = "the api not working now";
      }
      await message.channel.send(responseText);
    }
  }
};

client.on("messageCreate", async (message) => {
  await handleMessage(message);
});

client
  .login(process.env.DC_TOKEN)
  .catch((error) => console.error("Discord.Client.Login.Error", error));
