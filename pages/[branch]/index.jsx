import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { toast } from "react-toastify";
import queryString from 'query-string';
import Head from 'next/head';
import usePageOnLoad from '../../hooks/page/usePageOnLoad';
import DefaultLayout from '../../layouts/DefaultLayout';
import useUserFetchCurrentUser from '../../hooks/user/useUserFetchCurrentUser';
import TheHeader from '../../components/header/TheHeader';
import TheFooter from '../../components/footer/TheFooter';
import PageSectionIndexChefsChoices from '../../components/pageSection/index/PageSectionIndexChefsChoices';
import PageSectionIndexSpecialCruise from '../../components/pageSection/index/PageSectionIndexSpecialCruise';
import PageSectionIndexDeliveryAvailability from '../../components/pageSection/index/PageSectionIndexDeliveryAvailability';
import PageSectionIndexOurRestaurant from '../../components/pageSection/index/PageSectionIndexOurRestaurant';
import PageSectionIndexOurResource from '../../components/pageSection/index/PageSectionIndexOurResource';
import PageSectionIndexOurChef from '../../components/pageSection/index/PageSectionIndexOurChef';
import PageSectionIndexOurLocation from '../../components/pageSection/index/PageSectionIndexOurLocation';
import PageSectionIndexHero from '../../components/pageSection/index/PageSectionIndexHero';
import { useDispatch, useSelector } from 'react-redux';
import { getAppResources, getChefChoices, getChefStory, getSpecialCruises, getSubBanner, getSettings } from '../../lib/helpers';
import { initGA, logPageView } from '../../utils/analytics';
import { setCouponCode } from '../../store/actions/cart.actions';

export async function getServerSideProps(context) {
	const branchId = context.params.branch;
	const settings = await getSettings();

	// get current branch
	const { branches } = settings;
	const currentBranch = branches.filter((branch) => {
		return branch.id === parseInt(branchId);
	})[0];
	// if branch is not found
	if (_.isNil(currentBranch)) {
		context.res.statusCode = 404;
		context.res.end('Not found');
		return {
			props: {}
		};
	}

	const specialCruises = await getSpecialCruises(branchId);
	const chefChoices = await getChefChoices(branchId);
	const appResources = await getAppResources(branchId);
	const subBanner = await getSubBanner(branchId);
	const chefStory = await getChefStory(branchId);

	return {
		props: {
			specialCruises,
			chefChoices,
			appResources,
			subBanner,
			chefStory,
			settings,
			currentBranch,
		},
	};
}

export default function Index(props) {

	useUserFetchCurrentUser();
	usePageOnLoad(props);
	const { currentBranch } = props;
	const [render, setRender] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [contentWidgets, setContentWidgets] = useState({});
	const [
		isDeliveryAvailabilitySectionVisible,
		setIsDeliveryAvailabilitySectionVisible,
	] = useState(true);
	const { currentLanguage } = useSelector((state) => state.cart);
	const { type } = useSelector((state) => state.position);
	const [prop, setProp] = useState(props)
	const dispatch = useDispatch();

	const _process = async () => {
		try {
			setIsLoading(true);
			let specialCruises;
			if (!type) {
				specialCruises = await getSpecialCruises(props.currentBranch.id, currentLanguage, type);
			} else {
				specialCruises = await getSpecialCruises(props.currentBranch.id, currentLanguage, type.toLowerCase() === 'pickuponly' ? 'Pickup' : 'Delivery');
			}

			const chefChoices = await getChefChoices(props.currentBranch.id, currentLanguage);
			const chefStory = await getChefStory(props.currentBranch.id, currentLanguage);
			setProp({
				...prop,
				specialCruises,
				chefChoices,
				chefStory
			});
		} catch (error) {
			toast.error(error?.response?.data?.error?.message);
		} finally {
			setIsLoading(false);
		}
	}

	// set google analytics
	useEffect(() => {
		if (!window.GA_INITIALIZED) {
			initGA();
			window.GA_INITIALIZED = true;
		}
		logPageView()

		// get url query
		const { cpn } = queryString.parse(location.search, {
			decode: true,
		});

		if (!_.isNil(cpn)) {
			dispatch(setCouponCode(cpn));
		}
	}, [])

	// set which section to show and hide
	useEffect(() => {
		if (!currentBranch.contentWidgets) return;

		const contentWidgets = {};

		currentBranch.contentWidgets.forEach(({ name, isActive }) => {
			contentWidgets[name] = isActive;
		});

		setContentWidgets(contentWidgets);
	}, [currentBranch]);

	// set if delivery availability section is visible
	useEffect(() => {
		if (!currentBranch.contentWidgets) return;

		const { deliveryOption } = currentBranch.deliverySetting;
		setIsDeliveryAvailabilitySectionVisible(
			deliveryOption === 'DeliveryOnly' ||
			deliveryOption === 'DeliveryAndPickup'
		);
	}, [currentBranch]);

	useEffect(() => {
		if (render) {
			_process()
		}
		setRender(true)
	}, [currentLanguage])

	useEffect(() => {
		_process();
	}, [type])

	useEffect(() => {
		_process();
	}, [])

	return (
		<DefaultLayout>
			<Head>
				<title>Home</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<TheHeader />
			{contentWidgets.CAROUSEL && <PageSectionIndexHero branchId={currentBranch.id}/>}
			{contentWidgets.SPECIALCRUISE && prop && (
				<PageSectionIndexSpecialCruise
					specialCruises={prop.specialCruises}
					isLoading={isLoading}
				/>
			)}
			{isDeliveryAvailabilitySectionVisible && prop && (
				<PageSectionIndexDeliveryAvailability />
			)}
			{contentWidgets.CHEFSCHOICE && prop && (
				<PageSectionIndexChefsChoices chefChoices={prop.chefChoices} />
			)}
			{contentWidgets.SUBBANNER && prop && (
				<PageSectionIndexOurRestaurant subBanner={prop.subBanner} />
			)}
			{contentWidgets.CHEFSSTORY && prop && (
				<PageSectionIndexOurChef chefStory={prop.chefStory} />
			)}
			<PageSectionIndexOurLocation />
			{contentWidgets.APPRESOURCES && prop &&  prop.appResources !== null && (
				<PageSectionIndexOurResource
					appResources={prop.appResources}
				/>
			)}
			<TheFooter />
		</DefaultLayout>
	);
}
