
const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/manga.controller');
const { protect } = require('../middlewares/auth.middleware');
const volumeController = require('../controllers/volume.controller'); 

router.get('/', mangaController.getAllManga);
router.post('/', protect, mangaController.createManga);
router.post('/autofetch', mangaController.autoFetch);
router.get('/:id', mangaController.getMangaById);
router.put('/:id', mangaController.updateManga);
router.delete('/:id', mangaController.deleteManga);
router.post('/:id/volumes', volumeController.createVolume);
router.get('/:id/volumes', volumeController.getVolumesByMangaId);

module.exports = router;