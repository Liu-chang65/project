import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useProductPriceAndDiscountValueToShow from '../../hooks/product/useProductPriceAndDiscountValueToShow';
import { withTranslation } from '../../i18n/i18n';
import { AiFillInfoCircle } from 'react-icons/ai'
import { HiShoppingCart } from 'react-icons/hi'
import {
  toggleProductDetailsModal,
  toggleCustomizeProductModal,
} from '../../store/actions/layout.actions';

const ProductCard = ({ product, openMoreDetails, t, addToCartSide, openBuildMeal }) => {
  const dispatch = useDispatch();
  const { currency } = useSelector((state) => state.root.settings);
  const {
    isDiscountStillInRange,
    mainMeal,
  } = useProductPriceAndDiscountValueToShow(product);

  return (
    <div className="product-item">
      <div className="product-image relative">
        <a href="" title="">
          {product.thumbnail !== null && <img src={product.thumbnail} />}
          {product.thumbnail === null && <img src='images/picture/no-image-preview.png' />}
        </a>
        {mainMeal.menuPriceOption === 'Delivery' && (
          <div className="delivery absolute flex-center-center hide-abs">
            <a 
              className="btn btn-h46 btn-yellow btn-bgLeft"
              onClick={openBuildMeal}>
              {t('delivery_now')}
            </a>
          </div>
        )}
        {mainMeal.menuPriceOption === 'PickUp' && (
          <div className="pickup absolute flex-center-center hide-abs">
            <a 
              className="btn btn-h46 btn-yellow btn-bgLeft"
              onClick={openBuildMeal}>
              {t('pick_up')}
            </a>
          </div>
        )}
      </div>
      <div className="product-text">
        <h3 className="title-sm mgb-10">
          <a href="" title="" data-toggle="modal" data-target="#product-detail">
            {product.title}
          </a>
        </h3>
        {/* <div className="desc font-18 mgb-20">{product.description} <span></span> </div> */}
        <div>
          <div className="product-price-size">
            <div>
              <div className="product-price text-yellow font-28 font-demi">{`${currency} ${mainMeal.price}`}</div>
              <span>{mainMeal.size}</span>
            </div>
            {mainMeal?.mealSettings &&
              mainMeal.mealSettings[0]?.applyDiscount &&
              isDiscountStillInRange(
                mainMeal.mealSettings[0].from,
                mainMeal.mealSettings[0].to,
              ) && (
                <div className="product-sale mgt-10">
                  <span className="discount inflex-center-center btn-gray btn-h46 btn-bgLeft">
                    {t('discount')} {mainMeal.mealSettings[0].discount}
                    {mainMeal.mealSettings[0].discountType === 'Fixed'
                      ? currency
                      : '%'}
                  </span>
                </div>
              )}
          </div>
        </div>
        <div className="add-and-more mgt-10">
          <a
            onClick={openBuildMeal}
            className="btn-h46 inflex-center-center btn-yellow text-white more"
          >
            <HiShoppingCart className="mr-1" />
            {t('add to cart')}
          </a>
          <a
            onClick={openMoreDetails}
            className="btn-h46 inflex-center-center btn-gray more"
          >
            <AiFillInfoCircle className="mr-1" />
            {t('more')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(ProductCard);
