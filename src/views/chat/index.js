
import { useState, useEffect, forwardRef } from 'react'
import { useParams } from 'react-router-dom';

import { useBeforeunload } from 'react-beforeunload';

import { useTheme } from '@mui/material/styles';

import config from 'config/config';

import {
  Typography,
  Grid,
  Snackbar
} from '@mui/material';

import {
  CircleTwoTone,
} from '@mui/icons-material';

// project imports
import MainCard from 'ui-component/cards/MainCard';

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";

import "./styles.min.css";

import ReconnectingWebSocket from 'reconnecting-websocket';

import {
  newMessage,
  chatMessages,
  chatDetails,
  updateUserLastSeen
} from 'api/chat-api';

import { pingServer } from 'api/api';

import auth from 'auth/auth-helper';

import User1 from 'assets/images/ph3.png';

import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const ChatPage = (props) => {
  const theme = useTheme();

  const { chatId } = useParams();

  const jwt = auth.isAuthenticated();

  const [values, setValues] = useState({
    recipientName: ''
  });

  const [websocket, setWebscoket] = useState(null);

  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    reason: ''
  });

  const [messages, setMessages] = useState([]);

  const [chartValues, setChartValues] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((val) => random(0, 100)));

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    style: 'zugzwang-snackbar-message',
    ttl: 3000
  });

  const handleNewMessage = message => {
    const incomingMessage = { message, timestamp: 'yesterday', sender: 'me', direction: 'outgoing', postition: 'first' };

    setMessages(current => [...current, incomingMessage]);

    const params = {
      user_id: jwt.user._id,
      chat_id: chatId,
      text: message,
      message_type: 'CHAT_MESSAGE'
    };

    newMessage(params, { t: jwt.token });

    websocket.send(JSON.stringify(params));
  };

  const formatChatMessages = (messages) => {
    const formattedMessages = messages.map((message) => {
      const isLocalUser = jwt.user._id === message.user_id;

      console.log('message sender:', jwt.user._id === message.user_id)

      return {
        message: message.text,
        sender: '',
        direction: isLocalUser ? 'outgoing' : 'incoming',
        position: isLocalUser ? 'first' : 'last'
      };
    });

    return formattedMessages;
  };

  useEffect(() => {
    const ws = new ReconnectingWebSocket(config.socketUrl);

    ws.addEventListener('open', event => {
      console.log('opening socket');
      setWebscoket(ws);

      ws.send(JSON.stringify({
        message_type: 'CHAT_INIT',
        chat_id: chatId,
        user_id: jwt.user._id
      }));

      setSocketStatus({ ...socketStatus, connected: true })
    });

    ws.addEventListener('close', event => {
      console.log('socket closed')
      setSocketStatus({ ...socketStatus, connected: false });
      pingServer(); // wake server up, if asleep.
    });

    ws.addEventListener('message', event => {
      if (event.data) {
        const data = JSON.parse(event.data);
        console.log('got chat message: ', data)
        if (data.user_id !== jwt.user._id) {
          const incomingMessage = { message: data.text, timestamp: 'yesterday', sender: 'recipient', direction: 'incoming', postition: 'last' }
          setMessages(current => [...current, incomingMessage]);
          // setSnackbar({ ...snackbar, open: true, message: `New message from ${values.recipientName}`});
        }
      }
    });

    return () => {
      ws.close()

      // piggy backing this here until we get  beforeunload working
      const params = {
        user_id: jwt.user._id,
        chat_id: chatId
      };
  
      console.log('updating user last seen')
      updateUserLastSeen(params, { t: jwt.token });
    };
  }, []);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    fetchChatMessages();
  }, []);

  useEffect(() => {
    fetchChatDetails();
  }, []);

  const fetchChatDetails = async () => {
    const chat = await chatDetails({ chatId }, { t: jwt.token })

    const recipientName = chat.participants[0]._id === jwt.user._id
      ? chat.participants[1].name
      : chat.participants[0].name;

    setValues({ ...values, recipientName });
  }

  const fetchChatMessages = async () => {
    const messages = await chatMessages({ userId: jwt.user._id, chatId }, { t: jwt.token });
    console.log('got chat messages: ', messages)

    const formattedMessages = formatChatMessages(messages);
    setMessages((current) => [...formattedMessages])
  };

  const handleClose = () => {
    setSnackbar({ ...snackbar, message: '', open: false });
  }

  return (
    <MainCard title={
      <div>
        <span>{values.recipientName}</span>
        {
          values.recipientName && (
            <CircleTwoTone
              style={{
                maxHeight: 15,
                color: socketStatus.connected ? 'green' : 'grey',
              }}
            />
          )
        }
      </div>
    }>
      <Grid container style={{ width: '100%' }}>
        <Grid xs={12} md={6} lg={6}>
          <div className='zugzwang-chat-box'>
            <div style={{ position: "relative", height: 700, maxHeight: 'calc(100vh - 205px)' }}>
              <MainContainer>
                <ChatContainer>
                  <MessageList>
                    {
                      messages.map((message, index) => (
                        <Message
                          key={index}
                          model={{
                            message: message.message,
                            // sentTime: message.timestamp,
                            sender: message.sender,
                            direction: message.direction,
                            position: message.position,
                          }}
                        />
                      ))
                    }
                  </MessageList>
                  <MessageInput placeholder="Type message here" onSend={handleNewMessage} />
                </ChatContainer>
              </MainContainer>
            </div>
          </div>
        </Grid>
        <Grid xs={12} lg={6}>
          <Grid item xs={12} sx={{ pt: windowSize[0] < 1200 ? 3 : 0, pl: windowSize[0] > 1200 ? 3 : 0 }}>
            <img src={User1} style={{ width: '100%', display: 'flex' }} />
          </Grid>
          <br />
        </Grid>
      </Grid>
      <Snackbar
        className={snackbar.style}
        style={{ maxWidth: windowSize[0] < 1200 ? 240 : 240 }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={snackbar.ttl}
        onClose={handleClose}
      >
        <Alert className={snackbar.style} onClose={handleClose} sx={{ width: '100%' }}>
          <Typography>
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
    </MainCard>
  )
};

export default ChatPage;
