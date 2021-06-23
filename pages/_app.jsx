/* eslint-disable react/jsx-props-no-spreading */
import App from "next/app";
import React, { useEffect, useState } from 'react';
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { SWRConfig } from "swr";
import DateFnsUtils from "@date-io/date-fns";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { AnimatePresence } from "framer-motion";
import Head from 'next/head';
import SyncPositionToStore from "../components/SyncPositionToStore";
import axios from "../lib/axios";

import { useStore } from "../store";
import "../assets/css/_main.css";
import "swiper/swiper.scss";
import "swiper/components/pagination/pagination.scss";
import { appWithTranslation } from "../i18n/i18n";
import "swiper/components/navigation/navigation.scss";
import "react-toastify/dist/ReactToastify.css";
import "react-notifications-component/dist/theme.css";

function MyApp({ Component, pageProps,router }) {
    const store = useStore(pageProps.initialReduxState);
    const [loaded, setLoaded] = useState(!process.browser || !localStorage.getItem('user'));

    useEffect(() => {
      if (!loaded) {
        axios.get('/customer/web/profile-service/me').catch((e) => {
          console.log(e);
        }).finally(() => {
          setLoaded(true);
        })
      }
    }, []);

    return loaded && (
        <Provider store={store}>
            <Head>
				<link rel="shortcut icon" href="images/icon/favicon.png" />
			</Head>
            <PersistGate loading={null} persistor={persistStore(store)}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <SWRConfig
                        value={{
                            fetcher: (...args) =>
                                axios(...args).then((res) => res.data),
                            errorRetryInterval: true,
                            errorRetryCount: 1,
                        }}
                    >
                        <SyncPositionToStore key={router.route} route={router.route}>
                            <AnimatePresence exitBeforeEnter>
                                <Component {...pageProps} />
                            </AnimatePresence>
                        </SyncPositionToStore>
                    </SWRConfig>
                </MuiPickersUtilsProvider>
            </PersistGate>
        </Provider>
    );
}

MyApp.getInitialProps = async (appContext) => ({
    ...(await App.getInitialProps(appContext)),
});

export default appWithTranslation(MyApp);
