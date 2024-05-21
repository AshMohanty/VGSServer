# VGS Deployment:

**What is this document?**

In this document we’ll go over how to deploy this [website](https://vgs-server.vercel.app/) using Vercel, Node.JS, VGS and Stripe. 

![Screen Shot 2024-05-21 at 11.54.08 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_11.54.08_AM.png)

**This website:**

1. Receives a Credit Card Payment on the Client Side
2. Tokenizes and Secures that information using an Inbound Proxy. 
3. Passes that Information to a Back-End Server  that processes the payment with Stripe using an Outbound Proxy. 
4. Notifies the user of the status of their payment. 

**Steps You Will Take:**

1. Set-up Outbound and Inbound Routes
2. Deploy Application on Vercel
3. Update .env, Form.Js, Server.Js in order to get the deployment working for your environment. 
4. Monitor status of routes/application via Vercel and VGS

There is a summary checklist provided at the end of this document of steps you should take to get this deployed. 

**Useful Links:**

**[GitHub](https://github.com/AshMohanty/VGSServer/tree/main)**

**[Route Yaml](https://github.com/AshMohanty/VGSServer/tree/main/Routes)** 

**[Env File Example](https://github.com/AshMohanty/VGSServer/blob/main/Routes/env%20example) 
[Vercel](https://vercel.com)**

**[VGS Documentation](https://www.verygoodsecurity.com/docs/)** 

# Detailed Guide:

![Screen Shot 2024-05-20 at 8.20.20 PM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-20_at_8.20.20_PM.png)

1. **VGS Configuration**:  This document will go over how to configure Inbound and Outbound Routes. We’ll cover how to securely forward the tokenized card data from the front-end to our server and how to then process the payment information using Stripe via VGS outbound route.
2. **Front End**: We'll go over how to set up a simple website to collect card details and use VGS Collect.js to tokenize this sensitive data before sending it to the server.
3. **Back End(Server)**: We'll build a Node.js server that receives the tokenized card data, interacts with Stripe API through a secure VGS outbound route, and processes the payment.
4. **Deployment**: We'll deploy our application on Vercel for easy access and scalability, including automatic deployments via Git integration. How you deploy your application may be different; we are using Vercel in this example for ease of use. 

## VGS Route Configuration and Initial Setup:

We’ll go over how to build a simple Inbound Route and a simple outbound Route for our demo application. 

**You can also import the YAML’s provided here into VGS to get started quickly without following the steps outlined below.** 

![Screen Shot 2024-05-21 at 11.13.03 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_11.13.03_AM.png)

For the Inbound Route change the destination override endpoint to point to your server; we’ll generate this address later in the guide. 

```jsx
destination_override_endpoint: 'https://echo.sandbox.verygoodvault.com
```

**Set Up Guide:**

The difference between our outbound proxy and our inbound is that the inbound is static and sits between your client side and your server side, while the outbound proxy sits between your server and third parties.

**Route Creation:**

![Screen Shot 2024-05-21 at 10.55.43 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_10.55.43_AM.png)

After logging in, you can create a Route by navigating to the Vault → Routes page.

**[Inbound Route](https://www.verygoodsecurity.com/docs/guides/inbound-connection/):**  

An inbound route in VGS is designed to intercept and secure sensitive data before it reaches your server. Inbound Routes are highly configurable but for this demo we will just be creating an Inbound Route that secures a Credit Card Number and it’s CVV. 

**Configure the Inbound Route:**

- **Host**: Enter the host that will be sending the data (e.g., your Vercel app's domain). Or initially you can use echo.apps.verygood.systems
- **Filters**: Configure any filters as needed. In this case we are just securing Credit Card and CVV information.

![Screen Shot 2024-05-21 at 11.01.23 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_11.01.23_AM.png)

In these examples we’re redacting Credit Card Info and CVV to be secure. 

![Screen Shot 2024-05-21 at 11.18.23 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_11.18.23_AM.png)

![Screen Shot 2024-05-21 at 11.18.03 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_11.18.03_AM.png)

More context on Filters can be found [here](https://www.verygoodsecurity.com/docs/terminology/filters/). 

**[Outbound Routes](https://www.verygoodsecurity.com/docs/guides/outbound-connection)**: 

The outbound/forward proxy directs traffic between your server (outbound) traffic, the VGS vault (where sensitive data is stored), and your third party integration

**Configure the Outbound Route:**

- **Host**: Enter the host that will be receiving the  tokenized payment from the server. In this case it’s API.Stripe.com. There are many popular payment vendors with pre-configured routes found [here](https://support.verygoodsecurity.com/s/article/How-to-enable-and-test-integration-with-Stripe).
- **Filters**: Configure any filters as needed similar to the inbound route. In this case we are revealing the hidden credit card information to then be processed by Stripe.

![Screen Shot 2024-05-21 at 11.21.57 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_11.21.57_AM.png)

**Revealing Credit Card Information:** 

![Screen Shot 2024-05-21 at 11.34.36 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_11.34.36_AM.png)

![Screen Shot 2024-05-21 at 11.34.27 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_11.34.27_AM.png)

We have now set-up our initial routes! There are many configurations and ways to test Routes but for this quick set-up we can now move onto the deployment. 

The YAML’s to upload with all of this context can be found here as well. 

You are able to see the logs from each route page to monitor usage and status of your routes. 

![Screen Shot 2024-05-21 at 12.46.18 PM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_12.46.18_PM.png)

## Deploying our Template:

We’ll go over how to now deploy the following repository onto Vercel. 

### **1. Clone the Repository**

First, you need to clone the Git repository to your local machine. Open your terminal and run the following command:

```bash

git clone https://github.com/AshMohanty/VGSServer.git
```

You can now take this repository and move it into your Git/GitLab/BitBucket. 

### **2. Sign In to Vercel**

1. Go to [Vercel](https://vercel.com/) and log in with your account.

### **3. Import Project to Vercel**

1. On the Vercel dashboard, click on the **"New Project"** button.
2. Select your Git provider (GitHub, GitLab, or Bitbucket) where your project is hosted.
3. Authenticate with your Git provider if prompted.

### **4. Select the Repository**

1. Browse your repositories and select the **`VGSServer`** repository.
2. Click on the **"Import"** button next to the repository.
    
    ![Screen Shot 2024-05-21 at 10.40.24 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_10.40.24_AM.png)
    

### **5. Configure Project**

1. Ensure the **Root Directory** is set to the folder where your **`server.js`** is located (usually the root directory).

![Screen Shot 2024-05-21 at 10.40.37 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_10.40.37_AM.png)

### **6. Set Environment Variables**

1. Scroll down to the **"Environment Variables"** section.

1. Add the required environment variables:

```makefile
VGS_VAULT_ID=your-vgs-vault-id
VGS_USERNAME=your-vgs-username
VGS_PASSWORD=your-vgs-password
STRIPE_KEY='sk_test_51Lrs6CK6opjUgeSmFHReX14eBMcbofCJrUOisGTC7ASpkfFMqD6Eysbs83qBC12YZErV3nv1Pg4UTy9WRhPRVUpQ00o7cUrV8I'
OUTBOUND_ROUTE_ID=your-outbound-route-id
NODE_EXTRA_CA_CERTS = './cert.pem' 
```

### **7. Deploy Project**

1. Click the **"Deploy"** button at the bottom of the page.
2. Vercel will start the deployment process and build your project.

### **8. Access Your Project**

1. Once the deployment is complete, you will see a success message with the URL of your newly deployed project.
2. Click on the URL to access your application.

![Screen Shot 2024-05-21 at 11.59.31 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_11.59.31_AM.png)

### **Using the URL in VGS Configuration**

1. Go to your VGS dashboard.
2. Navigate to your inbound route configuration.
3. Set the **Upstream Host** to the URL provided by Vercel for your deployed project (will be the main domain name).

![Screen Shot 2024-05-21 at 9.26.36 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_9.26.36_AM.png)

**Monitoring:** You are able to monitor your deployment on Vercel. 

![Screen Shot 2024-05-21 at 12.03.48 PM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_12.03.48_PM.png)

**Logs: You can debug your server based from the logs page and monitor both your outbound and inbound proxies.** 

![Screen Shot 2024-05-21 at 12.04.38 PM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_12.04.38_PM.png)

**Status:** You can always access the status page of your back-end server by going to your .app page followed by status. I.E: [https://vgs-server.vercel.app/status](https://vgs-server.vercel.app/status)

## Front-End Guide:

For this website we are using VGS’s Collect.JS.  More information found [here](https://www.verygoodsecurity.com/docs/vgs-collect/js). 

Within the Index.HTML file this can be located here: 

```jsx
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>VGS Collect Payment Info Example</title>
  <script nonce="static-nonce" src="https://js.verygoodvault.com/vgs-collect/2.18.0/vgs-collect.js"></script>
  <script src="./form.js" defer></script>
  <link rel="stylesheet" href="./styles.css" />
</head>
```

This Form collects Credit Card information and then is processed by our [Form.JS](https://github.com/AshMohanty/VGSServer/blob/main/Public/form.js) file. 

Within Form.JS you must change the address at this line to your own server. 

I.E: your.vercel.app/process-payment. 

```jsx
    // Send tokenized card data to the server
    const response = await fetch('https://vgs-server.vercel.app/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tokenizedCardData)
    });
```

Form.JS takes the payment information, tokenizes it and then sends the tokenized information to our back-end server before it is processed by stripe. 

All of the required packages are within our [package.json](https://github.com/AshMohanty/VGSServer/blob/main/package.json). 

All of the Front-End and Client Side code is being served up from our Public Directory. 

## Server-Side Guide:

**In order to use VGS’s Outbound Proxy along side Stripe we need to use both an HTTPS Proxy as well as have a certificate.** 

The certificate can be found [here](https://github.com/AshMohanty/VGSServer/blob/main/cert.pem). It is automatically referenced in our code and our .env setup. 

The main file that manages our Server is our Server.JS file. Once it receives the tokenized data from our front-end, it reveals the credit card information and passes it to stripe. 

```jsx
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'Public')));

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
```

Once we have received a response from Stripe, we pass it back to our Form.JS to update the user on the status of their payment. 

```jsx
    const response = await fetch('https://vgs-server.vercel.app/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tokenizedCardData)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Payment was successful
        displayMessage('Payment successful! Your payment has been processed.');
        displayPaymentCompleteMessage();
      } else {
        // Payment failed
        let errorMessage = 'Payment failed. Please try again later.';
        if (data.error === 'invalid_card_number') {
          errorMessage = 'Invalid credit card number. Please check and try again.';
        } else if (data.error === 'authentication_failed') {
          errorMessage = 'Stripe authentication failed. Please try again later.';
        }
        throw new Error(errorMessage);
      }
    } else {
      throw new Error('Server error occurred.');
    }
  } catch (error) {
    // Network error occurred or payment failed
    displayMessage(error.message || 'Network error occurred. Please try again later.');
  }
});
```

## Check List:

1. Deploy Application on Vercel from GIT 
    1. Update .Env File to reflect your parameters
    2. Update Inbound Route ID and VaultID on Form.JS to match your Inbound Route
    
    ```jsx
    const vgsForm = window.VGSCollect.create(
      'tnt3qmfciiv', // your Vault ID here 
      'sandbox',
      (state) => {}
    ).setRouteId('431f97a0-cdba-48af-92f7-4aee1d7a82bd'); // your inbound route id here
    
    ```
    
    c. Update  the code block below in Form.JS to match your .app/proccess-payment. 
    
    ```jsx
    const response = await fetch('https://vgs-server.vercel.app/process-payment' // Your Server Here
    ```
    
2. Set Inbound and Outbound Route 
    1. Change the Inbound Route Host to match your Vercel Server Name. 
    
    ![Screen Shot 2024-05-21 at 11.01.23 AM.png](VGS%20Deployment%2068c3be10f47047399c790df8e9d0587c/Screen_Shot_2024-05-21_at_11.01.23_AM%201.png)
    
3. Ensure that you are using the certificate provided and a HTTPS Proxy in order to have the outbound route found in Server.JS work with Stripe 

**Any questions or was this guide not sufficient enough? Feel free to email Ashish at [Mohantay@gmail.com](mailto:Mohantay@gmail.com)**
