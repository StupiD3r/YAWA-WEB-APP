// server/src/kafka.js
const { Kafka } = require('kafkajs');

// Initialize the core Kafka client instance
const kafka = new Kafka({
  clientId: 'academic-analytics-server',
  brokers: ['localhost:9092'], // Points to our Docker Kafka container mapping
});

const producer = kafka.producer();

async function connectKafka() {
  try {
    await producer.connect();
    console.log('🚀 Connected to Real-Time Apache Kafka Broker...');
  } catch (error) {
    console.error('❌ Failed to establish link to Apache Kafka:', error);
  }
}

// Helper utility to fire events into a specific topic channel easily
async function streamLogEvent(topic, eventType, data) {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key: data.department || 'general',
          value: JSON.stringify({
            eventType,
            timestamp: new Date().toISOString(),
            payload: data,
          }),
        },
      ],
    });
    console.log(`📡 Kafka Event Streamed -> Topic: [${topic}] | Type: [${eventType}]`);
  } catch (err) {
    console.error('⚠️ Failed to broadcast event message over Kafka stream:', err.message);
  }
}

module.exports = { connectKafka, streamLogEvent };