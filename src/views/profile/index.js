import { useState, useEffect } from 'react';
import { Navigate, Link, useParams } from 'react-router-dom';

// material-ui
import {
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grid,
  ListItemSecondaryAction,
  Card,
  Button,
  IconButton
} from '@mui/material';

import {
  LocalFireDepartment,
  Send,
  Add
} from '@mui/icons-material'

import MainCard from './ProfileMainCard';
import SubCard from './ProfileSubCard';

import PerfectScrollbar from 'react-perfect-scrollbar';

import { profile, fetchGameHistory, fetchUserByName } from 'api/api-user';
import auth from 'auth/auth-helper';

import { Chessboard } from 'react-chessboard';

import { useSelector } from 'react-redux';

import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

import { useTheme } from '@mui/material/styles';

import User1 from 'assets/images/ph2.png';

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;


const ProfilePage = () => {
  const pathParams = useParams();
  console.log('path params: ', pathParams)
  const theme = useTheme();
  const jwt = auth.isAuthenticated();


  const [values, setValues] = useState({
    username: '',
    created: '',
    totalGamesPlayed: '',
    totalWins: '',
    totalLosses: '',
    totalAmountWon: '',
    totalAmountLost: '',
    totalWithdrawals: '',
    totalDeposits: '',
    currentBalance: ''
  });

  const [gameHistory, setGameHistory] = useState([]);

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  const bigAvatar = {
    width: 80,
    height: 80,
    marginRight: 15
  };

  useEffect(() => {
    if (pathParams.username) {
      fetchUserByName({ username: pathParams.username }, { t: jwt.token }).then((data, error) => {
        if (error) {
          console.log('error', error);
        }

        else {
          console.log('profile:', data)
          setValues({ ...values, ...data });
        }
      })

    }

    else {
      profile({ userId: jwt.user._id }, { t: jwt.token }).then((data, error) => {
        if (error) {
          console.log('error', error);
        }

        else {
          console.log('profile:', data)
          setValues({ ...values, ...data });
        }
      })
    }


  }, []);

  useEffect(() => {
    const params = {};
    if (pathParams.username) {
      params.username = pathParams.username;
    }

    else {
      params.userId = jwt.user._id;
    }

    fetchGameHistory(params, { t: jwt.token }).then((data, error) => {
      if (error) {
        console.log('error', error);
      }

      else {
        if (data) {
          const formattedGames = data.map((game) => {
            const opponentName = game.player_one.user_id === jwt.user._id
              ? game.player_two.player_name
              : game.player_one.player_name;

            const orientation = game.player_one.user_id === jwt.user._id
              ? game.player_one.side
              : game.player_two.side;

            const fen = game.current_fen;

            let winner = 'UNKOWN';

            if (game.winner_user_id) {
              winner = game.winner_user_id === jwt.user._id
                ? 'You'
                : opponentName;
            }

            return { id: game._id, fen, opponentName, winner, orientation }
          });

          setGameHistory(formattedGames)
        }
      }
    })
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

  const chartData = {
    series: [
      {
        name: "You",
        data: [29, 9, 14, 9, 29, 11, 31]
      },
      {
        name: 'average player',
        data: [35, 36, 28, 19, 11, 10, 20]
      }
    ],
    height: 400,
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
        // height: 90,
        type: 'line',
        dropShadow: {
          enabled: true,
          // color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        toolbar: {
          show: false
        }
      },
      // colors: ['#77B6EA', '#545454'],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: 'smooth'
      },
      title: {
        text: `Activity`,
        // align: 'left'
      },
      grid: {
        // borderColor: '#e7e7e7',
        row: {
          // colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          // opacity: 0.5
        },
      },
      markers: {
        size: 1
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        title: {
          text: 'Month'
        }
      },
      yaxis: {
        title: {
          text: 'Games Won'
        },
        min: 5,
        max: 40
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5
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
  }, [navType, orangeDark]);

  // if (!auth.isAuthenticated()) {
  //   return <Navigate to={'/signup'} />;
  // }

  return (
    <MainCard title="Profile">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <List dense>
            <ListItem>
              <ListItemAvatar>
                <Avatar src={User1} style={bigAvatar} />
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant='h3'>{values.username}</Typography>}
                secondary={`Joined ${new Date(values.created)}`.slice(0, 23)}
                style={{ fontSize: '10px' }}
              />
            </ListItem>
            <br />
            <ListItem>
              <Grid container>
                <Grid xs={4} md={2}>
                  <Button
                    style={{
                      backgroundColor: 'black',
                      color: 'white',
                      width: '95%',
                    }}
                  >
                    <LocalFireDepartment style={{ color: 'red', paddingBottom: 2}} />
                    Challenge
                  </Button>
                </Grid>
                <Grid xs={4} md={2}>
                  <Button
                  style={{
                    backgroundColor: 'black',
                    color: 'white',
                    width: '95%'
                  }}
                  >
                    <Send style={{ paddingRight: 5, paddingBottom: 2, color: 'green'}}/>
                    Message
                  </Button>
                </Grid>
                <Grid xs={4} md={2}>
                  <Button
                  style={{
                    backgroundColor: 'black',
                    color: 'white',
                    width: '95%'
                  }}
                  >
                    <Add style={{ marginLeft: -10, paddingBottom: 2 }} />
                    Follow
                  </Button>
                </Grid>
              </Grid>
            </ListItem>
            <br />
            <Card >
              {console.log(chartData.series)}
              <Chart {...chartData} />
            </Card>
            <ListItem>
              {
                !isNaN(values.totalGamesPlayed) && (
                  <ListItemText
                    primary={<Typography>{'Total Games Played:'}</Typography>}
                    secondary={values.totalGamesPlayed}
                    style={{ fontSize: '10px' }}
                  />
                )
              }
            </ListItem>
            <ListItem>
              {
                !isNaN(values.totalWins) && (
                  <ListItemText
                    primary={<Typography>{'Wins:'}</Typography>}
                    secondary={values.totalWins}
                    style={{ fontSize: '10px' }}
                  />
                )
              }
            </ListItem>
            <ListItem>
              {
                !isNaN(values.totalLosses) && (
                  <ListItemText
                    primary={<Typography>{'Losses:'}</Typography>}
                    secondary={values.totalLosses}
                    style={{ fontSize: '10px' }}
                  />
                )
              }
            </ListItem>
            <ListItem>
              {
                !isNaN(values.totalAmountWon) && (
                  <ListItemText
                    primary={<Typography>{'Total Amount Won:'}</Typography>}
                    secondary={`$${Number(values.totalAmountWon).toFixed(2)}`}
                    style={{ fontSize: '10px' }}
                  />
                )
              }
            </ListItem>
            <ListItem>
              {
                !isNaN(values.totalAmountLost) && (
                  <ListItemText
                    primary={<Typography>{'Total Amount Lost:'}</Typography>}
                    secondary={`$${Number(values.totalAmountLost).toFixed(2)}`}
                    style={{ fontSize: '10px' }}
                  />
                )
              }
            </ListItem>
            <ListItem>
              {
                !isNaN(values.totalWithdrawals) && (
                  <ListItemText
                    primary={<Typography>{'Total Withdrawals:'}</Typography>}
                    secondary={`$${Number(values.totalWithdrawals).toFixed(2)}`}
                    style={{ fontSize: '10px' }}
                  />
                )
              }
            </ListItem>
            <ListItem>
              {
                !isNaN(values.totalDeposits) && (
                  <ListItemText
                    primary={<Typography>{'Total Deposits:'}</Typography>}
                    secondary={`$${Number(values.totalDeposits).toFixed(2)}`}
                    style={{ fontSize: '10px' }}
                  />
                )
              }
            </ListItem>
            <ListItem>
              {
                !isNaN(values.currentBalance) && (
                  <ListItemText
                    primary={<Typography>{'Current Balance:'}</Typography>}
                    secondary={`$${Number(values.currentBalance).toFixed(2)}`}
                    style={{ fontSize: '10px' }}
                  />
                )
              }
            </ListItem>
          </List>
          <br />
        </Grid>
        <Grid item xs={12} md={6} style={{ paddingTop: windowSize[0] > 900 ? 194 : 0 }}>
          <SubCard title={<Typography variant={'h5'}>Game History</Typography>}>
            <PerfectScrollbar
              style={{ height: '100%', maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden' }}
            >
              <List>
                {
                  gameHistory.map((game, index) => (
                    <div>
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <div>
                            <Typography component={Link} to={`/game/${game.id}/${game.orientation}`}>
                              <Chessboard
                                arePiecesDraggable={false}
                                position={game.fen}
                                boardOrientation={game.orientation === 'W' ? 'white' : 'black'}
                              />
                            </Typography>
                          </div>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography >{`${values.username} vs ${game.opponentName}`}</Typography>}
                          secondary={<Typography>{`${game.winner} won`}</Typography>}
                          style={{ fontSize: '10px', paddingLeft: 10 }}
                        />
                      </ListItem>
                      <br />
                    </div>
                  ))
                }
              </List>
            </PerfectScrollbar>
          </SubCard>
        </Grid>
      </Grid>

    </MainCard>
  )
};

export default ProfilePage;
