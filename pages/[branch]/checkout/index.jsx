/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { isUndefined } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import LoadingOverlay from 'react-loading-overlay';
import { toast } from 'react-toastify';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { DateTimePicker, TimePicker } from '@material-ui/pickers';
import usePageOnLoad from '../../../hooks/page/usePageOnLoad';
import useUserIsLoggedIn from '../../../hooks/user/useUserIsLoggedIn';
import DefaultLayout from '../../../layouts/DefaultLayout';
import useUserFetchCurrentUser from '../../../hooks/user/useUserFetchCurrentUser';
import TheHeader from '../../../components/header/TheHeader';
import TheFooter from '../../../components/footer/TheFooter';
import axios from '../../../lib/axios';
import NewAddressForm from '../../../components/checkout/newAddress/NewAddressPanel';
import {
  setBackendOrder,
  setFinalAmount,
  fromCart,
} from '../../../store/actions/cart.actions';
import { closeCartDetailsModal } from '../../../store/actions/layout.actions';
import Logger from '../../../lib/logger';
import TotalMenu from '../../../components/checkout/totalMenu/TotalMenu';
import PaymentMethod from '../../../components/checkout/paymentMethod/PaymentMethod';
import ShippingAddress from '../../../components/checkout/shippingAddress/ShippingAddress';
import ProductList from '../../../components/checkout/productList/ProductList';
import AddItem from '../../../components/checkout/addItem/AddItem';
import _ from 'lodash';
const moment = require('moment-timezone');

export const useStyles = makeStyles(() => ({
  inputColor: {
    '&:before': {
      opacity: 0,
    },
    '&:after': {
      opacity: 0,
    },
  },
}));

const materialTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#F3AE0C',
    },
  },
});

const getSettings = async () => {
  try {
    const url = `/settings?mediaTypeFilters=LOGO&mediaTypeFilters=FAVI_ICON&mediaTypeFilters=MOBILE_PROFILE_IMAGE&mediaTypeFilters=MOBILE_START_SCREEN&mediaTypeFilters=MOBILE_WELCOME_SCREEN`;
    const response = await axios.get(url);

    return response.data.result;
  } catch (error) {
    Logger.error(error);
    return [];
  }
};

export async function getServerSideProps(context) {
  if (isUndefined(context.params)) {
    if (context.res) {
      context.res.statusCode = 404;
      context.res.end('Not found');
      return <ErrorPage />;
    }
  }

  const branchId = context.params.branch;
  const settings = await getSettings();

  // get current branch
  const { branches } = settings;
  const currentBranch = branches.filter(
    (branch) => branch.id.toString() === branchId,
  )[0];

  return {
    props: {
      settings,
      currentBranch,
    },
  };
}

