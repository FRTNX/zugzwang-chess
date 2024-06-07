import config from './../config/config';

const create = async (accountDetails) => {
    try {
        let response = await fetch(`${config.serverUrl}/api/v0/account`, {
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
        let response = await fetch(`${config.serverUrl}/api/v0/account?user_id=${params.user_id}${pathParams}`, {
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
        let response = await fetch(`${config.serverUrl}/api/v0/account/deposit`, {
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
        let response = await fetch(`${config.serverUrl}/api/v0/account/withdraw`, {
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

const transfer = async (params, credentials) => {
    try {
        let response = await fetch(`${config.serverUrl}/api/v0/account/transfer`, {
            method: 'POST',
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

const accountNumberDetails = async (accountNumber, credentials) => {
    try {
        let response = await fetch(`${config.serverUrl}/api/v0/account/transfer/details?account_num=${accountNumber}`, {
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

const createBudget = async (params) => {

};

const fetchBudget = async (params) => {

};

const fetchBudgets = (params) => {

};

const updateBudget = async (params) => {

};

const dissolveBudget = async (params) => {

};

export {
    create,
    read,
    deposit,
    withdraw,
    createBudget,
    fetchBudget,
    fetchBudgets,
    updateBudget,
    dissolveBudget,
    transfer,
    accountNumberDetails
};
