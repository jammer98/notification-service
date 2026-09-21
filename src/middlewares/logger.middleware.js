import PinoHttp from "pino-http";
import logger from "../utils/logger.js";

export const httpLogger = PinoHttp({ logger });