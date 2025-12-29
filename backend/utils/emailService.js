const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp, type = "verification") => {
  const subject =
    type === "verification"
      ? "Verify Your Email - Quiz App"
      : "Reset Your Password - Quiz App";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Quiz App</h2>
      <p>Your ${
        type === "verification" ? "verification" : "password reset"
      } code is:</p>
      <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">
        ${otp}
      </h1>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn’t request this, please ignore this email.</p>
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;">
      <p style="color:#666;font-size:12px;">
        © ${new Date().getFullYear()} Quiz App
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Quiz App <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Resend email error:", error);
    return false;
  }
};

module.exports = { sendOTPEmail };
