import React, { useState, useEffect } from 'react';
import firebase from '../../../containers/firebase/firebase';
import { useRouter } from 'next/router';
import { getSettings } from '../../../lib/helpers';
import useInterval from '../../../hooks/page/useInterval';

const MaintainanceNotification = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [routeMaintainance, setRouteMaintainance] = useState(false);
    const [countdownDate, setCountdownDate] = useState(new Date());
    const [maintainanceState, setMaintainanceState] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const db = firebase.firestore();
    const router = useRouter();
    const {
        query: { branch },
    } = router;
    const [toggle, running] = useInterval(() => {
        // custom logic here
        if (countdownDate) {
            const currentTime = new Date().getTime();
            const timeDifference = countdownDate - currentTime;
            if (timeDifference < 0) {
                return;
            }

            // Calculate
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
                setRouteMaintainance(true);
            }
        }
      }, 1000);


    
    const closeMaintainanceNotification = () => {
        setShowBanner(false);
    }

    useEffect(() => {
        const checkData = async () => {
            const settings = await getSettings();
            const getData = db
                .collection('RestaurantCollection')
                .doc(`Restaurants-${settings.id}`)
                .collection('BranchCollection')
                .where('Id', '==', parseInt(branch))
                .onSnapshot((querySnapshot) => {
                    if (querySnapshot.docs.length === 0) {
                        return;
                    }
                    let branch = querySnapshot.docs[0].data();
                    if (branch && branch.maintenanceStart) {
                        setCountdownDate(new Date(branch.maintenanceStart.toDate()))
                        setMaintainanceState({});
                        const diff = branch.maintenanceStart.toDate() - new Date().getTime();
                        setShowBanner(branch.isInMaintenanceMode && (diff/1000) > 0 && Math.round(diff/(1000*60*60)) <= 2);
                        setRouteMaintainance(branch.isInMaintenanceMode && branch.maintenanceStart.toDate() < new Date().getTime() && branch.maintainanceEnd.toDate() > new Date().getTime());
                    }
                });

            return () => {
                getData()
            };
        }
        checkData();
    }, [])

    useEffect(() => {
        if (routeMaintainance) {
            router.push(`/${branch}/maintainance`);
        }
    }, [routeMaintainance])

    if (!showBanner) return '';

    return (
        <div className="alert alert-primary mb-0 text-center px-3" role="alert">
            {`Maintainance Starts In ${maintainanceState.hours || '00'} Hours : ${maintainanceState.minutes || '00'} Minutes : ${maintainanceState.seconds || '00'} Seconds`}
            <a className="alert-link ml-1" onClick={closeMaintainanceNotification}>
                {'Close'}
            </a>
        </div>
    );
};

export default MaintainanceNotification;
