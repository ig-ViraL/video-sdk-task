const yup = require("yup");
const { eventType, start, end, message } = require("../utils/validations");
const Participant = require("../models/participant.model");
const Event = require("../models/event.model");

const ADD_EVENT_VALIDATION_SCHEMA = yup.object({
  eventType,
  start,
  end,
  message,
});

const addEvent = async (req, res, next) => {
  try {
    const { participantId, meetingId, eventData } = req.body;
    const { eventType } = eventData;

    await ADD_EVENT_VALIDATION_SCHEMA.validate(eventData);
    console.log({ participantId, meetingId });
    const participant = await Participant.findOne({ participantId, meetingId });
    if (!participant) {
      return res
        .status(404)
        .json({ status: "error", message: "Participant not found" });
    }

    const event = new Event(eventData);
    if (eventType === "timelog") {
      participant.timelog.push(event._id);
    } else {
      participant.events[eventType].push(event._id);
    }
    await participant.save();
    await event.save();

    res.status(201).json({
      status: "success",
      message: "Event added successfully",
      data: event.toJSON(),
    });
  } catch (e) {
    next(e);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { end } = req.body;

    if (!end) {
      return res
        .status(400)
        .json({ status: "error", message: "End time is required." });
    }

    const event = await Event.findByIdAndUpdate(id, { end }, { new: true });

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Event updated successfully",
      data: event,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  addEvent,
  updateEvent,
};
