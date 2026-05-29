// server/src/index.js
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { MongoClient } = require('mongodb');
const { createClient } = require('redis');
const { connectKafka } = require('./kafka'); // Import Kafka engine connector

const typeDefs = require('./graphql/typeDefs/gradeDefs');
const resolvers = require('./graphql/resolvers/gradeResolvers');

const MONGO_URI = 'mongodb://localhost:27016';
const DB_NAME = 'academic_analytics';

async function startServer() {
  // 1. Connect to Sharded DB Cluster via Mongos Router
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('🚀 Connected to Sharded MongoDB Cluster Router...');
  const db = client.db(DB_NAME);

  // 2. Initialize and connect to Redis Cache Server safely
  let redisClient = null;
  try {
    const clientInstance = createClient({ url: 'redis://localhost:6379' });
    clientInstance.on('error', (err) => console.log('⚠️ Redis Client Error:', err.message));
    await clientInstance.connect();
    console.log('⚡ Connected to Distributed Redis Cache Engine...');
    redisClient = clientInstance;
  } catch (redisError) {
    console.log('❌ Redis connection failed. Running in database-only fallback mode.');
  }

  // 3. Connect to Event Stream engine
  await connectKafka();

  // Initialize Apollo Server instance
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // 4. Inject connections into context
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => ({ db, redis: redisClient }),
  });

  console.log(`📊 GraphQL Engine ready at: ${url}`);
}

startServer().catch(err => {
  console.error('Failed to launch GraphQL backend engine:', err);
});