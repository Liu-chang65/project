import layoutConstants from '../../_constants/layout.constants';

export const toggleProductDetailsModal = () => {
    return {
      type: layoutConstants.TOGGLE_PRODUCT_DETAILS_MODAL,
      payload: {},
    };
  };
  
  export const openDeliveryPickupModal = () => {
    return {
      type: layoutConstants.OPEN_DELIVERYORPICKUP_MODAL,
      payload: {}
    }
  }
  export const closeDeliveryPickupModal = () => {
    return {
      type: layoutConstants.CLOSE_DELIVERYORPICKUP_MODAL,
      payload: {}
    }
  }
  export const setDeliveryPickupModalOpen = (value) => {
    return {
      type: layoutConstants.SET_DELIVERYORPICKUP_MODAL_OPEN,
      payload: { value}
    }
  }

  export const setCoachMark = (value) => {
    return {
      type: layoutConstants.SET_COACHMARK,
      payload: { value }
    }
  }

  export const toggleProductDetailsModalLoader = () => {
    return {
      type: layoutConstants.TOGGLE_PRODUCT_DETAILS_MODAL_LOADER,
      payload: {},
    };
  };
  
  export const toggleCustomizeProductModal = () => {
    return {
      type: layoutConstants.TOGGLE_CUSTOMIZE_PRODUCT_MODAL,
      payload: {},
    };
  };
  
  export const toggleConfirmProductModal = () => {
    return {
      type: layoutConstants.TOGGLE_CONFIRM_PRODUCT_MODAL,
      payload: {},
    };
  };
  
  export const toggleCartDetailsModal = () => {
    return {
      type: layoutConstants.TOGGLE_CART_DETAILS_MODAL,
      payload: {},
    };
  };

  export const closeCartDetailsModal = () => {
    return {
      type: layoutConstants.CLOSE_CART_DETAILS_MODAL,
      payload: {},
    };
  };

  export const setCurrentActiveProductId = (id) => {
    return {
      type: layoutConstants.SET_CURRENT_ACTIVE_PRODUCT_ID,
      payload: {
        id,
      },
    };
  };

  export const setCurrentActiveProductIndex = (index) => {
    return {
      type: layoutConstants.SET_CURRENT_ACTIVE_PRODUCT_INDEX,
      payload: {
        index,
      },
    };
  };

  export const openCartClearModal = () => {
    return {
      type: layoutConstants.OPEN_CART_CLEAR_MODAL,
      payload: {}
    }
  }
  export const closeCartClearModal = () => {
    return {
      type: layoutConstants.CLOSE_CART_CLEAR_MODAL,
      payload: {}
    }
  }