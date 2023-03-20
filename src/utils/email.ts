import nodemailer from "nodemailer";
import ejs from "ejs";
import { UserData, generateUrl } from "./crypto";

type SendMail = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};
async function sendEmail({ to, subject, text, html }: SendMail) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.log("email couldn't sent: ", error);
    throw new Error("email couldn't sent");
  }
}

type SendVerificationEmail = { to: string; subject: string; data: UserData };
async function sendVerificationEmail({
  to,
  subject,
  data,
}: SendVerificationEmail) {
  const htmlContent = await ejs.renderFile(
    __dirname + "/../templates/mail.ejs",
    {
      url: generateUrl(data),
    }
  );

  return await sendEmail({ to, subject, html: htmlContent });
}

export { sendVerificationEmail };
