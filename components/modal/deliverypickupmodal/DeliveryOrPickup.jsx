/* eslint-disable no-useless-return */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable consistent-return */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import deliveryConstants from "../../../_constants/delivery.constants";
import getSettings from "./getSettings";
import PickupOptions from "./PickupOptions";
import { setPosition } from "../../../store/actions/position.actions";
import { setCoachMark } from "../../../store/actions/layout.actions";
import { setDeliveryType } from '../../../store/actions/cart.actions';
import Logger from '../../../lib/logger';
import safeSelector from "../../../utils/safeSelector";

const getSelectedMode = (mode, defaultPickupValue, defaultDeliveryValue) => {
    if (mode === deliveryConstants.DELIVERY_AND_PICKUP) {
        if (defaultPickupValue) {
            return deliveryConstants.PICKUP_ONLY;
        }
        if (defaultDeliveryValue) {
            return deliveryConstants.DELIVERY_ONLY;
        }
        return null;
    }
    return mode;
};

const DeliveryOrPickup = ({
    setOpen,
    mode = deliveryConstants.DELIVERY_AND_PICKUP,
    defaultPickupValue = "",
    defaultDeliveryValue = "",
}) => {
    const { t } = useTranslation(["common"]);
    const dispatch = useDispatch();
    const [selectedPickupOption, setSelectedPickup] = useState(
        defaultPickupValue
    );
    const fullAddress = useRef(null);
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState("");
    const [addressVal, setAddressVal] = useState("");
    const [option, setOption] = useState(() =>
        getSelectedMode(mode, defaultPickupValue, defaultDeliveryValue)
    );
    const [spinner, setSpinner] = useState(false);
    const setDeliveryOption = (value) => {
        setOption(value);
        dispatch(setDeliveryType(value));
    }
    const branches = useSelector(
        safeSelector((state) => state.root.settings.branches, [])
    );

    const getCurrentPosition = () => {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const long = position.coords.longitude;
                    resolve({ status: "allowed", lat, long });
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        resolve({ status: "blocked", error });
                    } else {
                        resolve({ status: "other", error });
                    }
                }
            );
        });
    };

    const getPostionFromCoords = async () => {
        if (spinner) {
            return;
        }
        setSpinner(true);
        try {
            const position = await getCurrentPosition();
            if (position.status === "allowed") {
                // setOpen(false);
                const res = await getSettings(
                    null,
                    position?.long,
                    position?.lat,
                    null
                );
                if (!res) {
                    setErrorMsg("Sorry We Do Not Delivery In Your Area");
                    return;
                }
                fullAddress.current.value = res.fullAddress;
            } else {
                setErrorMsg("Please Allow Browser to use your Location");
                // setOpen(true);
            }
        } catch (e) {
            setErrorMsg("Something Went wront try Again Later");
        } finally {
            setSpinner(false);
        }
    };

    const onGoSite = async () => {
        setErrorMsg("");

        if (option === deliveryConstants.PICKUP_ONLY) {
            if (!selectedPickupOption) {
                return setErrorMsg("Branch Not Selected");
            }
            dispatch(
                setPosition({
                    type: deliveryConstants.PICKUP_ONLY,
                    result: selectedPickupOption,
                })
            );
            if (_.isEmpty(localStorage.getItem("position"))) {
                dispatch(setCoachMark(true));
            }

            router.push(`/${selectedPickupOption}`);
            setOpen(false);
            return;
        }

        if (option === deliveryConstants.DELIVERY_ONLY) {
            if (fullAddress.current.value === "") {
                setErrorMsg("Please Enter a Postal Code or An Address");
                return;
            }
            try {
                if (fullAddress.current.value !== "") {
                    let res;
                    if (
                        Number(fullAddress.current.value) &&
                        fullAddress.current.value.length === 4
                    ) {
                        res = await getSettings(
                            null,
                            null,
                            null,
                            fullAddress?.current?.value
                        );
                    } else {
                        res = await getSettings(
                            fullAddress?.current?.value,
                            null,
                            null,
                            null
                        );
                    }

                    if (res?.zone?.branchId) {
                        router.push(`/${res.zone.branchId}`);
                        dispatch(
                            setPosition({
                                type: deliveryConstants.DELIVERY_ONLY,
                                result: res,
                            })
                        );
                        if (_.isEmpty(localStorage.getItem("position"))) {
                            dispatch(setCoachMark(true));
                        }
                        setOpen(false);
                    } else {
                        setErrorMsg("Invalid Address");
                    }
                }
            } catch (e) {
                Logger.log(e);
                setErrorMsg("Invalid Address or Postal Code Entered");
            }
        }
    };
    const renderOption = () => {
        if (option === deliveryConstants.DELIVERY_ONLY) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                    }}
                >
                    <div className="input-group position-relative">
                        <div
                            onClick={getPostionFromCoords}
                            className="d-flex align-items-center justify-content-center"
                            style={{
                                cursor: spinner ? "default" : "pointer",
                                fontSize: "1rem",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: 30,
                                zIndex: 100,
                            }}
                        >
                            {!spinner ? (
                                <i className="fa fa-map-marker" />
                            ) : (
                                <motion.i
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        type: "tween",
                                    }}
                                    className="fa fa-spinner"
                                />
                            )}
                        </div>

                        <input
                            type="text"
                            className="form-control"
                            value={addressVal}
                            onChange={(e) => setAddressVal(e.target.value)}
                            style={{ paddingLeft: 30 }}
                            ref={fullAddress}
                            placeholder="Lehenmattstrasse 242 4052 Basel"
                        />
                    </div>
                </motion.div>
            );
        }
        if (option === deliveryConstants.PICKUP_ONLY) {
            return (
                <div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                    >
                        {" "}
                        { branches.length > 1 && <h3 className="text-center">
                            Please Select a Nearest Branch For Pickup
                        </h3> }
                        <PickupOptions
                            selected={selectedPickupOption}
                            setSelected={setSelectedPickup}
                            branches= {branches}
                        />
                    </motion.div>
                </div>
            );
        }
        return null;
    };

    const isButtonDisabled = useMemo(() => {
        if (option === deliveryConstants.PICKUP_ONLY) {
            return !selectedPickupOption;
        }
        if (option === deliveryConstants.DELIVERY_ONLY) {
            if (addressVal.length < 4) {
                return true;
            }
        }
        return false;
    }, [option, selectedPickupOption, addressVal]);

    useEffect(() => {
        if (defaultDeliveryValue) {
            fullAddress.current.value = defaultDeliveryValue;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (option) {
            setErrorMsg("");
        }
    }, [option]);

    return (
        <div className="modal-main">
            <div className="container">
                <div
                    className="row justify-content-center"
                    style={{ marginBottom: "30px", marginTop: "10px" }}
                >
                    <div className="col-10">
                        {mode === deliveryConstants.DELIVERY_AND_PICKUP && (
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="input-group justify-content-center">
                                    <span
                                        className={clsx(
                                            "font-24 font-weight-bold mb-0 p-0",
                                            {
                                                title:
                                                    option ===
                                                    deliveryConstants.DELIVERY_ONLY,
                                            }
                                        )}
                                        style={{
                                            backgroundSize: "contain",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => setDeliveryOption(deliveryConstants.DELIVERY_ONLY)}
                                    >
                                        Delivery
                                    </span>
                                </div>
                                <div className="input-group justify-content-center">
                                    <span
                                        className={clsx(
                                            "font-24 font-weight-bold mb-0 p-0",
                                            {
                                                title:
                                                    option ===
                                                    deliveryConstants.PICKUP_ONLY,
                                            }
                                        )}
                                        style={{
                                            backgroundSize: "contain",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => setDeliveryOption(deliveryConstants.PICKUP_ONLY)}
                                    >
                                        Pickup
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="mt-3">{renderOption()}</div>
                        <p
                            className="text-center"
                            style={{ color: "red", marginTop: "10px" }}
                        >
                            {errorMsg && errorMsg}
                        </p>
                    </div>
                </div>
            </div>
            <div className="text-center btn-modal-submit">
                {option && (
                    <button
                        type="button"
                        disabled={isButtonDisabled}
                        className="btn btn-yellow btn-h60 font-20 font-demi"
                        onClick={onGoSite}
                    >
                        {t("Proceed")}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DeliveryOrPickup;
