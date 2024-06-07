import config from './../config/config';

const create = async (user) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/users/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

const read = async (params, credentials, signal) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/users/` + params.userId, {
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

const fetchGameHistory = async (params, credentials) => {
  try {
    const query = params.username
      ? `?username=${params.username}`
      : `?user_id=${params.userId}`

    let response = await fetch(`${config.serverUrl}/api/v0/user/games${query}`, {
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

const profile = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/user/profile?user_id=` + params.userId, {
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

const fetchUserByName = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/user/profile?username=` + params.username, {
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
}

const update = async (params, credentials, user) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/users/` + params.userId, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      },
      body: user
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

export {
  create,
  read,
  update,
  profile,
  fetchUserByName,
  fetchGameHistory
};
