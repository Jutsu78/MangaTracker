const express = require('express');
const prisma = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// checking server status
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