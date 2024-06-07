import config from './../config/config';

const initGame = async (params) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/game/init`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

const fetchGameDetails = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/game?gameId=${params.gameId}&&side=${params.side}`, {
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

const fetchInGameDetails = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/game/cache?game_id=${params.gameId}`, {
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

const fetchLiveGameDetails = async () => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/game/live`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
}

const handleUserMove = async (gameDetails) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/game/move`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameDetails)
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

const sendInGameMessage = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/game/message`, {
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
}

const makeMove = async (gameDetails) => {
  try {
    console.log('sending stuff out')
    let response = await fetch(`${config.serverUrl}/api/v0/game/umove`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameDetails)
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

const resign = async (gameDetails) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/game/resign`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameDetails)
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

const sendNetworkReport = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/game/latency`, {
      method: 'PUT',
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
  handleUserMove,
  initGame,
  fetchGameDetails,
  fetchInGameDetails,
  fetchLiveGameDetails,
  sendInGameMessage,
  sendNetworkReport,
  makeMove,
  resign
};
