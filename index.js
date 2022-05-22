const app = require("express")();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const fs = require("fs");
const hiddenFiles = JSON.parse(fs.readFileSync(`${__dirname}/resources/hiddenFiles.json`));

const chat = {
  "userCount": 0,
  "online": 0,
  "users": {},
  "messages": []
}

app.get("/", (req, res) => {
  res.status(200);
  res.sendFile(`${__dirname}/static/index.html`);
});

app.use((req, res) => {
  let path = `${__dirname}/static${req.path}`;
  if(
    fs.existsSync(path) &&
    hiddenFiles.indexOf(req.path) == -1
  ) {
    res.status(200);
    res.sendFile(path);
    return;
  }

  let htmlPath = `${__dirname}/static${req.path}.html`;
  if(
    fs.existsSync(htmlPath) &&
    hiddenFiles.indexOf(`${req.path}.html`) == -1
  ) {
    res.status(200);
    res.sendFile(htmlPath);
    return;
  }

  res.status(404);
  res.send(JSON.stringify({"error": "Not found"}));
})

io.on("connection", (socket) => {
  chat.online++
  
  let userName = chat.userCount++;
  socket.emit("userName", `User${userName}`);
  chat.users[socket.id] = `User${userName}`

  io.emit("userConnect", {"usr": chat.users[socket.id], "online": chat.online})
  socket.on("disconnect", () => {
    chat.online--
    io.emit("userDisconnect", {"usr": chat.users[socket.id], "online": chat.online});
    delete chat.users[socket.id]
  })
  socket.on("sendMessage", (msg) => {
    io.emit("sentMessage", msg)
  })
  socket.on("userSetName", (inf) => {
    if(inf.from != inf.to) {
      io.emit("userSetName", inf)
    }
  })
})

server.listen(8080, () => {
  console.log("Server running on port 8080")
})