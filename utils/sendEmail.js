const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not configured');

    return {
      success: false,
      message: 'Email service is not configured'
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'COCOABRIDGE <hello@cocoabridge.com>',
      to,
      subject,
      html
    });

    if (error) {
      console.error('❌ Resend error:', error);

      return {
        success: false,
        message: error.message || 'Failed to send email',
        error
      };
    }

    console.log('✅ Email sent successfully');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Email ID:', data?.id);

    return {
      success: true,
      message: 'Email sent successfully',
      data
    };

  } catch (error) {
    console.error('❌ Email sending error:', error);

    return {
      success: false,
      message: error.message || 'Failed to send email',
      error
    };
  }
};

module.exports = sendEmail;
