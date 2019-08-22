const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean,
} = require('graphql/type');

const categoryType = new GraphQLObjectType({
    name: 'Currency',
    description: 'Product article type',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the article.',
        },
        
        name: {
            type: GraphQLNonNull(GraphQLString),
            description: 'Name of the article',
        },

        isActive: {
            type: GraphQLBoolean,
            description: 'Shows is article deleted or not',
        },
    }),
});

module.exports = categoryType;