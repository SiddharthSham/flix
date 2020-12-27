const path = require("path");
const express = require("express");

const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

const controller = require("./controller");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = 3000;

app.disable("x-powered-by");
app.use(cors());
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

/**
 *
 * Expose public files
 *
 */

app.use("/library", express.static(path.join(__dirname, "public/library")));
app.use("/", express.static(path.join(__dirname, "public/client/dist")));

/**
 *
 * App routes
 *
 */
app.get("/stream", controller.stream);
app.get("/subs", controller.subs);
app.get("/favicon.ico", (req, res) => {
  res.end();
});

// init in-memory database
const clients = new Map();

/*


    Synchronisation logic


*/

// handle socket connection
io.on("connection", (socket) => {
  console.log(socket.id, "connected!");
  // add to database
  clients.set(socket.id, Date.now());

  // on sync request from client
  socket.on("sync", (data) => {
    console.log(socket.id, data);
    socket.broadcast.emit("syncUpdate", data);
  });

  // flush client from database
  socket.on("disconnect", () => {
    clients.delete(socket.id);
    console.log(socket.id, "disconnected");
  });
});

/*


    Start server


*/

http.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
