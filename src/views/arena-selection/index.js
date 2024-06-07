import { useState, useEffect, forwardRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import {
    Button,
    IconButton,
    Grid,
    Stack,
    Typography,
    Divider,
    Paper,
    CardActions,
    Slide,
    Snackbar,
} from '@mui/material';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { IconSwords } from '@tabler/icons';

import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';

import { gridSpacing } from 'store/constant';

import { useTheme } from '@mui/material/styles';

import { read } from 'api/arena-api';
import { initGame } from 'api/game-api';

import auth from 'auth/auth-helper';

import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ArenaSelect = (props) => {
    const theme = useTheme();

    const jwt = auth.isAuthenticated();

    const [arenas, setArenas] = useState([]);
    const [rankings, setRankings] = useState([]);

    const [values, setValues] = useState({
        gameId: null,
        side: null,
        opponentName: '',
        fen: ''
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: ''
    });

    useEffect(() => {
        setArenas([]); // clear data
        fetchArenaDetails(); // repopulate
    }, [props.data.type]);

    const fetchArenaDetails = async () => {
        const params = {
            arena_id: props.data.type,
        }

        const result = await read(params, { t: jwt.token });

        if (result.wagers) {
            const rows = [];
            let row = [];

            // todo: sort wagers by size
            result.wagers.map((wager, index) => {
                if (result.wagers.length === index + 1) {
                    rows.push([...row, wager]);
                    return;
                }

                if (row.length < 3) {
                    row.push(wager);
                    return;
                }

                if (row.length === 3) {
                    rows.push([...row]);
                    row = [wager];
                    return;
                }
            });

            setArenas([...rows]);
            setRankings([
                { username: 'Jamie Kingslayer', rating: 1000, games: 50 },
                { username: 'Dauglas Dave', rating: 1000, games: 50 },
                { username: 'Barry Lavigne', rating: 1000, games: 50 },
                { username: 'Nqakuza Ndlovu', rating: 1000, games: 50 },
                { username: 'Dead Queen', rating: 1000, games: 50 },
                { username: 'Jamie Kingslayer', rating: 1000, games: 50 },
                { username: 'Dauglas Dave', rating: 1000, games: 50 },
                { username: 'Barry Lavigne', rating: 1000, games: 50 },
                { username: 'Nqakuza Ndlovu', rating: 1000, games: 50 },
                { username: 'Dead Queen', rating: 1000, games: 50 }
            ]);
        }
    }

    const initialiseGame = async (arena) => {
        const params = {
            user_id: jwt.user._id,
            arena_id: props.data.type,
            wager: { amount: arena.wager },
            adhoc: props.data.type.includes('BULLET')
        }

        const result = await initGame(params);
        console.log('arena selection result: ', result)

        if (result.message === 'INSUFFICIENT_FUNDS') {
            setSnackbar({
                ...snackbar,
                open: true,
                message: 'Not enough funds for this arena'
            });
        }

        setValues({ ...values, ...result });
    };

    const TransitionRight = (props) => {
        return <Slide {...props} direction='right' />
    }

    const handleClose = event => {
        setSnackbar({ ...snackbar, open: false });
    }

    if (values.gameId) {
        console.log('arena selection values:', values)
        return <Navigate to={`/game/${values.gameId}/${values.side}`} state={values} />;
    }

    // if (!auth.isAuthenticated()) {
    //     return <Navigate to={'/signup'} />;
    // }

    return (
        <>
            <MainCard title={`${props.data.title} Arenas`}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} sm={6}>
                        <SubCard title="Choose an Arena">
                            <Grid container spacing={1}>
                                {
                                    arenas.length > 0 && arenas.map((row) => (
                                        <Grid container item spacing={3}>
                                            {
                                                row.map((arena) => (
                                                    <Grid item xs={4} style={{ padding: 20, textAlign: 'center' }}>
                                                        <IconButton
                                                            sx={{
                                                                width: 50,
                                                                height: 50,
                                                                borderRadius: 0,
                                                                textAlign: 'center',
                                                                paddingLeft: 0
                                                            }}
                                                            aria-label="save"
                                                            onClick={() => initialiseGame({ wager: arena.amount })}
                                                        >
                                                            <IconSwords />
                                                        </IconButton>
                                                        <Typography variant="h3" sx={{ textAlign: 'center' }}>
                                                            {props.data.title}
                                                        </Typography>
                                                        <Typography variant="h2" sx={{ textAlign: 'center' }}>
                                                            ${arena.amount}
                                                        </Typography>
                                                    </Grid>
                                                ))
                                            }
                                        </Grid>
                                    ))
                                }
                            </Grid>
                        </SubCard>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper >
                            <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]} >
                                <Grid container direction="column" spacing={2}>
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center" justifyContent="space-between" sx={{ pt: 2, px: 2 }}>
                                            <Grid item>
                                                <Stack direction="row" spacing={2}>
                                                    <Typography variant="subtitle1" >{props.data.title} Leaderboard</Typography>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>
                                                            <Typography>
                                                                Player Name
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography>
                                                                Rating
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography>
                                                                Ganes Played
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {rankings.map((row, index) => (
                                                        <TableRow
                                                            key={`${row.username}-${index}`}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            <TableCell component="th" scope="row">
                                                                <Typography>
                                                                    {row.username}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography>
                                                                    {row.rating}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography>
                                                                    {row.games}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                </Grid>
                                <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                                    <Button size="small" disableElevation>
                                        View All
                                        </Button>
                                </CardActions>
                            </MainCard>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {/* <SubCard title="Our Trust Policy">
                            <Grid container direction="column" spacing={1}>
                                <Grid item>
                                    <Typography variant="body1" gutterBottom>
                                        body1. Lorem ipsum dolor sit connecter adieu siccing eliot. Quos blanditiis tenetur unde suscipit, quam
                                        beatae rerum inventore consectetur, neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti?
                                        Eum quasi quidem quibusdam.
                            </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body2" gutterBottom>
                                        body2. Lorem ipsum dolor sit connecter adieu siccing eliot. Quos blanditiis tenetur unde suscipit, quam
                                        beatae rerum inventore consectetur, neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti?
                                        Eum quasi quidem quibusdam.
                            </Typography>
                                </Grid>
                            </Grid>
                        </SubCard> */}
                    </Grid>
                </Grid>
            </MainCard>
            <Snackbar
                className={'zugzwang-snackbar-lose'}
                // style={{ maxWidth: windowSize[0] < 1200 ? 240 : 240 }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={snackbar.open}
                autoHideDuration={snackbar.ttl}
                onClose={handleClose}
            >
                <Alert className={'zugzwang-snackbar-lose'} onClose={handleClose} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )

};

export default ArenaSelect;
