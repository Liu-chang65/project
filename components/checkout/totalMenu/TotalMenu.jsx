import React, { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import LoadingOverlay from "react-loading-overlay";
import axios from '../../../lib/axios';
import { setBackendOrder, setFinalAmount } from '../../../store/actions/cart.actions';

const TotalMenu = ({ currency, order, isLessThanMinCart, handleCheckout }) => {
    const [couponCode, setCouponCode] = useState(order.couponCode);
    const [isLoading, setIsLoading] = useState(false);
    const [updatedOrder, setUpdatedOrder] = useState(order);
    const dispatch = useDispatch();
    const { t } = useTranslation("common");

    const handleChange = (event) => {
        setCouponCode(event.target.value)
    }

    const clearCoupon = async () => {
        setCouponCode('');
        await refreshOrder('');
    }

    const refreshOrder = async (code) => {
        try {
            setIsLoading(true);
            const response = await axios.post(
                `/customer/web/checkout-service/orders/${order.id}/value`,
                {
                    "couponCode": `${code}`,
                }
            );
            let orderData = {... order, ...response.data.result};
            setUpdatedOrder(orderData);
            dispatch(setBackendOrder(orderData));
            dispatch(setFinalAmount(orderData.finalAmount));
        } catch (apiError) {
            toast.error(apiError.response.data.error.message);
            setCouponCode('');
        } finally {
            setIsLoading(false);
        }
    }

    const applyCoupon = async () => {
        await refreshOrder(couponCode);
    }

    useEffect(() => {
        setUpdatedOrder(order)
        setCouponCode(order.couponCode);
    }, [order])

    return (
        <LoadingOverlay active={isLoading} spinner text="">
            <div className="menu-money">
                <div className="row">
                    <div className="col-md-6">
                        <div className="total-menu">
                            <div className="flex-center-between mgb-10">
                                <span className="font-24 text-ghi">
                                    {t("order_total")}
                                </span>
                                <span className="font-weight-bold font-36 text-green">
                                    {currency} {updatedOrder.orderItemsTotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex-center-between mgb-10">
                                <span className="font-24 text-ghi">
                                   {`${t("tax")}${updatedOrder.taxVariation === "INCLUSIVE" ? '(Included)' : ''}`}
                                </span>
                                <span className="font-weight-bold font-36 text-green">
                                    {currency} {updatedOrder.tax.toFixed(2)}{updatedOrder.taxPercentage > 0 ? `(${updatedOrder.taxPercentage.toFixed(2)}%)`: ''}
                                </span>
                            </div>
                            <div className="flex-center-between mgb-10">
                                <span className="font-24 text-ghi">
                                    Total After Tax
                                </span>
                                <span className="font-weight-bold font-36 text-green">
                                    {currency} {updatedOrder.totalAfterTax.toFixed(2)}
                                </span>
                            </div>
                            {updatedOrder.coupon !== 0 && <div className="flex-center-between mgb-10">
                                <span className="font-24 text-ghi">
                                    {t("coupon")}
                                </span>
                                <span className="font-weight-bold font-36 text-green">
                                    - {currency} {updatedOrder.coupon.toFixed(2)}
                                </span>
                            </div>}
                           {updatedOrder.paymentCommission !== 0 && <div className="flex-center-between mgb-10">
                                <span className="font-24 text-ghi">
                                    Payment Commission
                                </span>
                                <span className="font-weight-bold font-36 text-green">
                                    {currency} {updatedOrder.paymentCommission.toFixed(2)}
                                </span>
                            </div>}
                            <div className="flex-center-between mgb-10">
                                <span className="font-24 text-ghi">
                                    Delivery Fee
                                </span>
                                <span className="font-weight-bold font-36 text-green">
                                    { updatedOrder.deliveryCharge > 0 ? `${currency} ${updatedOrder.deliveryCharge.toFixed(2)}` : 'Free'}
                                </span>
                            </div>
                            <div className="flex-center-end">
                                <span className="font-weight-bold font-56 text-yellow">
                                    {currency} {updatedOrder.finalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="total-promotion">
                            <div className="flex-center-between mgb-30">
                                <span className="font-medium font-24 s-33">
                                    {t("coupon")}
                                </span>
                                <div className="input-coupon relative">
                                    <input
                                        type="text"
                                        name="couponCode"
                                        value={couponCode}
                                        placeholder=""
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="flex-center">
                                <button type="button" onClick={applyCoupon} className="btn btn-yellow btn-h46 w140">Apply Coupon</button>
                            &nbsp;&nbsp;&nbsp;
                            <button type="button" disabled={!couponCode || couponCode.length === 0} onClick={clearCoupon} className="btn btn-white btn-h46 w140">Clear Coupon</button>
                            </div>
                            <br />
                            <br />
                            <button
                                type="button"
                                disabled={isLessThanMinCart}
                                className="btn btn-block btn-yellow btn-h80 font-24 font-weight-bold"
                                id="checkout-button"
                                onClick={handleCheckout}
                            >
                                {t("confirm_checkout")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </LoadingOverlay>
    );
};

export default TotalMenu;
