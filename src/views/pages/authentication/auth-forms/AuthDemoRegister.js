
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { demoSignIn } from './../../../../auth/api-auth';

import auth from './../../../../auth/auth-helper';

import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputLabel,
    OutlinedInput,
    Typography,
    useMediaQuery
} from '@mui/material';

import * as Yup from 'yup';
import { Formik } from 'formik';

import AnimateButton from 'ui-component/extended/AnimateButton';


const FirebaseRegister = ({ ...others }) => {
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
    const customization = useSelector((state) => state.customization);
    const [checked, setChecked] = useState(true);

    const [values, setValues] = useState({
        redirectToHome: false,
        btnClicked: false,
        error: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const SignUp = async (values) => {
        setSubmitted(true);

        const user = {
            name: values.username
        }

        demoSignIn(user).then((data) => {
            console.log('signing in')
            if (data.error) {
                setSubmitted(false);
                setValues({ ...values, error: data.error })
            } else {
                auth.authenticate(data, () => {
                    console.log('authenticating')
                    setValues({ ...values, error: '', redirectToHome: true });
                })
            }
        })
    }

    if (values.redirectToHome) {
        return (<Navigate to={'/'} />)
    }

    return (
        <>
            <Grid container direction="column" justifyContent="center" spacing={2}>
                <Grid item xs={12}>
                    <Box sx={{ alignItems: 'center', display: 'flex' }}>
                        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
                        <Button
                            variant="outlined"
                            sx={{
                                cursor: 'unset',
                                m: 2,
                                py: 0.5,
                                px: 7,
                                borderColor: `${theme.palette.grey[100]} !important`,
                                color: `${theme.palette.grey[900]}!important`,
                                fontWeight: 500,
                                borderRadius: `${customization.borderRadius}px`
                            }}
                            disableRipple
                            disabled
                        >
                            {/* OR */}
                            <Typography className='zugzwang-demo-access-text'>
                                Demo Sign Up
                            </Typography>
                        </Button>
                        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
                    </Box>
                </Grid>
                <Grid item xs={12} container alignItems="center" justifyContent="center">
                    <Box sx={{ mb: 2 }}>
                        {/* <Typography variant="subtitle1">Demo Sign Up</Typography> */}
                    </Box>
                </Grid>
            </Grid>

            <Formik
                initialValues={{
                    username: '',
                }}
                validationSchema={Yup.object().shape({
                    username: Yup.string().required('Username is required'),
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        setStatus({ success: true });
                        setSubmitting(false);
                        SignUp(values)
                    } catch (err) {
                        console.error(err);
                        setStatus({ success: false });
                        setErrors({ submit: err.message });
                        setSubmitting(false);
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit} {...others}>
                        <Grid container spacing={matchDownSM ? 0 : 2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ ...theme.typography.customInput }}>
                                    <InputLabel htmlFor="first-name">Username</InputLabel>
                                    <OutlinedInput
                                        id="first-name"
                                        type="text"
                                        value={values.username}
                                        name="username"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.firstName && errors.firstName && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {errors.firstName}
                                        </FormHelperText>
                                    )}
                                </FormControl>

                            </Grid>
                        </Grid>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checked}
                                            onChange={(event) => setChecked(event.target.checked)}
                                            name="checked"
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography variant="subtitle1">
                                            Agree with &nbsp;
                                            <Typography variant="subtitle1" component={Link} to="#">
                                                Terms & Condition.
                                            </Typography>
                                        </Typography>
                                    }
                                />
                            </Grid>
                        </Grid>
                        {errors.submit && (
                            <Box sx={{ mt: 3 }}>
                                <FormHelperText error>{errors.submit}</FormHelperText>
                            </Box>
                        )}

                        {values.error && (
                            <FormHelperText error>
                                {values.error}
                            </FormHelperText>
                        )}

                        <Box sx={{ mt: 2 }}>
                            <AnimateButton>
                                <Button
                                    disableElevation
                                    disabled={submitted}
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                >
                                    <Typography>
                                        {submitted ? 'Creating account...' : 'Demo Sign up'}
                                    </Typography>
                                </Button>
                            </AnimateButton>
                        </Box>
                    </form>
                )}
            </Formik>
        </>
    );
};

export default FirebaseRegister;
