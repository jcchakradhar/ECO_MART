const express = require('express');
const { generateMotivation } = require('../controller/Motivation');

const router = express.Router();

router.get('/', generateMotivation);

exports.router = router;
