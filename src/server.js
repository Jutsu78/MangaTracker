const express = require('express');

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});