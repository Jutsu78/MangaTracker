
const { z } = require('zod');

const createMangaSchema = z.object({
    title: z.string().min(1, "Manga title is required"),
    author: z.string().min(1, "Author name is required"),
    totalVolumes: z.number().int().positive("Total volumes must be a positive integer"),
    status: z.enum(['ONGOING', 'COMPLETED', 'DROPPED']).optional() 
});

module.exports = {
    createMangaSchema
};