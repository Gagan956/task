export const response = (res, statusCode, message, data) => {
    res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message,
        data: data || null,
    });
};
