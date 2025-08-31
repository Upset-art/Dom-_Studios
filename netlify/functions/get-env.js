exports.handler = async (event, context) => {
  // Sécurité : ne pas exposer les clés privées côté client
  const publicEnvVars = {
    PAYDUNYA_PUBLIC_KEY: process.env.PAYDUNYA_PUBLIC_KEY,
    PAYDUNYA_MODE: process.env.PAYDUNYA_MODE,
    SITE_URL: process.env.SITE_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(publicEnvVars)
  };
};