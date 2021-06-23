import cartConstants from '../../_constants/cart.constants';

export const setProductDetails = (productDetails) => {
  return {
    type: cartConstants.SET_PRODUCT_DETAILS,
    payload: {
      productDetails,
    },
  };
};

export const changeLanguage = (language) => {
  return {
    type: cartConstants.SET_LANGUAGE,
    payload: {
      language,
    },
  };
};

export const setProductsBatch = (productsBatch) => {
  return {
    type: cartConstants.SET_PRODUCTS_BATCH,
    payload: {
      productsBatch,
    },
  };
};

export const setProductDetailsTrigger = () => {
  return {
    type: cartConstants.SET_PRODUCT_DETAILS_TRIGGER,
  };
};

export const setMenuDetailsTrigger = () => {
  return {
    type: cartConstants.SET_MENU_DETAILS_TRIGGER,
  };
};

export const setSelectedPrice = (selectedPrice) => {
  return {
    type: cartConstants.SET_SELECTED_PRICE,
    payload: {
      selectedPrice,
    },
  };
};

export const setSelectedToppings = (selectedToppings) => {
  return {
    type: cartConstants.SET_SELECTED_TOPPINGS,
    payload: {
      selectedToppings,
    },
  };
};

export const setDeliveryType = (type) => {

  if (type === 'DeliveryOnly') {
    return {
      type: cartConstants.SET_DELIVERY_TYPE,
      payload: {
        type: 'Delivery'
      },
    };
  }

  if (type === 'PickupOnly') {
    return {
      type: cartConstants.SET_DELIVERY_TYPE,
      payload: {
        type: 'Pickup'
      },
    };
  }

  if (type !== 'Delivery' && type !== 'PickUp') {
    return {
      type: cartConstants.SET_DELIVERY_TYPE,
      payload: {
        type: 'Delivery',
      },
    };
  }

  return {
    type: cartConstants.SET_DELIVERY_TYPE,
    payload: {
      type,
    },
  };
};

export const setOrderItems = (items) => {
  return {
    type: cartConstants.SET_ORDER_ITEMS,
    payload: {
      items,
    },
  };
};

export const setComboOrderItems = (items) => {
  return {
    type: cartConstants.SET_COMBO_ORDER_ITEMS,
    payload: {
      items,
    },
  };
};

export const setFinalAmount = (finalAmount) => {
  return {
    type: cartConstants.SET_FINAL_AMOUNT,
    payload: {
      finalAmount,
    },
  };
};

export const setBackendOrder = (backendOrder) => {
  return {
    type: cartConstants.SET_BACKEND_ORDER,
    payload: {
      backendOrder,
    },
  };
};

export const setSelectedAddress = (selectedAddress) => {
  return {
    type: cartConstants.SET_SELECTED_ADDRESS,
    payload: {
      selectedAddress,
    },
  };
};

export const resetCart = () => {
  return {
    type: cartConstants.RESET_CART,
    payload: {},
  };
};

export const setCountryAndProvince = (location) => {
  return {
    type: cartConstants.SET_COUNTRY_AND_PROVINCE,
    payload: { location },
  };
};

export const fromCart = (isFromCart) => {
  return {
    type: cartConstants.FROM_CART,
    payload: { isFromCart },
  };
};

export const setCouponCode = (couponCode) => {
  return {
    type: cartConstants.SET_COUPON_CODE,
    payload: { couponCode }
  };
};