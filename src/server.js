
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const mangaRoutes = require('./routes/manga.routes');
const volumeRoutes = require('./routes/volume.routes');

app.use('/api/manga', mangaRoutes);
app.use('/api/volumes', volumeRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Manga Tracker is running',
        timestamp: new Date().toISOString()
    });
});

const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});