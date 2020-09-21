require('dotenv').config();
const superagent = require('superagent');
const { App } = require('@slack/bolt');

const config = require('./config');
const { ledStates } = config;
const stateNames = Object.keys(ledStates);

const bot = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

const messageMe = (eventData, message) => {
  bot.client.chat.meMessage({
    token: eventData.context.botToken,
    channel: eventData.event.channel,
    text: message
  }).catch(() => {});
};

const updateLed = (state) => new Promise((resolve, reject) => {
  if (stateNames.includes(state)) {
    superagent
      .put(process.env.LED_URL)
      .send(ledStates[state])
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${process.env.LED_TOKEN}`)
      .end((err, res) => {
        if (err) {
          return reject('Unknown error. Try later');
        } else {
          return resolve();
        }
      });
  } else {
    return reject(`State not defined. Defined states: <${stateNames.join(', ')}>`);
  }
});

(async () => {
  await bot.start(process.env.PORT || 3000);
  console.log('Bot is running');

  bot.event('app_mention', (eventData) => {
    const message = eventData.event.text.split(' ').slice(1).join(' ');
    updateLed(message)
      .then(() => {
        messageMe(eventData, `State updated to "${eventData.event.text}"`);
      })
      .catch((e) => {
        messageMe(eventData, e);
      })
  });
})();