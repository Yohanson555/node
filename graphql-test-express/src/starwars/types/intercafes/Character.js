
const {
    GraphQLInterfaceType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
} = require('graphql/type');

const episodeEnum = require('../enums/Episodes');

/**
 * Characters in the Star Wars trilogy are either humans or droids.
 *
 * This implements the following type system shorthand:
 *   interface Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *     secretBackstory: String
 *   }
 */

const characterInterface = new GraphQLInterfaceType({
    name: 'Character',
    description: 'A character in the Star Wars Trilogy',
    fields: () => ({
      id: {
        type: GraphQLNonNull(GraphQLString),
        description: 'The id of the character.',
      },
      name: {
        type: GraphQLString,
        description: 'The name of the character.',
      },
      friends: {
        type: GraphQLList(characterInterface),
        description:
          'The friends of the character, or an empty list if they have none.',
      },
      appearsIn: {
        type: GraphQLList(episodeEnum),
        description: 'Which movies they appear in.',
      },
      secretBackstory: {
        type: GraphQLString,
        description: 'All secrets about their past.',
      },
    }),
    resolveType(character) {
      if (character.type === 'Human') {
        return humanType;
      }
      if (character.type === 'Droid') {
        return droidType;
      }
    },
});

module.exports = characterInterface;