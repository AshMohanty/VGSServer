const vgsForm = window.VGSCollect.create(
  'tnt3qmfciiv',
  'sandbox',
  (state) => {}
).setRouteId('2ddf5d66-6dba-492a-9fdb-48d2bf0be540');

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
  vgsForm.submit('/post', {}, (status, data) => {
    if (status >= 200 && status <= 300) {
      // Successful response
      displayMessage('Payment successful! Your payment has been processed.');
      displayPaymentCompleteMessage();
    } else if (!status) {
      // Network Error occurred
      displayMessage('Network error occurred. Please try again later.');
    } else {
      // Server Error
      displayMessage('Server error occurred. Please try again later.');
    }
  }, (validationError) => {
    // Form validation error
    displayMessage('Form validation error. Please check your inputs and try again.');
  });
}

document.getElementById('vgs-collect-form').addEventListener('submit', (e) => {
  e.preventDefault();

  // Obtain the tokenized card data
  const tokenizedCardData = {
    card_number: cardNumber.value,
    card_cvc: cardSecurityCode.value,
    card_exp: cardExpDate.value
  };

  // Send tokenized card data to the server
  fetch('https://vgs-server.vercel.app/process-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tokenizedCardData)
  })
  .then(response => {
    if (response.ok) {
      // Server responded with success
      return response.json();
    } else {
      // Server responded with error
      throw new Error('Server error occurred.');
    }
  })
  .then(data => {
    if (data.success) {
      // Payment was successful
      displayMessage('Payment successful! Your payment has been processed.');
      displayPaymentCompleteMessage();
    } else {
      // Payment failed
      throw new Error(data.error);
    }
  })
  .catch(error => {
    // Network error occurred or payment failed
    displayMessage(error.message || 'Network error occurred. Please try again later.');
  });

  // Submit the VGS form
  submitVGSCollectForm();
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
