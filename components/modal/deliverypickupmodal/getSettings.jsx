import axios from "../../../lib/axios";

const getSettings = async (fullAddress, long, lat, postalCode) => {
    let url;
    let response;
    if (fullAddress || long || postalCode) {
        if (fullAddress) {
            url = `settings/nearest-branch?fullAddress=${fullAddress}`;
        } else if (long) {
            url = `settings/nearest-branch?lat=${lat}&lng=${long}`;
        } else {
            url = `settings/nearest-branch?postalCode=${postalCode}`;
        }
        response = await axios.get(url);
    } else {
        return [];
    }

    return response.data.result;
};

export default getSettings;
