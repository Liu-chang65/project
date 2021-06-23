import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from 'next/head';
import { i18n, withTranslation } from "../i18n/i18n";
import queryString from 'query-string';
import usePageOnLoad from "../hooks/page/usePageOnLoad";
import DefaultLayout from "../layouts/DefaultLayout";
import useUserFetchCurrentUser from "../hooks/user/useUserFetchCurrentUser";
import TheHeader from "../components/header/TheHeader";
import TheFooter from "../components/footer/TheFooter";
import PageSectionIndexChefsChoices from "../components/pageSection/index/PageSectionIndexChefsChoices";
import PageSectionIndexSpecialCruise from "../components/pageSection/index/PageSectionIndexSpecialCruise";
import PageSectionIndexDeliveryAvailability from "../components/pageSection/index/PageSectionIndexDeliveryAvailability";
import PageSectionIndexOurRestaurant from "../components/pageSection/index/PageSectionIndexOurRestaurant";
import PageSectionIndexOurResource from "../components/pageSection/index/PageSectionIndexOurResource";
import PageSectionIndexOurChef from "../components/pageSection/index/PageSectionIndexOurChef";
import PageSectionIndexOurLocation from "../components/pageSection/index/PageSectionIndexOurLocation";
import PageSectionIndexHero from "../components/pageSection/index/PageSectionIndexHero";
import Logger from "../lib/logger";
import {
    getAppResources,
    getChefChoices,
    getChefStory,
    getSpecialCruises,
    getSubBanner,
    getSettings,
} from "../lib/helpers";
import _ from 'lodash';
import { setCouponCode } from "../store/actions/cart.actions";

export async function getServerSideProps() {
    const settings = await getSettings();
    // get current branch
    const { branches } = settings;
    const currentBranch = branches.filter((branch) => branch.primaryBranch)[0];
    const specialCruises = await getSpecialCruises(currentBranch.id);
    const chefChoices = await getChefChoices(currentBranch.id);
    const appResources = await getAppResources(currentBranch.id);
    const subBanner = await getSubBanner(currentBranch.id);
    const chefStory = await getChefStory(currentBranch.id);

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

function Index(props) {
    useUserFetchCurrentUser();
    usePageOnLoad(props);
    const { currentBranch } = props;
    const [render, setRender] = useState(false);
    const [contentWidgets, setContentWidgets] = useState({});
    const [
        isDeliveryAvailabilitySectionVisible,
        setIsDeliveryAvailabilitySectionVisible,
    ] = useState(true);
    const { currentLanguage } = useSelector((state) => state.cart);
    const [prop, setProp] = useState(props);
    const dispatch = useDispatch();
    // set which section to show and hide
    const _process = async () => {
        const specialCruises = await getSpecialCruises(
            props.currentBranch.id,
            currentLanguage
        );
        const chefChoices = await getChefChoices(
            props.currentBranch.id,
            currentLanguage
        );
        const chefStory = await getChefStory(
            props.currentBranch.id,
            currentLanguage
        );
        Logger.log(
            specialCruises,
            chefChoices,
            chefStory,
            currentLanguage,
            "currentlanguage"
        );
        setProp({
            ...prop,
            specialCruises,
            chefChoices,
            chefStory,
        });
    };

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
            deliveryOption === "DeliveryOnly" ||
            deliveryOption === "DeliveryAndPickup"
        );
    }, [currentBranch]);

    useEffect(() => {
        if (render) {
            _process();
        }
        setRender(true);
    }, [currentLanguage]);

    // set google analytics
    useEffect(() => {
        // get url query
        const { cpn } = queryString.parse(location.search, {
            decode: true,
        });

        if (!_.isNil(cpn)) {
            dispatch(setCouponCode(cpn));
        }
    }, [])

    return (
        <DefaultLayout>
            <Head>
                <title>Home</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <TheHeader />

            {contentWidgets.CAROUSEL && <PageSectionIndexHero branchId={currentBranch.id}/>}

            {/* {contentWidgets.SPECIALCRUISE && prop ? (
                <div className="" style={{ height: "100px", width: "200px" }}>
                    shimma effect
                </div>
            ) : (
                <div
                    className="shine"
                    style={{ height: "100px", width: "200px" }}
                >
                    shimma effect
                </div>
            )} */}

            {contentWidgets.SPECIALCRUISE && prop && (
                <PageSectionIndexSpecialCruise
                    specialCruises={prop.specialCruises}
                />
            )}

            {isDeliveryAvailabilitySectionVisible && (
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
            {contentWidgets.APPRESOURCES && prop && prop.appResources !== null && (
                <PageSectionIndexOurResource appResources={prop.appResources} />
            )}

            <TheFooter />
        </DefaultLayout>
    );
}

export default withTranslation()(Index);
