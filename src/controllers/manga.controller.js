
const prisma = require('../db');

const getAllManga = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const series = await prisma.series.findMany({
            where: whereClause,
            skip: skip,
            take: limitNumber,
        });

        const totalRecords = await prisma.series.count({ where: whereClause });

        res.status(200).json({ 
            status: 'ok', 
            data: series,
            meta: {
                total: totalRecords,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalRecords / limitNumber)
            }
        });
    } catch (error) {
        console.error('Error during fetching manga series:', error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
};

const createManga = async (req, res) => {
    try {
        const { title, author, totalVolumes, status } = req.body;
        const newSeries = await prisma.series.create({
            data: {
                title,
                author,
                totalVolumes,
                status
            }
        });

        res.status(201).json({ status: 'ok', data: newSeries });
    } catch (error) {
        console.error('Error during creating manga series:', error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
};

// GET: getting a manga series by id with progress indicator
const getMangaById = async (req, res) => {
    try {
        const mangaId = parseInt(req.params.id);
        const series = await prisma.series.findUnique({
            where: { id: mangaId }
        });

        if (!series) {
            return res.status(404).json({
                status: 'error',
                message: `Manga series with id ${mangaId} not found`
            });
        }

        const ownedVolumesCount = await prisma.volume.count({
            where: {
                seriesId: mangaId,
                status: 'OWNED'
            }
        });

        const progressIndicator = `${ownedVolumesCount}/${series.totalVolumes}`;
        const seriesWithProgress = {
            ...series,
            progress: progressIndicator
        };

        res.status(200).json({ status: 'ok', data: seriesWithProgress });
    } catch (error) {
        console.error(`Error during fetching manga progress for id ${req.params.id}:`, error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
};

// PUT: update
const updateManga = async (req, res) => {
    try {
        const mangaId = parseInt(req.params.id);
        const { title, author, totalVolumes, status } = req.body;

        const existingSeries = await prisma.series.findUnique({
            where: { id: mangaId }
        });
        if (!existingSeries) {
            return res.status(404).json({
                status: 'error',
                message: `Cannot update. Manga series with id ${mangaId} not found`
            });
        }

        const updatedSeries = await prisma.series.update({
            where: { id: mangaId },
            data: { title, author, totalVolumes, status }
        });

        res.status(200).json({ status: 'ok', data: updatedSeries });
    } catch (error) {
        console.error(`Error during updating manga series with id ${req.params.id}:`, error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
};

// DELETE: delete
const deleteManga = async (req, res) => {
    try {
        const mangaId = parseInt(req.params.id);

        const existingSeries = await prisma.series.findUnique({
            where: { id: mangaId }
        });

        if (!existingSeries) {
            return res.status(404).json({
                status: 'error',
                message: `Cannot delete. Manga series with id ${mangaId} not found`
            });
        }
        await prisma.series.delete({
            where: { id: mangaId }
        });

        res.status(200).json({
            status: 'ok',
            message: `Manga series with id ${mangaId} was successfully deleted`
        });
    } catch (error) {
        console.error(`Error during deleting manga series with id ${req.params.id}:`, error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
};
module.exports = {
    getAllManga,
    createManga,
    getMangaById,
    updateManga,
    deleteManga
};