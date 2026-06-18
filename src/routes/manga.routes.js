
const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/manga.controller');

router.get('/', mangaController.getAllManga);
router.post('/', mangaController.createManga);

router.get('/:id', mangaController.getMangaById);
router.put('/:id', mangaController.updateManga);
router.delete('/:id', mangaController.deleteManga);

module.exports = router;