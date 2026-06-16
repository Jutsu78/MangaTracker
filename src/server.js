const express = require('express');
const prisma = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Manga Tracker is running',
        timestamp: new Date().toISOString()
    });
});

// GET: Recieves all manga series in db
app.get('/api/manga', async (req, res) => {
    try {
        const series = await prisma.series.findMany();
        res.status(200).json({ status: 'ok', data: series });
    } catch (error) {
        console.error('Error during fetching manga series:', error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
});

// GET: Recieves manga series by id
app.get('/api/manga/:id', async (req, res) => {
    try{
        const mangaId = parseInt(req.params.id);

        const series = await prisma.series.findUnique({
            where: { 
                id: mangaId
             }
        
        });
    
        if (!series) {
            return res.status(404).json({
                status: 'error',
                message: `Manga series with id ${mangaId} not found`
            })
        }

        res.status(200).json({ status: 'ok', data: series });
    } catch (error) {
    console.error('Error during fetching manga series with id ${req.params.id}:', error);
    res.status(500).json({ status: 'error', error: "Internal Server Error" });

    }
});

// PUT: Updating a manga series
app.put('/api/manga/:id', async (req, res) => {
    try{
        const mangaId = parseInt(req.params.id);
        const { title, author, totalVolumes, status } = req.body;

        const existingSeries = await prisma.series.findUnique({
            where: { id: mangaId }
        });
        if (!existingSeries) {
            return res.status(404).json({
                status: 'error',
                message: `Cannot update manga series with id ${mangaId} not found`
            });
        }

        const updatedSeries = await prisma.series.update({
            where: { id: mangaId },
            data: {
                title,
                author,
                totalVolumes,
                status
            }
        });

        res.status(200).json({ status: 'ok', data: updatedSeries });
    } catch (error) {
        console.error('Error during updating manga series with id ${req.params.id}:', error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
});

// DELETE: Delete a manga series
app.delete('/api/manga/:id', async (req, res) => {
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
});


// POST: Adding a new manga series to the db
app.post('/api/manga', async (req, res) => {
    try {
        const { title, author, totalVolumes } = req.body;

        const newSeries = await prisma.series.create({
            data: {
                title,
                author,
                totalVolumes
            }
        });

        res.status(201).json({ status: 'ok', data: newSeries });
    } catch (error) {
        console.error('Error during adding manga series:', error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
});

 // POST: Adding a new volume to specific manga series
 app.post('/api/manga/:id/volumes', async (req, res) => {
    try {
        const seriesId = parseInt(req.params.id);
        const { number, status } = req.body;
        

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
                seriesId
            }
        });

        res.status(201).json({ status: 'ok', data: newVolume });
    } catch (error) {
        console.error(`Error during adding volume to manga series with id ${req.params.id}:`, error);
        res.status(500).json({ status: 'error', error: "Internal Server Error" });

    }
 });

 // GET: Retrieve all volumes for a specific manga series
app.get('/api/manga/:id/volumes', async (req, res) => {
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
});

    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});