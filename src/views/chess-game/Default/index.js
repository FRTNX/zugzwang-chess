import { Navigate, useParams } from 'react-router-dom';
import { Grid, Typography, Card } from '@mui/material';

import auth from './../../../auth/auth-helper';

import ChessBoard from './Chess';
import { gridSpacing } from 'store/constant';

const ChessGame = () => {
    const pathParams = useParams();

    if (!auth.isAuthenticated()) {
        return <Navigate to={'/signup'} />;
    }

    return (
        <Grid container spacing={gridSpacing}>
            <ChessBoard gameId={pathParams.gameId} side={pathParams.side} />
        </Grid>
    );
};

export default ChessGame;
