import config from './../config/config'; 

const create = async (accountDetails) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/arena`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountDetails)
    })
    return await response.json()
  } catch(err) {
    console.log(err)
  }
};

const read = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/arena/?arena_id=` + params.arena_id, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      }
  })
    return await response.json()
  } catch(err) {
    console.log(err)
  }
};

export {
  create,
  read
};
