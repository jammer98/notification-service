import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { findActiveKey, KEY_PREFIX } from "../services/apikey.service.js";

export const requireApiKey = catchAsync(async (req,res,next) => {
    const key = req.get("x-api-key");
    if(!key){
        throw new AppError("MIssing API key",401);
    } 

    if(!key.startsWith(KEY_PREFIX)) throw new AppError("Invalid or revoked API key",401);

    const producer = await findActiveKey(key);

    if(!producer) throw new AppError("Invalid or revoked API key",401);

    req.producer = producer;
    next();
})
