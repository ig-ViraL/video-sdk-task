const yup = require("yup");
const Session = require("../models/session.model");
const { meetingId, start, end: endTime } = require("../utils/validations");
const Participant = require("../models/participant.model");

const getSessions = async (req, res, next) => {
  try {
    let { page, perPage } = req.query;

    // Validate and sanitize page and perPage
    page = parseInt(page, 10) || 1;
    perPage = parseInt(perPage, 10) || 10;

    if (page < 1 || perPage < 1) {
      return res.status(400).json({
        status: "error",
        message: "Page and perPage must be positive integers.",
      });
    }

    const totalSessions = await Session.countDocuments();
    const sessions = await Session.aggregate([
      // Step 1: Skip and limit for pagination
      { $skip: (page - 1) * perPage },
      { $limit: perPage },

      // Step 2: Lookup the participant data based on the participantArray in Session
      {
        $lookup: {
          from: "participants",
          localField: "participantArray",
          foreignField: "_id",
          as: "participantsData",
        },
      },

      // Step 3: Project the required fields from the participant data (participantId and name)
      {
        $project: {
          meetingId: 1,
          start: 1,
          end: 1,
          uniqueParticipantsCount: 1,
          participantsData: {
            participantId: 1,
            name: 1,
          },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      message: "Sessions data fetched successfully.",
      data: {
        sessions,
        pagination: {
          total: totalSessions,
          page,
          perPage,
          totalPages: Math.ceil(totalSessions / perPage),
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

const getSessionById = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Validate the sessionId
    await meetingId.validate(sessionId);

    const session = await Session.aggregate([
      { $match: { meetingId: sessionId } }, // Match session by meetingId

      // Lookup participants data
      {
        $lookup: {
          from: "participants",
          localField: "participantArray", // Array of participant IDs
          foreignField: "_id",
          as: "participantsData", // Join participants data
        },
      },

      // Lookup events for each participant's mic, webcam, etc.
      {
        $unwind: "$participantsData", // Unwind the participantsData array to work with individual participants
      },
      {
        $lookup: {
          from: "events",
          let: { events: "$participantsData.events.mic" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$events"] } } },
            { $project: { start: 1, end: 1 } },
          ],
          as: "participantsData.events.mic",
        },
      },
      {
        $lookup: {
          from: "events",
          let: { events: "$participantsData.events.webcam" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$events"] } } },
            { $project: { start: 1, end: 1 } },
          ],
          as: "participantsData.events.webcam",
        },
      },
      {
        $lookup: {
          from: "events",
          let: { events: "$participantsData.events.screenShare" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$events"] } } },
            { $project: { start: 1, end: 1 } },
          ],
          as: "participantsData.events.screenShare",
        },
      },
      {
        $lookup: {
          from: "events",
          let: { events: "$participantsData.events.screenShareAudio" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$events"] } } },
            { $project: { start: 1, end: 1 } },
          ],
          as: "participantsData.events.screenShareAudio",
        },
      },
      {
        $lookup: {
          from: "events",
          let: { events: "$participantsData.events.errors" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$events"] } } },
            { $project: { start: 1, message: 1 } },
          ],
          as: "participantsData.events.errors",
        },
      },
      {
        $lookup: {
          from: "events",
          let: { events: "$participantsData.timelog" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$events"] } } },
            { $project: { start: 1, end: 1 } },
          ],
          as: "participantsData.timelog",
        },
      },

      // Re-group data back into the participants array
      {
        $group: {
          _id: "$_id", // Group by the session ID
          meetingId: { $first: "$meetingId" },
          start: { $first: "$start" },
          end: { $first: "$end" },
          uniqueParticipantsCount: { $first: "$uniqueParticipantsCount" },
          participantArray: { $push: "$participantsData" }, // Rebuild the participantArray with event details
        },
      },

      // Project the final output
      {
        $project: {
          meetingId: 1,
          start: 1,
          end: 1,
          uniqueParticipantsCount: 1,
          participantArray: 1, // Return the final participantArray with events
        },
      },
    ]);

    // If no session is found
    if (!session || session.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Session not found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: session[0],
    });
  } catch (e) {
    next(e);
  }
};

const CREATE_SESSION_VALIDATION = yup.object({
  meetingId,
  start,
});

const createSession = async (req, res, next) => {
  try {
    await CREATE_SESSION_VALIDATION.validate(req.body);
    const session = new Session(req.body);
    await session.save();
    res.status(200).json({
      status: "success",
      message: "Session created successfully.",
      data: session.toJSON(),
    });
  } catch (e) {
    next(e);
  }
};

const END_SESSION_VALIDATION_SCHEMA = yup.object({
  meetingId,
  endTime,
});

const endSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { end } = req.body;

    await END_SESSION_VALIDATION_SCHEMA.validate({
      meetingId: sessionId,
      endTime: end,
    });

    // Find the session
    const session = await Session.findOne({ meetingId: sessionId }).populate(
      "participantArray"
    );
    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Session not found.",
      });
    }

    session.end = end;
    await session.save();

    // Summarize participant events
    const participantsSummary = await Participant.find({
      _id: { $in: session.participantArray },
    });

    const summary = participantsSummary.map((participant) => ({
      participantId: participant.participantId,
      name: participant.name,
    }));

    res.status(200).json({
      status: "success",
      data: {
        meetingId: session.meetingId,
        start: session.start,
        end: session.end,
        uniqueParticipantsCount:
          session.uniqueParticipantsCount || participantsSummary.length,
        participantsSummary: summary,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  createSession,
  endSession,
  getSessions,
  getSessionById,
};
