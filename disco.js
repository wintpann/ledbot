require('dotenv').config();
const superagent = require('superagent');
const config = require('./config');
const {disco} = require('./config');

const updateLed = (state) => {
  superagent
    .put(process.env.LED_URL)
    .send(state)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${process.env.LED_TOKEN}`)
    .end(() => { });
};

let discoIndex = 0;

setInterval(() => {
  discoIndex === disco.length - 1 ? discoIndex = 0 : discoIndex++;
  updateLed(disco[discoIndex])
}, 1500);