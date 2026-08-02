import nodemailer from 'nodemailer';
import { logger } from '../../utils/logger.js';

export async function emailNotifierNode(state) {
  logger.info("[Email Notifier] Constructing execution status report...");

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const recipient = process.env.NOTIFICATION_RECIPIENT || emailUser;

  if (!emailUser || !emailPass) {
    logger.warn("[Email Notifier] Missing EMAIL_USER or EMAIL_PASS environment variables. Skipping email dispatch.");
    return {};
  }

  // Initialize SMTP Transport
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or host/port for custom SMTP
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const timestamp = new Date().toISOString();
  const isSuccess = state.isPosted === true;

  // Construct Email Payload
  const subject = isSuccess
    ? `✅ [X-Agent Success] Tweet Published - ${timestamp.split('T')[0]}`
    : `❌ [X-Agent Failure] Job Failed - ${timestamp.split('T')[0]}`;

  const htmlBody = isSuccess
    ? `
      <h2>🚀 Autonomous X Agent Report: SUCCESS</h2>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
      <hr />
      <h3>Published Content:</h3>
      <blockquote style="background: #f4f4f4; padding: 12px; border-left: 4px solid #1da1f2;">
        ${state.tweetContent}
      </blockquote>
      <p><strong>Total Recovery Retries:</strong> ${state.retryCount}</p>
    `
    : `
      <h2>⚠️ Autonomous X Agent Report: FAILURE</h2>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
      <hr />
      <h3>Failure Details:</h3>
      <p><strong>Target Element at Failure:</strong> <code>${state.targetElement}</code></p>
      <p><strong>Total Retries Attempted:</strong> ${state.retryCount}</p>
      <p><strong>Last Known Error Trace:</strong></p>
      <pre style="background: #fff0f0; color: #900; padding: 12px; border: 1px solid #f0c0c0;">
${state.lastError || "Unknown execution pipeline error."}
      </pre>
      <p><strong>Attempted Tweet Content:</strong></p>
      <blockquote style="background: #f4f4f4; padding: 12px;">
        ${state.tweetContent || "Failed during content generation stage."}
      </blockquote>
    `;

  try {
    const info = await transporter.sendMail({
      from: `"Autonomous Agent" <${emailUser}>`,
      to: recipient,
      subject: subject,
      html: htmlBody,
    });

    logger.info(`[Email Notifier] Email successfully dispatched. Message ID: ${info.messageId}`);
  } catch (err) {
    logger.error("[Email Notifier] Failed to dispatch email notification", err);
  }

  return {};
}