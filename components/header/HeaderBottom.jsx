/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import Menu from "@material-ui/core/Menu";
import Link from "next/link";
import {
    bindTrigger,
    usePopupState,
    bindMenu,
} from "material-ui-popup-state/hooks";
import MenuItem from "@material-ui/core/MenuItem";
import { Coachmark, DirectionalHint } from "@fluentui/react";
import CustomAvatar from "./CustomAvatar";
import {
    toggleRegistrationModal,
    toggleLoginModal,
    logOut,
    saveInfo,
} from "../../store/actions/authentication.actions";
import { resetCart, setDeliveryType } from "../../store/actions/cart.actions";
import useUserIsLoggedIn from "../../hooks/user/useUserIsLoggedIn";
import getUserDetails from "../../hooks/dataFetching/useUserDetails";
import deliveryConstants from "../../_constants/delivery.constants";
import { openDeliveryPickupModal, openCartClearModal } from "../../store/actions/layout.actions";
import { RiEdit2Fill } from "react-icons/ri";
import { HiArrowRight } from "react-icons/hi";
import CartModalConfirmClear from "../cart/modal/CartModalConfirmClear";


const HeaderBottom = () => {
    const dispatch = useDispatch();
    const isUserLoggedIn = useUserIsLoggedIn();
    const { t } = useTranslation(["common"]);
    const userData = useSelector((state) => state.authentication.basicInfo);
    const logo = useSelector((state) => state.root.logo);
    const { backendOrder } = useSelector((state) => state.cart);
    const { id: branchId, city, streetName } = useSelector(
        (state) => state.root.currentBranch
    );
    const menuState = usePopupState({
        variant: "popover",
        popupId: "dashboardMenu",
        isOpen: false,
    });
    const position = useSelector((state) => state.position);
    const handleLogout = () => {
        localStorage.removeItem("user");
        menuState.isOpen = false;
        dispatch(resetCart());
        dispatch(logOut());
    };
    const boundToggleRegistrationModal = () =>
        dispatch(toggleRegistrationModal());
    const boundToggleLoginModal = () => dispatch(toggleLoginModal());
    const boundDeliveryPickupModal = () => {
        if (backendOrder?.orderItems?.length > 0) {
            dispatch(openCartClearModal());
            return;
        }
        dispatch(openDeliveryPickupModal());
    }
    const isCoachMarkActive = useSelector(
        (state) => state.layout.isCoachmarkActive
    );
    const locationIcon = useRef();
    const [isVisible, setVisible] = useState(false);

    useEffect(() => {
        if (isUserLoggedIn && _.isEmpty(userData)) {
            const fetchUserData = async () => {
                const userDetails = await getUserDetails();
                dispatch(saveInfo(userDetails));
            };
            fetchUserData();
        }
    }, [isUserLoggedIn, dispatch, userData]);

    useEffect(() => {
        setTimeout(() => {
            setVisible(isCoachMarkActive);
        }, 100);
    }, [isCoachMarkActive]);

    useEffect(() => {
        dispatch(setDeliveryType(position.type === "PickupOnly" ? 'PickUp' : 'Delivery'));
    }, [position])

    return (
        <div className="header-left">
            {isVisible && (
                <div className="d-none">
                    <Coachmark
                        target={locationIcon.current}
                        beaconColorOne="#fbaf02"
                        beaconColorTwo="#fbaf02"
                        color="#fbaf02"
                        positioningContainerProps={{
                            directionalHint: DirectionalHint.bottomCenter,
                            doNotLayer: false,
                        }}
                        ariaAlertText="A coachmark has appeared"
                        ariaDescribedBy="coachmark-desc1"
                        ariaLabelledBy="coachmark-label1"
                        ariaDescribedByText="Press enter or alt + C to open the coachmark notification"
                        ariaLabelledByText="Coachmark notification"
                    />
                </div>
            )}
            <div className="header-left-left">
                <div className="header-left-logo">
                    <div className="logo">
                        <Link href={`/${branchId}/`} title="">
                            <span>
                                <img src={logo} alt="" />
                            </span>
                        </Link>
                        <span className="our-menu-link">
                            <Link href={`/${branchId}/menu`}>Our Menu</Link>
                        </span>
                    </div>

                    <div className="right-mb relative visible-mobile">
                        <button
                            type="button"
                            className="btn-default btn-search-mb"
                        >
                            <i className="fa fa-search" />
                        </button>
                        <button
                            type="button"
                            className="btn-default btn-user-mb"
                        >
                            <i className="fa fa-user-o" />
                        </button>

                        <ul className="user-abs">
                            <li onClick={boundToggleLoginModal}>
                                <a>{t("login")}</a>
                            </li>
                            <li onClick={boundToggleRegistrationModal}>
                                <a>Join Now</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="header-left-address">
                    <CartModalConfirmClear />
                    <div className="header-main">
                        <div className="visible-desktop">
                            <div className="address-and-register">
                                <div></div>
                                {!_.isEmpty(position) && (
                                    <div
                                        className="link font-18 address__link"
                                        style={{ cursor: "pointer" }}
                                        onClick={boundDeliveryPickupModal}
                                    >
                                        <i
                                            ref={locationIcon}
                                            id="mapicon"
                                            className="fa fa-map-marker text-yellow mr-2"
                                        />
                                        {position.type ===
                                            deliveryConstants.PICKUP_ONLY &&
                                            `${city} - ${streetName}`}
                                        {(position.type ===
                                            deliveryConstants.DELIVERY_ONLY &&
                                            position.result?.fullAddress) ||
                                            position.result?.zone?.postalCode}
                                        <RiEdit2Fill
                                            style={{
                                                marginLeft: 4,
                                            }}
                                            color="#fbaf02"
                                        />
                                    </div>
                                )}
                                {isUserLoggedIn ? (
                                    !_.isEmpty(userData) && (
                                        <>
                                            <CustomAvatar
                                                title={`${userData.name || ""
                                                    } ${userData.surname || ""}`}
                                                // image={userData.avatar}
                                                size="2.5em"
                                                style={{
                                                    cursor: "pointer",
                                                }}
                                                {...bindTrigger(menuState)}
                                            />
                                            <Menu
                                                {...bindMenu(menuState)}
                                                anchorOrigin={{
                                                    vertical: "bottom",
                                                    horizontal: "center",
                                                }}
                                                disableScrollLock={true}
                                            >
                                                <Link
                                                    href={`/${branchId}/me/basic_info`}
                                                >
                                                    <MenuItem>
                                                        <div className="custom-menu-item">
                                                            {" "}
                                                            <div>
                                                                <span className="custom-menu-item-a">
                                                                    P
                                                                </span>{" "}
                                                                My Profile
                                                            </div>{" "}
                                                            <div>
                                                                <HiArrowRight />
                                                            </div>
                                                        </div>
                                                    </MenuItem>
                                                </Link>
                                                <Link
                                                    href={`/${branchId}/me/manage_order`}
                                                >
                                                    <MenuItem>
                                                        <div className="custom-menu-item">
                                                            {" "}
                                                            <div>
                                                                <span className="custom-menu-item-a">
                                                                    O
                                                                </span>{" "}
                                                                My Orders
                                                            </div>{" "}
                                                            <div>
                                                                <HiArrowRight />
                                                            </div>
                                                        </div>
                                                    </MenuItem>
                                                </Link>

                                                <MenuItem
                                                    onClick={handleLogout}
                                                >
                                                    Logout
                                                </MenuItem>
                                            </Menu>
                                        </>
                                    )
                                ) : (
                                    <div className="btn-join1">
                                        <button
                                            type="button"
                                            onClick={boundToggleLoginModal}
                                            className="btn-tranfer btn-login"
                                        >
                                            {t("login")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={
                                                boundToggleRegistrationModal
                                            }
                                            className="btn btn-join"
                                        >
                                            JOIN NOW
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderBottom;
