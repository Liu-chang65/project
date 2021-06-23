import React from "react";
import { useSelector } from "react-redux";
import BannerAuthenticationVerifyEmail from "../components/banner/authentication/BannerAuthenticationVerifyEmail";
import AuthenticationContainer from "../containers/authentication/AuthenticationContainer";
import ProductsCustomizeContainer from "../containers/products/ProductsCustomizeContainer";
import CheckoutModalCartDetails from "../components/checkout/modal/CheckoutModalCartDetails";
import DeliveryPickupModal from "../components/modal/deliverypickupmodal/deliverypickupmodal";
import CookieNotification from "../components/cookienotification/cookienotification";
import safeSelector from "../utils/safeSelector";
import deliveryConstants from "../_constants/delivery.constants";
import ModalAuthenticationVerifyPhone from "../components/modal/authentication/ModalAuthenticationVerifyPhone";
import useUserIsLoggedIn from "../hooks/user/useUserIsLoggedIn";
import MaintainanceNotification from "../components/banner/maintainance/MaintainanceNotification";

const DefaultLayout = ({ children }) => {
    const deliveryOption = useSelector(
        safeSelector(
            (state) => state.root.currentBranch.deliverySetting.deliveryOption,
            deliveryConstants.DELIVERY_AND_PICKUP
        )
    );
        
    const isUserLoggedIn = useUserIsLoggedIn();
    const { currentUser } = useSelector((state) => state.authentication);

    return (
        <div>
            <CookieNotification />
            <BannerAuthenticationVerifyEmail />
            <MaintainanceNotification />
            <AuthenticationContainer />
            <ProductsCustomizeContainer />
            <CheckoutModalCartDetails />
            {!currentUser.isPhoneConfirmed && isUserLoggedIn ? (
                <ModalAuthenticationVerifyPhone />
            ) : null}

            <DeliveryPickupModal mode={deliveryOption} />

            {children}
        </div>
    );
};

export default DefaultLayout;
