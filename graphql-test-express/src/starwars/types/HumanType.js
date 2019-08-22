const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
} = require('graphql/type');

const characterInterface = require('./intercafes/Character');
const { getFriends } = require('../starWarsData');
const episodeEnum = require('./enums/Episodes');

/**
 * We define our human type, which implements the character interface.
 *
 * This implements the following type system shorthand:
 *   type Human : Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *     secretBackstory: String
 *   }
 */

const humanType = new GraphQLObjectType({
    name: 'Human',
    description: 'A humanoid creature in the Star Wars universe.',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The id of the human.',
        },
        name: {
            type: GraphQLString,
            description: 'The name of the human.',
        },
        friends: {
            type: GraphQLList(characterInterface),
            description:
                'The friends of the human, or an empty list if they have none.',
            resolve: human => getFriends(human),
        },
        appearsIn: {
            type: GraphQLList(episodeEnum),
            description: 'Which movies they appear in.',
        },
        homePlanet: {
            type: GraphQLString,
            description: 'The home planet of the human, or null if unknown.',
        },
        secretBackstory: {
            type: GraphQLString,
            description: 'Where are they from and how they came to be who they are.',
            resolve() {
              throw new Error('secretBackstory is secret.');
            },
        },
    }),
    interfaces: [characterInterface],
});

module.exports = humanType;