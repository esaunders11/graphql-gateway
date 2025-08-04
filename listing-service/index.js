/**
 * Listing Service - GraphQL Subgraph
 * 
 * This service handles all listing-related operations including book listings,
 * searches, and user-listing relationships. It's part of a federated GraphQL
 * architecture and extends the User type from the user service.
 */

const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const gql = require('graphql-tag');

/** Base URL for the backend API service */
const BASE_URL = process.env.BASE_URL;

/**
 * GraphQL type definitions for the Listing subgraph
 * 
 * Defines the Listing entity with federation directives and extends
 * the User type to include listing relationships. The @key directive
 * enables entity federation across services.
 */
const typeDefs = gql`
  type Listing @key(fields: "id") {
    id: ID!
    title: String!
    description: String
    price: Float
    condition: String
    ownerId: ID!
    postedAt: String
    seller: User
    imageUrl: String
    courseCode: String
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    listings: [Listing]
  }

  extend type Query {
    getListing(id: ID!): Listing
    searchListings(query: String, condition: String, minPrice: Float, maxPrice: Float): [Listing]
    recentListings: [Listing]
    myListings: [Listing]
  }
`;

/**
 * GraphQL resolvers for listing operations
 * 
 * Contains query resolvers for fetching listings, field resolvers for
 * entity relationships, and federation resolvers for cross-service data.
 */
const resolvers = {
  Query: {
    /**
     * Fetch a single listing by ID
     * @param {Object} _ - Parent object (unused)
     * @param {Object} args - Query arguments
     * @param {string} args.id - Listing ID
     * @returns {Promise<Object|null>} Listing object or null if not found
     */
    getListing: async (_, { id }) => {
      const res = await fetch(`${BASE_URL}/api/books/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    /**
     * Search listings with optional filters
     * @param {Object} _ - Parent object (unused)
     * @param {Object} args - Search parameters (query, condition, minPrice, maxPrice)
     * @returns {Promise<Array>} Array of matching listings
     */
    searchListings: async (_, args) => {
      const params = new URLSearchParams(args);
      const res = await fetch(`${BASE_URL}/api/books/search?${params}`);
      if (!res.ok) return [];
      return res.json();
    },
    /**
     * Fetch recent listings
     * @returns {Promise<Array>} Array of recent listings
     */
    recentListings: async () => {
      const res = await fetch(`${BASE_URL}/api/books`);
      if (!res.ok) return [];
      return res.json();
    },
    /**
     * Fetch listings owned by the authenticated user
     * @param {Object} _ - Parent object (unused)
     * @param {Object} __ - Arguments (unused)
     * @param {Object} context - GraphQL context
     * @param {Object} context.headers - Request headers containing authorization
     * @returns {Promise<Array>} Array of user's listings
     */
    myListings: async (_, __, { headers }) => {
      const res = await fetch(`${BASE_URL}/api/books/my-listings`, {
        headers: { 'Authorization': headers.authorization }
      });
      if (!res.ok) return [];
      return res.json();
    }
  },
  /**
   * Field resolvers for Listing type
   */
  Listing: {
    /**
     * Resolve seller relationship by returning User entity reference
     * @param {Object} listing - The listing object
     * @returns {Object} User entity reference for federation
     */
    seller(listing) {
      return { __typename: 'User', id: listing.ownerId };
    }
  },
  /**
   * Extended resolvers for User type from federation
   */
  User: {
    /**
     * Fetch all listings for a specific user
     * @param {Object} user - User entity with id field
     * @returns {Promise<Array>} Array of listings owned by the user
     */
    listings: async (user) => {
      const res = await fetch(`${BASE_URL}/api/books?ownerId=${user.id}`);
      if (!res.ok) return [];
      return res.json();
    }
  }
};

/**
 * Apollo Server configuration for the Listing subgraph
 * 
 * Creates a federated GraphQL subgraph that can be composed
 * with other services by the Apollo Gateway.
 */
const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  context: ({ req }) => ({
    headers: req.headers
  })
});

/**
 * Start the Listing service server
 * 
 * Initializes the Apollo Server on port 4002 and makes it available
 * for federation by the gateway service.
 */
startStandaloneServer(server, { listen: { port: 4002, host: '0.0.0.0' } }).then(({ url }) => {
  console.log(`Listing GraphQL subgraph ready at ${url}`);
});