import {
  Client,
  Events,
  GatewayIntentBits,
  Message,
  // PartialMessage,
  Partials,
} from "discord.js";
import fetch from 'node-fetch';

import { Configuration, OpenAIApi } from "openai";
import "dotenv/config";

// const openAIConfiguration = new Configuration({
//   apiKey: process.env.OPENAI_KEY,
// });

// const openai = new OpenAIApi(openAIConfiguration);

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
  const author = message?.author;
  if (author) {
    const { id: authorId } = author;
    if (authorId !== process.env.DC_BOT_ID) {
      const prompt = message.content;
      if (message.content.startsWith('!weather')) {
        const args = message.content.split(' ');
        const location = args.slice(1).join(' ');

        try {
          const response = await fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=CWB-764E7116-819C-42F3-9611-1C859945418F');
          const data = await response.json();
          const records = data['records']['location']
          let replyMessage

          for await (const record of records) {
            const name = record.locationName
            if (name !== location) {
              continue
            }
            replyMessage = record
          }

          const time = replyMessage.time.obsTime
          const weatherElement = replyMessage.weatherElement
          const weather = weatherElement.slice(-1)[0].elementValue
          const temperature = weatherElement[3].elementValue

          message.channel.send(`${location} is now ${weather}, temperature is ${temperature} at ${time}`);
          console.log('sent msg!')
        } catch (error) {
          console.error('Error fetching weather:', error);
          message.reply('Sorry, there was an error fetching the weather information.');
        }
      }
      else {
        let completion;
        let responseText;
        try {
          console.log('prompt', prompt)
          responseText = prompt
        }
        // try {
        //   completion = await openai.createCompletion({
        //     prompt,
        //     model: process.env.GPT_MODEL,
        //     max_tokens: 2048,
        //   });
        //   responseText = completion.data?.choices?.[0]?.text || "";
        // } 
        catch (e) {
          console.error(e);
          responseText = "the api not working now";
        }
        await message.channel.send(responseText);
      }
    }
  }
};

client.on("messageCreate", async (message) => {
  await handleMessage(message);
});

client
  .login(process.env.DC_TOKEN)
  .catch((error) => console.error("Discord.Client.Login.Error", error));
