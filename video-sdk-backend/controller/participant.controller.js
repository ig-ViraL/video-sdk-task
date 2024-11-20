const yup = require("yup");
const Participant = require("../models/participant.model");
const { meetingId, participantId, name } = require("../utils/validations");
const Session = require("../models/session.model");
const Event = require("../models/event.model");

const ADD_PARTICIPANT_VALIDATION_SCHEMA = yup.object({
  participantId,
  name,
});

const addParticipant = async (req, res, next) => {
  try {
    const { sessionId, participantData } = req.body;

    // Validations
    await meetingId.validate(sessionId);
    await ADD_PARTICIPANT_VALIDATION_SCHEMA.validate(participantData);

    // check if session exists or not
    const session = await Session.findOne({ meetingId: sessionId });
    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Session not found.",
      });
    }

    if (
      await Participant.findOne({
        ...participantData,
        meetingId: sessionId,
      })
    ) {
      return res.status(409).json({
        status: "error",
        message: "Participant already exists.",
      });
    }
    let participant = new Participant({
      ...participantData,
      meetingId: session.meetingId,
    });
    session.uniqueParticipantsCount++;
    session.participantArray.push(participant._id);
    await session.save();
    await participant.save();

    res.status(200).json({
      status: "success",
      message: "Participant added successfully.",
      data: participant.toJSON(),
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  addParticipant,
};
