// Set the NODE_EXTRA_CA_CERTS environment variable to the path of the cert.pem file
process.env.NODE_EXTRA_CA_CERTS = './cert.pem';

// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const tunnel = require('tunnel');
const qs = require('qs');
const events = require('events');
const path = require('path'); // Import path module

const eventEmitter = new events.EventEmitter();

// Create an Express application
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the same directory
app.use(express.static(path.join(__dirname, '/')));

const {
    VGS_VAULT_ID,
    VGS_USERNAME,
    VGS_PASSWORD,
    STRIPE_KEY,
    OUTBOUND_ROUTE_ID
} = process.env;

function getProxyAgent() {
    const vgs_outbound_url = `${OUTBOUND_ROUTE_ID}.${VGS_VAULT_ID}.sandbox.verygoodproxy.com`;
    console.log(`Sending request through outbound Route: ${vgs_outbound_url}`);
    return tunnel.httpsOverHttps({
        proxy: {
            host: vgs_outbound_url,
            port: 8443,
            proxyAuth: `${VGS_USERNAME}:${VGS_PASSWORD}`
        },
    });
}

async function postStripePayment(creditCardInfo) {
    let agent = getProxyAgent();
    let expiry = creditCardInfo['card_exp'].split('/');

    let base64Auth = Buffer.from(`${STRIPE_KEY}:`).toString('base64');

    const instance = axios.create({
        baseURL: 'https://api.stripe.com',
        headers: {
            'authorization': `Basic ${base64Auth}`,
        },
        httpsAgent: agent,
    });

    let pm_response = await instance.post('/v1/payment_methods', qs.stringify({
        type: 'card',
        card: {
            number: creditCardInfo['card_number'],
            cvc: creditCardInfo['card_cvc'],
            exp_month: expiry[0].trim(),
            exp_year: expiry[1].trim()
        }
    }));

    let pi_response = await instance.post('/v1/payment_intents', qs.stringify({
        amount: 1000, // Amount in cents
        currency: 'usd',
        payment_method: pm_response.data.id,
        confirm: true
    }));

    return pi_response.data;
}

app.post('/process-payment', async (req, res) => {
    try {
        const creditCardInfo = req.body;
        eventEmitter.emit('payment', creditCardInfo);
        const paymentResult = await postStripePayment(creditCardInfo);
        res.json({ success: true, paymentResult });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/status', (req, res) => {
    res.send('Server is listening and ready to process payments.');
});

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const listener = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    eventEmitter.on('payment', listener);

    req.on('close', () => {
        eventEmitter.removeListener('payment', listener);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
