import axios from '../../../lib/axios';

const getCountry = async () => {
    try {
        const url = `/settings/countries`;
        const response = await axios.get(url);
        return response.data.result
    } catch (error) {
        return [];
    }
};

const getProvinces = async () => {
    try {
        const url = '/settings/countries/1/provinces';
        const response = await axios.get(url);
        return response.data.result;
    } catch (error) {
        return [];
    }
};


export { getCountry, getProvinces };