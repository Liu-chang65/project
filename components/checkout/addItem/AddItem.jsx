import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const AddItem = ({currentBranch}) => {
    const { t } = useTranslation("common");

    return (
        <div className="menu-item menu-item-2 text-center">
            <Link href="/[branch]/menu" as={`/${currentBranch.id}/menu`}>
                <button
                    type="button"
                    className="btn btn-yellow btn-h60 font-20"
                >
                    <i className="ti-plus mgr-10" />
                    {t("add_another")}
                </button>
            </Link>
        </div>
    );
};

export default AddItem;
