export function ok(res, data, message = "Success", pagination) {
    return res.json({ success: true, message, data, pagination });
}
export function created(res, data, message = "Created") {
    return res.status(201).json({ success: true, message, data });
}
export class ApiError extends Error {
    statusCode;
    details;
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}
export function pagination(query) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    return { page, limit, skip: (page - 1) * limit };
}
