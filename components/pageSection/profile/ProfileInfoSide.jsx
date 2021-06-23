/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { store } from 'react-notifications-component';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';

import axios from '../../../lib/axios';
import CustomAvatar from '../../header/CustomAvatar';
import {
  logOut,
  saveInfo,
} from '../../../store/actions/authentication.actions';
import getUserDetails from '../../../hooks/dataFetching/useUserDetails';

import styles from './customAvatar.module.css';
import useUserIsLoggedIn from '../../../hooks/user/useUserIsLoggedIn';
import Logger from '../../../lib/logger';

const ProfileInfoSide = (props) => {
  const { pageurl } = props;
  const userDetails = useSelector((state) => state.authentication.basicInfo);
  // const [userDetails, setUserDetails] = useState({});
  const [avatar, setAvatar] = useState(userDetails.avatar);
  const [showRemovePhotoText, setShowRemovePhotoText] = useState(false);
  const { id: branchId } = useSelector((state) => state.root.currentBranch);
  const accessToken = useSelector(
    (state) => state.authentication.currentUser.accessToken,
  );
  const dispatch = useDispatch();

  const isLogged = useUserIsLoggedIn();

  const userData = useSelector((state) => state.authentication.basicInfo);

  useEffect(() => {
    if (isLogged && _.isEmpty(userData)) {
      const fetchUserData = async () => {
        const userResponse = await getUserDetails();
        dispatch(saveInfo(userResponse));
      };
      fetchUserData();
    }
  }, [isLogged, dispatch, userData]);

  useEffect(() => {
    setAvatar(userDetails.avatar);
  }, [userDetails.avatar]);

  const uploadImage = async (formData) => {
    try {
      const delAvatarUrl = '/customer/web/profile-service/me/avatar';
      await axios.delete(delAvatarUrl, {
        // headers: { Authorization: `Bearer ${accessToken}` },
      });
      const url = `customer/web/profile-service/me/avatar`;
      await axios.post(url, formData, {
        // headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userResponse = await getUserDetails();
      dispatch(saveInfo(userResponse));
      store.addNotification({
        title: 'Success!',
        message: 'Avatar updated successfully',
        type: 'success',
        insert: 'top',
        container: 'bottom-right',
        dismiss: {
          duration: 3000,
          onScreen: true,
        },
      });
    } catch (error) {
      const url = `customer/web/profile-service/me/avatar`;
      await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userResponse = await getUserDetails();
      dispatch(saveInfo(userResponse));
      store.addNotification({
        title: 'Success!',
        message: 'Avatar updated successfully',
        type: 'success',
        insert: 'top',
        container: 'bottom-right',
        dismiss: {
          duration: 3000,
          onScreen: true,
        },
      });
    }
  };

  const handleRemoveAvatar = () => {
    const removeAvatar = async () => {
      try {
        const delAvatarUrl = '/customer/web/profile-service/me/avatar';
        await axios.delete(delAvatarUrl, {
          // headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userResponse = await getUserDetails();
        dispatch(saveInfo(userResponse));
        store.addNotification({
          title: 'Success!',
          message: 'Avatar removed successfully',
          type: 'success',
          insert: 'top',
          container: 'bottom-right',
          dismiss: {
            duration: 3000,
            onScreen: true,
          },
        });
      } catch (error) {
        Logger.log(error);
      }
    };
    removeAvatar();
    setShowRemovePhotoText(!showRemovePhotoText);
  };

  const onLogout = () => {
    dispatch(logOut());
  };

  const onUploadImage = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file, file.name);
    uploadImage(formData);
  };

  return (
    <main className="cd-main-content">
      <section className="profile-user wrapper-gray">
        <div className="container basic-profile">
          <div className="row">
            <div className="col-md-4">
              <div className="order-left">
                <div className="user-box">
                  <div className="d-flex justify-content-center">
                    <CustomAvatar
                      size="8em"
                      image={avatar}
                      title={`${userDetails.name || ''} ${
                        userDetails.surname || ''
                      }`}
                    />
                  </div>
                  {showRemovePhotoText ? (
                    <div>
                      <div
                        className="text-center"
                        style={{ marginTop: '20px', marginBottom: '20px' }}
                      >
                        <p>Are you sure you want to remove your photo?</p>
                        <p>We'll replace it with a default avatar</p>
                      </div>
                      <div className="d-flex justify-content-around flex-wrap">
                        <button
                          onClick={() =>
                            setShowRemovePhotoText(!showRemovePhotoText)
                          }
                          type="button"
                          className="btn btn-outline-dark btn-sm mb-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRemoveAvatar()}
                          type="button"
                          className="btn btn-danger btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <label className="upload-avata relative">
                          <input
                            type="file"
                            className="hide-abs"
                            onChange={onUploadImage}
                            accept="image/*"
                          />
                          <span>
                            <i className="fa fa-upload" /> Upload
                          </span>
                        </label>
                      </div>
                      <div className="text-center">
                        <button
                          type="button"
                          className="btn btn-link btn-sm"
                          style={{ border: 'none', boxShadow: 'none' }}
                          onClick={() =>
                            setShowRemovePhotoText(!showRemovePhotoText)
                          }
                        >
                          Remove Photo
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="order-nav">
                  <ul>
                    <li className={pageurl === 'basic_info' ? 'active' : ''}>
                      <Link href={`/${branchId}/me/basic_info`}>
                        <a name="BasicInfo" href="/me" title="">
                          Basic Information
                        </a>
                      </Link>
                    </li>
                    <li className={pageurl === 'manage_order' ? 'active' : ''}>
                      <Link href={`/${branchId}/me/manage_order`}>
                        <a name="orderTrack" href="/manage_order" title="">
                          Order History
                        </a>
                      </Link>
                    </li>
                    <li className={pageurl === 'coupons' ? 'active' : ''}>
                      <Link href={`/${branchId}/me/coupons`}>
                        <a name="Coupons" href="/me/coupons" title="">
                          Coupons
                        </a>
                      </Link>
                    </li>
                    <li
                      className={pageurl === 'change_password' ? 'active' : ''}
                    >
                      <Link href={`/${branchId}/me/change_password`}>
                        <a name="ChangePassword" href="/password" title="">
                          Change Password
                        </a>
                      </Link>
                    </li>
                    <li>
                      <a onClick={onLogout} href={`/${branchId}`} title="">
                        Log Out
                      </a>{' '}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-8">{props.children}</div>
          </div>
        </div>
      </section>
      <footer />
    </main>
  );
};

export default ProfileInfoSide;
