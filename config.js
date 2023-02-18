import secrets from 'secrets';

export const config = {
  spotify: {
    clientId: secrets.clientId,
    clientSecret: secrets.clientSecret,
  },
  soundCharts: {
    appId: secrets.appId,
    apiKey: secrets.apiKey,
  },
};
