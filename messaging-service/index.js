/**
 * Messaging Service - GraphQL Subgraph
 * 
 * This service handles all messaging-related operations including message retrieval
 * and conversation management between users. It's part of a federated GraphQL
 * architecture providing messaging capabilities.
 */

const { ApolloServer } = require('@apollo/server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { startStandaloneServer } = require('@apollo/server/standalone');
const gql = require('graphql-tag');

/** Base URL for the backend API service */
const BASE_URL = process.env.BASE_URL;

/**
 * GraphQL type definitions for the Messaging subgraph
 * 
 * Defines the Message entity with federation support. The @key directive
 * enables this entity to be referenced and extended by other services.
 */
const typeDefs = gql`
  type Message @key(fields: "id") {
    id: ID!
    senderId: ID!
    receiverId: ID!
    content: String!
    timestamp: String!
  }

  extend type Query {
    getReceivedMessages(userId: ID!): [Message]
    getMessagesBetween(userId1: ID!, userId2: ID!): [Message]
  }
`;

/**
 * GraphQL resolvers for messaging operations
 * 
 * Contains query resolvers for fetching messages and federation
 * resolvers for entity resolution across services.
 */
const resolvers = {
  Query: {
    /**
     * Fetch all messages received by a specific user
     * @param {Object} _ - Parent object (unused)
     * @param {Object} args - Query arguments
     * @param {string} args.userId - ID of the user receiving messages
     * @returns {Promise<Array>} Array of received messages
     */
    getReceivedMessages: async (_, { userId }) => {
      const res = await fetch(`${BASE_URL}/api/messages/received/${userId}`);
      if (!res.ok) return [];
      return res.json();
    },
    /**
     * Fetch all messages in a conversation between two users
     * @param {Object} _ - Parent object (unused)
     * @param {Object} args - Query arguments
     * @param {string} args.userId1 - ID of the first user
     * @param {string} args.userId2 - ID of the second user
     * @returns {Promise<Array>} Array of messages between the two users
     */
    getMessagesBetween: async (_, { userId1, userId2 }) => {
      const res = await fetch(`${BASE_URL}/api/messages/between/${userId1}/${userId2}`);
      if (!res.ok) return [];
      return res.json();
    }
  },
  /**
   * Federation resolvers for Message entity
   */
  Message: {
    /**
     * Federation resolver for Message entity references
     * 
     * This resolver is called when other services reference a Message entity.
     * Currently returns null as message resolution is not implemented.
     * 
     * @param {Object} reference - Entity reference containing the message ID
     * @param {string} reference.id - Message ID
     * @returns {Promise<null>} Currently returns null (not implemented)
     */
    __resolveReference: async ({ id }) => {
      return null;
    }
  }
};

/**
 * Apollo Server configuration for the Messaging subgraph
 * 
 * Creates a federated GraphQL subgraph that provides messaging
 * functionality and can be composed with other services.
 */
const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

/**
 * Start the Messaging service server
 * 
 * Initializes the Apollo Server on port 4003 and makes it available
 * for federation by the gateway service.
 */
startStandaloneServer(server, { listen: { port: 4003, host: '0.0.0.0' } }).then(({ url }) => {
  console.log(`Messaging GraphQL subgraph ready at ${url}`);
});