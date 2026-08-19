const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<style>
body{
font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;
background:#f4f4f4;
margin:0;
padding:0;
}
.container{
max-width:600px;
margin:20px auto;
background:#fff;
border-radius:12px;
overflow:hidden;
box-shadow:0 4px 10px rgba(0,0,0,.1);
}
.header{
background:#0d9488;
color:#fff;
padding:25px;
text-align:center;
}
.content{
padding:30px;
}
.footer{
background:#f8f9fa;
padding:20px;
text-align:center;
font-size:12px;
color:#777;
}
.button{
display:inline-block;
padding:12px 20px;
background:#0d9488;
color:#fff !important;
text-decoration:none;
border-radius:6px;
font-weight:bold;
}
.status-approved{
background:#d4edda;
padding:8px;
border-radius:5px;
color:#155724;
}
.status-disapproved{
background:#f8d7da;
padding:8px;
border-radius:5px;
color:#721c24;
}
</style>
</head>
<body>

<div class="container">

<div class="header">
<h1>Telemedicine Platform</h1>
</div>

<div class="content">
${content}
</div>

<div class="footer">
© ${new Date().getFullYear()} Telemedicine Platform
</div>

</div>

</body>
</html>
`;

export const doctorApprovedTemplate = (name) =>
getBaseTemplate(`
<h2>Account Approved</h2>

<p>Hello Dr. ${name},</p>

<p>Your account has been approved.</p>

<a href="${process.env.FRONTEND_URL}" class="button">
Login
</a>
`);

export const doctorDisapprovedTemplate = (name, reason) =>
getBaseTemplate(`
<h2>Application Rejected</h2>

<p>Hello Dr. ${name},</p>

<p>Your application was not approved.</p>

<p><strong>Reason:</strong></p>

<p>${reason}</p>
`);

export const doctorDeletedTemplate = (name) =>
getBaseTemplate(`
<h2>Account Removed</h2>

<p>Hello Dr. ${name},</p>

<p>Your account has been removed.</p>
`);

export const meetingInviteTemplate = ({
    patientName,
    doctorName,
    roomId,
    password
}) =>
getBaseTemplate(`
<h2>Video Consultation Invitation</h2>

<p>Hello <strong>${patientName}</strong>,</p>

<p>
Dr. <strong>${doctorName}</strong> has invited you to a video consultation.
</p>

<table style="width:100%;border-collapse:collapse;">
<tr>
<td style="padding:10px;border:1px solid #ddd;"><strong>Meeting ID</strong></td>
<td style="padding:10px;border:1px solid #ddd;">${roomId}</td>
</tr>

<tr>
<td style="padding:10px;border:1px solid #ddd;"><strong>Password</strong></td>
<td style="padding:10px;border:1px solid #ddd;">${password}</td>
</tr>
</table>

<br>

<a href="${process.env.FRONTEND_URL}" class="button">
Open Telemedicine Portal
</a>

<p>
Use the Meeting ID and Password above to join your consultation.
</p>
`);