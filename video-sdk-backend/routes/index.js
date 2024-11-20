const express = require("express");
const sessionRouter = require("./session.routes");
const participantRouter = require("./participant.routes");
const eventRouter = require("./event.routes");

const router = express.Router();

router.get("/", (req, res) => {
  return res
    .status(200)
    .json({ status: "success", message: "Video SDK backend root." });
});

router.use("/session", sessionRouter);
router.use("/participant", participantRouter);
router.use("/event", eventRouter);

module.exports = router;
