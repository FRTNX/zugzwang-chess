import config from './../config/config';

const pingServer = async () => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/ping`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'ping' })
    })
    return await response.json()
  } catch (err) {
    console.log(err);
  }
};

const submitFeedback = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/user/feedback`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      },
      body: JSON.stringify(params)
    });

    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

export {
  pingServer,
  submitFeedback
};
