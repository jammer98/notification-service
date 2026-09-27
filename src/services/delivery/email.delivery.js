import { resend } from "../../config/mailer.js";
import logger from "../../utils/logger.js";

export async function deliveryEmail(notification) {
  const { data, error } = await resend.emails.send({
    from: process.env.MAIL_FROM,
    to: notification.user_email,
    subject: notification.title,
    text: notification.body,
  });

  if (error) {
    throw new Error(error.message); // worker's existing retry/backoff handles this
  }

  logger.info({ emailId: data.id }, "Email sent via Resend API");
}
