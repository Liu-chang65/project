/* eslint-disable react/no-danger */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import clsx from "clsx";
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import classes from "./cookienotification.module.css";

export default function CookieNotification() {
    if (!process.browser) {
      return null;
    }

    const [isHidden, setHidden] = useState(false);
    const cookieNotice = useSelector(
        (state) => state.root.settings.cookieNotice
    );
    const { t } = useTranslation(["common"]);
    const handleAccept = useCallback(() => {
        localStorage.setItem("disableCookieNotification", "true");
        setHidden(true);
    }, []);

    useEffect(() => {
        const isHidde =
            localStorage.getItem("disableCookieNotification") === "true";

        setHidden(isHidde);
    }, []);

    if (!isHidden) {
        return createPortal(
            <div className={classes.cookienotification}>
                <div className="container py-3">
                    <div className="row">
                        <div className="col-12 position-relative">
                            <p className="font-18 font-weight-bold">
                                {t("Notice")}
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-10">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: cookieNotice,
                                }}
                            />
                        </div>
                        <div className="col-md-2 ">
                            <button
                                type="button"
                                className={clsx(
                                    "btn btn-white px-2 py-2 rounded-2 w-100",
                                    classes.button
                                )}
                                onClick={handleAccept}
                            >
                                {t("Accept")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return null;
}
