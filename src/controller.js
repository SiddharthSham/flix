const fs = require("fs");
const path = require("path");
const srt2vtt = require("srt-to-vtt");

// config stuff
const moviePath = "/public/library/thor/thor.mp4";
const subsPath = "/public/library/thor/thorsubs.srt";

/**
 *
 * App logic starts here
 *
 */

const video = path.join(__dirname, moviePath);
const subs = path.join(__dirname, subsPath);
let total = 0;
fs.stat(video, (err, stat) => {
  if (err) {
    console.log(err);
  }
  total = stat.size;
});

// create subs file
fs.createReadStream(subs)
  .pipe(srt2vtt())
  .pipe(fs.createWriteStream("subs.vtt"));

let mimeType = moviePath.slice(-3);

/**
 *
 *
 * TODO:
 * 1) Dynamically size chunks by
 *    estimating network speed on client
 *
 *
 */

exports.stream = async (request, response, next) => {
  const range = request.headers.range;
  if (!range) {
    // 416 Wrong range
    console.log("Wrong range");
    return res.sendStatus(416);
  }

  let positions = range.replace(/bytes=/, "").split("-");
  // total already calculated
  let start = parseInt(positions[0], 10);
  let end = positions[1]
    ? parseInt(positions[1], 10)
    : Math.max(start + 1, total - 1);
  let chunksize = end - start + 1;

  // let maxChunk = 1024 * 1024 * 10; // 10MB max at a time
  // if (chunksize > maxChunk) {
  //   end = start + maxChunk - 1;
  //   chunksize = end - start + 1;
  // }

  // notify that partial content is coming in
  response.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${total}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type": `video/${mimeType}`,
  });

  // start stream
  const stream = fs.createReadStream(video, { start, end });
  stream.on("open", () => {
    // when stream is ready, pipe data
    stream.pipe(response);
  });
  stream.on("error", (err) => {
    console.warn("[Error detected]:");
    console.warn(err);
    response.end(err);
  });
};

exports.subs = async (request, response) => {
  response.download("subs.vtt");
};
