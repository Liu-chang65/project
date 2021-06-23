import axios from '../../../lib/axios';

const getPostalCode = async (val) => {
  try {
    const url = `customer/web/home-service/postal-codes?postalCodeSearch=${val}`;
    const response = await axios.get(url);
    return response.data.result;
  } catch (error) {
    return [];
  }
};

export default getPostalCode;
