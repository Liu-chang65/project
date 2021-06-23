import React from "react";
import { useTranslation } from "react-i18next";

const PaymentMethod = ({ onChange, availablePayments, order }) => {
    const { t } = useTranslation("common");

    return (
        <div className="menu-item menu-item-pick">
            <h2 className="font-24 font-demi mgb-40 flex-center">
                <img
                    src="images/icon/icon-clock.svg"
                    alt=""
                    title=""
                    className="mgr-15"
                />
                {t("payment_method")}{" "}
            </h2>
            <div className="box-060">
                <div className="row">
                    <div className="col-md-12">
                        <div className="row">
                            <form onChange={(event) => onChange(event)}>
                                {availablePayments?.paymentGatewayDetails
                                    ?.STRIPE === "True" && (
                                    <div className="col-md-3">
                                        <label className="label-check relative">
                                            <input
                                                type="radio"
                                                name="payment-type"
                                                className="hide-abs"
                                                // value={selectedPayment}
                                                checked={order.paymentType === 4}
                                                // onClick={() => {
                                                //   setSelectedPayment('Stripe');
                                                // }}
                                                value="Stripe"
                                            />
                                            <span>Stripe</span>
                                        </label>
                                    </div>
                                )}
                                {availablePayments?.paymentGatewayDetails
                                    ?.CARD === "True" && (
                                    <div className="col-md-3">
                                        <label className="label-check relative">
                                            <input
                                                type="radio"
                                                name="payment-type"
                                                className="hide-abs"
                                                // value={selectedPayment}
                                                checked={order.paymentType === 3}
                                                // onClick={() => {
                                                //   setSelectedPayment('Card');
                                                // }}
                                                value="Card"
                                            />
                                            <span>Card</span>
                                        </label>
                                    </div>
                                )}
                                {availablePayments?.paymentGatewayDetails
                                    ?.CASH === "True" && (
                                    <div className="col-md-3">
                                        <label className="label-check relative">
                                            <input
                                                type="radio"
                                                name="payment-type"
                                                className="hide-abs"
                                                // value={selectedPayment}
                                                checked={order.paymentType === 2}
                                                // onClick={() => {
                                                //   setSelectedPayment('Cash');
                                                // }}
                                                value="Cash"
                                            />
                                            <span>Cash</span>
                                        </label>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethod;
