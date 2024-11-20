const yup = require("yup");

const validations = {
  meetingId: yup
    .string()
    .required("Meeting ID is required")
    .matches(
      /^[a-zA-Z0-9-]+$/,
      "Meeting ID must contain only alphanumeric characters and hyphens."
    ),
  start: yup
    .date()
    .required("Start date and time are required")
    .typeError("Start must be a valid date"),
  end: yup.date().nullable().typeError("End must be a valid date"),
  participantId: yup
    .string()
    .required("Participant ID is required")
    .matches(/^[a-zA-Z0-9]+$/, "Participant ID must be alphanumeric."),
  name: yup
    .string()
    .required("Participant name is required")
    .min(2, "Participant name must be at least 2 characters long")
    .max(50, "Participant name must be at most 50 characters long")
    .matches(
      /^[a-zA-Z0-9\s]+$/,
      "Participant name must contain only alphanumeric characters and spaces."
    ),
  eventType: yup
    .string()
    .oneOf([
      "mic",
      "webcam",
      "errors",
      "screenShare",
      "screenShareAudio",
      "timelog",
    ])
    .required("Event type is required"),
  message: yup
    .string()
    .nullable()
    .test(
      "required-when-errors",
      "Message is required when eventType is 'errors'",
      function (value) {
        const { eventType } = this.parent;
        return (
          eventType !== "errors" ||
          (value !== null && value !== undefined && value.trim() !== "")
        );
      }
    ),
};

module.exports = validations;
