// material-ui
import { Typography, Grid } from '@mui/material';
import { Navigate } from 'react-router-dom';

import auth from 'auth/auth-helper';

import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';

import logo from 'assets/images/dark-theme-logo.png';

import { useEffect, useState } from "react";

import ChessMatch from './ChessMatch';

const HomePage = () => {
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // if (!auth.isAuthenticated()) {
  //   return <Navigate to={'/demo-signin'} />;
  // }

  return (
    <div>
      <MainCard title={<img src={logo} style={{ maxWidth: 250, paddingLeft: 20, textAlign: 'center' }} />}>
        <SubCard title={<Typography variant='h2'>Getting Started</Typography>}>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <Typography variant="subtitle1" gutterBottom>
                1. Demo Users
                            </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" gutterBottom>
                Demo users can ignore the instructions below and go straight to the arenas.
                Bullet arenas include bots and are great if you can't find another human opponent. To play against your friends use the Blitz Arenas.
                All transactions for demo accounts are symbolic and wont cost you anything. They are meant to give an idea how
                the platform works.
                        </Typography>
              <br />
              <Typography variant='subtitle2'> * Tip: You can chat with your opponent, even if its a bot 👾.
                        </Typography>
            </Grid>
          </Grid>
          <br />
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <Typography variant="subtitle1" gutterBottom>
                2. Regular Users
                        </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1" gutterBottom>
                Step 1: Make a Deposit
                        </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" gutterBottom>
                In order to play for real money against other players, simply chooose your preferred payment method
                and deposit money into your Zugzwang account. Your balance is only affected when you win or lose a game and can be withdrawn at any time.
                To make a deposit, select 'Withdraw/Deposit' in the left side panel. Enter a deposit amount. As much as you want, its just a demo and won't
                have any effect on your actual funds. Then enter your transaction password
                and hit the Deposit button.
                        </Typography>
            </Grid>
          </Grid>
          <br />
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <Typography variant="subtitle1" gutterBottom>
                Step 2: Play Some Chess
                        </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" gutterBottom>
                Choose an Arena, pick a wager, and battle! If you're testing this
                with friends make sure you pick the same Arena+wager to increase your
                chances of being matched up.
                        </Typography>
              <br />
              <Typography variant='subtitle2'>
                * Your selected wager shouldn't be more than the amount you have available
                in your account.
                        </Typography>
            </Grid>
          </Grid>
        </SubCard>
      </MainCard>
      <br />
      <br />
      <Grid container xs={12} md={12} spacing={windowSize[0] > 800 ? 2 : 0 }>
        <Grid item xs={windowSize[0] > 800 ? 6 : 12 } md={6} style={{ paddingTop: 10, paddingBottom: 10 }}>
          <ChessMatch />
        </Grid>
        <br />
        <Grid item xs={windowSize[0] > 800 ? 6 : 12 } md={6} style={{ paddingTop: 10, paddingBottom: 40 }}>
          <ChessMatch />
        </Grid>
      </Grid>
    </div>

  )
};

export default HomePage;
