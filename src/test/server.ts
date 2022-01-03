const envPort = Deno.env.get("PORT");
const port = envPort ? parseInt(envPort, 10) : 3000;
// Start listening on port 8080 of localhost.
const server = Deno.listen({ port: port });
let counter = 0;

console.log(
  `HTTP webserver running.  Access it at:  http://localhost:${port}/`,
);

// Connections to the server will be yielded up as an async iterable.
for await (const conn of server) {
  // In order to not be blocking, we need to handle each connection individually
  // without awaiting the function
  serveHttp(conn);
}

async function serveHttp(conn: Deno.Conn) {
  // This "upgrades" a network connection into an HTTP connection.
  const httpConn = Deno.serveHttp(conn);
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const requestEvent of httpConn) {
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    counter++;

    const body = `${counter}`;
    // The requestEvent's `.respondWith()` method is how we send the response
    // back to the client.
    requestEvent.respondWith(
      new Response(body, {
        status: 200,
      }),
    );
  }
}
