/* eslint-disable import/prefer-default-export */
import positionConstants from "../../_constants/position.constants";

export const setPosition = (postion) => {
    return {
        type: positionConstants.SET_POSITION,
        payload: postion
    }
}