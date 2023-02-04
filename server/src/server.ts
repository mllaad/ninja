import http from "http";
import express from "express";
import { ServerSocket } from "./socket.js";

const app = express();
const httpServer = http.createServer(app);
new ServerSocket(httpServer);

app.get("/", function (req, res) {
  res.status(200).send("its Working ...");
});

const port = 3000;
httpServer.listen(port, () =>
  console.log(`Server running at http://localhost:${port}/`)
);
