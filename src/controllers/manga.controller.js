
const prisma = require('../db');

const getAllManga = async (req, res) => {
    try {
        const series = await prisma.series.findMany();
        res.status(200).json({ status: 'ok', data: series });
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

module.exports = {
    getAllManga,
    createManga
};