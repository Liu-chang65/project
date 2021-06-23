import { useSelector, useDispatch } from 'react-redux';
import queryString from 'query-string';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { isNil } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import ProductModalDetails from '../../components/product/modal/ProductModalDetails';
import MenuModalDetails from '../../components/product/modal/MenuModalDetails';
import ProductModalCustomizeMeal from '../../components/product/modal/ProductModalCustomizeMeal';

import { setProductDetails } from '../../store/actions/cart.actions';
import {
  toggleProductDetailsModal,
  toggleProductDetailsModalLoader,
  toggleCustomizeProductModal,
} from '../../store/actions/layout.actions';
import axios from '../../lib/axios';
import Logger from '../../lib/logger';

const ProductsModalsContainer = ({ productType }) => {
  const dispatch = useDispatch();
  const { i18n, t } = useTranslation(['common']);
  const notifySuccess = () => toast.success(t('api_product_add'));
  const notifyError = () => toast.error(t('api_remove_suc'));
  const { id: branchId } = useSelector((state) => state.root.currentBranch);
  const {
    productDetails,
    isProductDetailsTrigger,
    isMenuDetailsTrigger,
  } = useSelector((state) => state.cart);
  const { currentActiveProductId } = useSelector((state) => state.layout);

  const {
    isProductDetailsActive,
    isCustomizeProductModalActive,
    isProductDetailsLoaderActive,
  } = useSelector((state) => state.layout);

  const boundToggleProductDetailsModal = () => {
    dispatch(toggleProductDetailsModal());
  }

  const boundToggleCustomizeProductModal = () =>
    dispatch(toggleCustomizeProductModal());

  const boundSetProductDetails = (product) =>
    dispatch(setProductDetails(product));

  const boundToggleProductDetailsModalLoader = () =>
    dispatch(toggleProductDetailsModalLoader());

  const handleOrder = () => {
    boundToggleProductDetailsModal();
    boundToggleCustomizeProductModal();
  };

  /**
   * Generate query object
   *
   * @param {Number} id
   * @return {String}
   */
  const generateQueryObject = (id) => {
    if (productType === 'combo') {
      return queryString.stringify({
        comboId: id,
        culture: i18n.language,
        branchId,
      });
    }
    return queryString.stringify({
      mealId: id,
      culture: i18n.language,
      branchId,
    });
  };

  /**
   * Fetch product details
   *
   * @param {Array} ids
   */
  const fetchProductDetails = async (id) => {
    boundToggleProductDetailsModalLoader();
    boundToggleProductDetailsModal();
    const query = generateQueryObject(id);
    try {
      const url = productType === 'combo' ? 'combo-details' : 'meal-details';

      const response = await axios.get(
        `customer/web/meals-service/${url}?${query}`,
      );

      boundSetProductDetails(response.data.result);
    } catch (error) {
      Logger.error(error);
    } finally {
      boundToggleProductDetailsModalLoader();
    }
  };

  const router = useRouter();
  // on id or index change fetch the details again
  useEffect(() => {
    let id = currentActiveProductId;
    const { productId } = queryString.parse(window.location.hash);
    if (!isNil(productId) && id === 0) {
      // eslint-disable-next-line radix
      id = parseInt(productId);
    } else if (id === 0) {
      return;
    }

    window.location = `#productId=${id}`;
    if (
      ![
        '/[branch]/checkout',
        '/[branch]/checkout/choose-address',
        '/[branch]/me/manage_order',
      ].includes(router.pathname)
    )
      fetchProductDetails(id);
  }, [isProductDetailsTrigger, isMenuDetailsTrigger]);

  return (
    <div>
      <ToastContainer />
      {/* <ProductModalDetails
        isActive={isProductDetailsActive}
        isLoading={isProductDetailsLoaderActive}
        productDetails={productDetails}
        close={boundToggleProductDetailsModal}
        order={() => handleOrder()}
      /> */}
      <MenuModalDetails
        isActive={isProductDetailsActive}
        isLoading={isProductDetailsLoaderActive}
        productDetails={productDetails}
        close={boundToggleProductDetailsModal}
        order={() => handleOrder()}
      />
      <ProductModalCustomizeMeal
        productType={productType}
        notifySuccess={notifySuccess}
        notifyError={notifyError}
        isActive={isCustomizeProductModalActive}
        productDetails={productDetails}
        close={boundToggleCustomizeProductModal}
      />
    </div>
  );
};

export default ProductsModalsContainer;
