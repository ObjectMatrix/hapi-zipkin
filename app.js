const Hapi = require('hapi');
const api = require('./api/index');
const middleware = require('./lib/hapi-zipkin-plugin');

// hapi
// define some constants to make life easier
const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 3000;

// define your server
const server = Hapi.server({
    host: process.env.HOST || DEFAULT_HOST,
    port: DEFAULT_PORT,
  });

const myHapiServer = async () => {
  await server.register(api);

     try {
        await server.register({
              register: middleware.register,
              name:'middlewareplug',
        });

        await server.start();
        console.log("Hapi Server Started .. ...");
    } catch (err) {
      console.error("Hapi error starting server", err);
    }
  };

 // and don't forget to call it
  myHapiServer();
