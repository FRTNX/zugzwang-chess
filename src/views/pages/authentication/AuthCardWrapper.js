import { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

// material-ui
import { Box, Typography } from '@mui/material';

// project import
import MainCard from 'ui-component/cards/MainCardBorderless';


import config from 'config/config';

import {
    CircleTwoTone,
} from '@mui/icons-material';

import ReconnectingWebSocket from 'reconnecting-websocket';

import { pingServer } from 'api/api';


// ==============================|| AUTHENTICATION CARD WRAPPER ||============================== //

const AuthCardWrapper = ({ children, ...other }) => {
    const [socketStatus, setSocketStatus] = useState({
        connected: false,
        reason: ''
    });

    // aggressively wakes up server
    useEffect(() => {
        const ws = new ReconnectingWebSocket(config.socketUrl);

        ws.addEventListener('open', event => {
            ws.send(JSON.stringify({ message_type: 'AUTH_INIT' }));
            setSocketStatus({ ...socketStatus, connected: true })
        });

        ws.addEventListener('close', event => {
            setSocketStatus({ ...socketStatus, connected: false });
            pingServer();
        });

        return () => ws.close();
    }, []);

    return (
        <MainCard
            sx={{
                maxWidth: { xs: 400, lg: 475 },
                margin: { xs: 2.5, md: 3 },
                borderColor: 'rgba(7, 75, 130, 0.14);',
                '& > *': {
                    flexGrow: 1,
                    flexBasis: '50%'
                }
            }}
            content={false}
            {...other}
        >
            <Box sx={{ p: { xs: 2, sm: 3, xl: 5 } }}>{children}</Box>
            <Typography style={{ textAlign: 'center' }}>
                <CircleTwoTone
                    style={{
                        maxHeight: 15,
                        color: socketStatus.connected ? 'green' : 'grey',
                        // marginBottom: -1
                    }}
                />
            </Typography>
        </MainCard>
    );

}

AuthCardWrapper.propTypes = {
    children: PropTypes.node
};

export default AuthCardWrapper;
