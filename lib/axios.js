/* eslint-disable no-param-reassign */
import axios from 'axios';
import { i18n } from '../i18n/i18n';
import _ from 'lodash';

import { store } from '../store';
import { updateToken, logOut } from '../store/actions/authentication.actions';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

instance.interceptors.request.use(config => {

  if (config.url.toLowerCase().indexOf('culture') !== -1) {
    config.url = config.url.replace('culture=undefined', `culture=${i18n.language || 'en'}`);
  } else if (config.url.toLowerCase().indexOf('?') !== -1) {
    config.url += `&culture=${i18n.language || 'en'}`;
  } else {
    config.url += `?culture=${i18n.language || 'en'}`;
  }

  if (process.browser) {
    try {
      const { accessToken } = JSON.parse(localStorage.getItem('user'));
      config.headers.common.Authorization = `Bearer ${accessToken}`;
    } catch (e) {
      delete config.headers.common.Authorization;
    }
  }

  return config;
});

instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  async (error) => {
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const { refreshToken } = user;
      const { data: { result: { accessToken } } } = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/tokenAuth/refreshToken?refreshToken=${refreshToken}`);

      await axios.get('/customer/web/profile-service/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      user.accessToken = accessToken;
      localStorage.setItem('user', JSON.stringify(user));
      store.dispatch(updateToken(accessToken));
    } catch (e) {
      store.dispatch(logOut());
      return Promise.reject(error);
    }

    return;

    // Logger.log('error: ', error);
    if (error.response.status === 401) {
      const user = localStorage.getItem('user');
      // no user in the local storage
      if (user === null) return Promise.reject(error);

      const userData = JSON.parse(user);
      // user opted for not staying logged in
      if (_.isNil(userData.refreshToken)) return Promise.reject(error);

      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/tokenAuth/refreshToken?refreshToken=${userData.refreshToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then((res) => res.json())
        .then((res) => {
          const { accessToken } = res.result;
          userData.accessToken = accessToken;
          localStorage.setItem('user', JSON.stringify(userData));
          store.dispatch(updateToken(accessToken));
        })
        .catch(() => {
          store.dispatch(logOut());
        });
    }
    return new Promise((resolve, reject) => {
      const originalReq = error.config;
      const responseCode = error.response.status;
      const isLoginRedirect = error.response.request.responseURL
        .toLowerCase()
        .includes('login');

      if (responseCode === 404 && isLoginRedirect) {
        const user = localStorage.getItem('user');
        // no user in the local storage
        if (user === null) return Promise.reject(error);

        const userData = JSON.parse(user);
        // user opted for not staying logged in
        if (_.isNil(userData.refreshToken)) return Promise.reject(error);

        const res = fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/tokenAuth/refreshToken?refreshToken=${userData.refreshToken}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
          .then((res) => res.json())
          .then((res) => {
            const { accessToken } = res.result;
            userData.accessToken = accessToken;
            localStorage.setItem('user', JSON.stringify(userData));

            originalReq.headers.authorization = `Bearer ${accessToken}`;

            return axios(originalReq);
          });

        resolve(res);
      }

      return reject(error);
    });
  },
);

export default instance;
