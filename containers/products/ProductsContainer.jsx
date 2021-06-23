import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import queryString from 'query-string';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from "framer-motion";
import {
    setProductsBatch,
    setProductDetailsTrigger,
    setMenuDetailsTrigger,
    setProductDetails
} from "../../store/actions/cart.actions";
import {
    setCurrentActiveProductId,
    setCurrentActiveProductIndex,
    toggleProductDetailsModal,
    toggleCustomizeProductModal,
    toggleProductDetailsModalLoader
} from "../../store/actions/layout.actions";
import ProductCard from "../../components/product/ProductCard";
import ProductChefItemCardV2 from "../../components/product/ProductChefItemCardV2";
import axios from '../../lib/axios';
import Logger from '../../lib/logger';

const easing = [0.175, 0.85, 0.42, 0.96];

const imageVariants = {
    exit: { y: 150, opacity: 0, transition: { duration: 0.5, ease: easing } },
    enter: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: easing,
        },
    },
};

const ProductsContainer = ({ products, productCardType }) => {
    const dispatch = useDispatch();
    const { i18n } = useTranslation(['common']);
    const boundSetProductsBatch = (productsBatch) =>
        dispatch(setProductsBatch(productsBatch));
    const boundSetCurrentActiveProductId = (id) =>
        dispatch(setCurrentActiveProductId(id));
    const boundSetCurrentActiveProductIndex = (index) =>
        dispatch(setCurrentActiveProductIndex(index));
    const boundSetProductsDetailsTrigger = () => {
        dispatch(setProductDetailsTrigger());
    };
    const boundSetMenuDetailsTrigger = () => {
        dispatch(setMenuDetailsTrigger());
    };
    const { id: branchId } = useSelector((state) => state.root.currentBranch);

    const openMoreDetailsModal = (id, index) => {
        // set the products batch
        boundSetProductsBatch(products);
        // set the current active product id
        boundSetCurrentActiveProductId(id);
        // set the current active product index
        boundSetCurrentActiveProductIndex(index);
        // if v3 type
        if (productCardType === "v3") {
            boundSetMenuDetailsTrigger();
        } else {
            // trigger the product details changes
            boundSetProductsDetailsTrigger();
        }
    };

    const handleAddToCartSide = (id, index) => {
        // set the products batch
        boundSetProductsBatch(products);
        // set the current active product id
        boundSetCurrentActiveProductId(id);
        // set the current active product index
        boundSetCurrentActiveProductIndex(index);
    
        // if v3 type
        if (productCardType === "v3") {
            boundSetMenuDetailsTrigger();
        } else {
            // trigger the product details changes
            boundSetProductsDetailsTrigger();
        }
    };

    const generateQueryObject = (id) => {
        return queryString.stringify({
          mealId: id,
          culture: i18n.language,
          branchId,
        });
      };

    const handleBuildMeal = async (id, index) => {
        try {
            dispatch(toggleProductDetailsModalLoader());
            const query = generateQueryObject(id);
            const response = await axios.get(`customer/web/meals-service/meal-details?${query}`);
            if (response.data.result.offeredInSizes) {
                handleAddToCartSide(id, index);
                return;
            }
            
            dispatch(setProductDetails(response.data.result));
            // set the products batch
            boundSetProductsBatch(products);
            // set the current active product id
            boundSetCurrentActiveProductId(id);
            // set the current active product index
            boundSetCurrentActiveProductIndex(index);
            dispatch(toggleCustomizeProductModal());
        } catch(error) {
            Logger.error(error);
        } finally {
            dispatch(toggleProductDetailsModalLoader());
        }
    }

    if (!_.isArray(products)) return "";
    return (
        <div className="col-12">
            <div className="row">
                {products.map((product, index) => (
                    <motion.div
                        variants={imageVariants}
                        exit="exit"
                        enter="exit"
                        animate="enter"
                        className="col-md-4"
                        key={product.id}
                    >
                        {productCardType === "v2" ? (
                            <ProductChefItemCardV2
                                openMoreDetails={() =>
                                    handleBuildMeal(product.mealId, index)
                                }
                                product={product}
                            />
                        ) : (
                            <ProductCard
                                openMoreDetails={() =>
                                    openMoreDetailsModal(product.id, index)
                                }
                                product={product}
                                addToCartSide={() => handleAddToCartSide(product.id, index)}
                                openBuildMeal={() => handleBuildMeal(product.id, index)}
                            />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

ProductsContainer.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    products: PropTypes.array.isRequired,
};

export default ProductsContainer;
