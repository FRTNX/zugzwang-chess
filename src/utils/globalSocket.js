import config from 'config/config';

const globalSocket = new ReconnectingWebSocket(config.socketUrl);

export default globalSocket;
