import { logPreviewUrl, transporter } from "../../config/mailer.js";

export async function deliveryEmail(notification) {
    const info = await transporter.sendMail({
        from:process.env.MAIL_FROM,
        to:notification.user_email,
        subject: notification.title,
        text: notification.body,
    });

    logPreviewUrl(info);
}