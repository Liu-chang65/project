import { isEmpty } from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";
import Link from 'next/link';
import { useSelector } from "react-redux";

const ShippingAddress = ({
    currentBranch,
    backendOrder,
    currentUser,
    postalCode,
    setIsOpen,
    savedProvince,
    savedCountry,
}) => {
    const { t } = useTranslation("common");
    const { deliveryType } = useSelector((state) => state.cart);

    return (
        <div className="menu-item">
            <h2 className="font-24 font-demi mgb-40 flex-center">
                <img
                    src="/images/icon/icon-pin-3.svg"
                    alt=""
                    title=""
                    className="mgr-15"
                />
                {deliveryType === "PickUp" ? t("shipping_address_pickup") : t("shipping_address")}
            </h2>
            <div className="box-060">
                <div className="row">
                    <div className="col-md-3">
                        <div className="font-24">
                            {backendOrder?.orderAddressFK?.customerName}
                        </div>
                    </div>
                    <div className="col-md-7 col-10">
                        <div className="font-24">
                            {`${backendOrder?.orderAddressFK?.street ?? "-"} ${backendOrder?.orderAddressFK?.no ?? "-"
                                }`}
                        </div>
                        <div className="font-24">
                            {`${postalCode} ${backendOrder?.orderAddressFK?.city ?? "-"
                                }`}
                        </div>
                        <div className="font-24">
                            {`${savedProvince ? savedProvince.name : "-"} ${savedCountry ? savedCountry.name : "-"
                                }`}
                        </div>
                    </div>
                    <div className="col-md-2 col-2 flex-center-end">
                        {isEmpty(currentUser) ? (
                            <i
                                className="ti-angle-right font-24"
                                style={{ cursor: "pointer" }}
                                onClick={() => setIsOpen(true)}
                                role="button"
                                aria-label="open form"
                                tabIndex={0}
                                onKeyPress={() => setIsOpen(true)}
                            />
                        ) : (
                            <Link
                                href="/[branch]/checkout/choose-address"
                                as={`/${currentBranch.id}/checkout/choose-address`}
                            >
                                <i
                                    className="ti-angle-right font-24"
                                    style={{ cursor: "pointer" }}
                                />
                            </Link>
                        )}
                    </div>
                </div>
                {!backendOrder?.orderAddressFK?.street && (
                    <div className="note-warning font-18 font-medium mgt-20 text-red flex-center">
                        <img
                            src="/images/icon/c-warning.svg"
                            alt=""
                            className="mgr-15"
                        />
                        Please pick an address
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShippingAddress;
