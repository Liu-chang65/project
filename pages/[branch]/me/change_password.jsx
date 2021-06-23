import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-nextjs-toast';
import _ from 'lodash';
import { createPortal } from 'react-dom';
import { toast as reactToast } from "react-toastify";
import Head from 'next/head';
import DefaultLayout from '../../../layouts/DefaultLayout';
import TheHeader from '../../../components/header/TheHeader';
import TheFooter from '../../../components/footer/TheFooter';
import axios from '../../../lib/axios';
import ProfileInfoSide from '../../../components/pageSection/profile/ProfileInfoSide';
import usePageOnLoad from '../../../hooks/page/usePageOnLoad';
import useUserFetchCurrentUser from '../../../hooks/user/useUserFetchCurrentUser';
import useUserIsLoggedIn from '../../../hooks/user/useUserIsLoggedIn'
import Logger from '../../../lib/logger';

const getUserDetails = async () => {
  try {
    const url = "/customer/web/profile-service/me";
    const response = await axios.get(url);
    return response.data.result;
  } catch (error) {
    Logger.error(error);
    return false;
  }
};

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
    return {
      props: {}
    };
  }

  return {
    props: {
      settings,
      currentBranch,
    },
  };
}

export default function Index(props) {
  useUserFetchCurrentUser();
  usePageOnLoad(props);
  const { currentBranch } = props;

  const [userDetails, setUserDetails] = useState();
  const [newPassowrd, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("");

  const isloggedin = useUserIsLoggedIn()
  const router = useRouter()

  useEffect(() => {
    if (!isloggedin) {
      router.push("/")
    }
  }, [])

  const changePassword = async (newPassowrd, confirmPassword) => {
    const url = `/customer/change-password`;
    try {
      const res = await axios.post(url, {
        "password": newPassowrd,
        "confirmPassword": confirmPassword
      })

      if (res.data.success) {
        toast.notify("successfully changed password", {
          duration: 5,
          position: "top",
          targetId: "toast-comp-3"
        })
      }
    } catch (error) {
      reactToast('Please Try Again Later. Password Unchanged', {
        duration: 5,
        position: 'top-right',
        type: 'error'
      })
    }
  }

  const _process = async () => {
    const userDetails = await getUserDetails();
    setUserDetails(userDetails);
    if (userDetails) {

    }
  }

  useEffect(() => {
    if (!userDetails) {
      _process()
    }
  }, [userDetails])

  const onChagePSW = (e) => {
    setError("")
    e.preventDefault()
    if (newPassowrd == confirmPassword) {
      const regexUppercase = /[a-z]/;
      const regexLowercase = /[A-Z]/;
      const regexSpecial = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

      if (newPassowrd.length < 6 || newPassowrd.length > 20) {
        setError("Passwords must be at least 6 characters.")
        return
      }
      if (!regexLowercase.test(newPassowrd)) {
        setError("Passwords must have at least one uppercase ('A'-'Z').")
        return
      }
      if (!regexUppercase.test(newPassowrd)) {
        setError("Passwords must have at least one lowercase ('a'-'z').")
        return
      }
      if (!regexSpecial.test(newPassowrd)) {
        setError("Passwords must have at least one non alphanumeric character")
        return;
      }
      changePassword(newPassowrd, confirmPassword)
    } else {
      setError("Password does not match!")
    }
  }

  return (
    <>
      <Head>
        <title>Change Password</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      { isloggedin && <>
        {createPortal(<ToastContainer align="right" position="top" id="toast-comp-3" />, document.body)}
        <DefaultLayout>
          <TheHeader />
          <ProfileInfoSide pageurl="change_password">
            <div className="order-right">
              <form className="profile-form" onSubmit={onChagePSW}>
                <h1 className="font-20 font-demi mgb-60">CHANGE PASSWORD</h1>
                <div className="row">
                  <div className="col-md-10">
                    <div className="label-top relative">
                      <label>New Password</label>
                      <input type="password" placeholder="New Password" value={newPassowrd} onChange={e => setNewPassword(e.target.value)} className="input-radius h56" />
                    </div>
                  </div>
                  <div className="col-md-10">
                    <div className="label-top relative">
                      <label>Confirm Password</label>
                      <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-radius h56" />
                    </div>
                  </div>
                  <div className="col-md-10">
                    <div style={{ color: "red" }}>{error}</div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="text-right"><button type="submit" className="btn btn-yellow btn-h60 font-demi font-20 w230">SAVE</button></div>
                  </div>
                </div>
              </form>
            </div>
          </ProfileInfoSide>
          <TheFooter />
        </DefaultLayout>
      </>}
    </>
  )
}
