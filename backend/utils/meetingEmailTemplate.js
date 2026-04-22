// ──────────────────────────────────────────────────────────────
// ADD THIS EXPORT to your existing backend/utils/emailTemplates.js
// ──────────────────────────────────────────────────────────────

/**
 * Meeting invite email template
 * @param {Object} params
 * @param {string} params.patientName
 * @param {string} params.doctorName
 * @param {string} params.roomId
 * @param {string} params.password
 */
export const meetingInviteTemplate = ({ patientName, doctorName, roomId, password }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: #ffffff;
      padding: 28px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
    }
    .header p {
      margin: 6px 0 0;
      opacity: 0.85;
      font-size: 14px;
    }
    .content {
      padding: 32px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #1f2937;
      margin-bottom: 16px;
    }
    .info-box {
      background: #f0fdfa;
      border: 2px solid #99f6e4;
      border-radius: 10px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .info-box h3 {
      color: #0f766e;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 16px 0;
    }
    .credential-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #ccfbf1;
    }
    .credential-row:last-child {
      border-bottom: none;
    }
    .credential-label {
      color: #6b7280;
      font-size: 13px;
      font-weight: 500;
    }
    .credential-value {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #0f766e;
      font-family: 'Courier New', monospace;
    }
    .password-value {
      font-size: 16px;
      letter-spacing: 0.05em;
    }
    .steps {
      margin: 20px 0;
    }
    .steps h3 {
      color: #374151;
      font-size: 15px;
      margin-bottom: 12px;
    }
    .step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 10px;
    }
    .step-num {
      width: 24px;
      height: 24px;
      background: #0d9488;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
      line-height: 24px;
      text-align: center;
    }
    .step-text {
      color: #4b5563;
      font-size: 14px;
      padding-top: 3px;
    }
    .warning {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-top: 20px;
      font-size: 13px;
      color: #92400e;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📹 Video Consultation Invite</h1>
      <p>Your appointment with Dr. ${doctorName} is ready</p>
    </div>

    <div class="content">
      <p class="greeting">Hello <strong>${patientName}</strong>,</p>
      <p style="color: #4b5563; font-size: 14px;">
        Dr. <strong>${doctorName}</strong> has scheduled a video consultation for you.
        Use the meeting credentials below to join at the scheduled time.
      </p>

      <div class="info-box">
        <h3>🔑 Meeting Credentials</h3>
        <div class="credential-row">
          <span class="credential-label">Meeting ID</span>
          <span class="credential-value">${roomId}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Password</span>
          <span class="credential-value password-value">${password}</span>
        </div>
      </div>

      <div class="steps">
        <h3>How to join:</h3>
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text">Log in to your <strong>Patient Portal</strong></div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text">Go to <strong>Video Consultation</strong> from the sidebar</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text">Enter the <strong>Meeting ID</strong> and <strong>Password</strong> above</div>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <div class="step-text">Click <strong>Join Meeting</strong> and allow camera/microphone access</div>
        </div>
      </div>

      <div class="warning">
        ⚠️ Please keep these credentials private and do not share them with others.
        The meeting link expires after 24 hours.
      </div>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} Telemedicine Platform. All rights reserved.<br />
      If you did not expect this email, please contact support.
    </div>
  </div>
</body>
</html>
`;
