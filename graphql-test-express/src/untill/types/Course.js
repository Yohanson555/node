const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean,
} = require('graphql/type');

const courseType = new GraphQLObjectType({
    name: 'Course',
    description: 'Article course type',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the course.',
        },
        
        number: {
            type: GraphQLNonNull(GraphQLInt),
            description: 'Number (order) of the course',
        },

        name: {
            type: GraphQLNonNull(GraphQLString),
            description: 'Name of the course',
        },

        isActive: {
            type: GraphQLBoolean,
            description: 'Shows is article deleted or not',
        },
    }),
});

module.exports = courseType;