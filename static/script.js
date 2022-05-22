function $(qry) {return document.querySelector(qry)};
let socket = io();

let input = $("#message-input");
let sendButton = $("#message-send");
let messages = $("#chat-panel");

let setName = $("#name-input");
let setNameButton = $("#name-set");

let settingsButton = $("#settings-button");
let settings = $("#settings");

let onlineCount = $("#online");

let userName = setName.value;

settingsButton.addEventListener("click", () => {
  settings.classList.toggle("closed");
})

input.addEventListener("keydown", ({key}) => {
  if(key == "Enter") {
    sendButton.click();
  }
})

sendButton.addEventListener("click", () => {
  if(input.value) {
    socket.emit("sendMessage", {"message": input.value, "from": userName});
    input.value = "";
  }
})

setNameButton.addEventListener("click", () => {
  if(setName.value && setName.value != userName) {
    socket.emit("userSetName", {"from": userName, "to": setName.value});
    userName = setName.value;
  }
})

socket.on("sentMessage", (msg) => {
  let append = document.createElement("div");
  append.className = "chat-message";
  append.innerText = `${msg.from}: ${msg.message}`;
  messages.append(append);
  messages.scrollTo(0, messages.scrollHeight);
})

socket.on("userName", (name) => {
  console.log(name)
  userName = name;
  setName.value = name;
})

socket.on("userConnect", (inf) => {
  let append = document.createElement("div");
  append.className = "chat-message";

  append.style = "color: green;";
  append.innerText = `${inf.usr} joined the chat`;
  messages.append(append);
  messages.scrollTo(0, messages.scrollHeight);

  onlineCount.innerText = `Users online: ${inf.online}`;
})

socket.on("userDisconnect", (inf) => {
  let append = document.createElement("div");
  append.className = "chat-message";

  append.style = "color: red;";
  append.innerText = `${inf.usr} left the chat`;
  messages.append(append);
  messages.scrollTo(0, messages.scrollHeight);

  onlineCount.innerText = `Users online: ${inf.online}`;
})

socket.on("userSetName", (inf) => {
  let append = document.createElement("div");
  append.className = "chat-message";

  append.style = "color: #008cff;";
  append.innerText = `${inf.from} changed their name to ${inf.to}`;
  messages.append(append);
  messages.scrollTo(0, messages.scrollHeight);
})