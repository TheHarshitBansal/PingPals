import { MailerSend, Recipient, EmailParams } from "mailersend";

const mailersend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
})

const sendMail = async(name, email, subject, templateId, resetUrl, otp) => {
    const recipient = new Recipient(email, name);

    const personalization = [
        {
          email: email,
          data: {
            otp: otp,
            name: name,
            account_name: 'PingPals',
            resetUrl: resetUrl
          },
        }
      ];

    const emailParams = new EmailParams()
    .setFrom(process.env.MAILERSEND_FROM_EMAIL)
    .setFromName('Team PingPals')
    .setRecipients(recipient)
    .setSubject(subject)
    .setTemplateId(templateId)
    .setPersonalization(personalization);

mailersend.send(emailParams);
}

export default sendMail;