
const prisma = require('../db');
const { createMangaSchema } = require('../validations/manga.validation');
const asyncHandler = require('../middlewares/asyncHandler');

const getAllManga = asyncHandler(async (req, res) => {
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
});

const createManga = asyncHandler(async (req, res) => {
    const validatedData = createMangaSchema.parse(req.body);

    const newSeries = await prisma.series.create({
        data: validatedData
    });

    res.status(201).json({ status: 'ok', data: newSeries });
});

// GET: getting a manga series by id with progress indicator and volumes
const getMangaById = asyncHandler(async (req, res) => {
    const mangaId = parseInt(req.params.id);
    const series = await prisma.series.findUnique({
        where: { id: mangaId },
        include: {
            volumes: {
                orderBy: { number: 'asc' }
            }
        }
    });

    if (!series) {
        return res.status(404).json({
            status: 'error',
            message: `Manga series with id ${mangaId} not found`
        });
    }

    const ownedVolumesCount = series.volumes.filter(vol => vol.status === 'OWNED').length;
    const progressIndicator = `${ownedVolumesCount}/${series.totalVolumes}`;

    const seriesWithDetails = {
        ...series,
        progress: progressIndicator
    };

    res.status(200).json({ status: 'ok', data: seriesWithDetails });
});

// PUT: update
const updateManga = asyncHandler(async (req, res) => {
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
});

// DELETE: delete
const deleteManga = asyncHandler(async (req, res) => {
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
});

module.exports = {
    getAllManga,
    createManga,
    getMangaById,
    updateManga,
    deleteManga
};