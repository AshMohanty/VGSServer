console.log(`Outbound route certificate is stored at this path: ${process.env['NODE_EXTRA_CA_CERTS']}`);

function getProxyAgent() {
    const vgs_outbound_url = `${VGS_VAULT_ID}.sandbox.verygoodproxy.com`
    console.log(`Sending request through outbund Route: ${vgs_outbound_url}`);
    return tunnel.httpsOverHttps({
        proxy: {
            servername: vgs_outbound_url,
            host: vgs_outbound_url,
            port: 8443,
            proxyAuth: `${VGS_USERNAME}:${VGS_PASSWORD}`
        },
    });
}

async function postStripePayment(creditCardInfo) {
    let agent = getProxyAgent();
    let expiry = creditCardInfo['card-expiration-date'].split('/')

    let buff = new Buffer(STRIPE_KEY+":");
    let base64Auth = buff.toString('base64');

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
            number: creditCardInfo['card-number'],
            cvc: creditCardInfo['card-security-code'],
            exp_month: expiry[0].trim(),
            exp_year: expiry[1].trim()
        }
    }));
    console.log(pm_response.data)

    let pi_response = await instance.post('/v1/payment_intents', qs.stringify({
        amount: 100,
        currency: 'usd',
        payment_method: pm_response.data.id,
        confirm: true
    }));
    console.log(pi_response.data);
    return pi_response.data;
