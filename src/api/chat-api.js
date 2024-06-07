import config from './../config/config';


const userChats = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/chats?id=${params.userId}`, {
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

const chatDetails = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/chat?id=${params.chatId}`, {
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

const chatMessages = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/chat/messages?chat_id=${params.chatId}&&user_id=${params.userId}`, {
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

const newMessage = async (message, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/chat/messages`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
};

const updateUserLastSeen = async (params, credentials) => {
  try {
    let response = await fetch(`${config.serverUrl}/api/v0/chat/log`, {
      method: 'PUT',
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
}

export {
  userChats,
  chatDetails,
  chatMessages,
  newMessage,
  updateUserLastSeen
};
