/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';
import ReactNotification, { store } from 'react-notifications-component';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-nextjs-toast';
import _ from 'lodash';
import Head from 'next/head';
import DefaultLayout from '../../../layouts/DefaultLayout';
import TheHeader from '../../../components/header/TheHeader';
import TheFooter from '../../../components/footer/TheFooter';
import axios from '../../../lib/axios';
import Autocomplete from '../../../components/element/Autocomplete';
import ProfileInfoSide from '../../../components/pageSection/profile/ProfileInfoSide';
import usePageOnLoad from '../../../hooks/page/usePageOnLoad';
import useUserFetchCurrentUser from '../../../hooks/user/useUserFetchCurrentUser';
import useUserIsLoggedIn from '../../../hooks/user/useUserIsLoggedIn';
import getUserDetails from '../../../hooks/dataFetching/useUserDetails';
import ModalAuthenticationVerifyPhone from '../../../components/modal/authentication/ConfirmCodeVerifyPhone';

import { saveInfo } from '../../../store/actions/authentication.actions';
import Logger from '../../../lib/logger';

const getSettings = async () => {
  try {
    const url = `settings?mediaTypeFilters=LOGO&mediaTypeFilters=FAVI_ICON&mediaTypeFilters=MOBILE_PROFILE_IMAGE&mediaTypeFilters=MOBILE_START_SCREEN&mediaTypeFilters=MOBILE_WELCOME_SCREEN`;
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
  // get current branch
  const { branches } = settings;
  const currentBranch = branches.filter((branch) => {
    return branch.id === parseInt(branchId);
  })[0];
  // if branch is not found
  if (_.isNil(currentBranch)) {
    context.res.statusCode = 404;
    context.res.end('Not found');
    return { props: {} };
  }

  return {
    props: {
      settings,
      currentBranch,
    },
  };
}

function BasicInfo(props) {
  useUserFetchCurrentUser();
  usePageOnLoad(props);

  const dispatch = useDispatch();
  const userData = useSelector((state) => state.authentication.basicInfo);
  const [isOpen, setIsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(userData);
  const [inputValues, setInputValues] = useState({});
  const [phoneEditable, setPhoneEditable] = useState(false);
  const { currentUser } = useSelector((state) => state.authentication);
  const [postalCodeData, setPostalCodeData] = useState([]);
  const [provinceData, setProvinceData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [cityName, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [inputPostal, setInputPostal] = useState({
    zip: '',
    id: '',
    value: '',
  });

  const isloggedin = useUserIsLoggedIn();
  const router = useRouter();

  const { t } = useTranslation(['common']);

  useEffect(() => {
    if (isloggedin && _.isEmpty(userData)) {
      const fetchUserData = async () => {
        const userResponse = await getUserDetails();
        dispatch(saveInfo(userResponse));
      };
      fetchUserData();
    }
  }, [isloggedin, dispatch, userData]);

  const accessToken = useSelector(
    (state) => state.authentication.currentUser.accessToken,
  );

  const getProvinces = async (countryId, userDetails) => {
    try {
      let url = '';
      if (countryId) {
        url = `/settings/countries/${countryId}/provinces`;
      } else {
        url = `/settings/countries/1/provinces`;
      }

      const res = await axios.get(url);
      setProvinceData(res.data.result);
      const province = res.data.result.filter((prov) => {
        if (prov.id == userDetails.provinceId) return prov;
      });

      return res.data.result;
    } catch (error) {
      Logger.error(error);
      return [];
    }
  };

  const getCountry = async (userDetails) => {
    try {
      const url = `/settings/countries`;
      const res = await axios.get(url);
      setCountryData(res.data.result);
      const country = res.data.result.filter((country) => {
        if (country.id == userDetails.countryId) return country;
      });

      getProvinces(userDetails.countryId, userDetails);
      return res.data.result;
    } catch (error) {
      Logger.error(error);
      return [];
    }
  };

  useEffect(() => {
    setUserDetails(userData);
    if (userData) {
      setInputValues({
        firstname: userData.name,
        lastname: userData.surname,
        streetname: userData.streetName,
        doornr: userData.doorNumber,
        postalcode: userData.postalCodeId,
        city: userData.city,
        province_id: userData.provinceId,
        countryId: userData.countryId,
        phonenumber: userData.phoneNumber ? userData.phoneNumber.slice(3) : '',
        phoneHeader: userData.phoneNumber
          ? userData.phoneNumber.slice(0, 3)
          : '',
        email: userData.email,
      });

      setCountry(userData.countryId);
      setProvince(userData.provinceId);
      setInputPostal({
        zip: userData.postalCodeFK?.zip || '',
        id: userData.postalCodeFK?.id || '',
        value: userData.postalCodeFK?.zip || '',
      });
    }
    getCountry(userData);
  }, []);

  useEffect(() => {
    if (!isloggedin) {
      router.push('/');
    }
  }, [isloggedin, router]);

  const getCityFromAuto = (value) => {
    Logger.log(value, 'cityname');
  };

  const getProvinceFromAuto = (value) => {
    Logger.log(value, 'province');
  };

  const getCountryFromAuto = (value) => {
    Logger.log(value, 'country');
  };

  const postUserDetails = async (data) => {
    try {
      const url = '/customer/web/profile-service/me';
      const response = await axios.post(url, data, {
        // headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.data) {
        store.addNotification({
          title: 'Success!',
          message: 'Data saved successfully',
          type: 'success',
          insert: 'top',
          container: 'bottom-right',
          dismiss: {
            duration: 3000,
            onScreen: true,
          },
        });
      }

      return response.data.result;
    } catch (error) {
      Logger.error(error);
      return false;
    }
  };

  const getPostalCode = async (val) => {
    try {
      const url = `customer/web/home-service/postal-codes?postalCodeSearch=${val}`;
      const response = await axios.get(url);
      return response.data.result;
    } catch (error) {
      showErrorMessage(t('an_error_happend'));
      return [];
    }
  };

  const verifyPhone = async () => {
    const { phonenumber } = inputValues;
    const url = `/customer/send-phone-verification-code?phone=+41${phonenumber}`;
    try {
      const res = await axios.post(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.data.success) {
        store.addNotification({
          title: 'Success!',
          message: 'Phone verification code is successfully sent to your phone',
          type: 'success',
          insert: 'top',
          container: 'bottom-right',
          dismiss: {
            duration: 3000,
            onScreen: true,
          },
        });
        setIsOpen(true);
      }
    } catch (error) {
      Logger.log(error);
    }
  };

  useEffect(() => {
    if (currentUser.isPhoneConfirmed) setPhoneEditable(true);
  }, [currentUser.isPhoneConfirmed]);

  const getPostalCodeFromAuto = async (e) => {
    setInputPostal({ zip: '', id: '', value: e.target.value });
    if (e.target.value === '') return;
    const codes = await getPostalCode(e.target.value);
    setPostalCodeData(codes);
  };

  const onPostalCodeClick = (postalCode) => {
    setInputPostal({ ...postalCode, value: postalCode.zip });
    setPostalCodeData([]);
  };

  const onSave = (e) => {
    e.preventDefault();

    const data = {
      surname: inputValues.lastname,
      name: inputValues.firstname,
      avatar: userDetails.avatar || '',
      doorNumber: inputValues.doornr,
      streetName: inputValues.streetname,
      postalCodeId: Number(inputPostal.id),
      city: inputValues.city,
      provinceId: province,
      countryId: country,
      id: userDetails.id,
    };

    postUserDetails(data);
  };

  const onInputHandle = (e) => {
    setInputValues({
      ...inputValues,
      [e.target.name]: e.target.value,
    });
  };

  const onPhoneEdit = () => {
    setPhoneEditable(false);
  };

  return (
    <>
      <Head>
        <title>Basic Info</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {isloggedin && (
        <DefaultLayout>
          <ToastContainer align="right" position="top" id="basicinfoSaved" />
          {isOpen && (
            <ModalAuthenticationVerifyPhone
              inputValues={inputValues}
              handleClose={() => setIsOpen(false)}
              onInputHandle={onInputHandle}
              verifyPhone={verifyPhone}
            />
          )}
          <ReactNotification />
          <TheHeader />
          <ProfileInfoSide pageurl="basic_info">
            <div>
              <div className="order-right">
                <ToastContainer
                  align="right"
                  position="top"
                  id="phone-Verify"
                />
                <form className="profile-form" onSubmit={onSave}>
                  <h1 className="font-20 font-demi mgb-60">
                    BASIC INFORMATION
                  </h1>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="label-top relative">
                        <label>First name</label>
                        <input
                          type="text"
                          placeholder="First name"
                          name="firstname"
                          onChange={onInputHandle}
                          className="input-radius h56"
                          value={inputValues.firstname}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="label-top relative">
                        <label>Last name</label>
                        <input
                          type="text"
                          placeholder="Last name"
                          className="input-radius h56"
                          onChange={onInputHandle}
                          name="lastname"
                          value={inputValues.lastname}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="label-top relative">
                        <label>Street Name</label>
                        <input
                          type="text"
                          placeholder="Street Name"
                          name="streetname"
                          onChange={onInputHandle}
                          className="input-radius h56"
                          value={inputValues.streetname}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="label-top relative">
                        <label>Door Nr</label>
                        <input
                          type="text"
                          placeholder="Door Nr"
                          className="input-radius h56"
                          onChange={onInputHandle}
                          name="doornr"
                          value={inputValues.doornr}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="label-top relative">
                        <label>Postal Code</label>
                        <input
                          className="input-radius h56"
                          value={inputPostal.value}
                          onChange={getPostalCodeFromAuto}
                          placeholder="Postal Code"
                        />
                        <ul className="auto-complete-suggestions">
                          {postalCodeData.map((code, index) => (
                            <li
                              key={index}
                              onClick={() => onPostalCodeClick(code)}
                            >
                              {code.zip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="label-top relative">
                        <label>City</label>
                        <input
                          type="text"
                          value={inputValues.city}
                          placeholder="City"
                          name="city"
                          className="input-radius h56"
                          onChange={onInputHandle}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="label-top relative">
                        <label>Province</label>
                        {provinceData.length > 0 ? (
                          <Autocomplete
                            value={
                              provinceData.find(
                                (innerProvince) =>
                                  province === innerProvince.id,
                              )?.name || ''
                            }
                            setValue={setProvince}
                            getValue={getProvinceFromAuto}
                            placeholder="Province"
                            suggestions={provinceData.map((province) => ({
                              name: province.name,
                              value: province.id,
                            }))}
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder="Province "
                            className="input-radius h56"
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="label-top relative">
                        <label>Country</label>
                        {countryData.length > 0 ? (
                          <Autocomplete
                            value={
                              countryData.find(
                                (innerCountry) => country === innerCountry.id,
                              )?.name || ''
                            }
                            getValue={getCountryFromAuto}
                            setValue={setCountry}
                            placeholder="Country"
                            suggestions={countryData.map((country) => ({
                              name: country.name,
                              value: country.id,
                            }))}
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder="Country "
                            className="input-radius h56"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="label-top relative">
                    <label>Phone number</label>
                    <div className="box-telephone relative">
                      <span className="area-code inflex-center-center">
                        {inputValues.phoneHeader}
                      </span>
                      <input
                        type="text"
                        disabled={phoneEditable}
                        placeholder="364 239 2830"
                        onChange={onInputHandle}
                        name="phonenumber"
                        className="input-radius h56"
                        value={inputValues.phonenumber}
                      />
                      {currentUser.isPhoneConfirmed && phoneEditable ? (
                        <button
                          type="button"
                          onClick={onPhoneEdit}
                          className="vertify-button font-16 font-demi"
                          data-target="#verify-phone"
                          data-toggle="modal"
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="vertify-button font-16 font-demi"
                          data-target="#verify-phone"
                          onClick={verifyPhone}
                          data-toggle="modal"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="label-top relative">
                    <label>E-mail</label>
                    <input
                      disabled
                      type="text"
                      placeholder="Infor@gmail.com"
                      value={inputValues.email}
                      name="email"
                      onChange={onInputHandle}
                      className="input-radius h56"
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      className="btn btn-yellow btn-h60 font-demi font-20 w230"
                    >
                      SAVE
                    </button>
                  </div>
                </form>
              </div>
              <div className="order-right mgt-30 pd-55">
                <div className="update-progess">
                  <h2 className="font-20 font-demi mgb-40">UPDATE PROFILE</h2>
                  <ul className="progressbar-update">
                    <li className="active">Add Address</li>
                    <li className={currentUser.isPhoneConfirmed && 'active'}>
                      <div className="box-verphone text-center">
                        <p>Verify Phone</p>
                        <p>
                          <button type="button" className="btn-default">
                            Verify
                          </button>
                        </p>
                      </div>
                    </li>
                    <li className={currentUser.isEmailConfirmed && 'active'}>
                      <div className="box-verphone text-center">
                        <p>Confirm Mail</p>
                        <p>
                          <button type="button" className="btn-default">
                            Check
                          </button>
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ProfileInfoSide>
          <TheFooter />
        </DefaultLayout>
      )}
    </>
  );
}

export default BasicInfo;
