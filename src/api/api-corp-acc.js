import config from './../config/config';

const create = async (accountDetails) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/corporate/account`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountDetails)
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

const read = async (params, credentials, signal) => {
  try {
    const pathParams = params.tx_filter ? `&&filter=${params.tx_filter}` : '';
    let response = await fetch(`${config.serverUrl}/api/v0/corporate/account?user_id=${params.user_id}${pathParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      }
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

const deposit = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/corporate/deposit`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      },
      body: JSON.stringify(params)
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

const withdraw = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/corporate/withdraw`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      },
      body: JSON.stringify(params)
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

export {
  create,
  read,
  deposit,
  withdraw
};
