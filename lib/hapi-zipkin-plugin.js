const { option: { Some, None }, Instrumentation } = require('zipkin');
const url = require('url');
const pkg = require('../package.json');

// Setup the tracer to use http and implicit trace context
const { Tracer, jsonEncoder: {JSON_V2} } = require('zipkin');
// We are going to need to construct a new Tracer for the Zipkin middleware to use.
// Before we can do that we need to import a few other things.
const { BatchRecorder } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');
const CLSContext = require('zipkin-context-cls');
// Putting those new pieces together:
const ctxImpl = new CLSContext();
//const endpoint = 'https://dna-zipkin-dev.np.uscm.libertyec.com';
const recorder = new BatchRecorder({
  logger: new HttpLogger({
   // endpoint: `http://localhost:9411/api/v2/spans`,
    endpoint: `http://localhost:9411/api/v1/spans`,
    jsonEncoder: JSON_V2, // optional, defaults to JSON_V1
    httpInterval: 500, // how often to sync spans. optional, defaults to 1000
    //headers: {'Authorization': 'secret'} // optional custom HTTP headers
  })
});

const tracer = new Tracer({ ctxImpl, recorder, localServiceName: 'service-a' });

const headerOption = (headers, header) => {
    const val = headers[header.toLowerCase()];
    if (val != null) {
      return new Some(val);
    } else {
      return None;
    }
  }

const port = 0;
const serviceName = "Service Tracing01";
 const register = (server) => {
    const instrumentation = new Instrumentation.HttpServer({tracer, serviceName, port});
    if (tracer == null) {
      // console.log('tacer is NULL');
      return;
    }

    server.ext('onRequest', (request, h) => {
      const {headers} = request;
      const readHeader = headerOption.bind(null, headers);
      const plugins = request.plugins;

      tracer.scoped(() => {
        const id = instrumentation.recordRequest(request.method, url.format(request.url), readHeader);
        plugins.zipkin = {
          traceId: id
        };

      });
      return h.continue;
    });

    server.ext('onPreResponse', (request, h) => {
      const {response} = request;
      const statusCode = response.isBoom ? response.output.statusCode : response.statusCode;

      tracer.scoped(() => {
        instrumentation.recordResponse(request.plugins.zipkin.traceId, statusCode);
      });
      return h.continue;
    });
  };

 module.exports = {
     register
}

// debug aid:
// curl -vs localhost:9411/api/v1/spans -H'Content-type: application/json' -H 'Expect:' -d '[{"traceId":"ff38bd00ff7b9fac","id":"ff38bd00ff7b9fac","name":"get","kind":"SERVER","timestamp":1517627939531000,"duration":12271,"localEndpoint":{"serviceName":"ahm service 01","ipv4":"10.0.0.159"},"tags":{"http.url":"/xkcd","http.status_code":"200"}}]'

// mapping view
// http://localhost:9411/mappings
