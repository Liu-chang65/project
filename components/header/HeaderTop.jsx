import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { changeLanguage } from "../../store/actions/cart.actions";
import { toggleCartDetailsModal } from "../../store/actions/layout.actions";
import { i18n, withTranslation } from "../../i18n/i18n";
import BaseSocialLink from "../base/BaseSocialLink";
import Logger from "../../lib/logger";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const HeaderTop = () => {
    const dispatch = useDispatch();
    const { languages, tenantDetails } = useSelector(
        (state) => state.root.settings
    );
    const { finalAmount } = useSelector((state) => state.cart);
    const { currency } = useSelector((state) => state.root.settings);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [socialLinks, setSocialLinks] = useState([]);
    const boundToggleCartDetailsModal = () =>
    {    
        dispatch(toggleCartDetailsModal());
    }

    useEffect(() => {
        const socialLinksList = !tenantDetails.socialLinks
            ? []
            : tenantDetails.socialLinks.split(";");

        setSocialLinks(socialLinksList);
    }, [tenantDetails]);

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
                                            onClick={() =>
                                                onChangeLanguage(language.name)
                                            }
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
        <div className="lang-add-to-cart">
            <button
                type="button"
                className="btn-default d-flex align-items-center header-top__cart mr-2 btn-ccart"
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
            <div className="language">
                <span
                    className="language-value"
                    onClick={toggleLanguageDropdown}
                    style={{ color: "#fff" }}
                >
                    {i18n.language}{" "}
                    {isLanguageDropdownOpen ? (
                        <FaChevronUp />
                    ) : (
                        <FaChevronDown />
                    )}
                </span>
                {dropdown(isLanguageDropdownOpen)}
            </div>
            {socialLinks.length === 0 ? (
                ""
            ) : (
                <div className="social flex-center">
                    <span>FOLLOW US:</span>
                    {socialLinks.map((link, index) => {
                        return <BaseSocialLink link={link} key={index} />;
                    })}
                </div>
            )}
        </div>
    );
};

export default withTranslation()(HeaderTop);
