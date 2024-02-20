export const typeDefs = `#graphql
  type Query {
    _empty: String
  }

  type User {
    username: String
  }

  type Auth {
    sessionToken: String
    userTypeToken: String
  }

  type Mutation {
    register(username: String!, password: String!, phoneNumber: String!, type: String!): User
    login(username: String!, password: String!): Auth
  }
`;