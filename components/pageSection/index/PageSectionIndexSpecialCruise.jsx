import { useEffect } from 'react';
import LoadingOverlay from "react-loading-overlay";
import _ from 'lodash';
import { withTranslation } from '../../../i18n/i18n';
import ProductsContainer from '../../../containers/products/ProductsContainer';

const PageSectionIndexSpecialCruise = ({ specialCruises, t, isLoading }) => {
	if (specialCruises === null || (_.isArray(specialCruises) && specialCruises.length === 0)) {
		return '';
	}
	
	return (
		<LoadingOverlay active={isLoading} spinner text="">
			<section className="special-cruise pd-100">
				<div className="container">
					{specialCruises ?
						<h2 className="title">
							<span>{t('special_cruise')}</span>
						</h2>
						:
						<h2 className="title">
							<span>{t('special_cruise')}</span>
						</h2>
					}
					<ProductsContainer products={specialCruises} />
				</div>
			</section>
		</LoadingOverlay>
	);
};

export default withTranslation()(PageSectionIndexSpecialCruise);
