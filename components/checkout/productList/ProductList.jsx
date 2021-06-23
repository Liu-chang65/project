import React from "react";
import CheckoutProductCard from "../product/CheckoutProductCard";
import { useTranslation } from "react-i18next";

const ProductList = ({
    order,
    productsBatch,
    setIsLoading,
    setOrder,
    isLessThanMinCart,
    currency,
    minCartValue
}) => {
    const { t } = useTranslation("common");

    return (
        <>
            {order.orderItems.map((orderItem) => (
                <CheckoutProductCard
                    orderItem={orderItem}
                    finalAmount={order.finalAmount}
                    thumb={
                        productsBatch.find(
                            (product) => product.id === orderItem.mealId
                        )?.thumbnail
                    }
                    setIsLoading={setIsLoading}
                    backendOrder={order}
                    setOrder={setOrder}
                />
            ))}
            {isLessThanMinCart && (
                <div className="note-warning font-18 font-medium text-red flex-center">
                    <img
                        src="/images/icon/c-warning.svg"
                        alt=""
                        className="mgr-15"
                    />
                    {t("min_cart_message")} {currency} {minCartValue}
                </div>
            )}
        </>
    );
};

export default ProductList;
