import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import * as positionActions from "../store/actions/position.actions";
import deliveryConstants from "../_constants/delivery.constants";
import { setDeliveryPickupModalOpen } from "../store/actions/layout.actions";
const config = require('../config.json');

export default function SyncPositionToStore({ children, route }) {
    const dispatch = useDispatch();
    const position = useSelector((state) => state.position);
    const isMount = useRef(true);
    const router = useRouter();
    useEffect(() => {
        if (!isMount.current) {
            localStorage.setItem("position", JSON.stringify(position));
        }
    }, [position]);
    useEffect(() => {
        if (config["exclude-redirections"].indexOf(route.toLowerCase()) !== -1 ) {
            return;
        }
        isMount.current = false;
        const prevVal = localStorage.getItem("position");
        if (prevVal) {
            const {query: {branch}} = router;
            const oldVal = JSON.parse(prevVal);
            dispatch(positionActions.setPosition(oldVal));
            if (oldVal.type === deliveryConstants.PICKUP_ONLY && parseInt(branch) !== parseInt(oldVal.result)) {
              router.push(`/${oldVal.result}`);
            }
            if (oldVal.type === deliveryConstants.DELIVERY_ONLY && parseInt(branch) !== parseInt(oldVal.result?.zone?.branchId)) {
              router.push(`/${oldVal.result?.zone?.branchId}`);
            }
        } else {
            dispatch(setDeliveryPickupModalOpen(true));
        }
    }, []);
    return <>{children}</>;
}
