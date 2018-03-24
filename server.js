'use strict';

const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const main = require('./app');

/**
 * support ejs in req.
 */
app.set('view engine', 'ejs');

/**
 * give public
 */
app.use(express.static('public'));

/**
 * parse json
 */
app.use(bodyParser.json());

/**
 * set routes
 */
app.use('/', main.page);


/**
 * set the port
 */
app.set('port', process.env.PORT || 3000);

/**
 * running express by HTTP module
 */
http.createServer(app)
    .listen(app.get('port'), () => {
        console.log('SERVER START', app.get('port'));
    });
