
const prisma = require('../db');
const asyncHandler = require('../middlewares/asyncHandler');
const { volumeSchema } = require('../validations/volume.validation');

const createVolume = asyncHandler(async (req, res) => {
    const seriesId = parseInt(req.params.id);
    const validatedData = volumeSchema.parse(req.body);
    
    const existingSeries = await prisma.series.findFirst({
        where: { 
            id: seriesId,
            userId: req.user.id
        }
    });
    
    if (!existingSeries) {
        return res.status(404).json({
            status: 'error',
            message: `Cannot add volume. Manga series with id ${seriesId} not found or access denied`
        });
    }
    
    const newVolume = await prisma.volume.create({
        data: {
            ...validatedData,
            seriesId
        }
    });

    res.status(201).json({ status: 'ok', data: newVolume });
});

const getVolumesByMangaId = asyncHandler(async (req, res) => {
    const seriesId = parseInt(req.params.id);
    
    const existingSeries = await prisma.series.findFirst({
        where: { 
            id: seriesId,
            userId: req.user.id
        }
    });

    if (!existingSeries) {
        return res.status(404).json({
            status: 'error',
            message: `Manga series with id ${seriesId} not found or access denied`
        });
    }

    const volumes = await prisma.volume.findMany({
        where: { seriesId: seriesId },
        orderBy: { number: 'asc' }
    });

    res.status(200).json({ status: 'ok', data: volumes });
});

const updateVolume = asyncHandler(async (req, res) => {
    const volumeId = parseInt(req.params.id);
    const validatedData = volumeSchema.parse(req.body);
    
    const existingVolume = await prisma.volume.findFirst({
        where: { 
            id: volumeId,
            series: {
                userId: req.user.id
            }
        }
    });

    if (!existingVolume) {
        return res.status(404).json({
            status: 'error',
            message: `Cannot update. Volume with id ${volumeId} not found or access denied`
        });
    }
    
    const updatedVolume = await prisma.volume.update({
        where: { id: volumeId },
        data: validatedData
    });

    res.status(200).json({ status: 'ok', data: updatedVolume });
});

const deleteVolume = asyncHandler(async (req, res) => {
    const volumeId = parseInt(req.params.id);

    const existingVolume = await prisma.volume.findFirst({
        where: { 
            id: volumeId,
            series: {
                userId: req.user.id
            }
        }
    });

    if (!existingVolume) {
        return res.status(404).json({
            status: 'error',
            message: `Cannot delete. Volume with id ${volumeId} not found or access denied`
        });
    }

    await prisma.volume.delete({
        where: { id: volumeId }
    });

    res.status(200).json({ status: 'ok', message: 'Volume deleted successfully' });
});

module.exports = {
    createVolume,
    getVolumesByMangaId,
    updateVolume,
    deleteVolume
};