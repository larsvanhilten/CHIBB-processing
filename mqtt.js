const mongoClient = require('mongodb');
const config = require('config');
const mqtt = require('mqtt');

let db;

mongoClient.connect(config.mongo.url)
.then(connection => {
  db = connection.collection('readings');
})
.catch(err => {
  console.error(err);
});

module.exports = {
  connect: broker => {
    const client = mqtt.connect(broker.url, {
      clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
      port: broker.port,
      username: broker.username,
      password: broker.password
    });

    client.on('connect', () => {
      client.subscribe(broker.channel);
    });

    client.on('message', (topic, message) => {
      const object = JSON.parse(message);

      db.insertMany(object.readings)
      .catch(err => {
        console.error(err);
      });
    });

    return client;
  }
};
