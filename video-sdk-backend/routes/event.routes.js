const express = require("express");
const { addEvent, updateEvent } = require("../controller/event.controller");

const router = express.Router();

router.post("/", addEvent);
router.patch("/:id", updateEvent);

module.exports = router;
