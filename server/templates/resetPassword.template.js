const resetPasswordTemplate = (name, resetUrl) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Your Password - PingPals</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
        }
        .content {
            margin: 20px 0;
            font-size: 16px;
            color: #333;
        }
        .btn {
            display: inline-block;
            padding: 12px 20px;
            background-color: #4CAF50;
            color: #fff;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
            margin-top: 20px;
        }
        .btn:hover {
            background-color: #45a049;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="logo">PingPals</div>
    <p class="content">
        Hi <strong>${name}</strong>,<br><br>
        We received a request to reset your password. Click the button below to proceed:
    </p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p class="content">
        If you did not request this, please ignore this email. This link will expire in 30 minutes.
    </p>
    <div class="footer">
        © 2025 PingPals. All rights reserved.
    </div>
</div>

</body>
</html>`
}

export default resetPasswordTemplate;