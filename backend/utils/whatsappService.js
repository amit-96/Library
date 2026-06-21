const https = require('https');
const querystring = require('querystring');

/**
 * Sends a WhatsApp message via Twilio Business API.
 * Uses native Node.js https module to remain dependency-free and lightweight.
 *
 * @param {string} to - Destination phone number (e.g., '+919876543210')
 * @param {string} messageBody - Text body of the message
 * @returns {Promise<object>} - Response payload
 */
const sendWhatsAppAlert = async (to, messageBody) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox number

  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  console.log(`[WhatsApp Alert Queued] To: ${formattedTo} | Msg: ${messageBody}`);

  // Fallback: If Twilio credentials are not set, mock a successful transmission.
  if (!accountSid || !authToken) {
    console.log('[WhatsApp Alert Mock Sandbox] Missing Twilio Environment Variables. Logged Alert details above.');
    return { success: true, mock: true, to: formattedTo, body: messageBody };
  }

  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      To: formattedTo,
      From: fromNumber,
      Body: messageBody
    });

    const auth = 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64');

    const options = {
      hostname: 'api.twilio.com',
      port: 444,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, sid: parsed.sid });
          } else {
            console.error('[WhatsApp Alert Twilio Error]', parsed.message);
            resolve({ success: false, error: parsed.message });
          }
        } catch (e) {
          resolve({ success: false, error: 'Failed to parse response payload' });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[WhatsApp Alert HTTP Request Error]', err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
};

module.exports = { sendWhatsAppAlert, sendAlert: sendWhatsAppAlert };

