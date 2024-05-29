const mqtt = require('mqtt');
require('dotenv').config()

const brokerUrl = 'mqtts://be4122922e5f4e8b8873c2ff4ab99465.s1.eu.hivemq.cloud:8883';
const options = {
  username: process.env.MQTT_USERNAME,  // Replace with your HiveMQ username
  password: process.env.MQTT_PASSWORD,  // Replace with your HiveMQ password
  rejectUnauthorized: false
};

const client = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
  console.log('Connected to HiveMQ broker');
  
  // Subscribe to a topic
  client.subscribe('feed', (err) => {
    if (!err) {
      console.log('Subscribed to feed topic');
    }
  });
});

client.on('error', (err) => {
  console.error('Connection error:', err);
});

client.on('message', (topic, message) => {
  console.log(`Received message: ${message.toString()} on topic: ${topic}`);
});

exports.sendFeedCommand = (quantity) => {
    // Send command to NodeMCU with quantity
    console.log(`Sending feed command to NodeMCU with quantity: ${quantity}`);
    
    // Publish a message to the topic with the quantity included
    const message = JSON.stringify({ feed: 'yes', quantity: quantity });
    client.publish('feed', message, (err) => {
      if (!err) {
        console.log(`Message sent: ${message}`);
      } else {
        console.error('Failed to send message:', err);
      }
    });
  };
