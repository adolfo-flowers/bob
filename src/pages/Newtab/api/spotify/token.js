export async function getLoginToken({ client_id, client_secret }) {
  const token = btoa(`${client_id}:${client_secret}`);

  const { access_token } = await fetch(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        Authorization: `Basic ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    }
  ).then((r) => r.json());
  return access_token;
}
