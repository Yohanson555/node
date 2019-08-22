const express = require('express');

const app = express();

//app.use(express.static('static'));
app.use(express.json()); 

const http = require('http').Server(app);

app.get('/', (request, response) => {
    console.log(' --- GET REQUEST --- ');
    console.log('Request:');
    console.log(request);
    //console.log('------------');
    //console.log('Response:');
    //console.log(response);

    response
        .status(200)
        .json({
            headers: request.headers,
            path: request.path,
            params: request.params,
            query: request.query,
            body: request.body,
            route: request.route,
            url: request.url,
            method: request.method
        })
        .end();
});

app.post('/', (request, response) => {
    console.log(' --- POST REQUEST --- ');
    console.log('Request:');
    console.log(request);
    //console.log('------------');
    //console.log('Response:');
    //console.log(response);

    response
        .status(200)
        .json({
            headers: request.headers,
            path: request.path,
            params: request.params,
            query: request.query,
            body: request.body,
            route: request.route,
            url: request.url,
            method: request.method
        })
        .end();
});

http.listen(8001, () => {
    console.log('Test server is runing on: http://localhost:8001');
}); 

