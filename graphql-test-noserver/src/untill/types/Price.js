const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLFloat,
    GraphQLString,
    GraphQLBoolean,
} = require('graphql/type');

const {
    getCurrency
} = require('../getters/CurrencyGetters');

const currencyType = require('./Currency');

const priceType = new GraphQLObjectType({
    name: 'Price',
    description: 'Article price type',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the price value.',
        },

        priceId: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the price type.',
        },

        currencyId: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the price currency.',
        },

        name: {
            type: GraphQLNonNull(GraphQLString),
            description: 'Name of the price',
        },

        value: {
            type: GraphQLFloat,
            description: 'Price value'
        },

        vat: {
            type: GraphQLInt,
            description: 'Price vat'
        },

        currency: {
            type: GraphQLNonNull(currencyType),
            description: 'Price currency',
            resolve: ({ currencyId }) => getCurrency(currencyId)
        },

        isActive: {
            type: GraphQLBoolean,
            description: 'Is price active',
        },
    }),
});

module.exports = priceType;