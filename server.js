const config = require('config');
const mqtt = require('mqtt')

var clientOptions = {
    port: config.mqtt.port,
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: config.mqtt.username,
    password: config.mqtt.password
};

var client = mqtt.connect(config.mqtt.url, clientOptions);

client.on('connect', () => {
  client.subscribe('sensors')
  console.log("Subscribed to sensors channel")
})

client.on('message', (topic, message) => {
  // message is Buffer
  console.log(message.toString())
  client.end()
})
