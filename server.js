const config = require('config');
const mqtt = require('mqtt');
const mongoClient = require('mongodb');

let db;

mongoClient.connect(config.mongo.url)
.then(connection => {
  db = connection.collection(config.mongo.collection);
})
.catch(err => {
  console.error(err);
});

const clientOptions = {
  port: config.mqtt.port,
  clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
  username: config.mqtt.username,
  password: config.mqtt.password
};

const client = mqtt.connect(config.mqtt.url, clientOptions);

client.on('connect', () => {
  client.subscribe('sensors');
});

client.on('message', (topic, message) => {
  const object = JSON.parse(message);

  db.insertMany(object.readings)
  .catch(err => {
    console.error(err);
  });
});

