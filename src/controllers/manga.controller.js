
const prisma = require('../db');
const { createMangaSchema } = require('../validations/manga.validation');
const asyncHandler = require('../middlewares/asyncHandler');

const getAllManga = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause = { userId: req.user.id };
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
    const validatedData = mangaSchema.parse(req.body);

    const newManga = await prisma.series.create({
        data: {
            ...validatedData,
            userId: req.user.id 
        }
    });

    res.status(201).json({ status: 'ok', data: newManga });
});

// POST: manga auto fetching from MyAnimeList API
const autoFetch = asyncHandler(async (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ status: 'error', message: 'Title is required for search' });
    }

    const response = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(title)}&limit=1`);
    const result = await response.json();

    if (!result.data || result.data.length === 0) {
        return res.status(404).json({ 
            status: 'error', 
            message: `Manga with title "${title}" not found on MyAnimeList` 
        });
    }

    const mangaData = result.data[0];

    const fetchedTitle = mangaData.title_english || mangaData.title; 
    
    const fetchedAuthor = mangaData.authors && mangaData.authors.length > 0 
        ? mangaData.authors[0].name 
        : "Unknown Author";
        
    const fetchedVolumes = mangaData.volumes || 0; 

    let fetchedStatus = 'ONGOING';
    if (mangaData.status === 'Finished') {
        fetchedStatus = 'COMPLETED';
    } else if (mangaData.status === 'On Hiatus' || mangaData.status === 'Discontinued') {
        fetchedStatus = 'DROPPED';
    }

    const newSeries = await prisma.series.create({
        data: {
            title: fetchedTitle,
            author: fetchedAuthor,
            totalVolumes: fetchedVolumes,
            status: fetchedStatus,
            userId: req.user.id
        }
    });

    res.status(201).json({ 
        status: 'ok', 
        message: 'Manga auto-fetched and saved successfully!',
        data: newSeries 
    });
});

// GET: getting a manga series by id with progress indicator and volumes
const getMangaById = asyncHandler(async (req, res) => {
    const mangaId = parseInt(req.params.id);

    const series = await prisma.series.findFirst({
        where: {
            id: mangaId,
            userId: req.user.id 
        }
    });

    if (!series) {
        return res.status(404).json({ 
            status: 'error', 
            message: 'Manga not found or you do not have permission to view it' 
        });
    }

    res.status(200).json({ status: 'ok', data: series });
});

// PUT: update
const updateManga = asyncHandler(async (req, res) => {
    const mangaId = parseInt(req.params.id);
    const existingSeries = await prisma.series.findFirst({
        where: { id: mangaId, userId: req.user.id }
    });

    if (!existingSeries) {
        return res.status(404).json({ 
            status: 'error', 
            message: 'Manga not found or you do not have permission to update it' 
        });
    }

    const updatedSeries = await prisma.series.update({
        where: { id: mangaId },
        data: req.body 
    });

    res.status(200).json({ status: 'ok', data: updatedSeries });
});

// DELETE: delete
const deleteManga = asyncHandler(async (req, res) => {
    const mangaId = parseInt(req.params.id);
    const existingSeries = await prisma.series.findFirst({
        where: { id: mangaId, userId: req.user.id }
    });

    if (!existingSeries) {
        return res.status(404).json({ 
            status: 'error', 
            message: 'Manga not found or you do not have permission to delete it' 
        });
    }
    await prisma.series.delete({
        where: { id: mangaId }
    });

    res.status(200).json({ 
        status: 'ok', 
        message: 'Manga deleted successfully' 
    });
});

module.exports = {
    getAllManga,
    createManga,
    autoFetch,
    getMangaById,
    updateManga,
    deleteManga
};