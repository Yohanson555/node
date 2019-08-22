const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
} = require('graphql/type');

const characterInterface = require('./intercafes/Character');
const { getHero, getHuman, getDroid } = require('../starWarsData');
const episodeEnum = require('./enums/Episodes');

const humanType = require('./HumanType');
const droidType = require('./DroidType');

/**
 * This is the type that will be the root of our query, and the
 * entry point into our schema. It gives us the ability to fetch
 * objects by their IDs, as well as to fetch the undisputed hero
 * of the Star Wars trilogy, R2-D2, directly.
 *
 * This implements the following type system shorthand:
 *   type Query {
 *     hero(episode: Episode): Character
 *     human(id: String!): Human
 *     droid(id: String!): Droid
 *   }
 *
 */

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      hero: {
        type: GraphQLList(characterInterface),
        args: {
          episode: {
            description:
              'If omitted, returns the hero of the whole saga. If provided, returns the hero of that particular episode.',
            type: episodeEnum,
          },
        },
        resolve: (root, { episode }) => getHero(episode),
      },
      human: {
        type: humanType,
        args: {
          id: {
            description: 'id of the human',
            type: GraphQLNonNull(GraphQLString),
          },
        },
        resolve: (root, { id }) => getHuman(id),
      },
      droid: {
        type: droidType,
        args: {
          id: {
            description: 'id of the droid',
            type: GraphQLNonNull(GraphQLString),
          },
        },
        resolve: (root, { id }) => getDroid(id),
      },
    }),
});

module.exports = queryType;