export default function Index(props) {
  const accessToken = useSelector(
    (state) => state.authentication.currentUser.accessToken,
  );
  const hourFormat = useSelector((state) => state.root.settings.hourFormat);
  const { currentBranch } = props;
  useUserFetchCurrentUser();
  usePageOnLoad(props);
  const stripeKey = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const classes = useStyles();
  const position = useSelector(state => state.position);
  const postalCode = position.result?.zone?.postalCode || '';
  const currentAddress = position.result?.fullAddress || '';
  useEffect(() => {
    dispatch(closeCartDetailsModal());
  }, [dispatch]);

  const isloggedin = useUserIsLoggedIn();

  const {
    deliveryType,
    backendOrder,
    productsBatch,
    country: savedCountry,
    province: savedProvince,
  } = useSelector((state) => state.cart);
  const { timeZone } = useSelector((state) => state.root.settings)
  const [clockOpen, isClockOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [date, setDate] = useState(null);
  const [isAsap, setIsAsap] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePayments, setAvailablePayments] = useState({});
  const [order, setOrder] = useState({
    orderItems: [],
    finalAmount: 0,
    orderItemsTotal: 0,
    taxVariation: "EXCLUSIVE",
    tax: 0,
    taxPercentage: 0,
    totalAfterTax: 0,
    paymentCommission: 0,
    deliveryCharge: 0,
    coupon: 0
  });
  const [isOpen, setIsOpen] = useState(false);
  const [nextOpeningTime, setNextOpeningTime] = useState('');
  const [isBranchOpen, setIsBranchOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    streetName: '',
    doorNumber: '',
    city: '',
    postalCode: { zip: '', id: '', value: '' },
    province: { name: '', id: '', value: '' },
    country: { name: '', id: '', value: '' },
  });
  const { currentUser } = useSelector((state) => state.authentication);
  const { currency } = useSelector((state) => state.root.settings);
  const { t } = useTranslation('common');
  const updateTargetValues = (name) => (obj) => {
    setFormData({ ...formData, [name]: obj });
  };
  const updateForm = (name) => (event) => {
    setFormData({ ...formData, [name]: event.target.value });
  };

  const updateObjFormValue = (name, field) => (event) => {
    setFormData({
      ...formData,
      [field]: { ...formData[field], [name]: event.target.value },
    });
  };

  useEffect(() => {
    if (!selectedPayment) {
      return;
    }
    const refreshOrder = async () => {
      try {

        const response = await axios.post(
          `/customer/web/checkout-service/orders/${order.id}/value`,
          {
            "orderPaymentType": `${selectedPayment}`,
            "couponCode": order.couponCode,
          }
        );
        let updatedOrder = response?.data?.result;
        let orderData = { ...order, ...updatedOrder }

        switch (selectedPayment) {
          case 'Stripe': orderData.paymentType = 4; break;
          case 'Card': orderData.paymentType = 3; break;
          case 'Cash': orderData.paymentType = 2; break;
        }

        setOrder(orderData)
        dispatch(setBackendOrder(orderData));
        dispatch(setFinalAmount(orderData.finalAmount));
      } catch (error) {
        toast.error(error.response.data.error.message);
      }
    }
    refreshOrder();

  }, [selectedPayment])

  useEffect(() => {
    const fetchOrderItem = async () => {
      try {
        if (!backendOrder || !backendOrder.id) {
          return;
        }
        const result = await axios.get(
          `/customer/web/checkout-service/orders/${backendOrder.id}`,
          {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : undefined,
          },
        );
        const data = result.data.result;
        if (data.orderRequestedDateTime && new Date(data.orderRequestedDateTime).getFullYear() !== 1) {
          setIsAsap(false);
          const estMoment = moment(data.orderRequestedDateTime).tz(timeZone.name, true);
          setDate(moment.utc(estMoment).format('MMM DD YYYY HH:mm'));
        }
        setOrder(data);
        dispatch(setBackendOrder(data));
        dispatch(setFinalAmount(data.finalAmount));
        if (deliveryType === 'Delivery') {
          setFormData({
            province: { ...savedProvince },
            country: { ...savedCountry },
            name: data.orderAddressFK.customerName,
            phone: data.customerPhone,
            email: data.customerEmail,
            streetName: data.orderAddressFK.street,
            doorNumber: data.orderAddressFK.no,
            city: data.orderAddressFK.city,
            postalCode,
          });
        }
      } catch (err) {
        toast.error(err.response.data.error.message);
      }
    };
    fetchOrderItem();
  }, [backendOrder.id, dispatch, postalCode]);

  useEffect(() => {
    setOrder({ ...order, ...backendOrder });
    setSelectedPayment(backendOrder.paymentType)
  }, [backendOrder]);

  useEffect(() => {
    const fetchAvailablePayments = async () => {
      const result = await axios.get(
        '/customer/web/checkout-service/payment-methods',
        {
          params: { branchId: currentBranch.id },
        },
      );
      setAvailablePayments(result.data.result);
      stripeKey.current = loadStripe(
        result.data.result.paymentGatewayDetails[
        'App.Restaurant.PaymentSettings.Stripe.PublishableKey'
        ],
      );
    };
    // get the next opening time and restaurant open / close status
    const getBranchOpenCloseStatus = async () => {
      try {
        const details = await axios.get(`/restaurant/${currentBranch.id}/next-opening-time`);
        setIsBranchOpen(details.data.result.isOpened);
        if (_.has(details.data.result, 'nextOpeningTime')) {
          const estMoment = moment(details.data.result.nextOpeningTime).tz(timeZone.name, true);
          setNextOpeningTime(moment.utc(estMoment).format('DD/MM/YYYY HH:mm'));
        }
      } catch (error) {
        toast.error(error);
      }
    }
    fetchAvailablePayments();
    getBranchOpenCloseStatus();
  }, [currentBranch.id]);

  useEffect(() => {
    window.location.hash = '';
  }, []);

  const minCartValue = useMemo(() => {
    if (typeof window === 'undefined') {
      return 0;
    }

    if (!position) {
      return 0;
    }

    return position.result?.zone?.minOrderValue || 0;
  }, [position]);
  const isLessThanMinCart = backendOrder.finalAmount < minCartValue;
  const isOrderRequestedForPastDateTime = (dateValue) => {
    if (moment().diff(dateValue, 'seconds') > 0) {
      setDate(null);
      toast.error('Please Select a Future Date Time');
      return true;
    }
    return false;
  }
  const handleCheckout = async () => {
    // check order requested date 
    if (!isAsap && isOrderRequestedForPastDateTime(backendOrder.orderRequestedDateTime)) {
      return;
    }
    // Get Stripe.js instance
    const stripe = await stripeKey.current;
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        isWebPayment: selectedPayment === 'Stripe' || selectedPayment === 4,
        stripeApiVersion:
          selectedPayment === 'Stripe' || selectedPayment === 4
            ? availablePayments.paymentGatewayDetails.APIVERSION
            : '',
      }).toString();

      const response = await axios.post(
        `/customer/web/checkout-service/process-order?` + params,
        {
          ...backendOrder,
          paymentType: selectedPayment,
          isPaymentDeviceRequired: selectedPayment === 'Card',
          isAsap: isAsap ? isBranchOpen : isAsap,
          orderRequestedDateTime: isAsap ? (!isBranchOpen ? moment(nextOpeningTime, 'DD/MM/YYYY HH:mm').tz(timeZone.name).format().split('+')[0] : null) : moment(date).tz(timeZone.name).format().split('+')[0],
          orderType: isAsap && isBranchOpen ? 'CurrentOrder' : 'PreOrder',
        },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        }
      );

      const session = response.data.result?.sessionId;
      if (!session) {
        dispatch(fromCart(true));
        return isloggedin
          ? router.push(
            `/[branch]/me/manage_order`,
            `/${backendOrder.branchId}/me/manage_order`,
          )
          : router.push(
            `/[branch]/orders/[orderId]`,
            `/${backendOrder.branchId}/orders/${backendOrder.id}`,
          );
      }
      // When the customer clicks on the button, redirect them to Checkout.
      if (session) {
        dispatch(fromCart(true));
        await stripe.redirectToCheckout({
          sessionId: session,
        });
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response.data.error.message);
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      // using `result.error.message`.
    }
  };

  const updateOrder = useCallback(
    (isAsap, dateValue) => {
      // if the branch is closed then asap will 
      // be false and the next delivery time will be the branch opening time.

      if (dateValue) {
        setDate(moment(dateValue.toISOString()).format('MMM DD YYYY HH:mm'));
      }
      const handleUpdate = async () => {
        try {
          setIsLoading(true);
          const { data } = await axios.post(
            '/customer/web/checkout-service/order',
            {
              ...backendOrder,
              isAsap,
              orderType: isAsap ? 'CurrentOrder' : 'PreOrder',
              orderRequestedDateTime: isAsap ? (!isBranchOpen ? moment(nextOpeningTime, 'DD/MM/YYYY HH:mm').tz(timeZone.name).format() : null) : moment(dateValue.toISOString()).tz(timeZone.name).format(),
            },
            {
              headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : undefined,
            },
          );
          dispatch(setBackendOrder(data.result));
          dispatch(setFinalAmount(data.result.finalAmount));
          toast.success(t('api_order'));
        } catch (error) {
          toast.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      handleUpdate();
    },
    [t, backendOrder, date, dispatch],
  );

  const dateTimeChange = (dateValue) => {
    if (isOrderRequestedForPastDateTime(dateValue)) {
      return;
    }
    updateOrder(false, dateValue);
    isClockOpen(false);
  }

  return (
    <LoadingOverlay active={isLoading} spinner text="">
      <Head>
        <title>Checkout</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <DefaultLayout>
        <TheHeader />
        <NewAddressForm
          isOpen={isOpen}
          handleClose={() => setIsOpen(false)}
          updateForm={updateForm}
          formData={formData}
          backendOrderItem={order}
          updateObjFormValue={updateObjFormValue}
          updateTargetValues={updateTargetValues}
          savedPostalCode={{ id: position.result?.zone?.postalCodeId, zip: postalCode, value: postalCode }}
        />
        <section className="wrapper-gray">
          <div className="container">
            <div className="confirm-checkout wrapper-white pd-55">
              <div className="cofirm-item">
                <ProductList order={order} productsBatch={productsBatch} setIsLoading={setIsLoading} setOrder={setOrder} isLessThanMinCart={isLessThanMinCart} minCartValue={minCartValue} />
                <AddItem currentBranch={currentBranch} />
                {(
                  <div className="menu-item menu-item-pick">
                    <h2 className="font-24 font-demi mgb-40 flex-center">
                      <img
                        src="/images/icon/icon-clock.svg"
                        alt=""
                        title=""
                        className="mgr-15"
                      />
                      {t('delivery_time')}{' '}
                    </h2>
                    <div className="box-060">
                      <div className="row">
                        <div className="col-md-6">
                          <label className="label-check relative">
                            <input
                              type="radio"
                              name="delivery-time"
                              className="hide-abs"
                              checked={isAsap}
                              onClick={() => {
                                setIsAsap(true);
                                updateOrder(true);
                                setDate(null);
                              }}
                            />
                            <span>{t('quickest')}</span>
                            {!isBranchOpen && <div className="note-warning font-18 font-medium mgt-20 text-red flex-center">
                              <img
                                src="/images/icon/c-warning.svg"
                                alt=""
                                className="mgr-15"
                              />
                              {`Next opening time ${nextOpeningTime}`}
                            </div>}
                          </label>
                        </div>
                        <div className="col-md-6">
                          <label className="label-check relative check-flex">
                            <input
                              type="radio"
                              name="delivery-time"
                              className="hide-abs"
                              checked={!isAsap}
                              onClick={() => {
                                setIsAsap(false);
                                isClockOpen(true);
                              }}
                            />
                            <span>
                              <span>{t('specific_time')}:</span>
                              <div>
                                <ThemeProvider theme={materialTheme}>
                                  <DateTimePicker
                                    ampm={false}
                                    className="input-time text-center"
                                    autoOk
                                    open={clockOpen}
                                    onChange={(dateValue) => dateTimeChange(dateValue)}
                                    onClose={() => isClockOpen(false)}
                                    onAccept={() => updateOrder(false)}
                                    value={date}
                                    disabled={isAsap}
                                    disablePast
                                    InputProps={{
                                      className: classes.inputColor,
                                    }}
                                  />
                                </ThemeProvider>
                              </div>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {<ShippingAddress currentBranch={currentBranch} backendOrder={backendOrder} currentUser={currentUser} setIsOpen={setIsOpen} postalCode={postalCode} savedCountry={savedCountry} savedProvince={savedProvince} />}
                <PaymentMethod onChange={(event) => { setSelectedPayment(event.target.value) }} availablePayments={availablePayments} order={order} />
                <TotalMenu currency={currency} order={order} isLessThanMinCart={isLessThanMinCart} handleCheckout={() => handleCheckout()} />
              </div>
            </div>
          </div>
        </section>
        <TheFooter />
      </DefaultLayout>
    </LoadingOverlay>
  );
}
