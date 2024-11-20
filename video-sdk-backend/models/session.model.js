const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
    },
    uniqueParticipantsCount: {
      type: Number,
      default: 0,
    },
    participantArray: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participant",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model("Session", SessionSchema);

module.exports = Session;
