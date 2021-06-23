import layoutConstants from '../../_constants/layout.constants';

const initialState = {
  currentActiveProductId: 0,
  currentActiveProductIndex: 0,
  isProductDetailsActive: false,
  isProductDetailsLoaderActive: false,
  isCustomizeProductModalActive: false,
  isConfirmProductModalActive: false,
  isCartDetailsModalActive: false,
  isDeliveryorPickupModalActive: false,
  isCoachmarkActive: false,
  isCartClearModalActive: false,
};

export default function layout(state = initialState, action) {
  switch (action.type) {
    case layoutConstants.TOGGLE_CUSTOMIZE_PRODUCT_MODAL:
      return {
        ...state,
        isCustomizeProductModalActive: !state.isCustomizeProductModalActive,
      };
    case layoutConstants.TOGGLE_PRODUCT_DETAILS_MODAL:
      return {
        ...state,
        isProductDetailsActive: !state.isProductDetailsActive,
      };
    case layoutConstants.TOGGLE_PRODUCT_DETAILS_MODAL_LOADER:
      return {
        ...state,
        isProductDetailsLoaderActive: !state.isProductDetailsLoaderActive,
      };
    case layoutConstants.TOGGLE_CONFIRM_PRODUCT_MODAL:
      return {
        ...state,
        isConfirmProductModalActive: !state.isConfirmProductModalActive,
      };
    case layoutConstants.TOGGLE_CART_DETAILS_MODAL:
      return {
        ...state,
        isCartDetailsModalActive: !state.isCartDetailsModalActive,
      };
    case layoutConstants.CLOSE_CART_DETAILS_MODAL:
      return {
        ...state,
        isCartDetailsModalActive: false,
      };
    case layoutConstants.SET_CURRENT_ACTIVE_PRODUCT_ID:
      return {
        ...state,
        currentActiveProductId: action.payload.id,
      };
    case layoutConstants.SET_CURRENT_ACTIVE_PRODUCT_INDEX:
      return {
        ...state,
        currentActiveProductIndex: action.payload.index,
      };
    case layoutConstants.OPEN_DELIVERYORPICKUP_MODAL:
      return {
        ...state,
        isDeliveryorPickupModalActive: true,
      }
    case layoutConstants.CLOSE_DELIVERYORPICKUP_MODAL:
      return {
        ...state,
        isDeliveryorPickupModalActive: false,
      }
    case layoutConstants.SET_DELIVERYORPICKUP_MODAL_OPEN:
      return {
        ...state,
        isDeliveryorPickupModalActive: action.payload.value,
      }
    case layoutConstants.SET_COACHMARK:
      return {
        ...state,
        isCoachmarkActive: action.payload.value
      }
    case layoutConstants.OPEN_CART_CLEAR_MODAL:
      return {
        ...state,
        isCartClearModalActive: true
      }
      case layoutConstants.CLOSE_CART_CLEAR_MODAL:
        return {
          ...state,
          isCartClearModalActive: false
        }
    default:
      return state;
  }
}
