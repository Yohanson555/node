const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean,
} = require('graphql/type');

const appPaymentButtonType = new GraphQLObjectType({
    name: 'AppPaymentButton',
    description: 'Application payment button',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLID),
            description: 'Button id.',
        },
        
        num: {
            type: GraphQLInt,
            description: 'Button order',
        },

        button_text: {
            type: GraphQLNonNull(GraphQLString),
            description: 'Button text',
        },

        button_code: {
            type: GraphQLNonNull(GraphQLString),
            description: `Button's action code`,
        },

        type: {
            type: GraphQLInt,
            description: 'Button type',
        },

        action_data: {
            type: GraphQLString,
            description: 'Additional action data',
        },

        state: {
            type: GraphQLInt,
            description: 'Shows is button was deleted or not',
        },
    }),
});

module.exports = appPaymentButtonType;