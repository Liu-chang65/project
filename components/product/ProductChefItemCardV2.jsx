import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import ProductModalMore from '../product/modal/ProductModalMore'
import useProductPriceAndDiscountValueToShow from '../../hooks/product/useProductPriceAndDiscountValueToShow';
import { useRef } from 'react';

const ProductChefItemCardV2 = ({ product, openMoreDetails }) => {
	const { t } = useTranslation(['common']);
	const { currency } = useSelector((state) => state.root.settings);
	const {
		isDiscountStillInRange,
		mainMeal,
	} = useProductPriceAndDiscountValueToShow(product);
	const chText = useRef(null);
	const [isMore, setMore] = useState(false);
	const [showMore, setShowMore] = useState(false)

	useEffect(() => {
		if (product.description && product.description.length > 200) {
			setMore(true)
		}
	}, [product])

	const closeModal = () => {
		setShowMore(!showMore)
	}
	return (
		<div className="chef-item relative">
			<div className="ch-image">
				<div>
					{product.thumbnail !== null && <img src={product.thumbnail} alt={product.title} />}
					{product.thumbnail === null && <img src={product.imagePath} alt={product.title} />}
				</div>
			</div>
			<div className="ch-text text-center" ref={chText}>
				<h3 className="title-sm mgb-minus-50">
					<div className="ch-text_title"><p>{product.title}</p></div>
				</h3>
				<div className="more-wrapper"
					style={{ height: "80px" }}
				>
					<p className="desc text-gray font-18">{product.description}</p>
				</div>
				{ isMore && <button onClick={() => setShowMore(!showMore)} className="ch-more_details">More Details...</button>}
			</div>
			<div className="d-flex flex-column align-items-center">
				<div className="d-flex justify-content-center align-items-center my-4">
					{product?.mealPrices?.length > 1 && (
						<span className="mr-3 font-16">{t('from')}</span>
					)}
					{!isEmpty(mainMeal) &&
						<div className="product-price text-yellow font-28 font-demi">{`${currency} ${mainMeal.price}`}</div>
					}
				</div>
				{mainMeal?.mealSettings && mainMeal?.mealSettings[0]?.applyDiscount &&
					isDiscountStillInRange(
						mainMeal?.mealSettings[0]?.from,
						mainMeal?.mealSettings[0]?.to
					) && (
						<div className="product-sale mgt-10">
							<span className="discount discount--white inflex-center-center btn-gray btn-h46 btn-bgLeft">
								{`${t('discount')} `}
								{mainMeal?.mealSettings[0]?.discount}
								{mainMeal?.mealSettings[0]?.discountType ===
									'Fixed'
									? `${currency}`
									: ' %'}
							</span>
						</div>
					)}
			</div>
			<div className="text-center order-abs">
				<button onClick={openMoreDetails} type="button" className="btn btn-yellow btn-h60 font-18 font-demi text-uppercase">
					{t('order_now')}
				</button>
			</div>
			{showMore && <ProductModalMore closeModal={closeModal} product={product} />}
		</div>
	);
};

export default ProductChefItemCardV2;
