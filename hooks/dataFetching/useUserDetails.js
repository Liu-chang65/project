import axios from '../../lib/axios';
import { store } from '../../store';
import Logger from '../../lib/logger';

const getUserDetails = async () => {
  const token = store.getState().authentication.currentUser.accessToken;
  try {
    if (!token) return false;
    const url = '/customer/web/profile-service/me';
    const response = await axios.get(
      url,
      token
        ? {
            headers: { Authorization: `Bearer ${token}` },
          }
        : {},
    );
    return response.data.result;
  } catch (error) {
    Logger.error(error);
    return false;
  }
};

export default getUserDetails;
