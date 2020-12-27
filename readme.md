# Coolflix

## Stream videos in sync over the web.

## TODO:

- Test other encodings
- Add buffer detection
- FIND A BETTER WAY TO SERVE THE VIDEO
- Improve UI

---

## Instructions

- Run `yarn` the first time you open the folder, in order to install dependencies
- Recommended - Transcode your video file into MP4 for the web using Handbrake/FFMPEG.
  - AV1 should give the best results, but the encoders are too slow.
  - WebM with VP9 should give the practical results, given you can wait for the transcode to complete.
- Copy your video file into `src/public/library`
- Set the video file path in `server.js`
- Run `yarn dev` to start the dev server
- Expose localhost to public:
  - Run `yarn expose` to start a tunnel via `localtunnel`, or
  - Use ngrok to start a tunnel from port 3000 (cmd: `ngrok http 3000`)
- Share public link (SHOULD BE HTTPS!)
