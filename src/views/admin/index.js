import config from 'config/config';

import { useState, useEffect, useRef } from 'react';

import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  Paper,
  TextField,
  CardActions,
  ClickAwayListener,
  Card,
  CardContent,
  Avatar
} from '@mui/material';

import PerfectScrollbar from 'react-perfect-scrollbar';

import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';

import * as Yup from 'yup';
import { Formik } from 'formik';

import { gridSpacing } from 'store/constant';

import { useTheme } from '@mui/material/styles';

import AnimateButton from 'ui-component/extended/AnimateButton';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import SocketConnectionIcon from '@mui/icons-material/DonutLargeOutlined'

import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

import DeallocationIcon from '@mui/icons-material/KeyboardArrowUpOutlined';

import { useSelector } from 'react-redux';

import Ecocash from 'assets/images/ecocash.png';
import OneMoney from 'assets/images/one-money.png';
import Telecash from 'assets/images/telecash.png';
import Paynow from 'assets/images/paynow.png';

import { deposit, withdraw, read } from 'api/api-corp-acc';
import auth from 'auth/auth-helper';

import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

import ReconnectingWebSocket from 'reconnecting-websocket';

import logo from 'assets/images/dark-theme-logo.png';

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const CASH_INFLOWS = ['CORPORATE_DEPOSIT', 'WAGER_ACCRUAL', 'GAME_DEPOSIT', 'GAME_TX_CHARGE', 'DIRECT_TX_CHARGE'];
const CASH_OUTFLOWS = ['WAGER_ALLOCATION', 'CORPORATE_WITHDRAWAL'];

const status = [
  {
    value: 'all',
    label: 'All Transactions'
  },
  {
    value: 'cash_inflows',
    label: 'Cash Inflows'
  },
  {
    value: 'cash_outflows',
    label: 'Cash Outflows'
  },
  {
    value: 'wager_allocations',
    label: 'Wager Allocations'
  },
  {
    value: 'wager_deallocations',
    label: 'Wager Deallocations'
  }
];

const paymentMethods = [
  {
    value: 'ecocash',
    label: 'Ecocash'
  },
  {
    value: 'one-money',
    label: 'One Money'
  },
  {
    value: 'telecash',
    label: 'Telecash'
  },
  {
    value: 'paynow',
    label: 'Paynow'
  },
];

const logoMap = {
  'ecocash': Ecocash,
  'one-money': OneMoney,
  'telecash': Telecash,
  'paynow': Paynow
};

const brandMap = {
  'ecocash': 'Ecocash',
  'one-money': 'OneMoney',
  'telecash': 'Telecash',
  'paynow': 'Paynow'
};


