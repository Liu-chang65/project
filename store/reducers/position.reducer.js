import positionConstants from "../../_constants/position.constants"

export default function Position (state = {}, action){
    switch(action.type){
        case positionConstants.SET_POSITION: {
            return action.payload;
        }
        default: 
            return state
    }
}