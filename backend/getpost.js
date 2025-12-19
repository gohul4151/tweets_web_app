const express = require('express');
const { auth } = require('./auth');

const router = express.Router();

router.post("/", auth, async (req, res) => {
    

});

module.exports = { getpostRoute: router };