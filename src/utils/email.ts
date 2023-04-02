import nodemailer from "nodemailer";
import ejs from "ejs";
import { generateUrl } from "./crypto";
import { addDays } from "./dates";

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

type UserData = {
  username: string;
  email: string;
  password: string;
};

type SendVerificationEmail = {
  to: string;
  subject: string;
  data: UserData;
  req: Express.Request;
};

async function sendVerificationEmail({
  to,
  subject,
  data,
  req,
}: SendVerificationEmail) {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  const htmlContent = await ejs.renderFile(
    __dirname + "/../templates/mail.ejs",
    {
      welcome: req.t("register.email.welcome"),
      heading: req.t("register.email.heading"),
      url: generateUrl({
        ...data,
        iat: today,
        exp: tomorrow,
      }),
      verify: req.t("register.email.verify"),
      valid24Hours: req.t("register.email.valid24Hours"),
    }
  );

  return await sendEmail({ to, subject, html: htmlContent });
}

export { sendVerificationEmail };
