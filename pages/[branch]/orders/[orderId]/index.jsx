import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Head from 'next/head';
import { isUndefined } from 'lodash';
import usePageOnLoad from '../../../../hooks/page/usePageOnLoad';
import TheHeader from '../../../../components/header/TheHeader';
import axios from '../../../../lib/axios';
import firebase from '../../../../containers/firebase/firebase';
import MapContainer from '../../../../containers/maps/googleMaps';
import { resetCart } from '../../../../store/actions/cart.actions';
import DateConvert from '../../../../utils/DateConvert';
import Logger from '../../../../lib/logger';
import DefaultLayout from '../../../../layouts/DefaultLayout';
import moment from 'moment';

const selectIcon = (status) =>
({
  New: '/images/icon/lemon.svg',
  Accepted: '/images/icon/cutlery.svg',
  Dispatched: '/images/icon/milk.svg',
  OnTheWay: '/images/icon/bag-delivery.svg',
  Delivered: '/images/icon/check.svg',
  PickedUp: '/images/icon/check.svg',
}[status]);

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
  usePageOnLoad(props);
  const tenantId = props.settings.id;
  const [orderDetail, setOrderDetail] = useState({
    orderHistory: [],
    orderItems: [],
    orderPayment: null
  });
  const [origin, setOrigin] = useState({});
  const [destination, setDestination] = useState({});
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    query: { branch, orderId },
  } = router;
  const paymentTypes = ["Paypal", "Cash", "Card", "Stripe"]
  const db = firebase.firestore();
  const { t } = useTranslation(['common']);


  useEffect(() => {
    dispatch(resetCart());
  }, [dispatch]);

  const getDetails = async () => {
    const response = await axios.get(
      `/customer/web/checkout-service/orders/${orderId}`,
    );
    setOrderDetail(response.data.result);
    setDestination({
      lat: response.data.result.orderAddressFK.latitude,
      lng: response.data.result.orderAddressFK.longitude
    })
  };

  useEffect(() => {
    const unsubscribe = db
      .collection('RestaurantCollection')
      .doc(`Restaurants-${tenantId}`)
      .collection('BranchCollection')
      .doc(`Branch-${branch}`)
      .collection('orders')
      .where('OrderId', '==', orderId)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.data()?.ExpectedDeliveryTime) {
            setExpectedDeliveryTime(moment(doc.data()?.ExpectedDeliveryTime.toDate()).format('DD/MM/YYYY h:mm a'));
          }
          if (orderDetail.status !== doc.data().Status) {
            getDetails();
          }
        });
      });

    return () => {
      unsubscribe();
    };
  }, [branch, orderId, db, tenantId]);

  useEffect(() => {
    getDetails();
  }, []);

  return (
    <div>
      <DefaultLayout>
        <Head>
          <title>Order</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <TheHeader />
        <section className="order" style={{ paddingBottom: '53px' }}>
          <div className="container">
            <div className="row">
              <div className="col-md-2" />
              <div className="col-md-8">
                <div className="order-right">
                  <div className="search-order flex-center-between">
                    <span className="font-14 font-demi">
                      <p>Order : {orderDetail.id}</p>
                      {orderDetail.creationTime &&
                        DateConvert(orderDetail.creationTime)}
                      {expectedDeliveryTime.trim() !== '' && <p className="mgt-10">Delivery Time : {expectedDeliveryTime}</p>}
                    </span>
                    {/* <span className="font-14 font-demi">
                      <p>Delivery Time : {expectedDeliveryTime}</p>
                    </span> */}
                    <div className="search-item flex-center">
                      <div className="select-box relative mgr-15">
                        {orderDetail.orderPayment !== null && orderDetail.orderPayment.paymentStatus.toLowerCase() === "paid" ? (
                          <div className="btn btn-h50 btn-yellow font-demi font-16  inflex-center-center">
                            Paid
                          </div>
                        ) : (
                          <div className="btn btn-h46 btn-red font-demi font-12  inflex-center-center text-white">
                            Not Paid
                          </div>
                        )}
                      </div>
                      <div className="select-box relative mgr-15">
                        <div className="btn btn-h46 font-demi font-12  inflex-center-center">
                          {`${orderDetail.currency || 'CHF'} ` +
                            ` ${orderDetail.finalAmount}`}
                        </div>
                      </div>
                      <div className="select-box relative">
                        <div className="btn btn-h46 btn-blue font-demi font-12  inflex-center-center text-white">
                          {paymentTypes[orderDetail.paymentType - 1]}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="progress-tracking mb-3 mt-4">
                    <h1 className="font-demi font-20 mgb-40 text-center">
                      {t('progress')}
                    </h1>
                    <div className="step-head">
                      <ul className="progressbar">
                        {orderDetail.orderHistory.map((orderPoint) => (
                          <li className={orderPoint?.isCompleted ? 'active' : ''}>
                            <span className="progress-img">
                              <img
                                src={selectIcon(orderPoint.status)}
                                alt=""
                                title=""
                              />{' '}
                            </span>
                            <p>{t(orderPoint.status)}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="order-tracking">
                    {!['DeliveryAccepted'].includes(orderDetail.status) && (
                      <div className="cover-tracking text-center">
                        <p className="mgb-30 order-tracking-image">
                          <img
                            src={orderDetail.customerOrderImage}
                            alt=""
                            title=""
                          />{' '}
                        </p>
                        <div className="max-320 font-18 font-demi">{t()}</div>
                      </div>
                    )}
                    {['DeliveryAccepted'].includes(orderDetail.status) && (
                      <MapContainer
                        destination={destination}
                        origin={origin}
                        tenantId={tenantId}
                        branch={branch}
                        orderId={orderId}
                      ></MapContainer>
                    )}
                  </div>
                  <div className="post-review">
                    <div className="review-author flex flex-wrap">
                      {orderDetail.orderItems.map((item) => {
                        let name = item.mealName;
                        if (item.mealPriceName) {
                          name += ` - ${item.mealPriceName}`
                        }
                        return (
                          <>
                            <div className="flex mgr-15 order-tracking-items">
                              <span className="img-circle-60 mgr-15">
                                <img src={item.imagePath} alt="" title="" />{' '}
                              </span>
                              <div className="author-info">
                                <h2 className="font-20 font-demi">
                                  {name}
                                </h2>
                              </div>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </DefaultLayout>
    </div>
  );
}
