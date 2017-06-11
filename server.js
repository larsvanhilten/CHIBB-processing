const config = require('config');
const mqtt = require('./mqtt');
const mongoClient = require('mongodb');
const _ = require('lodash');

const defaultClient = {
  url: config.mqtt.url,
  port: config.mqtt.port,
  channel: config.mqtt.channel,
  username: config.mqtt.username,
  password: config.mqtt.password
};

mongoClient.connect(config.mongo.url)
.then(connection => {
  const db = connection.collection('brokers');
  mqtt.connect(defaultClient);

  const activeBrokers = [];
  const activeClients = {};
  setInterval(() => {
    db.find().toArray()
    .then(results => {
      const newBrokers = _.difference(results, activeBrokers);
      _.forEach(newBrokers, broker => {
        const client = mqtt.connect(broker);
        activeBrokers.push(broker);
        activeClients[broker.name] = client;
      });

      const oldBrokers = _.difference(activeBrokers, results);
      _.forEach(oldBrokers, broker => {
        if(activeClients[broker.name].connected) {
          activeClients[broker.name].end();
          delete activeClients[broker.name];
          const index = activeBrokers.indexOf(broker);
          activeBrokers.splice(index, 1);
        }
      });
    })
    .catch(err => {
      console.error(err);
    });
  }, config.mongo.checkInterval * 1000);
})
.catch(err => {
  console.error(err);
});
