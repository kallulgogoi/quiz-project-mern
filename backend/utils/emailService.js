const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  // Enable detailed logs
  logger: true,
  debug: true,
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
    console.log(`Attempting to send email to ${email}...`);

    await transporter.verify(); // Test connection before sending
    console.log("Transporter connection verified.");

    const info = await transporter.sendMail({
      from: `"Quiz App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully: ", info.messageId);
    return true;
  } catch (error) {
    console.error("CRITICAL EMAIL ERROR:", error);
    return false;
  }
};

module.exports = { sendOTPEmail };
