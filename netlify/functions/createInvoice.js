const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { amount, description } = JSON.parse(event.body);

    const res = await fetch("https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTERKEY,
        "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATEKEY,
        "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN
      },
      body: JSON.stringify({
        invoice: {
          items: [
            {
              name: description,
              quantity: 1,
              unit_price: amount,
              total_price: amount
            }
          ],
          total_amount: amount
        }
      })
    });

    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ invoice_url: data.response_text ? null : data.response.checkout_url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
