import cartConstants from '../../_constants/cart.constants';
import { i18n } from '../../i18n/i18n';

const initialState = {
  fromCart: false,
  productDetails: {},
  productsBatch: [],
  currentLanguage: i18n.language || 'en',
  currentCustomizeProductMode: 'add', // add or edit
  deliveryType: 'Delivery', // Delivery or PickUp,
  selectedPrice: {},
  selectedProductChoices: [],
  orderItems: [],
  comboOrderItems: [],
  isProductDetailsTrigger: true,
  isMenuDetailsTrigger: true,
  selectedAddress: {},
  orderAddressFk: {
    postalCodeId: 0,
    orderAddressFk: null,
  },
  postalCode: {},
  finalAmount: 0,
  backendOrder: {
    orderItems: [],
  },
  country: {
    name: '',
    value: '',
    id: '',
  },
  province: {
    name: '',
    value: '',
    id: '',
  },
  couponCode: ''
};

export default function cart(state = initialState, action) {
  switch (action.type) {
    case cartConstants.SET_LANGUAGE:
      return {
        ...state,
        currentLanguage: action.payload.language,
      };
    case cartConstants.SET_PRODUCT_DETAILS:
      return {
        ...state,
        productDetails: action.payload.productDetails,
      };
    case cartConstants.SET_PRODUCTS_BATCH:
      return {
        ...state,
        productsBatch: action.payload.productsBatch,
      };
    case cartConstants.SET_PRODUCT_DETAILS_TRIGGER:
      return {
        ...state,
        isProductDetailsTrigger: !state.isProductDetailsTrigger,
      };
    case cartConstants.SET_MENU_DETAILS_TRIGGER:
      return {
        ...state,
        isMenuDetailsTrigger: !state.isMenuDetailsTrigger,
      };
    case cartConstants.SET_DELIVERY_TYPE:
      return {
        ...state,
        deliveryType: action.payload.type,
      };
    case cartConstants.SET_SELECTED_PRICE:
      return {
        ...state,
        selectedPrice: action.payload.selectedPrice,
      };
    case cartConstants.SET_SELECTED_TOPPINGS:
      return {
        ...state,
        selectedProductChoices: action.payload.selectedToppings,
      };
    case cartConstants.SET_ORDER_ITEMS:
      return {
        ...state,
        orderItems: action.payload.items,
      };
    case cartConstants.SET_COMBO_ORDER_ITEMS:
      return {
        ...state,
        comboOrderItems: action.payload.items,
      };

    case cartConstants.SET_FINAL_AMOUNT:
      return {
        ...state,
        finalAmount: action.payload.finalAmount,
      };

    case cartConstants.SET_BACKEND_ORDER:
      return {
        ...state,
        backendOrder: action.payload.backendOrder,
      };

    case cartConstants.SET_SELECTED_ADDRESS:
      return {
        ...state,
        selectedAddress: action.payload.selectedAddress,
      };

    case cartConstants.RESET_CART:
      return {
        ...initialState,
        currentLanguage: state.currentLanguage,
      };

    case cartConstants.SET_COUNTRY_AND_PROVINCE:
      return {
        ...state,
        country: action.payload.location.country,
        province: action.payload.location.province,
      };

    case cartConstants.FROM_CART:
      return {
        ...state,
        fromCart: action.payload.isFromCart,
      };

    case cartConstants.SET_COUPON_CODE:
      return {
        ...state,
        couponCode: action.payload.couponCode
      }
    default:
      return state;
  }
}
