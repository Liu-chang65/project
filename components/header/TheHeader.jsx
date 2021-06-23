/* eslint-disable no-unused-expressions */
import { useState, useRef, useEffect, useCallback } from "react";

import HeaderTop from "./HeaderTop";
import HeaderBottom from "./HeaderBottom";
import { GiHamburgerMenu } from "react-icons/gi";
import MobileHeader from "./MobileHeader";

const TheHeader = () => {
    const [isSticky, setSticky] = useState(false);
    const ref = useRef(null);
    const [showHeader, setShowHeader] = useState(false);

    const handleScroll = useCallback(() => {
        if (ref.current) {
            window.scrollY > ref.current.getBoundingClientRect().bottom
                ? setSticky(true)
                : setSticky(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", () => handleScroll);
        };
    }, [handleScroll]);

    return (
        <div className={`${isSticky ? "sticky" : "header-wrapper"}`} ref={ref}>
            <section className="header-top">
                <div className="header-container">
                    <div className="header-left-part">
                        <HeaderBottom />
                    </div>
                    <div className="header-right-part">
                        <HeaderTop />
                    </div>
                    <div className="mobile-menu-only">
                        <GiHamburgerMenu
                            fontSize="28"
                            onClick={() => setShowHeader(true)}
                            color="#fbaf02"
                        />
                    </div>
                </div>
            </section>
            {showHeader && (
                <MobileHeader onClose={() => setShowHeader(false)} />
            )}
        </div>
    );
};

export default TheHeader;
