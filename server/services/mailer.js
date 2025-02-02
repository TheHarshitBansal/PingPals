import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
});

const sendMail = async ({name, email, subject, html}) => {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    name,
    to: email,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;
