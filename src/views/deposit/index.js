import config from 'config/config';

import { useState, useEffect, useRef, forwardRef } from 'react';

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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slide,
} from '@mui/material';

import PerfectScrollbar from 'react-perfect-scrollbar';

import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';

import * as Yup from 'yup';
import { Formik } from 'formik';

import { gridSpacing } from 'store/constant';

import { useTheme } from '@mui/material/styles';

import AnimateButton from 'ui-component/extended/AnimateButton';

import SocketConnectionIcon from '@mui/icons-material/DonutLargeOutlined'

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

import logo from 'assets/images/dark-theme-logo.png';

import { useSelector } from 'react-redux';

import Ecocash from 'assets/images/ecocash.png';
import OneMoney from 'assets/images/one-money.png';
import Telecash from 'assets/images/telecash.png';
import Paynow from 'assets/images/paynow.png';

import {
  deposit,
  withdraw,
  read,
  transfer,
  accountNumberDetails
} from 'api/api-acc';

import auth from 'auth/auth-helper';

import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

import ReconnectingWebSocket from 'reconnecting-websocket';

const CASH_INFLOWS = ['DEPOSIT', 'GAME_DEPOSIT', 'INCOMING_DIRECT_TRANSFER'];
const CASH_OUTFLOWS = ['WITHDRAWAL', 'GAME_WITHDRAWAL', 'OUTGOING_DIRECT_TRANSFER'];

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const status = [
  {
    value: 'all',
    label: 'All Transactions'
  },
  {
    value: 'deposits',
    label: 'Deposits'
  },
  {
    value: 'withdrawals',
    label: 'Withdrawals'
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

const TransitionDown = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const DepositPage = ({ ...others }) => {
  const theme = useTheme();
  const anchorRef = useRef(null);

  const jwt = auth.isAuthenticated();

  const [showDepositPassword, setShowDepositPassword] = useState(false);
  const [showWithdrawPassword, setShowWithdrawPassword] = useState(false);
  const [showTransferPassword, setShowTransferPassword] = useState(false);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [chartValues, setChartValues] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((val) => random(0, 100)))

  const [websocket, setWebscoket] = useState(null);

  const [values, setValues] = useState({
    accountNumber: null,
    transferAmount: null,
    transferTxPassword: null,
    paymentMethod: 'paynow'
  });

  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    reason: ''
  });

  const [fatalError, setFatalError] = useState({
    error: false,
    message: ''
  });

  const [dialog, setDialog] = useState({
    title: '',
    text: '',
    open: false
  });


  const [details, setDetails] = useState({
    balance: '0.00',
    accountNumber: '',
    increase: '',
    txHistory: []
  });

  const [paymentMethod, setPaymentMethod] = useState('Ecocash')

  const chartData = {
    type: 'area',
    height: 95,
    options: {
      chart: {
        id: 'support-chart',
        sparkline: { enabled: true }
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
    setPaymentMethod(brandMap[values.paymentMethod]);
  }, [values.paymentMethod]);

  useEffect(() => {
    getAccountDetails();
  }, []);

  useEffect(() => {
    const ws = new ReconnectingWebSocket(config.socketUrl);

    ws.addEventListener('open', event => {
      console.log('OPENING SOCKET')
      setWebscoket(ws);

      ws.send(JSON.stringify({
        message_type: 'USER_TX_LIST_INIT',
        user_id: jwt.user._id
      }));

      setSocketStatus({ ...socketStatus, connected: true })
    });

    ws.addEventListener('close', event => {
      console.log('SOCKET CLOSED')
      setSocketStatus({ ...socketStatus, connected: false })
    });

    ws.addEventListener('message', event => {
      console.log('SYNC INSTRUCTION', event)
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

  const handleChange = (event) => {
    console.log('Got new option:', event.target.value);

    if (event?.target.value) setValue(event?.target.value);
  };

  const handleTxTypeChange = (event) => {
    console.log('Got new option:', event.target.value);
    if (event?.target.value) setValue(event?.target.value);
    getAccountDetails({ tx_filter: event.target.value });
  }

  const handleClickShowDepositPwd = () => {
    setShowDepositPassword(!showDepositPassword);
  };

  const handleClickShowWithdrawalPwd = () => {
    setShowWithdrawPassword(!showWithdrawPassword);
  };

  const handleClickShowTransferPwd = () => {
    setShowTransferPassword(!showWithdrawPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChangePaymentMethod = (event) => {
    setValues({ ...values, paymentMethod: event.target.value });
  };

  const handleDialogClose = event => {
    return setDialog({ ...dialog, open: false });
  };
  
  const openDialog = async (inputValues) => {
    console.log('got input values:', inputValues)
    setValues({ ...values, ...inputValues });

    const { accountNumber, transferAmount } = inputValues;
    const recipientAccountDetails = await accountNumberDetails(accountNumber, { t: jwt.token });
    console.log('recipient acc details: ', recipientAccountDetails)

    const { accountOwner } = recipientAccountDetails;
    const confirmationMessage = `Send a direct transfer of $${Number(transferAmount).toFixed(2)} to ${accountOwner}`;

    setDialog({ text: confirmationMessage, open: true });
  };

  const getAccountDetails = async (params = {}) => {
    const accountDetails = await read({ user_id: jwt.user._id, ...params }, { t: jwt.token });

    console.log('got account details:', accountDetails)

    if (accountDetails.error) {
      if (accountDetails.error === 'MISSING_PAYMENT_METHOD') {
        setFatalError({
          error: true,
          message: 'NOTE: Deposits and withdrawals won\'t work until you add a payment method.'
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
    }).reverse();

    const { accountNumber } = accountDetails;
    setDetails({ ...details, accountNumber, balance: accountDetails.balance.amount, txHistory });
    setChartValues(accountDetails.balanceHistory);
  };

  const makeTransfer = async () => {
    setDialog({ ...dialog, open: false, text: '' });

    const params = {
      user_id: auth.isAuthenticated().user._id,
      transfer: { amount: values.transferAmount },
      recipient_account_number: values.accountNumber,
      tx_password: values.transferTxPassword
    }
    const result = await transfer(params, { t: jwt.token });

    // await props.getAccountDetails();
  }

  const makeDeposit = async (txDetails) => {
    const params = {
      user_id: auth.isAuthenticated().user._id,
      deposit: { amount: txDetails.depositAmount },
      tx_password: txDetails.depositTxPassword
    }

    const result = await deposit(params, { t: jwt.token });

    await getAccountDetails();
  };

  const makeWithdrawal = async (txDetails) => {
    const params = {
      user_id: auth.isAuthenticated().user._id,
      withdrawal: { amount: txDetails.withdrawalAmount },
      tx_password: txDetails.withdrawalTxPassword
    }
    const result = await withdraw(params, { t: jwt.token });

    await getAccountDetails();
  }

  return (
    <MainCard title="Account Management">
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
                        Account Balance
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
          <Typography style={{ paddingLeft: 5, paddingBottom: 10 }}>
            {`Account Number: ${details.accountNumber}`}
          </Typography>
          <SubCard title="Make a Deposit">
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

          <Typography textAlign='center' style={{ paddingTop: 50, paddingBottom: 50 }}>
            <img src={logo} alt="Zugzwang" width="180" />
          </Typography>

          <SubCard title="Make a Withdrawal">
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
                withdrawalAmount: '',
                withdrawalTxPassword: '',
                submit: null
              }}
              validationSchema={Yup.object().shape({
                withdrawalAmount: Yup.number().max(10000).required('Withdrawal amount is required'),
                withdrawalTxPassword: Yup.string().max(255).required('Transaction password is required')
              })}
              onSubmit={async (values, { setErrors, setStatus, setSubmitting, resetForm }) => {
                try {
                  setStatus({ success: true });
                  setSubmitting(false);
                  makeWithdrawal(values);
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
                  <FormControl fullWidth error={Boolean(touched.withdrawalAmount && errors.withdrawalAmount)} sx={{ ...theme.typography.customInput }}>
                    <InputLabel htmlFor="withdrawal-amount">Transfer Amount</InputLabel>
                    <OutlinedInput
                      id="withdrawal-amount"
                      type="number"
                      value={values.withdrawalAmount}
                      name="withdrawalAmount"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      label="Withdrawal Amount"
                      // placeholder={0.00}
                      inputProps={{}}
                    />
                    {touched.withdrawalAmount && errors.withdrawalAmount && (
                      <FormHelperText error id="standard-weight-helper-withdrawal-amount">
                        {errors.withdrawalAmount}
                      </FormHelperText>
                    )}
                  </FormControl>


                  <FormControl
                    fullWidth
                    error={Boolean(touched.withdrawalTxPassword && errors.withdrawalTxPassword)}
                    sx={{ ...theme.typography.customInput }}
                  >
                    <InputLabel htmlFor="withdrawal-password">Transaction Password</InputLabel>
                    <OutlinedInput
                      id="withdrawal-password"
                      type={showWithdrawPassword ? 'text' : 'password'}
                      value={values.withdrawalTxPassword}
                      name="withdrawalTxPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowWithdrawalPwd}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            size="large"
                          >
                            {showWithdrawPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Withdrawaml Password"
                      inputProps={{}}
                    />
                    {touched.withdrawalTxPassword && errors.withdrawalTxPassword && (
                      <FormHelperText error id="standard-weight-helper-withdrawal-password">
                        {errors.withdrawalTxPassword}
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
                        Withdraw
                                </Button>
                    </AnimateButton>
                  </Box>
                </form>
              )}
            </Formik>
          </SubCard>

          <Typography textAlign='center' style={{ paddingTop: 50, paddingBottom: 50 }}>
            <img src={logo} alt="Zugzwang" width="180" />
          </Typography>

          <SubCard title="Direct Transfer">
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
                accountNumber: '',
                transferAmount: '',
                transferTxPassword: '',
                submit: null
              }}
              validationSchema={Yup.object().shape({
                accountNumber: Yup.number().required('recipient account number is required'),
                transferAmount: Yup.number().max(10000).required('Transfer amount is required'),
                transferTxPassword: Yup.string().max(255).required('Transaction password is required')
              })}
              onSubmit={async (values, { setErrors, setStatus, setSubmitting, resetForm }) => {
                try {
                  setStatus({ success: true });
                  setSubmitting(false);
                  openDialog(values);
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
                <form noValidate onSubmit={handleSubmit} >
                  <FormControl fullWidth error={Boolean(touched.accountNumber && errors.accountNumber)} sx={{ ...theme.typography.customInput }}>
                    <InputLabel htmlFor="account-number">Recipient Account Number</InputLabel>
                    <OutlinedInput
                      id="account-number"
                      type="number"
                      value={values.accountNumber}
                      name="accountNumber"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      label="Recipient Account "
                      inputProps={{}}
                    />
                    {touched.accountNumber && errors.accountNumber && (
                      <FormHelperText error id="standard-weight-helper-transfer-amount">
                        {errors.accountNumber}
                      </FormHelperText>
                    )}
                  </FormControl>


                  <FormControl fullWidth error={Boolean(touched.transferAmount && errors.transferAmount)} sx={{ ...theme.typography.customInput }}>
                    <InputLabel htmlFor="transfer-amount">Transfer Amount</InputLabel>
                    <OutlinedInput
                      id="transfer-amount"
                      type="number"
                      value={values.transferAmount}
                      name="transferAmount"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      label="Transfer Amount"
                      inputProps={{}}
                    />
                    {touched.transferAmount && errors.transferAmount && (
                      <FormHelperText error id="standard-weight-helper-transfer-amount">
                        {errors.transferAmount}
                      </FormHelperText>
                    )}
                  </FormControl>

                  <FormControl
                    fullWidth
                    error={Boolean(touched.transferTxPassword && errors.transferTxPassword)}
                    sx={{ ...theme.typography.customInput }}
                  >
                    <InputLabel htmlFor="transfer-password">Transaction Password</InputLabel>
                    <OutlinedInput
                      id="transfer-password"
                      type={showTransferPassword ? 'text' : 'password'}
                      value={values.transferTxPassword}
                      name="transferTxPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowTransferPwd}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            size="large"
                          >
                            {showTransferPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Withdrawaml Password"
                      inputProps={{}}
                    />
                    {touched.transferTxPassword && errors.transferTxPassword && (
                      <FormHelperText error id="standard-weight-helper-transfer-password">
                        {errors.transferTxPassword}
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
                        Transfer
                                </Button>
                    </AnimateButton>
                  </Box>
                </form>
              )}
            </Formik>
          </SubCard>


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
                            Transactions History
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
                    <PerfectScrollbar
                      style={{ height: '100%', maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden' }}
                    >
                      <Grid container direction="column" spacing={2}>
                        <Grid item xs={12}>
                          <div style={{ paddingLeft: 10, paddingRight: 10 }}>
                            <TextField
                              id="outlined-select-currency-native"
                              select
                              style={{ borderColor: 'transparent' }}
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
                      </Grid>
                      {/* <NotificationList /> */}
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
        <Grid item xs={12} sm={6}>
          {/* <SubCard title="Transactions Overview">
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <Typography variant="body1" gutterBottom>
                  Transactions made within the platform, such as game wins, losses, and money transfers to other users
                  are instantaneous. Transfers into the platform from Paynow, Ecocash, etc, are subject to small delays.
                  These delays are no more than a few minutes.
                            </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2" gutterBottom>
                  You can keep track of the status of your transactions on this page by observing
                  the status labels that appear on the second line of all listed transactions (i.e., PENDING, SUCCESS, FAILED, etc).
                            </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2" gutterBottom>
                  For support, contact info@zugzwang.co.zw
                            </Typography>
              </Grid>
            </Grid>
          </SubCard> */}
        </Grid>
      </Grid>
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
            <Typography style={{ fontSize: 15 }}>{dialog.text}</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            <Typography style={{ fontSize: 15 }}>Cancel</Typography>
          </Button>
          <Button onClick={makeTransfer}>
            <Typography style={{ fontSize: 15, color: theme.palette.success.dark }}>Yes</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  )

};

export default DepositPage;
