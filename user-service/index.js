/**
 * User Service - GraphQL Subgraph
 * 
 * This service handles all user-related operations including user authentication,
 * profile management, and serves as the primary User entity for federation.
 * Other services can extend and reference the User type defined here.
 */

const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const gql = require('graphql-tag');
const fetch = require('node-fetch');

/** Base URL for the backend API service */
const BASE_URL = process.env.BASE_URL;

/**
 * GraphQL type definitions for the User subgraph
 * 
 * Defines the primary User entity with federation support. The @key directive
 * enables this entity to be referenced and extended by other services in the
 * federated schema. This serves as the authoritative source for user data.
 */
const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    username: String!
    email: String!
    role: String!
    firstName: String
    lastName: String
    verified: Boolean
  }

  extend type Query {
    getUser(id: ID!): User
    currentUser: User
  }
`;

/**
 * GraphQL resolvers for user operations
 * 
 * Contains query resolvers for fetching user data and federation
 * resolvers that allow other services to resolve User entities.
 */
const resolvers = {
  Query: {
    /**
     * Fetch a user by their unique ID
     * @param {Object} _ - Parent object (unused)
     * @param {Object} args - Query arguments
     * @param {string} args.id - User ID
     * @returns {Promise<Object|null>} User object or null if not found
     */
    getUser: async (_, { id }) => {
      const res = await fetch(`${BASE_URL}/api/users/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    /**
     * Fetch the currently authenticated user
     * @param {Object} _ - Parent object (unused)
     * @param {Object} __ - Arguments (unused)
     * @param {Object} context - GraphQL context
     * @param {Object} context.user - User object from authentication (unused)
     * @param {Object} context.headers - Request headers containing authorization
     * @returns {Promise<Object|null>} Current user object or null if not authenticated
     */
    currentUser: async (_, __, { user, headers }) => {
      const res = await fetch(`${BASE_URL}/api/auth/user`, {
        headers: { 'Authorization': headers.authorization }
      });
      if (!res.ok) return null;
      return res.json();
    }
  },
  /**
   * Federation resolvers for User entity
   */
  User: {
    /**
     * Federation resolver for User entity references
     * 
     * This resolver is called when other services reference a User entity
     * by ID. It fetches the complete user data from the backend API.
     * 
     * @param {Object} reference - Entity reference containing the user ID
     * @param {string} reference.id - User ID
     * @returns {Promise<Object|null>} Complete user object or null if not found
     */
    __resolveReference: async ({ id }) => {
      const res = await fetch(`${BASE_URL}/api/users/${id}`);
      if (!res.ok) return null;
      return res.json();
    }
  }
};

/**
 * Apollo Server configuration for the User subgraph
 * 
 * Creates a federated GraphQL subgraph that serves as the authoritative
 * source for user data and provides authentication capabilities.
 */
const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  context: ({ req }) => ({
    headers: req.headers
  })
});

/**
 * Start the User service server
 * 
 * Initializes the Apollo Server on port 4001 and makes it available
 * for federation by the gateway service. This is typically the first
 * service to start as other services may reference User entities.
 */
startStandaloneServer(server, { listen: { port: 4001, host: '0.0.0.0' } }).then(({ url }) => {
  console.log(`User GraphQL subgraph ready at ${url}`);
});