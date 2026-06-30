const https = require('https');
const querystring = require('querystring');

/**
 * Sends an SMS message via Twilio SMS Gateway.
 * Uses native Node.js https module to remain dependency-free and lightweight.
 *
 * @param {string} to - Destination phone number (e.g., '+919876543210')
 * @param {string} messageBody - Text body of the SMS message
 * @returns {Promise<object>} - Response payload
 */
const sendSMSAlert = async (to, messageBody) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_SMS_FROM || '+12015550123'; // Twilio SMS number

  console.log(`[SMS Alert Queued] To: ${to} | Msg: ${messageBody}`);

  // Fallback: If Twilio credentials are not set, mock a successful transmission.
  if (!accountSid || !authToken) {
    console.log('[SMS Alert Mock Sandbox] Missing Twilio Environment Variables. Logged Alert details above.');
    return { success: true, mock: true, to, body: messageBody };
  }

  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      To: to,
      From: fromNumber,
      Body: messageBody
    });

    const auth = 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64');

    const options = {
      hostname: 'api.twilio.com',
      port: 443,
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
            console.error('[SMS Alert Twilio Error]', parsed.message);
            resolve({ success: false, error: parsed.message });
          }
        } catch (e) {
          resolve({ success: false, error: 'Failed to parse response payload' });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[SMS Alert HTTP Request Error]', err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
};

module.exports = { sendSMSAlert, sendAlert: sendSMSAlert };
