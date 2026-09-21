import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

export function protect(req,res,next){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return next(new AppError("Not Authenticated",401));
    }

    try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        req.user = { id: decoded.id}
        next();
    } catch (error) {
        next(new AppError("Invalid or expired token",401));
    }
}