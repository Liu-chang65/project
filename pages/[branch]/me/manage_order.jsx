/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';
import ReactPaginate from 'react-paginate';
import Head from 'next/head';
import Rating from '@material-ui/lab/Rating';
import Box from '@material-ui/core/Box';
import useUserFetchCurrentUser from '../../../hooks/user/useUserFetchCurrentUser';
import DefaultLayout from '../../../layouts/DefaultLayout';
import TheHeader from '../../../components/header/TheHeader';
import TheFooter from '../../../components/footer/TheFooter';
import usePageOnLoad from '../../../hooks/page/usePageOnLoad';
import useUserIsLoggedIn from '../../../hooks/user/useUserIsLoggedIn';
import ManagementSide from '../../../components/pageSection/profile/ManagmentSide';
import DateConvert from '../../../utils/DateConvert';
import axios from '../../../lib/axios';
import firebase from '../../../containers/firebase/firebase';
import Map from '../../../containers/maps/googleMaps';

import ProfileInfoSide from '../../../components/pageSection/profile/ProfileInfoSide';

import { resetCart, fromCart } from '../../../store/actions/cart.actions';
import Logger from '../../../lib/logger';

const selectIcon = (status) =>
({
  New: '/images/icon/lemon.svg',
  Accepted: '/images/icon/cutlery.svg',
  Dispatched: '/images/icon/milk.svg',
  OnTheWay: '/images/icon/bag-delivery.svg',
  Delivered: '/images/icon/check.svg',
  PickedUp: '/images/icon/check.svg',
  PreOrdered: '/images/icon/lemon.svg',
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
  const branchId = context.params.branch;
  const settings = await getSettings();
  // get brach

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
  const { currentBranch } = props;
  useUserFetchCurrentUser();
  usePageOnLoad(props);

  const dispatch = useDispatch();

  useEffect(() => {
    window.location.hash = '';
  }, []);

  const ordersMapRef = useRef({});

  const db = firebase.firestore();

  const { t } = useTranslation(['common']);

  const isFromCart = useSelector((state) => state.cart.fromCart);

  useEffect(() => {
    if (isFromCart) {
      dispatch(resetCart());
      dispatch(fromCart(false));
    }
  }, [isFromCart, dispatch]);

  const [isReceveid, setIsReceived] = useState(false);
  const [totalPages, setTotalPage] = useState(0);
  const [ordersId, setOrdersId] = useState([]);
  const [skipCount, setSkipCount] = useState(0);
  const [orderHistoryData, setOrderHistoryData] = useState([]);
  const [fromDateString, setFromDateString] = useState('');
  const [toDateString, setToDateString] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState('All');
  const [noData, setNoData] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [starValue, setStarValue] = useState({});
  const [comment, setComment] = useState({});
  const [idStarValueGroup, setIdStarValueGroup] = useState({});

  const isloggedin = useUserIsLoggedIn();
  const router = useRouter();

  useEffect(() => {
    if (!isloggedin) {
      router.push('/');
    }
  }, [isloggedin, router]);

  const accessToken = useSelector(
    (state) => state.authentication.currentUser.accessToken,
  );

  const getOrderHistory = async () => {
    try {
      ordersMapRef.current = {};
      setNoData(false);
      setOrderHistoryData([]);
      const url = `/customer/web/checkout-service/orders?MaxResultCount=5&SkipCount=${skipCount}&status=${status}&isIncludeFeedback=true&startDate=${fromDateString}&endDate=${toDateString}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOrderHistoryData(response.data.result.items);
      setTotalCount(response.data.result.totalCount);
      if (response.data.result.totalCount === 0) setNoData(true);
      const page = Math.ceil(response.data.result.totalCount / 5);
      setTotalPage(page);
      return response.data.result;
    } catch (error) {
      Logger.error(error);
      return [];
    }
  };

  useEffect(() => {
    const refreshPage = async () => {
      const data = await getOrderHistory();
      const filteredOrders = data.items.filter(
        (order) =>
          !['Completed', 'Delivered', 'Rejected', 'CustomerRejected'].includes(
            order.status,
          ),
      );
      const ids = filteredOrders.map((order) => order.id);
      setOrdersId(ids);
    }

    refreshPage();
  }, [currentPage]);

  useEffect(() => {
    if (ordersId.length > 0) {
      const unsubscribe = db
        .collection('RestaurantCollection')
        .doc(`Restaurants-${props.settings.id}`)
        .collection('BranchCollection')
        .doc(`Branch-${currentBranch.id}`)
        .collection('orders')
        .where('OrderId', 'in', ordersId)
        .onSnapshot((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (ordersMapRef.current[doc.data().OrderId]) {
              getOrderHistory();
            }
            ordersMapRef.current[doc.data().OrderId] = true;
          });
        });

      return () => {
        unsubscribe();
      };
    }
  }, [ordersId, props.settings.id, currentBranch.id, db]);

  const onPageChange = (page) => {
    ordersMapRef.current = {};
    setCurrentPage(page);
    setSkipCount(page * 5);
  };

  const fromDateChange = (date) => {
    if (date == null) {
      setFromDateString('');
      setFromDate('');
      return;
    }
    const fromdate = `${date.getFullYear()}/${date.getMonth() + 1
      }/${date.getDate()}`;
    setFromDateString(fromdate);
    setFromDate(date);
  };

  const toDateChange = (date) => {
    if (date == null) {
      setToDateString('');
      setToDate('');
      return;
    }
    const todate = `${date.getFullYear()}/${date.getMonth() + 1
      }/${date.getDate()}`;
    setToDateString(todate);
    setToDate(date);
  };

  const searchWithDate = (e) => {
    e.preventDefault();
    getOrderHistory();
  };

  const getStatus = (e) => {
    setStatus(e.target.value);
  };

  const changeStarFeedback = (e, newValue) => {
    const parentName = e.target.parentElement.parentElement.parentElement.getAttribute(
      'name',
    );
    setStarValue((prevState) => ({
      ...prevState,
      [e.target.name]: newValue,
    }));
    if (idStarValueGroup[parentName]) {
      if (idStarValueGroup[parentName].indexOf(e.target.name) < 0)
        setIdStarValueGroup({
          ...idStarValueGroup,
          [parentName]: [...idStarValueGroup[parentName], e.target.name],
        });
    } else {
      setIdStarValueGroup({
        ...idStarValueGroup,
        [parentName]: [e.target.name],
      });
    }
  };

  const commentChange = (e) => {
    const { name } = e.target;
    setComment({
      ...comment,
      [name]: e.target.value,
    });
    Logger.log(comment);
  };

  const submitFeedback = async (e) => {
    const orderItem = e.target.name;
    const commentOfItem = comment[orderItem];
    const keys = idStarValueGroup[orderItem];
    const values = [];
    keys.map((key) => values.push(starValue[key]));
    const result = {};
    keys.forEach((key, i) => (result[key] = values[i]));
    const url = `customer/web/checkout-service/orders/${orderItem}/feedback`;
    try {
      const res = await axios.post(
        url,
        {
          Rating: result,
          Comment: commentOfItem,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      Logger.log(res);
    } catch (error) {
      Logger.log(error);
    }
  };
  return (
    <>
      <Head>
        <title>Manage Order</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <>
        <DefaultLayout>
          <TheHeader />
          <ProfileInfoSide pageurl="manage_order">
            <section>
              <div className="order-right">
                <form
                  className="search-order search-order-history"
                  onSubmit={searchWithDate}
                >
                  <div className="search-item">
                    <label>{t('status')}</label>
                    <div className="select-box relative">
                      <select className="baris-blank" onChange={getStatus}>
                        <option>{t('all')}</option>
                        <option>{t('pending')}</option>
                        <option>{t('active')}</option>
                        <option>{t('completed')}</option>
                      </select>
                      <span className="arrow-abs ti-angle-down" />
                    </div>
                  </div>
                  <div className="search-item search-date">
                    <label>{t('from_date')}</label>
                    <div className="input-group date">
                      <DatePicker
                        className="baris-blank"
                        placeholderText="MM/DD/YYYY"
                        selected={fromDate}
                        onChange={fromDateChange}
                      />
                      <span className="input-group-addon">
                        <i className="fa fa-calendar" />
                      </span>
                    </div>
                  </div>
                  <div className="search-item search-date">
                    <label>{t('to_date')}</label>
                    <div className="input-group date">
                      <DatePicker
                        className="baris-blank"
                        placeholderText="MM/DD/YYYY"
                        selected={toDate}
                        onChange={toDateChange}
                      />
                      <span className="input-group-addon">
                        <i className="fa fa-calendar" />
                      </span>
                    </div>
                  </div>
                  <div className="search-item search-item-button ">
                    <label> </label>
                    <button
                      type="button"
                      className="btn btn-h50 btn-yellow font-demi font-16  inflex-center-center"
                      onClick={getOrderHistory}
                    >
                      {t('search')}
                    </button>
                  </div>
                </form>
              </div>
              {orderHistoryData.length === 0 ? (
                noData ? (
                  <div
                    className="order-right order-track"
                    style={{ textAlign: 'center' }}
                  >
                    {t('no_data')}
                  </div>
                ) : (
                  <div className="order-right order-track">
                    <div className="search-order flex-center-between">
                      <span className="ordertype-shine shine" />
                      <div className="search-item flex-center">
                        <div className="select-box relative mgr-15">
                          <div className="btn-h46-shine shine" />
                        </div>
                        <div className="select-box relative mgr-15">
                          <div className="btn-h46-shine shine" />
                        </div>
                        <div className="select-box relative">
                          <div className="btn-h46-shine shine" />
                        </div>
                      </div>
                    </div>
                    <div className="post-review">
                      <div className="review-author flex">
                        <span className="img-circle-shine mgr-15 shine">
                          <img alt="" title="" />{' '}
                        </span>
                        <div className="author-info">
                          <h2 className="star-rate-shine shine" />
                          <br />
                          <div className="star-rate-shine shine" />
                        </div>
                      </div>
                      <div className="post-comment-shine flex-center mgb-30 shine" />
                    </div>
                  </div>
                )
              ) : (
                orderHistoryData.map((data) => (
                  <div className="order-right order-track p-3">
                    <div className="search-order flex-center-between">
                      <span className="font-14 font-demi">
                        <p>Order : {data.id}</p>
                        {DateConvert(data.creationTime)}
                      </span>
                      <div className="search-item flex-center">
                        <div className="select-box relative mgr-15">
                          {data.isPaid ? (
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
                            {`${data.currency || 'CHF'} ` +
                              ` ${data.finalAmount}`}
                          </div>
                        </div>
                        <div className="select-box relative">
                          <div className="btn btn-h46 btn-blue font-demi font-12  inflex-center-center text-white">
                            {data.paymentType}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="progress-tracking mb-3">
                      <h1 className="font-demi font-20 mgb-40 text-center">
                        {t('progress')}
                      </h1>
                      <div className="step-head">
                        <ul className="progressbar">
                          {(data.orderHistory || []).map((orderPoint) => (
                            <li
                              className={
                                orderPoint?.isCompleted ? 'active' : ''
                              }
                            >
                              <span className="progress-img">
                                <img
                                  src={selectIcon(orderPoint.status)}
                                  alt=""
                                  title=""
                                />{' '}
                              </span>
                              <p>{t(`${orderPoint.status}`)}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="order-tracking">
                      {data.Status === 'Completed' &&
                        data.orderDeliveryType !== 'Delivery' && (
                          <div className="cover-tracking text-center">
                            <p className="font-24 font-demi mgb-30">
                              {t('ready_meal')}
                            </p>
                            <p>
                              <img
                                src="/images/picture/image-3.png"
                                alt=""
                                title=""
                              />{' '}
                            </p>
                            <div className="flex-center-center group-btn-deliver">
                              <button
                                type="button"
                                className="btn btn-yellow btn-h60 font-18 font-demi"
                                onClick={() => setIsReceived(true)}
                              >
                                {t('picked_up')}
                              </button>
                              <button
                                type="button"
                                className="btn btn-white btn-h60 font-18 font-demi"
                              >
                                {t('something_wrong')}
                              </button>
                            </div>
                          </div>
                        )}
                      {/* {data.Status === 'Completed' &&
                        data.orderDeliveryType ===
                          'Delivery'(
                            <div className="cover-tracking text-center">
                              <p className="font-24 font-demi mgb-30">
                                {t('enjoy_meal')}
                              </p>
                              <p>
                                <img
                                  src="/images/picture/image-4.png"
                                  alt=""
                                  title=""
                                />{' '}
                              </p>
                              <div className="tracking-share">
                                <div className="feedback font-24">
                                  Let us know how you feel!{' '}
                                  <a href="" title="">
                                    Feedback
                                  </a>
                                </div>
                                <div className="share-friend font-24 font-medium">
                                  <span>Share your feeling with friends:</span>
                                  <a href="" title="">
                                    <img
                                      src="/images/icon/icon-facebook.svg"
                                      alt=""
                                      title=""
                                    />{' '}
                                  </a>
                                  <a href="" title="">
                                    <img
                                      src="/images/icon/icon-instagram.svg"
                                      alt=""
                                      title=""
                                    />{' '}
                                  </a>
                                  <a href="" title="">
                                    <img
                                      src="/images/icon/icon-twitter.svg"
                                      alt=""
                                      title=""
                                    />{' '}
                                  </a>
                                </div>
                              </div>
                            </div>,
                          )} */}
                      {data.Status === 'OnTheWay' &&
                        data.orderDeliveryType === 'Delivery' && (
                          <Map lat={40.854885} lng={88.081807} />
                        )}
                      {data.Status === 'Completed' &&
                        data.orderDeliveryType === 'Delivery' && (
                          <div className="cover-tracking text-center">
                            <p className="font-24 font-demi mgb-30">
                              {t('delivered_meal')}
                            </p>
                            <p>
                              <img
                                src="/images/picture/map-colour.png"
                                alt=""
                                title=""
                              />{' '}
                            </p>
                            <div className="flex-center-center group-btn-deliver">
                              <button
                                type="button"
                                className="btn btn-yellow btn-h60 font-18 font-demi"
                                onClick={() => setIsReceived(true)}
                              >
                                {t('received_meal')}
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                    <div className="post-review">
                      <div className="review-author flex">
                        {data.orderItems.map((item, index) => {
                          return (
                            <>
                              <span className="img-circle-60 mgr-15">
                                <img src={data.image} alt="" title="" />{' '}
                              </span>
                              <div className="author-info">
                                <h2 className="font-20 font-demi">
                                  {item.mealName} - {item.mealPriceName}
                                </h2>
                                <div className="star-rate" name={data.id}>
                                  {data.status === 'Completed' && (
                                    <Box
                                      component="fieldset"
                                      mb={3}
                                      borderColor="transparent"
                                    >
                                      <Rating
                                        name={item.id}
                                        value={
                                          data.feedback
                                            ? data.feedback.Rating[
                                            data.orderItems[index].id
                                            ]
                                            : starValue[item.id]
                                        }
                                        onChange={changeStarFeedback}
                                      />
                                    </Box>
                                  )}
                                </div>
                              </div>
                            </>
                          );
                        })}
                      </div>
                      {data.status !== 'Completed' ? null : (
                        <div className="post-comment flex-center mgb-30">
                          <span className="img-circle mgr-15">
                            <img
                              src="/images/picture/user.png"
                              alt=""
                              title=""
                            />{' '}
                          </span>
                          <div className="label-top relative">
                            <label>{t('comment')}</label>
                            <button
                              type="button"
                              className="btn btn-h50 btn-yellow font-demi font-16  inflex-center-center submit-button"
                              name={data.id}
                              onClick={submitFeedback}
                            >
                              {t('submit')}
                            </button>
                            {data.feedback && data.feedback.Comment ? (
                              <input
                                name={data.id}
                                className="input-radius h56"
                                value={
                                  data.feedback
                                    ? data.feedback.Comment
                                    : comment[data.id]
                                }
                                onChange={commentChange}
                              />
                            ) : (
                              <p>{data.feedback.Comment}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {totalCount > 5 && (
                <div className="order-right">
                  <div style={{ height: '50px' }} />
                  {totalPages > 0 && (
                    <div className="pagi">
                      <ul className="flex-center-center">
                        <ReactPaginate
                          pageCount={totalPages}
                          pageRangeDisplayed={5}
                          marginPagesDisplayed={1}
                          previousLabel={<i className="ti-angle-left" />}
                          nextLabel={<i className="ti-angle-right" />}
                          nextClassName="active"
                          previousClassName="active"
                          activeClassName="current"
                          containerClassName="d-flex pagenation"
                          onPageChange={(page) => onPageChange(page.selected)}
                          hrefBuilder={() => { }}
                        />
                      </ul>
                    </div>
                  )}
                  <footer style={{ height: '50px' }} />
                </div>
              )}
            </section>
          </ProfileInfoSide>
          <TheFooter />
        </DefaultLayout>
      </>
    </>
  );
}
