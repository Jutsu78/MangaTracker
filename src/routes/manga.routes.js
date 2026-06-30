
const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/manga.controller');
const { protect } = require('../middlewares/auth.middleware');
const volumeController = require('../controllers/volume.controller');

router.get('/', protect, mangaController.getAllManga);
router.post('/', protect, mangaController.createManga);
router.post('/autofetch', protect, mangaController.autoFetch);
router.get('/:id', protect, mangaController.getMangaById);
router.put('/:id', protect, mangaController.updateManga);
router.delete('/:id', protect, mangaController.deleteManga);
router.post('/:id/volumes', protect, volumeController.createVolume);
router.get('/:id/volumes', protect, volumeController.getVolumesByMangaId);

module.exports = router;