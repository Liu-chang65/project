/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable prefer-template */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */

import React from "react";
import Avatar from "@material-ui/core/Avatar";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
};

export const getInitials = (fullName = "") => {
    const firstPosition = 0;
    const thirdPosition = 2;
    const names = fullName.split(" ");
    return names
        .map((name) => name.charAt(firstPosition))
        .join("")
        .substr(firstPosition, thirdPosition)
        .toUpperCase();
};

const CustomAvatar = ({ title, style, size, image, ...rest }) => {
    return (
        <Avatar
            {...rest}
            style={{
                ...style,
                backgroundColor: image ? "unset" : stringToColor(title || ""),
                width: size,
                height: size,
            }}
            alt={title}
            src={image}
        >
            ACCOUNT{" "}
            {rest["aria-controls"] ? (
                <FaChevronUp style={{ marginLeft: 4 }} />
            ) : (
                <FaChevronDown style={{ marginLeft: 4 }} />
            )}
            {/* {getInitials(title || '')} */}
        </Avatar>
    );
};

export default CustomAvatar;
