import React, { useState, useEffect } from "react";
import { isNil } from 'lodash';
import Head from 'next/head';
import usePageOnLoad from '../../hooks/page/usePageOnLoad';
import DefaultLayout from '../../layouts/DefaultLayout';
import useUserFetchCurrentUser from '../../hooks/user/useUserFetchCurrentUser';
import TheHeader from '../../components/header/TheHeader';
import TheFooter from '../../components/footer/TheFooter';
import { getSettings } from '../../lib/helpers';
import firebase from '../../containers/firebase/firebase';
import { useRouter } from 'next/router';
import useInterval from '../../hooks/page/useInterval';

export async function getServerSideProps(context) {
  const branchId = context.params.branch;
  const settings = await getSettings();

  // get current branch
  const { branches } = settings;
  const currentBranch = branches.filter((branch) => {
    return branch.id === parseInt(branchId);
  })[0];

  // if branch is not found
  if (isNil(currentBranch)) {
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
  const tenantId = props.settings.id;
  const db = firebase.firestore();
  const router = useRouter();
  const {
    query: { branch },
  } = router;
  const [countdownDate, setCountdownDate] = useState(new Date());
  const [maintainanceState, setMaintainanceState] = useState({});
  const [isRouteBack, setRouteBack] = useState(false);
  const [toggle, running] = useInterval(() => {
    // custom logic here
    const currentTime = new Date().getTime();
    const timeDifference = countdownDate - currentTime;
    if (timeDifference < 0) {
      return;
    }
    if (countdownDate) {
      //   Calculate
      let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      let hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
      const numbersToAddZeroTo = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      if (numbersToAddZeroTo.includes(hours)) {
        hours = `0${hours}`;
      } else if (numbersToAddZeroTo.includes(minutes)) {
        minutes = `0${minutes}`;
      } else if (numbersToAddZeroTo.includes(seconds)) {
        seconds = `0${seconds}`;
      }

      // Set the state to each new time
      setMaintainanceState({ days: days, hours: hours, minutes, seconds });
      if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) {
        setRouteBack(true);
      }
    }
  }, 1000);

  useEffect(() => {
    if (isRouteBack) {
      router.push(`/${branch}`)
    }
  }, [isRouteBack]);

  useEffect(() => {
    const getData = db
      .collection('RestaurantCollection')
      .doc(`Restaurants-${tenantId}`)
      .collection('BranchCollection')
      .where('Id', '==', parseInt(branch))
      .onSnapshot((querySnapshot) => {
        if (querySnapshot.docs.length === 0) {
          return;
        }
        let branch = querySnapshot.docs[0].data();
        if (branch && branch.maintainanceEnd) {
          setCountdownDate(new Date(branch.maintainanceEnd.toDate()))
          setMaintainanceState({});
          if (!branch.isInMaintenanceMode) {
            setRouteBack(true);
            return;
          }
          const diff = branch.maintainanceEnd.toDate() - new Date().getTime();
          if (diff <= 0) {
            setRouteBack(true);
          }
          const startDiff = branch.maintenanceStart.toDate() - new Date().getTime();
          if (startDiff > 0) {
            setRouteBack(true);
          }
        }
      });

    return () => {
      getData()
    };
  }, [])

  return (
    <DefaultLayout>
      <Head>
        <title>Maintainance</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <TheHeader />
      <section className="maintainance-section">
        <br />
        <div className="maintainance-page"></div>
        <div className="maintainance-text">
          <h2>Sorry, we're down for maintainance</h2>
          <h2>Back online in</h2>
          <h2>{maintainanceState.hours || '00'} Hours : {maintainanceState.minutes || '00'} Minutes : {maintainanceState.seconds || '00'} Seconds</h2>
        </div>
        <br />
      </section>
      <TheFooter />
    </DefaultLayout>
  );
}


