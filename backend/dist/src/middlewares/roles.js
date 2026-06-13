import { ApiError } from "../utils/apiResponse.js";
export function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user)
            return next(new ApiError(401, "Authentication required"));
        if (!roles.includes(req.user.role))
            return next(new ApiError(403, "Insufficient permissions"));
        return next();
    };
}
