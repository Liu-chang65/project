import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useSelector, useDispatch } from "react-redux";
import ModalAuthenticationSignUp from "../../components/modal/authentication/ModalAuthenticationSignUp";
import ModalAuthenticationWhatIsThis from "../../components/modal/authentication/ModalAuthenticationWhatIsThis";
import ModalAuthenticationSignIn from "../../components/modal/authentication/ModalAuthenticationSignIn";
import ModalAuthenticationVerifyPhone from "../../components/modal/authentication/ModalAuthenticationVerifyPhone";
import ModalAuthenticationForgotPassword from "../../components/modal/authentication/ModalAuthenticationForgotPassword";
import axios from "../../lib/axios";
import Logger from "../../lib/logger";
import {
    setUserData,
    togglePhoneVerficationModal,
} from "../../store/actions/authentication.actions";
import useUserIsLoggedIn from "../../hooks/user/useUserIsLoggedIn";

const AuthenticationContainer = () => {
    const {
        isRegistrationModalVisible,
        isWhatsThisModalVisible,
        isLoginModalVisible,
        isPhoneVerificationModalVisible,
        isForgotPasswordModalVisible,
    } = useSelector((state) => state.authentication);
    const dispatch = useDispatch();
    const isUserLoggedIn = useUserIsLoggedIn();
    const [socialAuthProviders, setSocialAuthProviders] = useState([]);
    const [googleClientId, setGoogleClientId] = useState(null);
    const [message, setMessage] = useState("");
    const { t } = useTranslation(["common"]);

    const boundTogglePhoneVerficationModal = () => {
        dispatch(togglePhoneVerficationModal());
    };

    const onOneTapSignedIn = (response) => {
        handleGoogleLogin(response.credential);
    };

    const showErrorMessage = (message, timeout) => {
        setMessage(message);
        setTimeout(() => {
            setMessage("");
        }, timeout);
    };

    const handleGoogleLogin = async (credential) => {
        try {
            const response = await axios.post("customer/external-login", {
                authProvider: "Google",
                ProviderKey: "",
                ProviderAccessCode: credential,
            });
            const userData = response.data.result;
            if (!userData.isPhoneConfirmed) {
                boundTogglePhoneVerficationModal();
            }
            dispatch(setUserData(userData));
        } catch (error) {
            showErrorMessage(t("request_failed"), 5000);
        }
    };

    const initializeGSI = () => {
        google.accounts.id.initialize({
            client_id: googleClientId,
            callback: onOneTapSignedIn,
        });
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
                console.log(notification.getNotDisplayedReason());
            } else if (notification.isSkippedMoment()) {
                console.log(notification.getSkippedReason());
            } else if (notification.isDismissedMoment()) {
                console.log(notification.getDismissedReason());
            }
        });
    };

    useEffect(() => {
        if (!isUserLoggedIn) {
            const el = document.createElement("script");
            el.setAttribute("src", "https://accounts.google.com/gsi/client");
            el.onload = () => initializeGSI();
            document.querySelector("body").appendChild(el);
        }
    }, [googleClientId, isUserLoggedIn]);

    const getSocialAuthProviders = async () => {
        try {
            const response = await axios.get(
                "TokenAuth/GetExternalAuthenticationProviders"
            );
            setSocialAuthProviders(response.data.result);
        } catch (error) {
            Logger.log(error);
        }
    };

    useEffect(() => {
        socialAuthProviders.forEach((provider) => {
            if (provider.name === "Google") {
                setGoogleClientId(provider.clientId);
            }
        });
    }, [socialAuthProviders]);

    useEffect(() => {
        getSocialAuthProviders();
    }, []);

    return (
        <div>
            {message && <div className="alert alert-danger">{message}</div>}
            {isRegistrationModalVisible && (
                <ModalAuthenticationSignUp
                    socialAuthProviders={socialAuthProviders}
                />
            )}
            {isWhatsThisModalVisible && <ModalAuthenticationWhatIsThis />}
            {isLoginModalVisible && (
                <ModalAuthenticationSignIn
                    socialAuthProviders={socialAuthProviders}
                />
            )}
            {isPhoneVerificationModalVisible && (
                <ModalAuthenticationVerifyPhone />
            )}
            {isForgotPasswordModalVisible && (
                <ModalAuthenticationForgotPassword />
            )}
        </div>
    );
};

export default AuthenticationContainer;
