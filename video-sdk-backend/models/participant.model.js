const mongoose = require("mongoose");

const refSchema = {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Event",
};

const ParticipantSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
    },
    participantId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    events: {
      mic: [refSchema],
      webcam: [refSchema],
      errors: [refSchema],
      screenShare: [refSchema],
      screenShareAudio: [refSchema],
    },
    timelog: [refSchema],
  },
  {
    timestamps: true,
  }
);

const Participant = mongoose.model("Participant", ParticipantSchema);

module.exports = Participant;
