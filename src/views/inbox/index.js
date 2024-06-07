import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import {
  Typography,
  Grid,
  Divider,
  Chip
} from '@mui/material';

import {
  Error,
  Done,
  MarkEmailRead,
  MarkEmailUnread
} from '@mui/icons-material';

import MainCard from 'ui-component/cards/MainCard';

import { useTheme } from '@mui/material/styles';

import { userChats } from 'api/chat-api';
import auth from 'auth/auth-helper';

const InboxPage = () => {
  const theme = useTheme();
  const jwt = auth.isAuthenticated();

  const [noChats, setNoChats] = useState(false);

  const [chats, setChats] = useState([]);

  useEffect(() => {
    fetchUserChats();
  }, []);

  const fetchUserChats = async () => {
    const chats = await userChats({ userId: jwt.user._id }, { t: jwt.token });

    if (chats.length === 0) {
      setNoChats(true);
    }

    const formattedChats = chats.map((chat) => {
      const chatName = chat.participants[0]._id === jwt.user._id
        ? chat.participants[1].name
        : chat.participants[0].name;

      const lastActiveDate = chat.updated
        ? `${new Date(chat.updated)}`
        : `${new Date(chat.created)}`;

      const lastActiveTime = lastActiveDate.slice(16, 21);

      const today = `${new Date(chat.updated)}`.slice(0, 15);

      const lastActive = lastActiveDate.slice(0, 15) === today
        ? `today at ${lastActiveTime}`
        : `${lastActiveDate.slice(0, 15)} at ${lastActiveTime}`

      let sender = '';

      if (chat.most_recent_text) {
        sender = chat.most_recent_text.sender === jwt.user.name
          ? 'You'
          : chat.most_recent_text.sender;
      }

      const lastText = chat.most_recent_text
        ? `${sender}: ${chat.most_recent_text.text}`
        : 'New Chat ✨';

      const status = chat.has_unread ? 'unread' : 'read';

      return { id: chat._id, chatName, lastText, lastActive, status }
    });

    setChats((current) => [...formattedChats]);
  }

  const statusMap = {
    'read': {
      color: '#364152',
      icon: <MarkEmailRead style={{ marginTop: 8, fontSize: 15 }} />
    },
    'unread': {
      color: theme.palette.success.dark,
      icon: <MarkEmailUnread style={{ marginTop: 8, fontSize: 15 }} />
    },
    'delivered': {
      color: theme.palette.success.dark,
      icon: <Done style={{ marginTop: 8, fontSize: 15 }} />
    },
    'failed': {
      color: theme.palette.orange.dark,
      icon: <Error style={{ marginTop: 8, fontSize: 15 }} />
    }
  };

  return (
    <MainCard title="Inbox">
      {
        noChats && (
          <Typography justifyContent='center'>
            No chats found. Chats are automatically created when you play chess with someone.
          </Typography>
        )
      }
      {
        chats.map((chat, index) => (
          <>
            <Grid container direction="column">
              <Grid item>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="subtitle1" color="inherit" component={Link} to={`/chat/${chat.id}`} >
                      {chat.chatName}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Grid container alignItems="center" justifyContent="space-between">
                      <Grid item>
                        <Typography variant="subtitle1" color="inherit">
                          <Chip
                            size="small"
                            label={statusMap[chat.status].icon}
                            sx={{
                              width: 35,
                              color: theme.palette.background.default,
                              bgcolor: statusMap[chat.status].color
                            }}
                          />
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <br />
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.success.dark }}>
                      {/* todo: determine text cut-off by window size */}
                      {chat.lastText.slice(0, 30)}{chat.lastText.length > 30 ? '...' : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <div style={{ textAlign: 'right' }}>
                      <Typography variant="subtitle2">
                        {chat.lastActive}
                      </Typography>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Divider sx={{ mb: 1.5 }} /></>
        ))
      }

    </MainCard>
  )

};

export default InboxPage;
