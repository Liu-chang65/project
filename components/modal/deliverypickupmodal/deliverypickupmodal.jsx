/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import deliveryConstants from "../../../_constants/delivery.constants";
import DeliveryOrPickup from "./DeliveryOrPickup";

import { setDeliveryPickupModalOpen } from "../../../store/actions/layout.actions";


const DeliveryOptionModal = ({
    mode = deliveryConstants.DELIVERY_AND_PICKUP,
}) => {
    const { t } = useTranslation(["common"]);

    const isDeliveryPickupModalOpen = useSelector(
        (state) => state.layout.isDeliveryorPickupModalActive
    );

    const dispatch = useDispatch();
    const setOpen = (value) => {
        dispatch(setDeliveryPickupModalOpen(value));
    };
    const onClose = () => {
        setOpen(false);
    };
    const { type, result } = useSelector((state) => state.position);
    const isFirstimeOpened = useMemo(() => {
        if (typeof window === "undefined") {
            return true;
        }
        return _.isEmpty(localStorage.getItem("position"));
    }, []);
    if (!isDeliveryPickupModalOpen) {
        return null;
    }

    return (
        <div>
            <div className="modal fade modal-box show" id="search-filter">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-top">
                            <h2
                                className="title"
                                style={{ marginTop: "60px", fontSize: "32px" }}
                            >
                                <span>{t(mode)}</span>
                            </h2>
                            {!isFirstimeOpened && (
                                <button
                                    type="button"
                                    className="close"
                                    onClick={onClose}
                                >
                                    <i className="ti-close" />
                                </button>
                            )}
                        </div>
                        <DeliveryOrPickup
                            mode={mode}
                            defaultPickupValue={
                                type === deliveryConstants.PICKUP_ONLY && result
                            }
                            defaultDeliveryValue={
                                (type === deliveryConstants.DELIVERY_ONLY &&
                                    result.fullAddress) ||
                                result?.zone?.postalCode
                            }
                            setOpen={setOpen}
                        />
                    </div>
                </div>
            </div>

            <div className="modal-backdrop fade show" />
        </div>
    );
};

export default DeliveryOptionModal;
