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
 * The other type of character in Star Wars is a droid.
 *
 * This implements the following type system shorthand:
 *   type Droid : Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *     secretBackstory: String
 *     primaryFunction: String
 *   }
 */

const droidType = new GraphQLObjectType({
    name: 'Droid',
    description: 'A mechanical creature in the Star Wars universe.',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The id of the droid.',
        },
        name: {
            type: GraphQLString,
            description: 'The name of the droid.',
        },
        friends: {
            type: GraphQLList(characterInterface),
            description:
                'The friends of the droid, or an empty list if they have none.',
            resolve: droid => getFriends(droid),
        },
        appearsIn: {
            type: GraphQLList(episodeEnum),
            description: 'Which movies they appear in.',
        },
        secretBackstory: {
            type: GraphQLString,
            description: 'Construction date and the name of the designer.',
            resolve() {
                throw new Error('secretBackstory is secret.');
            },
        },
        primaryFunction: {
            type: GraphQLString,
            description: 'The primary function of the droid.',
        },
    }),
    interfaces: [characterInterface],
});

module.exports = droidType;