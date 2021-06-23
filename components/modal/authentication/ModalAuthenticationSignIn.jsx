import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import GRecaptcha from "react-google-recaptcha";
import {
  toggleLoginModal,
  toggleRegistrationModal,
  setUserData,
  togglePhoneVerficationModal,
  toggleForgotPasswordModal,
} from '../../../store/actions/authentication.actions';
import BaseLoader from '../../base/BaseLoader';
import axios from '../../../lib/axios';
import Logger from '../../../lib/logger';

const ModalAuthenticationSignIn = ({ socialAuthProviders }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['common']);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { register, handleSubmit, watch, errors } = useForm();
  const recaptchaRef = React.useRef();
  const { reCaptchaSiteKey} = useSelector((state) => state.root.settings.tenantDetails);

  const boundToggleLoginModal = () => dispatch(toggleLoginModal());

  const boundToggleRegistrationModal = () => {
    dispatch(toggleLoginModal());
    dispatch(toggleRegistrationModal());
  };

  const boundTogglePhoneVerficationModal = () => {
    dispatch(toggleLoginModal());
    dispatch(togglePhoneVerficationModal());
  };

  const boundToggleForgotPasswordModal = () => {
    dispatch(toggleLoginModal());
    dispatch(toggleForgotPasswordModal());
  };

  const showErrorMessage = (message, timeout) => {
    setMessage(message);

    setTimeout(() => {
      setMessage('');
    }, timeout);
  };

  const onSubmit = async (data) => {
    const captchaResponse = recaptchaRef.current.getValue();

    if (!captchaResponse) {
      return;
    }

    const { emailOrUsername, password, rememberMe } = data;

    setIsLoading(true);

    try {
      const response = await axios.post('customer/login', {
        userNameOrEmailAddress: emailOrUsername,
        password,
        twoFactorVerificationCode: '',
        twoFactorRememberClientToken: '',
        rememberClient: rememberMe,
        singleSignIn: true,
        returnUrl: 'string',
      });

      const userData = response.data.result;

      userData.emailOrUsername = emailOrUsername;

      setIsLoading(false);
      dispatch(setUserData(userData));
      if (!userData.isPhoneConfirmed) {
        boundTogglePhoneVerficationModal();
      } else {
        boundToggleLoginModal();
      }
    } catch (error) {
      setIsLoading(false);
      if (!error.success) {
        showErrorMessage(t('email_or_password_is_wrong'), 5000);
      }
      Logger.error(error);
    }
  };

  const generateSocialButtons = () => {
    return socialAuthProviders.map((provider, index) => {
      if (provider.name === 'Google') {
        return (
          <GoogleLogin
            key={index}
            clientId={provider.clientId}
            buttonText={t('login')}
            onSuccess={responseGoogleSuccess}
            onFailure={responseGoogleFailure}
            render={(renderProps) => (
              <a
                onClick={renderProps.onClick}
                className="btn-h50 flex-center-center signin-ggle"
              >
                {t('sign_in')}
              </a>
            )}
          />
        );
      }
      if (provider.name === 'Facebook') {
        return (
          <FacebookLogin
            key={index}
            appId={provider.clientId}
            autoLoad={false}
            fields="name,email,picture"
            callback={responseFacebook}
            onFailure={responseFacebookFailure}
            render={(renderProps) => (
              <a
                onClick={renderProps.onClick}
                className="btn-h50 flex-center-center signin-facebook"
              >
                {t('sign_in')}
              </a>
            )}
          />
        );
      }
    });
  };

  const responseGoogleSuccess = async (data) => {
    console.log('Google Success')

    const { accessToken, profileObj } = data;
    setIsLoading(true);

    try {
      const response = await axios.post('customer/external-login', {
        authProvider: 'Google',
        ProviderKey: profileObj.googleId,
        ProviderAccessCode: accessToken,
      });



      const userData = response.data.result;

      userData.emailOrUsername = profileObj.email;

      setIsLoading(false);
      dispatch(setUserData(userData));
      if (!userData.isPhoneConfirmed) {
        boundTogglePhoneVerficationModal();
      } else {
        boundToggleLoginModal();
      }
    } catch (error) {
      setIsLoading(false);
      showErrorMessage(t('request_failed'), 5000);
    }
  };
  const responseFacebookFailure = () => {

    showErrorMessage(t('facebook_auth_failed', 5000));
  };
  const responseGoogleFailure = () => {
    console.log('Google Failure')

    showErrorMessage(t('google_auth_failed', 5000));
  };

  const responseFacebook = async (data) => {
    const { accessToken, id, email } = data;
    setIsLoading(true);


    try {
      const response = await axios.post('customer/external-login', {
        authProvider: 'Facebook',
        ProviderKey: id,
        ProviderAccessCode: accessToken,
      });



      const userData = response.data.result;

      userData.emailOrUsername = email;

      setIsLoading(false);
      dispatch(setUserData(userData));
      if (!userData.isPhoneConfirmed) {
        boundTogglePhoneVerficationModal();
      } else {
        boundToggleLoginModal();
      }
    } catch (error) {
      setIsLoading(false);
      showErrorMessage(t('request_failed'), 5000);
    }
  };

  return (
    <div>
      <div
        className="modal fade modal-box modal-box-sm show"
        id="sign-in"
        onClick={boundToggleLoginModal}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="modal-dialog"
          role="document"
        >
          {isLoading && <BaseLoader />}
          <div className="modal-content">
            <div className="modal-top">
              <h2 className="title">
                <span>{t('sign_in')}</span>
              </h2>
            </div>
            <div className="modal-main">
              <div className="box-signin">
                {socialAuthProviders.length !== 0 && (
                  <div>
                    <div className="sigin-social">
                      {generateSocialButtons()}
                    </div>
                    <div className="or">{t('or')}</div>
                  </div>
                )}
                <form className="form-sign" onSubmit={handleSubmit(onSubmit)}>
                  {message && (
                    <div className="alert alert-danger">{message}</div>
                  )}
                  <div className="name-bg mgb-20">
                    <input
                      name="emailOrUsername"
                      type="text"
                      placeholder="Username or email"
                      className="input-radius btn-h50"
                      ref={register({
                        required: true,
                      })}
                    />
                    {errors.emailOrUsername?.type === 'required' && (
                      <div className="invalid-input">{t('input_required')}</div>
                    )}
                  </div>
                  <div className="name-bg mgb-40">
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      className="input-radius btn-h50"
                      ref={register({
                        required: true,
                      })}
                    />
                    {errors.password?.type === 'required' && (
                      <div className="invalid-input">{t('input_required')}</div>
                    )}
                  </div>
                  <div className="d-flex align-items-center justify-content-center mgb-40">
                    <GRecaptcha
                      ref={recaptchaRef}
                      sitekey={reCaptchaSiteKey}
                    />
                    </div>
                  <div className="flex-center-between">

                    <div className="remember">


                      <label>
                        <input
                          name="rememberMe"
                          type="checkbox"
                          ref={register({
                            required: false,
                          })}
                        />
                        <span>{t('remember_me')}</span>
                      </label>
                    </div>
                    <a
                      className="fogot"
                      onClick={boundToggleForgotPasswordModal}
                    >
                      {t('forgot_password')}
                    </a>
                  </div>
                  <div className="text-center mgt-30">
                    <button
                      type="submit"
                      className="btn btn-yellow btn-h60 font-20 font-demi w230"
                    >
                      {t('sign_in')}
                    </button>
                  </div>
                </form>
                <div className="sign-note font-16 font-medium">
                  <div className="note-first">
                    <span>ABC account can access</span>
                  </div>
                  <div className="note-pre">
                    all other restaurants in the ABC system.
                  </div>
                </div>
                <div className="text-center font-18">
                  <span className="font-medium text-ghi">
                    {t('do_not_have_an_account')}
                  </span>
                  <button
                    onClick={boundToggleRegistrationModal}
                    className="btn btn-link btn-link--no-shadow text-yellow link-underlinef font-demi"
                  >
                    {t('sign_up')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </div>
  );
};

export default ModalAuthenticationSignIn;
