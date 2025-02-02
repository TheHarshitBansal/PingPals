const otpTemplate = (name, otp) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 500px;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: auto;
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            background: #e3f2fd;
            padding: 10px;
            border-radius: 5px;
            display: inline-block;
            letter-spacing: 3px;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OTP Verification</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your One-Time Password (OTP) for verifying your account on PingPals is:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <div class="footer">&copy; 2025 PingPals. All rights reserved.</div>
    </div>
</body>
</html>
`;
}

export default otpTemplate;