import React from "react";
import ReactShimmer from "react-shimmer-effect";

export default function Shimmer({isReady, fallback, children}){
    if(!isReady){
        return <ReactShimmer>{fallback}</ReactShimmer>;
    }
    return <>{children}</>;
}

