require('dotenv').config();

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    // Vérification de la signature PayDunya
    const signature = event.headers['x-paydunya-signature'];
    if (!signature || signature !== process.env.PAYDUNYA_SIGNATURE) {
      return { statusCode: 403, body: 'Signature non valide' };
    }

    // TODO: Traiter le paiement confirmé
    // TODO: Envoyer les produits par email

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};