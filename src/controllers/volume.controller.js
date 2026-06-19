
const prisma = require('../db');

const createVolume = async (req, res) => {
    try {
        const seriesId = parseInt(req.params.id);
        const { number, status, purchaseUrl } = req.body;

        const existingSeries = await prisma.series.findUnique({
            where: { id: seriesId }
        });
        if (!existingSeries) {
            return res.status(404).json({
                status: 'error',
                message: `Cannot add volume. Manga series with id ${seriesId} not found`
            });
        }
        const newVolume = await prisma.volume.create({
            data: {
                number,
                status,
                purchaseUrl,
                seriesId
            }
        });

        res.status(201).json({ status: 'ok', data: newVolume });
    } catch (error) {
        console.error(`Error during adding volume to manga series with id ${req.params.id}:`, error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
};

const getVolumesByMangaId = async (req, res) => {
    try {
        const seriesId = parseInt(req.params.id);
        const existingSeries = await prisma.series.findUnique({
            where: { id: seriesId }
        });

        if (!existingSeries) {
            return res.status(404).json({
                status: 'error',
                message: `Manga series with id ${seriesId} not found`
            });
        }

        const volumes = await prisma.volume.findMany({
            where: { seriesId: seriesId },
            orderBy: { number: 'asc' }
        });

        res.status(200).json({ status: 'ok', data: volumes });
    } catch (error) {
        console.error(`Error during fetching volumes for series ${req.params.id}:`, error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
};

const updateVolume = async (req, res) => {
    try {
        const volumeId = parseInt(req.params.id);
        const { number, status, purchaseUrl } = req.body;
        const existingVolume = await prisma.volume.findUnique({
            where: { id: volumeId }
        });

        if (!existingVolume) {
            return res.status(404).json({
                status: 'error',
                message: `Cannot update. Volume with id ${volumeId} not found`
            });
        }

        const updatedVolume = await prisma.volume.update({
            where: { id: volumeId },
            data: {
                number,
                status,
                purchaseUrl
            }
        });

        res.status(200).json({ status: 'ok', data: updatedVolume });
    } catch (error) {
        console.error(`Error during updating volume with id ${req.params.id}:`, error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
};

const deleteVolume = async (req, res) => {
    try {
        const volumeId = parseInt(req.params.id);
        const existingVolume = await prisma.volume.findUnique({
            where: { id: volumeId }
        });

        if (!existingVolume) {
            return res.status(404).json({
                status: 'error',
                message: `Cannot delete. Volume with id ${volumeId} not found`
            });
        }

        await prisma.volume.delete({
            where: { id: volumeId }
        });

        res.status(200).json({ status: 'ok', message: 'Volume deleted successfully' });
    } catch (error) {
        console.error(`Error during deleting volume with id ${req.params.id}:`, error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
};

module.exports = {
    createVolume,
    getVolumesByMangaId,
    updateVolume,
    deleteVolume
};