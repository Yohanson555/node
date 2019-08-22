const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean,
} = require('graphql/type');

const salesAreaType = new GraphQLObjectType({
    name: 'SalesArea',
    description: 'Sales area type',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the sales area.',
        },

        name: {
            type: GraphQLNonNull(GraphQLString),
            description: 'Name of the sales area',
        },

        number: {
            type: GraphQLInt,
            description: 'Sales area order variable',
        },

        bManual: {
            type: GraphQLBoolean,
            description: 'If true this sales area can be selected only from POS by waiter',
        },

        closeManual: {
            type: GraphQLBoolean,
            description: 'If true all tables in this sales area should be closed manualy',
        },

        isActive: {
            type: GraphQLBoolean,
            description: 'Shows is sales area was deleted or not',
        },
    }),
});

module.exports = salesAreaType;