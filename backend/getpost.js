const express = require('express');
const { auth } = require('./auth');
app.use(express.json());

const router = express.Router();

router.post("/", auth, async (req, res) => {


});

module.exports = { getpostRoute: router };