const fs = require('fs'); // pull in the file system module

// Load our index fully into memory.
// THIS IS NOT ALWAYS THE BEST IDEA.
// We are using this for simplicity. Ideally we won't have
// synchronous operations or load entire files into memory.
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
// load style.css
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

// function to handle the index page
const getIndex = (request, response) => {
  // set status code (200 success) and content type
  response.writeHead(200, { 'Content-Type': 'text/html' });
  // write an HTML string or buffer to the response
  response.write(index);
  // send the response to the client.
  response.end();
};

// handle style.css
const getCss = (request, response) => {
  // set status code (200 success) and content type
  response.writeHead(200, { 'Content-Type': 'text/css' });
  // write an HTML string or buffer to the response
  response.write(css);
  // send the response to the client.
  response.end();
};

// does nothing right now
const getFavicon = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.end();
};

// exports to set functions to public.
// In this syntax, you can do getIndex:getIndex, but if they
// are the same name, you can short handle to just getIndex,
module.exports = {
  getIndex,
  getCss,
  getFavicon,
};
