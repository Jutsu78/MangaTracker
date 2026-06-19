
const express = require('express');
const router = express.Router();
const volumeController = require('../controllers/volume.controller');

router.put('/:id', volumeController.updateVolume);
router.delete('/:id', volumeController.deleteVolume);

module.exports = router;