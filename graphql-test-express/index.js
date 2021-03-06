var express = require('express');
var graphqlHTTP = require('express-graphql');

//const schema = require('./src/starwars/starWarsSchema');
const schema = require('./src/untill/UntillSchema');

var app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));