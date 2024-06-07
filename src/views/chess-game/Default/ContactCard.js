// material-ui
import { styled } from '@mui/material/styles';
import { Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

import logo from 'assets/images/dark-theme-logo.png'

// styles
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

// ==============================|| PROFILE MENU - UPGRADE PLAN CARD ||============================== //

const UpgradePlanCard = () => (
    <CardStyle>
        <CardContent>
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Typography variant="h4">
                        <img src={logo} width={150}/>
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="subtitle2" color="grey.900" sx={{ opacity: 0.6 }}>
                        Welcome to financially productive chess. <br/>
                        We'd like to hear from you.
                    </Typography>
                </Grid>
                <Grid item>
                    <Stack direction="row">
                        <AnimateButton>
                            <Button variant="contained" color="warning" sx={{ boxShadow: 'none' }}>
                                Contact Us
                            </Button>
                        </AnimateButton>
                    </Stack>
                </Grid>
            </Grid>
        </CardContent>
    </CardStyle>
);

export default UpgradePlanCard;
