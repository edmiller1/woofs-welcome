import { eq } from "drizzle-orm";
import {
  Business,
  BusinessNotificationPreferences,
  user,
  UserNotificationPreferences,
} from "../db/schema";
import { NotificationContext } from "../routes/notification/schemas";
import { db } from "../db";
import { Resend } from "resend";
import { env } from "../config/env";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const resend = new Resend(env.RESEND_API_KEY);

export class EmailService {
  /**
   * Send email based on context and notification preferences
   */
  static async sendEmailIfEnabled(
    userId: string,
    context: NotificationContext,
    businessId: string | undefined,
    emailType:
      | keyof UserNotificationPreferences["email"]
      | keyof BusinessNotificationPreferences["email"],
    emailParams: SendEmailParams
  ) {
    let emailEnabled = false;

    if (context === "business" && businessId) {
      // Check business notification preferences
      const business = await db.query.Business.findFirst({
        where: eq(Business.id, businessId),
        columns: {
          notificationPreferences: true,
        },
      });
      emailEnabled =
        //@ts-ignore
        business?.notificationPreferences?.email?.[emailType] ?? false;
    } else {
      // Check user notification preferences
      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: {
          notificationPreferences: true,
        },
      });
      emailEnabled =
        //@ts-ignore
        userRecord?.notificationPreferences?.email?.[emailType] ?? false;
    }

    if (emailEnabled) {
      try {
        await resend.emails.send({
          from: "Woofs Welcome <hello@woofswelcome.app>",
          to: emailParams.to,
          subject: emailParams.subject,
          html: emailParams.html,
        });
        console.log(
          `[${context}] Email sent to ${emailParams.to} for ${emailType}`
        );
      } catch (error) {
        console.error("Failed to send email:", error);
      }
    } else {
      console.log(
        `[${context}] Email notifications disabled for user ${userId}, type: ${emailType}`
      );
    }
  }
}
