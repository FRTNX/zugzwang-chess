import config from './../../../config/config';
import PropTypes from 'prop-types';
import { useEffect, useState, forwardRef } from 'react';

import { styled, useTheme } from '@mui/material/styles';
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Slide,
  Snackbar,
  Typography,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField
} from '@mui/material';

import {
  SkipNext,
  SkipPrevious,
  Flag,
  CropRotate,
  PlayArrow,
  Chat,
  CircleTwoTone,
  History,
  MoreVert,
  NetworkCheck,
} from '@mui/icons-material';

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";

import PerfectScrollbar from 'react-perfect-scrollbar';

import SubCard from 'ui-component/cards/SubCard';

import { Chessboard } from 'react-chessboard';
import { Game } from 'js-chess-engine';

import { makeMove } from 'api/game-api';

import auth from 'auth/auth-helper';

import { fetchGameDetails, fetchInGameDetails, sendInGameMessage, resign, sendNetworkReport } from 'api/game-api';
import { pingServer, submitFeedback } from 'api/api';

import ReconnectingWebSocket from 'reconnecting-websocket';

import MuiAlert from '@mui/material/Alert';

import AnimateButton from 'ui-component/extended/AnimateButton';

import { useSelector } from 'react-redux';

import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

import logo from 'assets/images/dark-theme-logo.png'

