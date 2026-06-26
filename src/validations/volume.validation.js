
const { z } = require('zod');

const volumeSchema = z.object({
    number: z.number().int().positive("Volume number must be a positive integer"),
    status: z.enum(['WISHLIST', 'OWNED', 'READ'], {
        errorMap: () => ({ message: "Status must be WISHLIST, OWNED, or READ" })
    }),

    purchaseUrl: z.union([
        z.string().url("Invalid URL format"),
        z.literal(""),
        z.null()
    ]).optional()
});

module.exports = {
    volumeSchema
};