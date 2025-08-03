/**
 * GraphQL Gateway Server
 * 
 * This module sets up an Apollo Gateway that federates multiple GraphQL services
 * into a single unified API endpoint. The gateway handles service discovery,
 * schema composition, and request routing to the appropriate microservices.
 */

const { ApolloGateway } = require('@apollo/gateway');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

/**
 * Apollo Gateway configuration with federated service endpoints
 * 
 * The gateway automatically handles:
 * - Schema composition from multiple services
 * - Query planning and execution across services
 * - Type federation and relationship resolution
 */
const gateway = new ApolloGateway({
  serviceList: [
    { name: 'user', url: 'http://user-service:4001' },
    { name: 'listing', url: 'http://listing-service:4002' },
    { name: 'messaging', url: 'http://messaging-service:4003' }
  ],
});

/**
 * Context function that provides request headers to resolvers
 * 
 * This function runs for each GraphQL request and allows passing
 * authentication headers and other request metadata to the federated services.
 * 
 * @param {Object} params - Request parameters
 * @param {Object} params.req - HTTP request object
 * @returns {Object} Context object with request headers
 */
async function contextFunction({ req }) {
  return {
    headers: req.headers,
  };
}

/**
 * Initialize and start the GraphQL Gateway server
 * 
 * Sets up the Apollo Server with the configured gateway and starts
 * listening for incoming GraphQL requests on port 4000.
 */
async function start() {
  const server = new ApolloServer({
    gateway,
    subscriptions: false,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000, host: '0.0.0.0' },
    context: contextFunction,
  });
  console.log(`Gateway running at ${url}`);
}

start();