/* eslint-disable no-nested-ternary */
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingOverlay from "react-loading-overlay";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import {
    setFinalAmount,
    setBackendOrder,
} from "../../../store/actions/cart.actions";
import { toggleCartDetailsModal, setCurrentActiveProductId } from "../../../store/actions/layout.actions";
import { withTranslation } from "../../../i18n/i18n";
import axios from "../../../lib/axios";
import safeSelector from "../../../utils/safeSelector";

const PriceItem = ({ price, currency }) =>
    price === 0 ? (
        <p>FREE</p>
    ) : (
        <p style={{ lineHeight: 1 }}>
            <span className="top__cart__currency mr-1">{currency}</span>{" "}
            {price.toFixed(2)}
        </p>
    );

const CheckoutModalCartDetails = ({ t }) => {
    const position = useSelector(
        safeSelector((state) => state.position.result.zone, null)
    );

    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const { backendOrder, deliveryType } = useSelector((state) => state.cart);
    const { id } = useSelector(
        safeSelector((state) => state.root.currentBranch, { id: 1 })
    );
    const { isCartDetailsModalActive } = useSelector((state) => state.layout);
    const router = useRouter();
    const minCartValue = useMemo(() => {
        if (typeof window === "undefined") {
            return 0;
        }

        if (!position) {
            return 0;
        }

        return position.minOrderValue;
    }, [position]);
    const isLessThanMinCart = backendOrder.finalAmount < minCartValue;
    const notifySuccess = () => toast.success(t("api_product_rem"));
    const notifyError = (errorMessage) => toast.error(errorMessage);
    const { currency } = useSelector((state) => state.root.settings);
    const boundtoggleCartDetailsModal = () => dispatch(toggleCartDetailsModal());
    const goToMenu = () => {
        boundtoggleCartDetailsModal();
        router.push(`/[branch]/menu`, `/${id}/menu`);
    };
    const handleSelectAddress = () => {
        const handleUpdate = async () => {
            try {
                setIsLoading(true);
                const response = await axios.post(
                    "/customer/web/checkout-service/order",
                    {
                        ...backendOrder
                    }
                );

                dispatch(setBackendOrder(response.data.result));
                dispatch(setFinalAmount(response.data.result.finalAmount));
                dispatch(setCurrentActiveProductId(0));
                router.push(
                    `/[branch]/checkout`,
                    `/${backendOrder.branchId}/checkout`
                );
            } catch (apiError) {
                toast.error(apiError.response.data.error.message);
            } finally {
                setIsLoading(false);
                
            }
        };

        handleUpdate();
    };
    const handleOrderQuantity = (type, index) => async () => {
        try {
            const changedAmount = type === "inc" ? 1 : -1;
            const response = await axios.post(
                "/customer/web/checkout-service/order",
                {
                    ...backendOrder,
                    orderItems: backendOrder.orderItems.map((item, i) => {
                        if (i === index) {
                            const newQuantity = item.quantity + changedAmount;
                            return {
                                ...item,
                                quantity: newQuantity,
                                orderItemChoices:
                                    item.orderItemChoices &&
                                    item.orderItemChoices.map((itemChoice) => ({
                                        ...itemChoice,
                                        quantity: newQuantity,
                                    })),
                            };
                        }
                        return item;
                    }),
                }
            );
            dispatch(setFinalAmount(response.data.result.finalAmount));
            dispatch(setBackendOrder(response.data.result));
        } catch (apiError) {
            notifyError(apiError.response.data.error.message);
        }
    };
    const handleDelete = async (lineItemId) => {
        try {
            const response = await axios.post(
                "/customer/web/checkout-service/order",
                {
                    ...backendOrder,
                    orderItems: backendOrder.orderItems.filter(
                        (order) => order.id !== lineItemId
                    ),
                }
            );

            dispatch(setFinalAmount(response.data.result.finalAmount));
            dispatch(setBackendOrder(response.data.result));
            notifySuccess();
        } catch (apiError) {
            notifyError(apiError.response.data.error.message);
        }
    };

    useEffect(() => {
        window.location.hash = "";
    }, []);
    
    useEffect(() => {
        router.prefetch(`/[branch]/menu`, `/${id}/menu`);
    }, [id, router]);

    return (
        <LoadingOverlay active={isLoading} spinner text="">
            <AnimatePresence>
                {isCartDetailsModalActive && (
                    <motion.div
                        key="checkoutmodal"
                        animate={{ right: 0, opacity: 1 }}
                        transition={{ease: "linear"}}
                        initial={{ right: -580, opacity: 0 }}
                        exit={{ right: -580, opacity: 0 }}
                        className="customize-food show"
                    >
                        <div
                            className="customize-main relative pb-3"
                            style={{ maxWidth: "580px", background: "#ccc" }}
                        >
                            <div
                                className="customize-top relative"
                                style={{
                                    marginTop: "24px",
                                    backgroundColor: "#FFF",
                                    boxShadow:
                                        "0px 1px 2px 0px rgba(0,0,0,0.75)",
                                }}
                            >
                                <h2 className="title">
                                    <span>{t("your_cart")}</span>
                                </h2>
                                <button
                                    type="button"
                                    className="close close-customize"
                                    onClick={boundtoggleCartDetailsModal}
                                >
                                    <i className="ti-close" />
                                </button>
                            </div>
                            {!backendOrder.orderItems.length ? (
                                <div
                                    className="d-flex flex-column align-items-center p-4 mt-4"
                                    style={{
                                        backgroundColor: "#FFF",
                                        boxShadow:
                                            "0px 1px 2px 0px rgba(0,0,0,0.75)",
                                    }}
                                >
                                    <img
                                        src="images/icon/warning.svg"
                                        style={{ width: "20%" }}
                                        alt="A yellow warning symbol"
                                    />
                                    <p className="text-center mt-3">
                                        <strong>{t("empty_cart")}</strong>
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className="p-4 mt-3"
                                        style={{
                                            backgroundColor: "#FFF",
                                            boxShadow:
                                                "0px 1px 2px 0px rgba(0,0,0,0.75)",
                                        }}
                                    >
                                        <h2>
                                            <span>{t("your_order")}</span>
                                        </h2>
                                        <hr />
                                        {backendOrder.orderItems.map(
                                            (item, i) => (
                                                <div className="d-flex flex-column">
                                                    <div>
                                                        <div className="d-flex justify-content-between">
                                                            <p>
                                                                {item.quantity}{" "}
                                                                {item.mealName}
                                                            </p>
                                                            <p>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-white p-0 change-quantity mr-2  rounded-circle"
                                                                    disabled={
                                                                        item.quantity ===
                                                                        1
                                                                    }
                                                                    onClick={handleOrderQuantity(
                                                                        "dec",
                                                                        i
                                                                    )}
                                                                >
                                                                    -
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-yellow p-0 change-quantity rounded-circle"
                                                                    onClick={handleOrderQuantity(
                                                                        "inc",
                                                                        i
                                                                    )}
                                                                >
                                                                    +
                                                                </button>
                                                            </p>
                                                            <div className="d-flex align-items-center">
                                                                <PriceItem
                                                                    currency={
                                                                        currency
                                                                    }
                                                                    price={
                                                                        item.mealPrice *
                                                                            item.quantity -
                                                                        (item.discount ||
                                                                            0) +
                                                                        item.orderItemChoices.reduce(
                                                                            (
                                                                                acc,
                                                                                lineItem
                                                                            ) =>
                                                                                acc +
                                                                                lineItem.quantity *
                                                                                    lineItem.choiceItemPrice,
                                                                            0
                                                                        )
                                                                    }
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn-default"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            item.id
                                                                        )
                                                                    }
                                                                >
                                                                    <i
                                                                        className="fa fa-trash-o"
                                                                        aria-hidden="true"
                                                                    />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {item.orderItemChoices.map(
                                                            (order) => (
                                                                <div className="d-flex justify-content-between ml-4">
                                                                    <p>
                                                                        X
                                                                        {
                                                                            order.quantity
                                                                        }{" "}
                                                                        {
                                                                            order.choiceItemName
                                                                        }
                                                                    </p>
                                                                    <PriceItem
                                                                        currency={
                                                                            currency
                                                                        }
                                                                        price={
                                                                            order.choiceItemPrice *
                                                                            order.quantity
                                                                        }
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                    <hr />
                                                </div>
                                            )
                                        )}
                                        {/* <div className="d-flex justify-content-between">
                                            <p>{t("total")}:</p>
                                            <PriceItem
                                                currency={currency}
                                                price={
                                                    backendOrder.orderItemsTotal
                                                }
                                            />
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p>
                                                {t("tax")} (
                                                {backendOrder.taxRate}%{" "}
                                                {t("included")}):{" "}
                                            </p>
                                            <p>{backendOrder.tax.toFixed(2)}</p>
                                        </div>
                                        {deliveryType === "Delivery" && (
                                            <div className="d-flex justify-content-between">
                                                <p>{t("delivery_charge")}: </p>
                                                <p>
                                                    {backendOrder.deliveryCharge ===
                                                    0
                                                        ? t("free")
                                                        : backendOrder.deliveryCharge}
                                                </p>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between">
                                            <p>{t("payment_commission")}:</p>{" "}
                                            <PriceItem
                                                currency={currency}
                                                price={
                                                    backendOrder.paymentCommission
                                                }
                                            />
                                        </div> */}
                                    </div>
                                    <div
                                        className="d-flex justify-content-between pl-4 pr-4"
                                        style={{
                                            backgroundColor: "#080040",
                                            color: "#FFF",
                                            fontSize: "1.625rem",
                                            padding: "0.6rem",
                                            fontWeight: 600,
                                            boxShadow:
                                                "0px 1px 2px 0px rgba(0,0,0,0.75)",
                                        }}
                                    >
                                        <p>{t("order_total")}</p>
                                        <p>
                                            <span
                                                className="top__cart__currency mr-1"
                                                style={{ fontSize: "1rem" }}
                                            >
                                                {currency}
                                            </span>
                                            {backendOrder.finalAmount.toFixed(
                                                2
                                            )}
                                        </p>
                                    </div>
                                </>
                            )}

                            <button
                                type="button"
                                disabled={isLessThanMinCart}
                                className="btn-default d-flex align-items-center header-top__cart px-3 py-2 pb-3"
                                style={{
                                    fontSize: "1.625rem",
                                    width: "100%",
                                    marginTop: "24px",
                                    boxShadow:
                                        "0px 1px 2px 0px rgba(0,0,0,0.75)",
                                }}
                                onClick={
                                    !backendOrder.orderItems.length
                                        ? goToMenu
                                        : () => handleSelectAddress()
                                }
                            >
                                <p style={{ width: "100%", fontWeight: 600 }}>
                                    {isLessThanMinCart
                                        ? t("add_more_items")
                                        : !backendOrder.orderItems.length
                                        ? t("explore_menu")
                                        : t("checkout")}
                                </p>
                            </button>
                            {isLessThanMinCart && (
                                <div className="alert-danger p-2 mt-3">
                                    {t("min_cart_message")} {currency}{" "}
                                    {minCartValue}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </LoadingOverlay>
    );
};

export default withTranslation()(CheckoutModalCartDetails);
