import React, { useEffect, useState } from 'react';
import ReactNotification, { store } from 'react-notifications-component';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import Head from 'next/head';
import useUserFetchCurrentUser from '../../../hooks/user/useUserFetchCurrentUser';
import DefaultLayout from '../../../layouts/DefaultLayout';
import TheHeader from '../../../components/header/TheHeader';
import TheFooter from '../../../components/footer/TheFooter';
import usePageOnLoad from '../../../hooks/page/usePageOnLoad';
import useUserIsLoggedIn from '../../../hooks/user/useUserIsLoggedIn'
import axios from '../../../lib/axios';
import i18n from '../../../i18n/i18n';
import Logger from '../../../lib/logger';
import ProfileInfoSide from '../../../components/pageSection/profile/ProfileInfoSide';
import ReactPaginate from 'react-paginate';
import BaseLoader from '../../../components/base/BaseLoader';

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
    (branch) => branch.id.toString() === branchId
  )[0];

  return {
    props: {
      settings,
      currentBranch
    },
  };
}

export default function Index(props) {
  const { currentBranch } = props;
  useUserFetchCurrentUser();
  usePageOnLoad(props);
  const isloggedin = useUserIsLoggedIn();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [totalPages, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  let maxResultCount = 5;

  const getCouponDetails = async (maxResultCount, skipCount) => {
    try {
      const url = `/customer/web/profile-service/coupons?maxresultcount=${maxResultCount}&skipcount=${skipCount}`;
      const response = await axios.get(url);
      return response.data.result;
    } catch (error) {
      setIsloading(false);
      Logger.error(error);
      return false;
    }
  };

  const inviteFriend = async (phone, email) => {
    try {
      const url = `/customer/web/profile-service/invite-friend`;
      const response = await axios.post(url,
        {
          "email": `${email}`,
          "phone": `${phone}`
        });
      return response.data;
    } catch (error) {
      setIsloading(false);
      Logger.error(error);
      return false;
    }
  }

  const invite = () => {
    setIsloading(true);
    if (phone.trim() === '' && email.trim() === '') {
      return;
    }
    inviteFriend(phone, email).then((response) => {
      setIsloading(false);
      setEmail('');
      setPhone('');
      if (response.success) {
        store.addNotification({
          title: 'Success!',
          message: 'Sent invitation successfully',
          type: 'success',
          insert: 'top',
          container: 'bottom-right',
          dismiss: {
            duration: 3000,
            onScreen: true,
          },
        });
      }
    });
  }

  const getCoupons = (maxResultCount, skipCount) => {
    setIsloading(true);
    getCouponDetails(maxResultCount, skipCount).then((response) => {
      setIsloading(false);
      setCoupons(response.items);
      setTotalCount(response.totalCount);
      setTotalPage(Math.ceil(response.totalCount / maxResultCount));
    });
  }

  useEffect(() => {
    if (!isloggedin) {
      router.push("/")
    }
    getCoupons(maxResultCount, skipCount);
  }, [])

  useEffect(() => {
    getCoupons(maxResultCount, skipCount);
  }, [currentPage]);

  const onPageChange = (page) => {
    setSkipCount(page * maxResultCount);
    setCurrentPage(page);
  };

  return (
    <>
      <Head>
        <title>Coupons</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      { isloggedin && <>
        <DefaultLayout>
          <TheHeader />
          <ReactNotification />
          <ProfileInfoSide pageurl="coupons">
            <section>
              <div className="order-right">
                <form className="search-order flex-center-between">
                  <span className="font-20 font-demi">COUPON</span>
                </form>
                <div className="order-table table-responsive-md">
                  <table className="table table-striped">
                    {isLoading && <BaseLoader />}
                    <thead>
                      <tr>
                        <th scope="col">Code</th>
                        <th scope="col">Expired Date</th>
                        <th scope="col">Branch</th>
                        <th scope="col">Discount</th>
                        <th scope="col"> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons && coupons.map(item => {
                        return (
                          <tr>
                            <th>{item.code}</th>
                            <td>{format(parseISO(item.expiryDate), "dd/MM/yyyy")}</td>
                            <td>{currentBranch.branchName}</td>
                            <td>{item.discountStatement}</td>
                            <td><a href="a" title="" className="link-underline" data-toggle="modal" data-target="#coupon-detail">Detail</a> </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalCount > maxResultCount && <div className="pagi">
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
                  <br />
                </div>}
              </div>
              <div className="order-right mgt-30">
                {isLoading && <BaseLoader />}
                <form className="invited">
                  <h3 className="font-20 font-demi mgb-40">INVITE FRIEND</h3>
                  <div className="label-top relative">
                    <label>Phone number</label>
                    <div className="box-telephone relative">
                      <span className="area-code inflex-center-center">
                        +41
                      </span>
                      <input
                        type="phoneNumber"
                        placeholder="364 239 2830"
                        onChange={(e) => setPhone(e.target.value)}
                        name="phonenumber"
                        className="input-radius h56"
                        value={phone}
                      />
                    </div>
                  </div>
                  <div className="label-top relative">
                    <label>E-mail</label>
                    <input type="text" placeholder="Infor@mail.com" className="input-radius h56" value={email} onChange={(event) => setEmail(event.target.value)} />
                  </div>
                  <div className="text-right">
                    <button type="button" onClick={invite} className="btn btn-yellow btn-h60 font-demi font-20 w230">SEND</button>
                  </div>
                </form>
              </div>
            </section>
          </ProfileInfoSide>
          <TheFooter />
        </DefaultLayout>
      </>}
    </>
  );
}
