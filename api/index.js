const xkcd = require('xkcd-fun');

module.exports = {
    name: "ApiPlugin",
    register: async (server, options) => {

      server.route([
        {
          method: "GET",
          path: "/xkcd",
          handler: responseHandler,
          config: {
            cache: {
              expiresIn: 0,
            }
          }
        },
      ]);
    }
  }
 const configuration = {
   config: {
    cache: {
      expiresIn: 0,
      privacy: 'private'
    }
  }
 }
const responseHandler = async (request, h) => {
  return ret = await xkcd.img.then(data => {
    return data;
  }).then(d => {
     return '<h4>' + d.img_title + '</h3> <img src=' + d.img_url + '>';
  });
  h.continue;
}

