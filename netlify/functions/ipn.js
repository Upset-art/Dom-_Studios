const crypto = require('crypto');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const data = body.data;

    // Vérification de la signature PayDunya
    const receivedHash = data.hash; // le hash envoyé par PayDunya
    const calculatedHash = crypto
      .createHash('sha256')
      .update(process.env.PAYDUNYA_MASTER_KEY) // ta clé principale dans Netlify
      .digest('hex');

    if (!receivedHash || receivedHash !== calculatedHash) {
      return { statusCode: 403, body: 'Signature non valide' };
    }

    // ✅ Paiement authentifié
    // TODO: Traiter le paiement confirmé (ex: sauvegarder en DB)
    // TODO: Envoyer le produit ou email de confirmation

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
