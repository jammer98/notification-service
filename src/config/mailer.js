import { Resend } from "resend";
import { AppError } from "../utils/AppError.js";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Resend is a plain HTTPS call, not SMTP, so there's no handshake to verify anymore.
// This just fails fast on boot if the key is obviously missing or malformed.
export async function verifyMailer() {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_API_KEY.startsWith("re_")) {
    throw new AppError("RESEND_API_KEY is missing or malformed", 500);
  }
}