const DepositPage = ({ ...others }) => {
  const theme = useTheme();
  const anchorRef = useRef(null);

  const [websocket, setWebscoket] = useState(null);

  const [showDepositPassword, setShowDepositPassword] = useState(false);
  const [showWithdrawPassword, setShowWithdrawPassword] = useState(false);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [chartValues, setChartValues] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((val) => random(0, 100)))

  const [fatalError, setFatalError] = useState({
    error: false,
    message: ''
  });

  const [details, setDetails] = useState({
    balance: '0.00',
    increase: '',
    txHistory: []
  });

  const [paymentMethod, setPaymentMethod] = useState('Ecocash')

  const [values, setValues] = useState({
    paymentMethod: 'paynow'
  });

  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    reason: ''
  });

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  const chartData = {
    type: 'area',
    height: 95,
    options: {
      chart: {
        id: 'support-chart',
        sparkline: { enabled: true },
        zoom: {
          type: 'x',
          enabled: true,
          autoScaleYaxis: false
        },
        toolbar: {
          show: false,
          offsetX: windowSize[0] < 800 ? -80 : 90,
          offsetY: windowSize[0] < 800 ? -26 : 23,
          tools: {
            download: false,
            selection: false,
            zoom: false,
            zoomin: true,
            zoomout: true,
            pan: false,
            reset: false,
            customIcons: []
          },
          // export: {
          //   csv: {
          //     filename: undefined,
          //     columnDelimiter: ',',
          //     headerCategory: 'category',
          //     headerValue: 'value',
          //     dateFormatter(timestamp) {
          //       return new Date(timestamp).toDateString()
          //     }
          //   },
          //   svg: {
          //     filename: undefined,
          //   },
          //   png: {
          //     filename: undefined,
          //   }
          // },
          autoSelected: 'zoom'
        },
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 1 },
      tooltip: {
        fixed: { enabled: false },
        x: { show: false },
        y: { title: 'Ticket ' },
        marker: { show: false }
      }
    },
    series: [
      {
        data: [...chartValues]
      }
    ]
  };

  const customization = useSelector((state) => state.customization);
  const { navType } = customization;

  const orangeDark = theme.palette.secondary[200];

  const jwt = auth.isAuthenticated();

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

  useEffect(() => {
    getAccountDetails();
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

  useEffect(() => {
    const ws = new ReconnectingWebSocket(config.socketUrl);

    ws.addEventListener('open', event => {
      console.log('OPENING SOCKET')
      setWebscoket(ws);
      const adminId = auth.isAuthenticated().user._id;

      ws.send(JSON.stringify({
        message_type: 'ADMIN_INIT',
        user_id: adminId
      }));

      setSocketStatus({ ...socketStatus, connected: true })
    });

    ws.addEventListener('close', event => {
      console.log('SOCKET CLOSED')
      setSocketStatus({ ...socketStatus, connected: false })
    });

    ws.addEventListener('message', event => {
      console.log('SOCKET MESSAGE', event)
      if (event.data) {
        const data = JSON.parse(event.data);
        console.log('socket data: ', data)
        getAccountDetails();
      }
    });
    return () => ws.close();
  }, []);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    setPaymentMethod(brandMap[values.paymentMethod]);
  }, [values.paymentMethod]);


  const handleChange = (event) => {
    if (event?.target.value) setValue(event?.target.value);
  };

  const handleTxTypeChange = (event) => {
    console.log('Got new option:', event.target.value);
    if (event?.target.value) setValue(event?.target.value);
    getAccountDetails({ tx_filter: event.target.value });
  }

  const handleChangePaymentMethod = (event) => {
    setValues({ ...values, paymentMethod: event.target.value });
  }

  const handleClickShowDepositPwd = () => {
    setShowDepositPassword(!showDepositPassword);
  };

  const handleClickShowWithdrawalPwd = () => {
    setShowWithdrawPassword(!showWithdrawPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const getAccountDetails = async (filter = {}) => {
    const accountDetails = await read({ user_id: auth.isAuthenticated().user._id, ...filter }, { t: jwt.token });

    console.log('got account details:', accountDetails)

    if (accountDetails.error) {
      if (accountDetails.error === 'MISSING_CORPORATE_ACCOUNT') {
        setFatalError({
          error: true,
          message: 'NOTE: No corporate account detected. Please create one to complete integration.'
        });
      }

      return;
    }

    const txHistory = accountDetails.txHistory.map((tx) => {
      const timestamp = new Date(tx.created);
      const created = timestamp.toDateString() + ` at ${timestamp.toTimeString().slice(0, 5)}`;
      if (typeof tx.tx_amount === 'number') {
        return { type: tx.tx_method, amount: tx.tx_amount, status: tx.tx_status || 'SUCCESS', created };
      }

      return { type: tx.tx_method, amount: tx.tx_amount.amount, status: tx.tx_status || 'SUCCESS', created };
    });

    setDetails({ ...details, balance: accountDetails.balance.amount, txHistory });
    setChartValues(accountDetails.balanceHistory);
  };

  const makeDeposit = async (txDetails) => {
    const params = {
      user_id: auth.isAuthenticated().user._id,
      deposit: { amount: txDetails.depositAmount },
      tx_password: txDetails.depositTxPassword
    }

    const result = await deposit(params, { t: jwt.token });

    await getAccountDetails();
  };

  return (
    <MainCard title="Corporate Account">
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} sm={6}>
          {
            fatalError.error && (
              <FormHelperText error id="standard-weight-helper-text-password-login">
                {fatalError.message}
              </FormHelperText>
            )
          }
          <Grid item xs={12} sx={{ pt: '16px !important' }}>
            <Card sx={{}}>
              <Grid container sx={{ p: 2, pb: 0, color: '#fff' }}>
                <Grid item xs={12}>
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                      <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.dark }}>
                        Corporate Account Balance
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h4" sx={{ color: theme.palette.grey[800] }}>
                        ${Number(details.balance).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  {
                    details.increase && (
                      <Typography variant="subtitle2" sx={{ color: theme.palette.grey[800] }}>
                        {details.increase}
                      </Typography>
                    )
                  }
                </Grid>
              </Grid>
              <Chart {...chartData} />
            </Card>
          </Grid>
          <br />
          <SubCard title="Corporate Deposit">
            <Grid container direction="column" justifyContent="center" spacing={2}>
              <Grid item xs={12}>
                <div style={{ paddingLeft: 10, paddingRight: 10 }}>
                  <Typography variant={'subtitle1'} style={{ fontSize: 10, paddingLeft: 7 }}>Select Payment Method</Typography>
                  <TextField
                    id="outlined-select-currency-native"
                    select
                    fullWidth
                    value={values.paymentMethod}
                    onChange={handleChangePaymentMethod}
                    SelectProps={{
                      native: true
                    }}
                  >
                    {paymentMethods.map((option) => (
                      <option key={option.value} value={option.value} >
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                </div>
              </Grid>
              <br />
              <Grid item xs={12}>
                <Typography variant="h2" sx={{ color: theme.palette.success.dark, textAlign: 'center' }}>
                  <img src={logoMap[values.paymentMethod]} alt={values.paymentMethod} style={{ maxHeight: 30 }} />
                </Typography>
              </Grid>
            </Grid>

            <br />

            <Formik
              initialValues={{
                depositAmount: '',
                depositTxPassword: '',
                submit: null
              }}
              validationSchema={Yup.object().shape({
                depositAmount: Yup.number().max(10000).required('Deposit amount is required'),
                depositTxPassword: Yup.string().max(255).required('Transaction password is required')
              })}
              onSubmit={async (values, { setErrors, setStatus, setSubmitting, resetForm }) => {
                try {
                  setStatus({ success: true });
                  setSubmitting(false);
                  makeDeposit(values)
                  resetForm();
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
                  <FormControl fullWidth error={Boolean(touched.depositAmount && errors.depositAmount)} sx={{ ...theme.typography.customInput }}>
                    <InputLabel htmlFor="deposit-amount">Deposit Amount</InputLabel>
                    <OutlinedInput
                      id="depisit-amount"
                      type="number"
                      value={values.depositAmount}
                      name="depositAmount"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      label="Deposit Amount"
                      inputProps={{}}
                    />
                    {touched.depositAmount && errors.depositAmount && (
                      <FormHelperText error id="standard-weight-helper-deposit-amount">
                        {errors.depositAmount}
                      </FormHelperText>
                    )}
                  </FormControl>

                  <FormControl
                    fullWidth
                    error={Boolean(touched.depositTxPassword && errors.depositTxPassword)}
                    sx={{ ...theme.typography.customInput }}
                  >
                    <InputLabel htmlFor="tx-password-1">Transaction Password</InputLabel>
                    <OutlinedInput
                      id="tx-password-1"
                      type={showDepositPassword ? 'text' : 'password'}
                      value={values.depositTxPassword}
                      name="depositTxPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowDepositPwd}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            size="large"
                          >
                            {showDepositPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Password"
                      inputProps={{}}
                    />
                    {touched.password && errors.password && (
                      <FormHelperText error id="standard-weight-helper-text-password-login">
                        {errors.password}
                      </FormHelperText>
                    )}
                  </FormControl>

                  {errors.submit && (
                    <Box sx={{ mt: 3 }}>
                      <FormHelperText error>{errors.submit}</FormHelperText>
                    </Box>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <AnimateButton>
                      <Button
                        disableElevation
                        disabled={isSubmitting || fatalError.error}
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        color="secondary"
                      >
                        Deposit
                      </Button>
                    </AnimateButton>
                  </Box>
                </form>
              )}
            </Formik>
          </SubCard>

          {/* <Typography textAlign='center' style={{ paddingTop: 50, paddingBottom: 50 }}>
            <img src={logo} alt="Zugzwang" width="180" />
          </Typography> */}

        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper>
            <ClickAwayListener onClickAway={handleClose}>
              <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                <Grid container direction="column" spacing={2}>
                  <Grid item xs={12}>
                    <Grid container alignItems="center" justifyContent="space-between" sx={{ pt: 2, px: 2 }}>
                      <Grid item>
                        <Stack direction="row" spacing={2}>
                          <Typography variant="subtitle1">
                            Corporate Transactions
                            <SocketConnectionIcon
                              style={{
                                color: socketStatus.connected ? 'green' : 'grey',
                                marginLeft: 5,
                                marginBottom: -3,
                                maxHeight: 15
                              }}
                            />
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <div style={{ paddingLeft: 10, paddingRight: 10 }}>
                      <TextField
                        id="outlined-select-currency-native"
                        select
                        fullWidth
                        value={value}
                        onChange={handleTxTypeChange}
                        SelectProps={{
                          native: true
                        }}
                      >
                        {status.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </TextField>
                    </div>
                  </Grid>
                  <Grid item xs={12} p={0}>
                    <Divider sx={{ my: 0 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <PerfectScrollbar
                      style={{ height: '100%', maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden' }}
                    >
                      <MainCard content={false}>
                        <CardContent className='zugzwang-tx-list'>
                          <Grid container spacing={gridSpacing}>
                            <Grid item xs={12}>
                              {
                                details.txHistory.map((tx, index) => (
                                  <>
                                    <Grid container direction="column">
                                      <Grid item>
                                        <Grid container alignItems="center" justifyContent="space-between">
                                          <Grid item>
                                            <Typography variant="subtitle1" color="inherit">
                                              {tx.type.split('_').join(' ')}
                                            </Typography>
                                          </Grid>
                                          <Grid item>
                                            <Grid container alignItems="center" justifyContent="space-between">
                                              <Grid item>
                                                <Typography variant="subtitle1" color="inherit">
                                                  ${Number(tx.amount).toFixed(2)}
                                                </Typography>
                                              </Grid>
                                              <Grid item>
                                                {
                                                  CASH_INFLOWS.includes(tx.type) && (
                                                    <Avatar
                                                      variant="rounded"
                                                      sx={{
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: '5px',
                                                        backgroundColor: theme.palette.success.dark,
                                                        color: theme.palette.orange.dark,
                                                        ml: 2
                                                      }}
                                                    >
                                                      <KeyboardArrowUpOutlinedIcon fontSize="small" color="inherit" />
                                                    </Avatar>
                                                  )
                                                }

                                                {
                                                  tx.type === 'WAGER_DEALLOCATION' && (
                                                    <Avatar
                                                      variant="rounded"
                                                      sx={{
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: '5px',
                                                        backgroundColor: theme.palette.success.dark,
                                                        color: theme.palette.orange.light,
                                                        ml: 2
                                                      }}
                                                    >
                                                      <DeallocationIcon fontSize="small" color="inherit" />
                                                    </Avatar>
                                                  )
                                                }

                                                {
                                                  CASH_OUTFLOWS.includes(tx.type) && (
                                                    <Avatar
                                                      variant="rounded"
                                                      sx={{
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: '5px',
                                                        backgroundColor: theme.palette.orange.dark,
                                                        color: theme.palette.orange.dark,
                                                        marginLeft: 1.875
                                                      }}
                                                    >
                                                      <KeyboardArrowDownOutlinedIcon fontSize="small" color="inherit" />
                                                    </Avatar>
                                                  )
                                                }

                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Grid container>
                                          <Grid item xs={6}>
                                            {
                                              !tx.status && ( // for legacy test data
                                                <Typography variant="subtitle2" sx={{ color: theme.palette.success.dark }}>
                                                  SUCCESS
                                                </Typography>
                                              )
                                            }

                                            {
                                              tx.status === 'SUCCESS' && (
                                                <Typography variant="subtitle2" sx={{ color: theme.palette.success.dark }}>
                                                  {tx.status}
                                                </Typography>
                                              )
                                            }

                                            {
                                              tx.status !== 'SUCCESS' && (
                                                <Typography variant="subtitle2" sx={{ color: theme.palette.orange.dark }}>
                                                  {tx.status}
                                                </Typography>
                                              )
                                            }
                                          </Grid>
                                          <Grid item xs={6}>
                                            <div style={{ textAlign: 'right', paddingRight: 30 }}>
                                              <Typography variant="subtitle2">
                                                {tx.created}
                                              </Typography>
                                            </div>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                    <Divider sx={{ my: 1.5 }} /></>
                                ))
                              }

                            </Grid>
                          </Grid>
                        </CardContent>
                      </MainCard>
                    </PerfectScrollbar>
                  </Grid>
                </Grid>
                <Divider />
                <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                  <Button size="small" disableElevation>
                    View All
                                        </Button>
                </CardActions>
              </MainCard>
            </ClickAwayListener>
          </Paper>
        </Grid>
      </Grid>
    </MainCard>
  )

};

export default DepositPage;
