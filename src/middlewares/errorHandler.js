
const errorHandler = (err, req, res, next) => {
    console.error('System Error Captured:', err);

    if (err.name === 'ZodError') {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Validation error', 
            errors: err.flatten().fieldErrors 
        });
    }
    res.status(500).json({ 
        status: 'error', 
        message: 'Internal Server Error' 
    });
};

module.exports = errorHandler;