// server/src/index.js
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { MongoClient } = require('mongodb');

const typeDefs = require('./graphql/typeDefs/gradeDefs');
const resolvers = require('./graphql/resolvers/gradeResolvers');

const MONGO_URI = 'mongodb://localhost:27016'; // Routing layer entry point
const DB_NAME = 'academic_analytics';

async function startServer() {
  // Connect to Sharded DB Cluster via Mongos Router
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('🚀 Connected to Sharded MongoDB Cluster Router...');
  const db = client.db(DB_NAME);

  // Initialize Apollo Server instance
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Start standalone server injecting the shared database context into resolvers
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => ({ db }),
  });

  console.log(`📊 GraphQL Engine ready at: ${url}`);
}

startServer().catch(err => {
  console.error('Failed to launch GraphQL backend engine:', err);
});