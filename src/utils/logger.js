import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    redact:{
        paths: ["req.headers.authorization",'req.headers["x-api-key"]',"req.headers.cookies"],
        censor: "[redacted]",
    },
    ...(isDev && {transport:{ target: "pino-pretty",options:{ colorize:true}}})
});

export default logger;
