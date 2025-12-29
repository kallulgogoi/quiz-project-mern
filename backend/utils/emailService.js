const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp, type = "verification") => {
  const subject =
    type === "verification"
      ? "Verify Your Email - Quiz App"
      : "Reset Your Password - Quiz App";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Quiz App</h2>
      <p>Your code is:</p>
      <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;

  try {
    console.log(`Sending email to ${email}...`);

    await transporter.sendMail({
      from: `"Quiz App" <quizapp109@gmail.com>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully!");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = { sendOTPEmail };