const CardStyle = styled(Card)(({ theme }) => ({
  background: '#181a1b',
  marginTop: '16px',
  marginBottom: '16px',
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '200px',
    height: '200px',
    border: '19px solid ',
    borderColor: theme.palette.warning.main,
    borderRadius: '50%',
    top: '65px',
    right: '-150px'
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: '200px',
    height: '200px',
    border: '3px solid ',
    borderColor: theme.palette.warning.main,
    borderRadius: '50%',
    top: '145px',
    right: '-70px'
  }
}));

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const TransitionDown = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const ChessCard = (props) => {
  const theme = useTheme();

  const jwt = auth.isAuthenticated();

  const [websocket, setWebscoket] = useState(null);

  const [playerTime, setPlayerTime] = useState(60);
  // todo: move to values, set from incoming opponent data
  const [opponentTime, setOpponentTime] = useState(60);

  const [opponentName, setOpponentName] = useState('');

  const [formattedMoves, setFormattedMoves] = useState({});

  const [moveHistory, setMoveHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  ]);

  const [networkLatency, setNetworkLatency] = useState([0]);

  const [opponentLatency, setOpponentLatency] = useState([0]);

  const [currentFenIndex, setCurrentFenIndex] = useState(0);

  const [orientation, setOrientation] = useState(props.side === 'B' ? 'black' : 'white');

  const [chatBox, setChatBox] = useState({
    open: false
  });

  const [values, setValues] = useState({
    gameId: props.gameId,
    orientation: props.side === 'B' ? 'black' : 'white',
    wagerAmount: 0,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    playerName: '',
    opponentUserId: '',
    gameOver: true,
    turn: 'W',
    ws: null
  });

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [userFeedback, setUserFeedback] = useState({
    email: '',
    subject: '',
    message: ''
  });

  const [subCard, setSubCard] = useState({
    title: 'Network Performance'
  });

  const [networkBar, setNetworkBar] = useState({
    open: false
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    secondaryMsg: '',
    textColor: 'success',
    style: 'zugzwang-snackbar-default',
    ttl: 3000
  });

  const [dialog, setDialog] = useState({
    title: '',
    text: '',
    open: false
  })

  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    reason: 'NO_GAME'
  });

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  const [gameMessages, setGameMessages] = useState([]);

  const [checked, setChecked] = useState(false);

  const validUpdate = (prevFen, newFen) => prevFen.split(' ')[1] !== newFen.split(' ')[1];

  const formatGameMessages = (messages) => {
    const formattedMessages = messages.map((message) => {
      const isLocalUser = jwt.user._id === message.user_id;

      return {
        message: message.text,
        sender: isLocalUser ? values.playerName : opponentName,
        direction: isLocalUser ? 'outgoing' : 'incoming',
        position: isLocalUser ? 'first' : 'last'
      };
    });

    return formattedMessages;
  };

  const updateGameDetails = async () => {
    const { gameId, side } = props;
    fetchGameDetails({ gameId, side }, { t: jwt.token }).then((data, error) => {
      if (error) {
        console.log(error)
      }

      setValues({ ...values, ...data });

      setMoveHistory(current => [...data.moveHistory]);
      setFenHistory(current => [...data.fenHistory]);
      setCurrentFenIndex(data.fenHistory.length - 1);

      // console.log('got network profile:', data.networkProfile)
      setNetworkLatency(current => {
        if (current.length === 1 && data.networkProfile.length > 1) {
          return [...data.networkProfile];
        }

        return current;
      });

      setOpponentLatency(current => [...data.opponentNetworkProfile]);

      if (data.opponentName) {
        setOpponentName(data.opponentName);
      }

      if (data.gameMessages) {
        const formattedMessages = formatGameMessages(data.gameMessages);
        setGameMessages(current => [...formattedMessages]);
      }
    });
  };

  useEffect(() => { updateGameDetails(); }, []);

  const latencyChartRange = () => {
    const maxChartLength = Math.max(networkLatency.length, opponentLatency.length);
    return maxChartLength > 100 ? 100 : maxChartLength;
  };

  const networkTest = async () => {
    const startTime = new Date().getTime();
    const serverResponse = await pingServer();
    const endTime = new Date().getTime();
    const latencyMillis = endTime - startTime;
    return latencyMillis;
  };

  const publishNetworkReport = async () => {
    if (!values.gameOver) {
      setNetworkLatency(current => {
        const params = {
          userId: jwt.user._id,
          gameId: values.gameId,
          latencyArray: current
        };

        sendNetworkReport(params, { t: jwt.token });

        return current;
      });
    }
  };

  // const broadcastLatency = (value) => {
  //   const params = {
  //     message_type: 'LATENCY_REPORT',
  //     latency: value,
  //     game_id: props.gameId,
  //     side: props.side
  //   };

  //   console.log('broadcasting latency:', params)
  //   websocket.send(JSON.stringify(params));
  // };

  // run a network test every 2 seconds
  useEffect(() => {
    const networkTestInterval = setInterval(() => {
      if (opponentName) {
        networkTest().then((value, error) => {
          // broadcastLatency(value);
          setNetworkLatency(current => [...current, value]);
        });
      }
    }, 1000 * 2);

    if (values.gameOver || !opponentName) {
      clearInterval(networkTestInterval);
      publishNetworkReport();
    }

    return () => {
      clearInterval(networkTestInterval);
      publishNetworkReport();
    }
  }, [values.gameOver, opponentName]);

  // publish network report every 30 seconds
  useEffect(() => {
    const networkReportInterval = setInterval(() => {
      publishNetworkReport();
      updateGameDetails();
    }, 1000 * 8);

    if (values.gameOver || !opponentName) {
      clearInterval(networkReportInterval);
    }

    return () => {
      clearInterval(networkReportInterval);
    }
  }, [values.gameOver]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      const { gameId } = props;
      fetchInGameDetails({ gameId }, { t: jwt.token }).then((data, error) => {
        if (error) {
          console.log(error)
        }

        if (data) {
          if (data.moveHistory.length > moveHistory.length) {
            setMoveHistory(current => [...data.moveHistory]);
            setFenHistory(current => [...data.fenHistory]);
            setCurrentFenIndex(data.fenHistory.length - 1);

            const game = new Game(data.fen);
            const gameState = game.exportJson();
            const currentTurn = gameState.turn === 'black' ? 'B' : 'W';

            if (gameState.check && currentTurn === props.side) {
              if (!checked) {
                setChecked(true);
                setSnackbar({ message: 'Check!', open: true, ttl: 2000, style: 'zugzwang-snackbar-lose' });
              }
            }

            if (gameState.checkMate) {
              const message = 'Checkmate! You lose.';
              const secondaryMsg = `-$${Number(values.wagerAmount).toFixed(2)}`;

              setValues({ ...values, turn: currentTurn, gameOver: true, fen: data.fen });
              setSnackbar({ ...snackbar, open: true, message, secondaryMsg, style: 'zugzwang-snackbar-lose' });
            }

            else {
              setValues({ ...values, turn: currentTurn, fen: data.fen });

              if (checked) {
                setChecked(false);
              }
            }
          }
        }
      });
    }, 1000 * 4);

    if (values.gameOver || !opponentName) {
      clearInterval(updateInterval);
    }

    return () => {
      clearInterval(updateInterval)
    }
  }, [values.gameOver]);


  useEffect(() => {
    // observe
    setValues({ ...values, fen: fenHistory[currentFenIndex] });
  }, [currentFenIndex]);

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
    setFormattedMoves(moveHistory.reduce((moves, move) => ({ ...moves, ...move }), {}));
  }, [moveHistory]);

  // useEffect(() => {
  //   let interval;
  //   console.log('player side:', props.side)
  //   console.log('current turn', values.turn)
  //   const playerTimeOut = playerTime < 0;

  //   if (playerTimeOut) {
  //     setValues({ ...values, gameOver: true });
  //     setSnackbar('You timed out!')
  //   }

  //   else {
  //     if (props.side === values.turn) {
  //       if (!values.gameOver && !playerTimeOut) {
  //         interval = setInterval(() => {
  //           setPlayerTime((seconds) => seconds - 1);
  //         }, 1000);
  //       }
  //     }  
  //   }

  //   return () => clearInterval(interval);

  // }, [values.turn]);

  // useEffect(() => {
  //   let interval;
  //   if (props.side !== values.turn) {
  //     if (!values.gameOver) {
  //       interval = setInterval(() => {
  //         setOpponentTime((seconds) => seconds - 1);
  //       }, 1000);
  //     }
  //   }

  //   return () => clearInterval(interval);

  // }, [values.turn]);

  useEffect(() => {
    const ws = new ReconnectingWebSocket(config.socketUrl);

    ws.addEventListener('open', event => {
      console.log('opening socket');

      setWebscoket(ws);
      const userId = auth.isAuthenticated().user._id;

      ws.send(JSON.stringify({
        message_type: 'GAME_INIT',
        user_id: userId,
        game_id: values.gameId,
        player_name: values.playerName,
        player_time: playerTime,
        side: props.side
      }));

      setSocketStatus({ ...socketStatus, connected: true })
    });

    ws.addEventListener('close', event => {
      console.log('socket closed')
      setSocketStatus({ ...socketStatus, connected: false });
      pingServer(); // wake server up, if asleep.
    });

    ws.addEventListener('message', event => {
      console.log('socket message', event.data)
      if (event.data) {
        const data = JSON.parse(event.data);

        if (data.side !== props.side) {
          if (data.messageType === 'GAME_INIT') {
            if (data.playerName && (data.side !== props.side) && !opponentName) {
              setOpponentName(data.playerName);
            }

            if (data.playerTime) {
              setOpponentTime(data.playerTime)
            }
          }

          if (data.messageType === 'GAME_MESSAGE') {
            const newMessage = { message: data.text, sender: opponentName, direction: 'incoming', postition: 'last' };
            setGameMessages(current => [...current, newMessage]);
            setSnackbar({ ...snackbar, message: `New message from ${opponentName}`, open: true, style: 'zugzwang-snackbar-message' });
          };

          if (data.messageType === 'LATENCY_REPORT') {
            console.log('got websocket opponent latency', data)
            setOpponentLatency(current => [...current, data.latency]);
          }

          // if (data.messageType === 'CLOCK_UPDATE') {
          //     console.log('received opponent clock data: ', data)
          //     setOpponentTime((seconds) => data.seconds);
          // }

          if (data.messageType == 'IN_GAME') {
            if (data.action) {
              if (data.action === 'RESIGN') {
                setValues({ ...values, gameOver: true });
                const secondaryMsg = `+$${Number(values.wagerAmount).toFixed(2)}`;

                setSnackbar({ ...snackbar, message: `${opponentName} resigned.`, secondaryMsg, open: true, style: 'zugzwang-snackbar-win' });
              }

              if (data.action === 'STALEMATE') {
                setValues({ ...values, gameOver: true });
                setSnackbar({ ...snackbar, message: 'Stalemate!', open: true, style: 'zugzwang-snackbar-win' });
              }
            }

            if (data.move) {
              console.log('socket received move number: ', Object.keys(data.move)[0]);
              console.log('move history length:', moveHistory.length)
              setMoveHistory(current => [...current, data.move]);
            }

            if (data.fen) {
              updateGameDetails();
              const game = new Game(data.fen);
              const gameState = game.exportJson();
              const currentTurn = gameState.turn === 'black' ? 'B' : 'W';

              if (gameState.check && currentTurn === props.side) {
                console.log('socket check')
                setSnackbar({ message: 'Check!', open: true, ttl: 2000, style: 'zugzwang-snackbar-lose' });
              }

              if (gameState.checkMate) {
                const message = 'Checkmate! You lose.';
                const secondaryMsg = `-$${Number(values.wagerAmount).toFixed(2)}`;

                setValues({ ...values, turn: currentTurn, gameOver: true, fen: data.fen });
                setSnackbar({ ...snackbar, open: true, message, secondaryMsg, style: 'zugzwang-snackbar-lose' });
              }

              else {
                setValues({ ...values, turn: currentTurn, fen: data.fen });
              }
            }
          }
        }
      }
    });

    return () => {
      ws.close();
      if (websocket) {
        setWebscoket(null)
      }
    }
  }, [values.playerName]);

  const handleMove = async (move) => {
    if (currentFenIndex !== fenHistory.length - 1) {
      setSnackbar({
        message: 'Return to current game state before making a move.', open: true, ttl: 4000
      });
      return;
    }

    if (values.gameOver) {
      // setSnackbar({ message: 'Game Over', open: true });
      return;
    }

    const turn = values.fen.split(' ')[1];

    if (props.side === turn.toUpperCase()) {
      const { from, to, piece } = move;

      const game = new Game(values.fen);
      const validMove = game.move(from, to);

      const currentFen = game.exportFEN();

      if (validMove) {
        const formattedMove = { [moveHistory.length]: `${from} > ${to}` };

        const fens = [...fenHistory, currentFen];

        setMoveHistory(current => [...current, formattedMove]);
        setFenHistory(current => [...current, currentFen]);
        setCurrentFenIndex(fens.length - 1);

        const gameState = new Game(currentFen).exportJson();
        const currentTurn = gameState.turn === 'black' ? 'B' : 'W';

        if (gameState.checkMate) {
          const message = 'Checkmate! You win.';
          const secondaryMsg = `+$${Number(values.wagerAmount).toFixed(2)}`;

          setValues({ ...values, turn: currentTurn, gameOver: true, fen: currentFen });
          setSnackbar({ ...snackbar, open: true, message, secondaryMsg, style: 'zugzwang-snackbar-win' });
        }

        else {
          setValues({ ...values, turn: currentTurn, fen: currentFen });
        }

        const params = {
          game_id: values.gameId,
          move: formattedMove,
          fen: currentFen,
          seconds_remaining: playerTime,
          opponent_user_id: values.opponentUserId,
        };

        params.message_type = 'IN_GAME';
        params.side = props.side;
        params.player_time = playerTime;

        websocket.send(JSON.stringify(params));

        const result = await makeMove(params);
        console.log('server response: ', result);

        if (result.stalemate) {
          websocket.send(JSON.stringify({ game_id: values.game_id, message_type: 'IN_GAME', game_state: 'STALEMATE' }));

          setValues({ ...values, gameOver: true });
          setSnackbar({ ...snackbar, message: 'Stalemate!', style: 'zugzwang-snackbar-message' });
        }
      }
    }

    else {
      // setSnackbar({ message: 'It\'s not your turn.', open: true });
    }
  };

  const previousFen = () => {
    if (currentFenIndex > 0) {
      setCurrentFenIndex(currentFenIndex - 1);
    }
  };

  const nextFen = () => {
    if (currentFenIndex < fenHistory.length - 1) {
      setCurrentFenIndex(currentFenIndex + 1);
    }
  };

  const currentFen = () => {
    setCurrentFenIndex(fenHistory !== 0 ? fenHistory.length - 1 : 0);
  }

  const handleClose = event => {
    setSnackbar({ ...snackbar, open: false });
    if (snackbar.secondaryMsg) {
      displaySecondaryMsg();
    }
  };

  const displaySecondaryMsg = () => {
    setTimeout(() => {
      const message = snackbar.secondaryMsg;
      setSnackbar({ ...snackbar, message, open: true, secondaryMsg: '' });
    }, 2000);
  }

  const handleDialogClose = event => {
    return setDialog({ open: false })
  }

  const handleUserResignation = () => {
    return setDialog({ ...dialog, open: true })
  };

  const toggleOrientation = () => {
    if (orientation === 'black') {
      setOrientation('white');
    }

    if (orientation === 'white') {
      setOrientation('black');
    }
  };

  const toggleChatBox = () => {
    if (chatBox.open) {
      setChatBox({ ...chatBox, open: false });
      setSubCard({ ...subCard, title: 'Move History' });
    }

    else {
      setChatBox({ ...chatBox, open: true });
      setSubCard({ ...subCard, title: 'Chat' });
    }
  };

  const toggleNetworkCheck = () => {
    if (networkBar.open) {
      setNetworkBar({ ...networkBar, open: false });
      setSubCard({ ...subCard, title: 'Chat' })
    }

    else {
      setNetworkBar({ ...networkBar, open: true });
      setChatBox({ ...chatBox, open: false })
      setSubCard({ ...subCard, title: 'Network Performance' })
    }
  }

  const resignGame = () => {
    setDialog({ ...dialog, open: false });
    setValues({ ...values, gameOver: true });

    const resigningSide = props.side === 'W' ? 'white' : 'black';

    const move = { [moveHistory.length]: `${resigningSide} resigned` };

    const params = {
      game_id: values.gameId,
      userId: jwt.user._id,
      move,
      side: props.side,
      message_type: 'IN_GAME',
      player_time: playerTime,
      action: 'RESIGN'
    }

    resign(params);
    websocket.send(JSON.stringify(params));

    const secondaryMsg = `-$${Number(values.wagerAmount).toFixed(2)}`;

    setValues({ ...values, gameOver: true });
    setSnackbar({ ...snackbar, message: 'You resigned.', secondaryMsg, open: true, style: 'zugzwang-snackbar-lose' });
    
    updateGameDetails();
  };

  const handlePlayerTimeOut = (params) => {
    console.log('You timed out');
    // send to server for investigation, return game outcome
  };

  const handleNewMessage = message => {
    const newMessage = { message, timestamp: 'yesterday', sender: 'me', direction: 'outgoing', postition: 'first' };

    setGameMessages(current => [...current, newMessage]);

    const params = {
      message_type: 'GAME_MESSAGE',
      user_id: jwt.user._id,
      opponent_user_id: values.opponentUserId,
      opponent_name: opponentName || '',
      game_id: values.gameId,
      text: message,
      side: props.side
    };

    sendInGameMessage(params, { t: jwt.token });
    websocket.send(JSON.stringify(params));
  };

  const handleChangeUserFeedback = (name, event) => {
    setUserFeedback({ ...userFeedback, [name]: event.target.value })
  }

  const handleUserFeedback = () => {
    setChatBox({ ...chatBox, open: false });
    setSubCard({ ...subCard, title: 'Feedback' });
  };

  const submitUserFeedback = () => {
    if (!socketStatus.connected) {
      setSnackbar({ ...snackbar, message: 'No Internet', open: true, style: 'zugzwang-snackbar-lose' });
      return;
    }

    const params = {
      user_id: jwt.user._id,
      ...userFeedback
    };

    submitFeedback(params, { t: jwt.token });
    setFeedbackSubmitted(true);
  };

  // const chartData = {
  //   type: 'area',
  //   height: 225,
  //   options: {
  //     chart: {
  //       id: 'support-chart',
  //       sparkline: { enabled: true },
  //       toolbar: {
  //         autoSelected: 'pan',
  //         show: false
  //       }
  //     },
  //     dataLabels: { enabled: false },
  //     stroke: { curve: 'smooth', width: 1 },
  //     tooltip: {
  //       fixed: { enabled: false },
  //       x: { show: false },
  //       y: { title: 'Ticket ' },
  //       marker: { show: false }
  //     }
  //   },
  //   series: [
  //     {
  //       data: [...networkLatency]
  //     }
  //   ]
  // };


  const chartData = {
    series: [
      {
        name: "You",
        data: [...networkLatency]
      },
      {
        name: opponentName,
        data: [...opponentLatency]
      }
    ],
    type: 'area',
    height: 225,
    options: {
      tooltip: {
        fixed: { enabled: false },
        x: { show: false },
        y: { title: 'Ticket ' },
        marker: { show: false },
        theme: 'dark'
      },
      chart: {
        foreColor: '#fff',
        dropShadow: {
          enabled: true,
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        toolbar: {
          // autoSelected: 'pan',
          show: false
        }
      },
      // colors: ['#77B6EA', '#545454'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },

      grid: {
        // borderColor: '#e7e7e7',
        // row: {
        //   colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        //   opacity: 0.5
        // },
      },
      markers: {
        show: false
      },
      xaxis: {
        labels: {
          show: false
        },
        axisTicks: {
          show: false
        },
        range: latencyChartRange()
        // min: networkLatency.length - 40,
        // max: networkLatency.length + 2
      },
      yaxis: {
        // min: 5,
        // max: 40
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -2,
        // offsetX: -5
      }
    },
  };

  const customization = useSelector((state) => state.customization);
  const { navType } = customization;

  const orangeDark = theme.palette.secondary[200];

  useEffect(() => {
    const newSupportChart = {
      ...chartData.options,
      colors: [orangeDark],
      tooltip: {
        theme: 'dark'
      }
    };
    ApexCharts.exec(`support-chart`, 'updateOptions', newSupportChart);
  }, [navType, orangeDark, networkBar.open]);

  const ContactCard = () => (
    <CardStyle>
      <CardContent>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Typography variant="h4">
              <img src={logo} width={150} />
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle2" color="grey.900" sx={{ opacity: 0.6 }}>
              Welcome to financially productive chess. <br />
              We'd like to hear from you.
            </Typography>
          </Grid>
          <Grid item>
            <Stack direction="row">
              <AnimateButton>
                <Button variant="contained" color="warning" sx={{ boxShadow: 'none' }} onClick={handleUserFeedback}>
                  Contact Us
                </Button>
              </AnimateButton>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </CardStyle>
  )

  const PlayerChessClock = () => {
    return (
      <Grid container xs={12}>
        <Grid xs={9}>
          <div style={{ textAlign: 'left', fontSize: '20px', padding: 3 }}>
            <span>{values.playerName}</span>
            {
              values.playerName && (<CircleTwoTone
                style={{
                  maxHeight: 15,
                  color: socketStatus.connected ? 'green' : 'grey',
                  // marginBottom: -1
                }}
              />)
            }
          </div>
        </Grid>
        <Grid xs={3}>
          <div style={{ textAlign: 'right', fontSize: '20px', padding: 3 }}>
            {/* <span>{playerTime}</span> */}
            <span>00:00</span>
          </div>
        </Grid>
      </Grid>
    )
  }

  const OpponentChessClock = (props) => {
    return (
      <Grid container xs={12}>
        <Grid xs={9}>
          <div style={{ textAlign: 'left', fontSize: '20px', padding: 3 }}>
            <span>{opponentName}</span>
            {
              opponentName && (<CircleTwoTone
                style={{
                  maxHeight: 15,
                  color: socketStatus.connected ? 'green' : 'grey',
                  // marginBottom: -1
                }}
              />)
            }
          </div>
        </Grid>
        <Grid xs={3}>
          <div style={{ textAlign: 'right', fontSize: '20px', padding: 3 }}>
            {/* <span>{opponentTime}</span> */}
            <span>00:00</span>
          </div>
        </Grid>
      </Grid>
    )
  }

  const menuOptions = [
    'Network Performance',
    'Move History',
    'Abort Game',
    'Chat'
  ]

  const ControlGrid = () => (
    <Grid item xs={12}>
      <Grid container>
        <Grid item xs={11}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={2}>
                <IconButton onClick={previousFen} >
                  <SkipPrevious />
                </IconButton>
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={currentFen} >
                  <PlayArrow />
                </IconButton>
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={nextFen} >
                  <SkipNext />
                </IconButton>
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={handleUserResignation} disabled={values.gameOver}>
                  <Flag />
                </IconButton>
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={toggleOrientation}>
                  <CropRotate />
                </IconButton>
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={toggleChatBox}>
                  {
                    chatBox.open && (<History />)
                  }
                  {
                    !chatBox.open && (<Chat />)
                  }
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={toggleNetworkCheck}>
            <NetworkCheck />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <>
      <Grid item xs={12} sm={12} lg={7}>
        <Grid maxWidth={700} container direction="column">
          {
            values.orientation === orientation && (
              <OpponentChessClock expiryTimestamp={opponentTime} />
            )
          }
          {
            values.orientation !== orientation && (
              <PlayerChessClock expiryTimestamp={playerTime} />
            )
          }
          <div className='chess-board'>
            <Chessboard
              arePiecesDraggable={!values.gameOver}
              boardOrientation={orientation}
              position={values.fen}
              onPieceDrop={(sourceSquare, targetSquare, piece) =>
                handleMove({
                  from: sourceSquare,
                  to: targetSquare,
                  piece,
                  promotion: 'q'
                })}
            />
          </div>
          {
            values.orientation !== orientation && (
              <OpponentChessClock expiryTimestamp={opponentTime} />
            )
          }
          {
            values.orientation === orientation && (
              <PlayerChessClock expiryTimestamp={playerTime} />
            )
          }
          {
            windowSize[0] < 1200 && (<div style={{ paddingTop: 40 }}><ControlGrid /></div>)
          }
        </Grid>
      </Grid>

      <Grid item xs={12} sm={12} lg={5}>
        <SubCard className='zugzwang-action-bar' title={subCard.title}>
          <Grid container direction="column" spacing={1}>
            {
              subCard.title === 'Feedback' && (
                <div>
                  <TextField
                    onChange={(event) => handleChangeUserFeedback('email', event)}
                    type='email'
                    fullWidth
                    label="Email"
                    value={userFeedback.email}
                    style={{
                      paddingBottom: 10
                    }}
                  />
                  <TextField
                    onChange={(event) => handleChangeUserFeedback('subject', event)}
                    fullWidth
                    label="Subject"
                    value={userFeedback.subject}
                    style={{
                      paddingBottom: 10
                    }}
                  />
                  <TextField
                    onChange={(event) => handleChangeUserFeedback('message', event)}
                    multiline
                    fullWidth
                    label="Message"
                    value={userFeedback.message}
                    rows={16}
                  />
                  <div style={{ display: 'flex', justifyContent: 'right' }}>
                    <Button
                      onClick={submitUserFeedback}
                      disabled={feedbackSubmitted}
                      style={{
                        backgroundColor: feedbackSubmitted ? 'grey' : 'green',
                        color: 'white',
                        marginTop: 10,
                        marginBottom: 10,
                        marginRight: 10
                      }}
                    >
                      {feedbackSubmitted ? 'Feedback Sent' : 'Send'}
                    </Button>
                  </div>
                </div>
              )
            }

            {
              subCard.title === 'Network Performance' && (
                <div>
                  <Grid item xs={12} sx={{ pt: '16px !important' }}>
                    <Card sx={{}}>
                      <Grid container sx={{ p: 2, pb: 0, color: '#fff' }}>
                        <Grid item xs={12}>
                          <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                              <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.dark }}>
                                Network Performance
                              </Typography>
                            </Grid>

                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ color: theme.palette.grey[800] }}>
                            {`Average: ${Number(networkLatency.reduce((partSum, value) => partSum + value, 0) / networkLatency.length).toFixed(2)} ms`}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Chart {...chartData} />
                      {/* <Chart {...brushChartOptions} /> */}
                    </Card>
                  </Grid>
                  {/* <div style={{ height: 100 }}>
                  </div> */}
                  <ContactCard />
                </div>
              )
            }

            {
              subCard.title === 'Move History' && (
                <div>
                  <PerfectScrollbar
                    style={{ height: 300, maxHeight: 300, overflowY: 'scroll' }}
                  >
                    {
                      Object.keys(formattedMoves).sort().reverse().map((key) => (
                        <>
                          <Typography style={{ padding: 4 }}>
                            {`${Number(key) + 1}. ${formattedMoves[key]}`}
                          </Typography>
                          <Divider style={{ maxWidth: 150 }} />
                        </>
                      ))
                    }
                  </PerfectScrollbar>
                  <ContactCard />
                </div>
              )
            }

            {
              subCard.title === 'Chat' && (
                <div className='zugzwang-chat-box'>
                  <div style={{ position: "relative", height: "300px" }}>
                    <MainContainer>
                      <ChatContainer>
                        <MessageList>
                          {
                            gameMessages.map((message, index) => (
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
                  <ContactCard />
                </div>
              )
            }
            {/* <UserFeedback /> */}
          </Grid>
          {
            windowSize[0] >= 1200 && (<ControlGrid />)
          }
        </SubCard>
      </Grid>
      <Snackbar
        className={snackbar.style}
        style={{ maxWidth: windowSize[0] < 1200 ? 240 : 240 }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={snackbar.ttl}
        onClose={handleClose}
      >
        <Alert className={snackbar.style} onClose={handleClose} severity={'info'} sx={{ width: '100%' }}>
          <Typography>
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
      <Dialog
        open={dialog.open}
        TransitionComponent={TransitionDown}
        keepMounted
        onClose={handleDialogClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          <Typography style={{ fontSize: 20 }}>Confirm</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Typography style={{ fontSize: 15 }}>Are you sure you want to resign?</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            <Typography style={{ fontSize: 15 }}>Cancel</Typography>
          </Button>
          <Button onClick={resignGame}>
            <Typography style={{ fontSize: 15, color: theme.palette.orange.dark }}>Resign</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ChessCard.propTypes = {
//     isLoading: PropTypes.bool
// };

export default ChessCard;
