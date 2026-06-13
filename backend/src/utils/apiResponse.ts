import type { Response } from "express";

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function ok<T>(res: Response, data: T, message = "Success", pagination?: Pagination) {
  return res.json({ success: true, message, data, pagination });
}

export function created<T>(res: Response, data: T, message = "Created") {
  return res.status(201).json({ success: true, message, data });
}

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function pagination(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}
