'use strict';

require('dotenv').config()
const envConfig = require('./config/env.js')
const Hapi = require('@hapi/hapi');
const Qs = require('qs');
const productRoutes = require('./routes/products')
const transactionRoutes = require('./routes/transactions')
const Path = require('path');
const Inert = require('@hapi/inert');

const server = Hapi.server({
    port: envConfig.PORT,
    host: envConfig.HOST,
    query: {
        parser: (query) => Qs.parse(query)
    },
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'upload')
        }
    }
});

server.route(productRoutes)
server.route(transactionRoutes)

const init = async () => {
    await server.register(Inert);

    server.route({
        method: 'GET',
        path: '/upload/{param*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true
            }
        }
    });

    await server.register({
        plugin: require('hapi-pgsql'),
        options: {
            database_url: `postgresql://${envConfig.DATABASE.USERNAME}:${envConfig.DATABASE.PASSWORD}@${envConfig.DATABASE.HOSTNAME}/${envConfig.DATABASE.NAME}`,
        }
    })
    
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();