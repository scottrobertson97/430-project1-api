const http = require('http'); // pull in the http server module
const url = require('url'); // pull in the url module


// pull in our response handler file
const jsonHandler = require('./jsonResponses.js');
const htmlHandler = require('./htmlResponses.js');

// set the port. process.env.PORT and NODE_PORT are for servers like heroku
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// key:value object to look up URL routes to specific functions
const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCss,
  '/favicon.ico': htmlHandler.getFavicon,
  '/addDrink': jsonHandler.addDrink,
  '/getDrinks': jsonHandler.getDrinks,
  notFound: jsonHandler.notFound,
};

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  // if post is to /addUser (our only POST url)
  if (parsedUrl.pathname === '/addDrink') {
    const res = response;

    // uploads come in as a byte stream that we need
    // to reassemble once it's all arrived
    const body = [];

    // if the upload stream errors out, just throw a
    // a bad request and send it back
    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    // on 'data' is for each byte of data that comes in
    // from the upload. We will add it to our byte array.
    request.on('data', (chunk) => {
      body.push(chunk);
    });

    // on end of upload stream.
    request.on('end', () => {
      // combine our byte array (using Buffer.concat)
      // and convert it to a string value (in this instance)
      const bodyString = Buffer.concat(body).toString();

      const bodyParams = JSON.parse(bodyString);

      // pass to our addUser function
      jsonHandler.addDrink(request, res, bodyParams);
    });
  }
};

// handle HTTP requests. In node the HTTP server will automatically
// send this function request and pre-filled response objects.
const onRequest = (request, response) => {
  // parse the url using the url module
  // This will let us grab any section of the URL by name
  const parsedUrl = url.parse(request.url);

  // check if method was POST, otherwise assume GET
  // for the sake of this example
  if (request.method === 'POST') {
    return handlePost(request, response, parsedUrl);
  }

  if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](request, response);
  }

  return urlStruct.notFound(request, response);
};

// start HTTP server
http.createServer(onRequest).listen(port);

// console.log(`Listening on 127.0.0.1: ${port}`);
