using System.Net;
using System.Net.Mail;

namespace Server.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;


        public EmailService(
            IConfiguration configuration
        )
        {
            _configuration = configuration;
        }


        public async Task SendEmailAsync(
            string toEmail,
            string subject,
            string htmlBody
        )
        {
            // =================================================
            // READ EMAIL SETTINGS
            // =================================================

            var smtpServer =
                _configuration[
                    "EmailSettings:SmtpServer"
                ];


            var smtpPortText =
                _configuration[
                    "EmailSettings:SmtpPort"
                ];


            var senderName =
                _configuration[
                    "EmailSettings:SenderName"
                ];


            var senderEmail =
                _configuration[
                    "EmailSettings:SenderEmail"
                ];


            var username =
                _configuration[
                    "EmailSettings:Username"
                ];


            var password =
                _configuration[
                    "EmailSettings:Password"
                ];



            // =================================================
            // VALIDATE CONFIGURATION
            // =================================================

            if (
                string.IsNullOrWhiteSpace(
                    smtpServer
                )
                ||
                string.IsNullOrWhiteSpace(
                    senderEmail
                )
                ||
                string.IsNullOrWhiteSpace(
                    username
                )
                ||
                string.IsNullOrWhiteSpace(
                    password
                )
            )
            {
                throw new InvalidOperationException(
                    "Email configuration is incomplete."
                );
            }


            if (
                !int.TryParse(
                    smtpPortText,
                    out var smtpPort
                )
            )
            {
                smtpPort = 587;
            }



            // =================================================
            // CREATE EMAIL
            // =================================================

            using var mailMessage =
                new MailMessage();


            mailMessage.From =
                new MailAddress(
                    senderEmail,
                    string.IsNullOrWhiteSpace(
                        senderName
                    )
                        ? "MediGo"
                        : senderName
                );


            mailMessage.To.Add(
                toEmail
            );


            mailMessage.Subject =
                subject;


            mailMessage.Body =
                htmlBody;


            mailMessage.IsBodyHtml =
                true;



            // =================================================
            // SMTP CLIENT
            // =================================================

            using var smtpClient =
                new SmtpClient(
                    smtpServer,
                    smtpPort
                );


            smtpClient.EnableSsl =
                true;


            smtpClient.UseDefaultCredentials =
                false;


            smtpClient.Credentials =
                new NetworkCredential(
                    username,
                    password
                );


            // =================================================
            // SEND EMAIL
            // =================================================

            await smtpClient.SendMailAsync(
                mailMessage
            );
        }
    }
}