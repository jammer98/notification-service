import { AppError } from "./AppError";

export function parseId(value, label = "id"){
    const id = Number(value);
    if(!Number.isInteger(id) || id < 1) throw new AppError(`Inavlid ${label}`,400);
    return id;
}