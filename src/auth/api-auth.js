import config from './../config/config';

const demoSignIn = async (user) => {
    try {
        let response = await fetch(`${config.serverUrl}/api/v0/auth/demo/signin`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });
        return await response.json();
    } catch(err) {
        console.log(err)
    }
};

const signin = async (user) => {
    try {
        let response = await fetch(`${config.serverUrl}/api/v0/auth/signin/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            // credentials: 'include',
            body: JSON.stringify(user)
        });
        return await response.json();
    } catch(err) {
        console.log(err)
    }
};

const signout = async () => {
    try {
        let response = await fetch(`${config.serverUrl}/api/v0/auth/signout/`, { method: 'GET' });
        return await response.json();
    } catch(err) {
        console.log(err);
    }
};

export {
    signin,
    signout,
    demoSignIn
};
