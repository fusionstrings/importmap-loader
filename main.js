//import specs from 'web-specs' assert { type: 'json' };
// import specs from 'https://ga.jspm.io/npm:web-specs@2.46.0/index.json.js';

import specs from 'web-specs';
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.end(JSON.stringify(specs, null, 2));
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(8080);