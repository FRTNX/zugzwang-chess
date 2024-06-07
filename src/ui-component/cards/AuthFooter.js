// material-ui
import { Link, Typography, Stack } from '@mui/material';

// ==============================|| FOOTER - AUTHENTICATION 2 & 3 ||============================== //

const AuthFooter = () => (
    <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle2" component={Link} href="" target="_blank" underline="hover">
            &copy; {new Date().getFullYear()} {' '} Zugzwang Pvt Ltd
        </Typography>
        {/* <Typography variant="subtitle2" component={Link} href="" target="_blank" underline="hover">
            &copy; Busani Ndlovu
        </Typography> */}
    </Stack>
);

export default AuthFooter;