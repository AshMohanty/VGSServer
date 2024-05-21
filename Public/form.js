const vgsForm = window.VGSCollect.create(
  'tnt3qmfciiv',
  'sandbox',
  (state) => {}
).setRouteId('431f97a0-cdba-48af-92f7-4aee1d7a82bd'); // your inbound route id here

const css = {
  boxSizing: 'border-box',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI"',
  color: '#000000',
  '&::placeholder': {
    color: '#bcbcbc'
  }
};

const cardNumber = vgsForm.field('#cc-number', {
  type: 'card-number',
  name: 'card_number',
  placeholder: 'Card number',
  showCardIcon: {
    left: 0
  },
  validations: ['required', 'validCardNumber'],
  css: {
    paddingLeft: '40px',
    ...css
  },
});

const cardSecurityCode = vgsForm.field('#cc-cvc', {
  type: 'card-security-code',
  name: 'card_cvc',
  placeholder: 'CVV',
  validations: ['required', 'validCardSecurityCode'],
  css: css,
});

const cardExpDate = vgsForm.field('#cc-expiration-date', {
  type: 'card-expiration-date',
  name: 'card_exp',
  placeholder: 'MM / YY',
  validations: ['required', 'validCardExpirationDate'],
  css: css,
});

const submitVGSCollectForm = () => {
  return new Promise((resolve, reject) => {
    vgsForm.submit('/post', {}, (status, data) => {
      if (status >= 200 && status <= 300) {
        resolve('Tokenization successful!');
      } else if (!status) {
        reject('Network error occurred. Please try again later.');
      } else {
        reject('Server error occurred. Please try again later.');
      }
    }, (validationError) => {
      reject('Form validation error. Please check your inputs and try again.');
    });
  });
}

document.getElementById('vgs-collect-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    await submitVGSCollectForm();

    // Obtain the tokenized card data
    const tokenizedCardData = {
      card_number: cardNumber.value,
      card_cvc: cardSecurityCode.value,
      card_exp: cardExpDate.value
    };

    // Send tokenized card data to the server
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

function displayMessage(message) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
  messageElement.classList.remove('hidden');
  setTimeout(() => {
    messageElement.classList.add('hidden');
  }, 5000); // Hide message after 5 seconds
}

function displayPaymentCompleteMessage() {
  const paymentCompleteMessage = document.getElementById('payment-complete-message');
  paymentCompleteMessage.classList.remove('hidden');
}
