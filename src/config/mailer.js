import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: `${process.env.SMTP_USER}`, pass: `${process.env.SMTP_PASS}` },
});

export async function verifyMailer(){
    await transporter.verify();
}

export function logPreviewUrl(info){
    const url = nodemailer.getTestMessageUrl(info);
    if(url) logger.info({ url}, "Etheral email preview");
}
