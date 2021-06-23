import { ImCross } from "react-icons/im";
import {
    FaShoppingBag,
    FaUser,
    FaChevronUp,
    FaChevronDown,
} from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import useUserIsLoggedIn from "../../hooks/user/useUserIsLoggedIn";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import {
    toggleRegistrationModal,
    toggleLoginModal,
    logOut,
} from "../../store/actions/authentication.actions";
import { resetCart } from "../../store/actions/cart.actions";
import { useState } from "react";
import { i18n } from "../../i18n/i18n";
import { AiFillMessage } from "react-icons/ai";
import { changeLanguage } from "../../store/actions/cart.actions";
import Logger from "../../lib/logger";
import { toggleCartDetailsModal } from "../../store/actions/layout.actions";

const MobileHeader = ({ onClose }) => {
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const { languages } = useSelector(
        (state) => state.root.settings
    );
    const dispatch = useDispatch();
    const { finalAmount } = useSelector((state) => state.cart);
    const { currency } = useSelector((state) => state.root.settings);
    const boundToggleCartDetailsModal = () => {
        onClose();
        dispatch(toggleCartDetailsModal());
    }

    const { id: branchId } = useSelector((state) => state.root.currentBranch);
    const isUserLoggedIn = useUserIsLoggedIn();

    const boundToggleLoginModal = () => {
        onClose();
        dispatch(toggleLoginModal());
    };

    const boundToggleRegistrationModal = () => {
        onClose();
        dispatch(toggleRegistrationModal());
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        dispatch(resetCart());
        dispatch(logOut());
        onClose();
    };

    const toggleLanguageDropdown = () => {
        setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
    };

    const onChangeLanguage = async (language) => {
        await i18n.changeLanguage(language);
        setIsLanguageDropdownOpen(false);
        dispatch(changeLanguage(language));
        Logger.log(i18n.language, "language");
        if (i18n.language == "en") {
            const path = window.location.pathname.split("/");
            path.splice(1, 1);
            window.history.replaceState(null, null, path.join("/"));
        } else if (i18n.language == "de") {
            const path = window.location.pathname.split("/");
            path[0] = "/de";
            window.history.replaceState(null, null, path.join("/"));
        }
    };

    const dropdown = (isActive) => {
        if (isActive) {
            return (
                <ul className="choice-lang">
                    {languages.map((language) => {
                        return (
                            <ul className="choice-lang">
                                {languages.map((language) => {
                                    return (
                                        <li
                                            onClick={() => {
                                                onClose();
                                                onChangeLanguage(language.name);
                                            }}
                                            key={language.name}
                                        >
                                            {language.name}
                                        </li>
                                    );
                                })}
                            </ul>
                        );
                    })}
                </ul>
            );
        }
    };

    return (
        <div className="mobile-header">
            <ImCross
                onClick={onClose}
                style={{ cursor: "pointer" }}
                className="cross-mobile-header"
            />
            <div className="mobile-header-profile">
                <div className="mobile-avatar">
                    <div className="d-flex">
                        <div className="mobile-avatar-img"></div>
                        <h3 className="mobile-header-h3">Account</h3>
                    </div>
                </div>
            </div>
            <div className="mobile-header-body">
                {isUserLoggedIn ? (
                    <>
                        <Link href={`/${branchId}/me/basic_info`}>
                            <div
                                className="mobile-btn-order"
                                onClick={() => onClose()}
                            >
                                <FaUser className="order-icon" /> My Profile
                            </div>
                        </Link>
                        <Link href={`/${branchId}/me/manage_order`}>
                            <div
                                className="mobile-btn-order"
                                onClick={() => onClose()}
                            >
                                <FaShoppingBag className="order-icon" /> My
                                Order
                            </div>
                        </Link>
                        <div
                            className="mobile-btn-order"
                            onClick={boundToggleCartDetailsModal}
                        >
                            <span className="top__cart__currency mr-1">{currency}</span>
                            <span className="header-top__cart__total mr-2">
                                {finalAmount.toFixed(2)}
                            </span>
                            <img
                                src="/images/icon/cart.svg"
                                alt=""
                                style={{ height: "1rem" }}
                            />
                        </div>
                        <div
                            className="mobile-btn-order"
                            onClick={handleLogout}
                        >
                            <IoLogOut className="order-icon" /> Logout
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mobile-header-body__lr">
                            <button
                                className="mobile-btn-login"
                                onClick={boundToggleLoginModal}
                            >
                                Login
                            </button>
                            <button
                                className="mobile-btn-register"
                                onClick={boundToggleRegistrationModal}
                            >
                                Register
                            </button>
                            <button
                                className="mobile-btn-register"
                                onClick={boundToggleCartDetailsModal}
                            >
                                <span className="top__cart__currency mr-1">{currency}</span>
                                <span className="header-top__cart__total mr-2">
                                    {finalAmount.toFixed(2)}
                                </span>
                                <img
                                    src="/images/icon/cart.svg"
                                    alt=""
                                    style={{ height: "1rem" }}
                                />
                            </button>
                        </div>
                    </>
                )}
                <div className="language mobile-header-lang">
                    <span
                        className="language-value"
                        onClick={toggleLanguageDropdown}
                        style={{ color: "#fff" }}
                    >
                        <AiFillMessage style={{ lineHeight: 40 }} />{" "}
                        {i18n.language}{" "}
                    </span>
                    <span>
                        {isLanguageDropdownOpen ? (
                            <FaChevronUp />
                        ) : (
                            <FaChevronDown />
                        )}
                    </span>
                    {dropdown(isLanguageDropdownOpen)}
                </div>
            </div>
        </div>
    );
};

export default MobileHeader;
