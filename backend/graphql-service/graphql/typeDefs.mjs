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
    userIdToken: String
  }

  type PostEvent {
    id: ID
    user_id: String
    room_name: String
    description: String
    stars: Int
    lat: Float
    lng: Float
    category: String
    type_post: String
    duration: Int
  }

  type PostPlace {
    id: ID
    user_id: String
    room_name: String
    description: String
    stars: Int
    lat: Float
    lng: Float
    category: String
    type_post: String
  }

  type Event {
    message: String
    newEvent: PostEvent
  }

  type Place {
    message: String
    newPlace: PostPlace
  }

  type Mutation {
    register(username: String!, password: String!, phoneNumber: String!, type: String!): User
    login(username: String!, password: String!): Auth
    createEvent(name: String!, description: String!, lat: Float!, lng: Float!, category: String!, duration: Int!): Event
    createPlace(name: String!, description: String!, lat: Float!, lng: Float!, category: String!): Place
  }
`;