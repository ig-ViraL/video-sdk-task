const express = require("express");
const {
  createSession,
  endSession,
  getSessions,
  getSessionById,
} = require("../controller/session.controller");

const router = express.Router();

router.get("/", getSessions);
router.get("/:sessionId", getSessionById);
router.post("/", createSession);
router.patch("/:sessionId/end", endSession);

module.exports = router;
