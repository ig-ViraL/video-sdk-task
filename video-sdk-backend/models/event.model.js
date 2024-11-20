const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        "mic",
        "webcam",
        "errors",
        "screenShare",
        "screenShareAudio",
        "timelog",
      ],
      required: true,
    },
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
