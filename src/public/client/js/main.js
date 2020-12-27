import io from "socket.io-client";
import Plyr from "plyr";

const URL = "/";
const socket = io(URL);

const video = document.getElementById("video");
const player = new Plyr(video);

let supressEvents = false;
let commandHistory = [];

const videoSyncLoop = () => {
  const handlePlay = () => {
    if (supressEvents) {
      supressEvents = false;
      return;
    }
    socket.emit("sync", {
      type: "play",
      time: player.currentTime,
    });
  };

  const handlePause = () => {
    if (supressEvents) {
      supressEvents = false;
      return;
    }
    socket.emit("sync", {
      type: "pause",
      time: player.currentTime,
    });
  };

  player.on("pause", handlePause);
  player.on("play", handlePlay);
};

/**
 *
 * Socket control
 *
 *  */
socket.on("syncUpdate", (command) => {
  // early abort to avoid bad updates
  if (player.paused) {
    if (command.type === "pause") return;
  } else {
    if (command.type === "play") return;
  }

  // collect commandHistory in queue
  if (commandHistory.length < 10) {
    commandHistory.push(command);
  } else {
    commandHistory.shift();
    commandHistory.push(command);
  }

  // detect cycles
  let expected = false;
  let counter = 0;
  for (const el of commandHistory) {
    if (!expected) {
      expected = Math.round(el.time);
    } else {
      if (Math.round(el.time) === expected) {
        counter += 1;
      }
    }
  }
  // Loop detected: flush history and eject
  if (counter === 10) {
    // 10: Maximum number of repetitions
    console.warn(`LOOP DETECTED`);
    commandHistory = [];
    return;
  }

  supressEvents = true;
  player[command.type]();
  player.currentTime = command.time;
});

//
// init
window.addEventListener("load", () => {
  videoSyncLoop();
  // expose to window so we can use from console
  window.player = player;
  console.log(`[INIT]`);
});
