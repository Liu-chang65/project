import axios from './axios';
import Logger from './logger';

export const getSpecialCruises = async (branchId, language, type) => {
  try {
    const url = `customer/web/home-service/special-cruise?branchId=${branchId}&culture=${language}${type ? `&deliveryType=${type}` : ''}`;
    const response = await axios.get(url);

    return response.data.result;
  } catch (error) {
    Logger.error(error);
    return [];
  }
};

export const getChefChoices = async (branchId, language) => {
  try {
    const url = `customer/web/home-service/chef-choice?branchId=${branchId}&culture=${language}`;
    const response = await axios.get(url);

    return response.data.result;
  } catch (error) {
    Logger.error(error);

    return [];
  }
};

export const getAppResources = async (branchId) => {
  try {
    const url = `customer/web/home-service/app-resources?branchId=${branchId}`;
    const response = await axios.get(url);

    return response.data.result;
  } catch (error) {
    Logger.error(error);

    return [];
  }
};

export const getSubBanner = async (branchId) => {
  try {
    const url = `customer/web/home-service/sub-banner?branchId=${branchId}`;
    const response = await axios.get(url);

    return response.data.result;
  } catch (error) {
    Logger.error(error);

    return [];
  }
};

export const getChefStory = async (branchId, language) => {
  try {
    const url = `customer/web/home-service/chef-story?branchId=${branchId}&culture=${language}`;
    const response = await axios.get(url);
    return response.data.result;
  } catch (error) {
    Logger.error(error);

    return [];
  }
};

export const getSettings = async () => {
  try {
    const url = `settings?mediaTypeFilters=LOGO&mediaTypeFilters=FAVI_ICON&mediaTypeFilters=MOBILE_PROFILE_IMAGE&mediaTypeFilters=MOBILE_START_SCREEN&mediaTypeFilters=MOBILE_WELCOME_SCREEN`;
    const response = await axios.get(url);

    return response.data.result;
  } catch (error) {
    Logger.error(error);

    return [];
  }
};
