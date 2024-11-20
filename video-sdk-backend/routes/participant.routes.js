const express = require("express");
const { addParticipant } = require("../controller/participant.controller");

const router = express.Router();

router.post("/", addParticipant);

module.exports = router;
