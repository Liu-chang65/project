import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from '../../../lib/axios';
import BaseLoader from '../../base/BaseLoader';
import {
  setBackendOrder,
  setCountryAndProvince,
} from '../../../store/actions/cart.actions';
import getPostalCode from '../modal/helpers';
import { getCountry, getProvinces } from './helpers';
const config = require('../../../config.json');

const NewAddressPanel = ({
  isOpen,
  handleClose,
  updateForm,
  formData,
  backendOrderItem,
  isLogged,
  handleAddAddress,
  updateObjFormValue,
  updateTargetValues,
  savedPostalCode,
  isUpdate
}) => {
  const { t } = useTranslation(['common']);
  const dispatch = useDispatch();
  const [postalCodeData, setPostalCodeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const notifySuccess = () => toast.success(t('address_success'));
  const notifyError = (message) => toast.error(message);
  const [provinceList, setProvinceList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [countryName, setCountryName] = useState('');
  const saveLocation = () =>
    dispatch(
      setCountryAndProvince({
        country: formData.country,
        province: formData.province,
      }),
    );

  useEffect(() => {
    const getCountryAsync = async () => {
      const country = await getCountry();
      setCountryList(country);
    };
    const getProvincesAsync = async () => {
      const provinces = await getProvinces();
      setProvinceList(provinces);
    };
    if (countryList.length === 0 && formData.country.value.length === 0) {
      getCountryAsync();
    }
    if (provinceList.length === 0 && formData.province.value.length === 0) {
      getProvincesAsync();
    }
  }, [
    formData.country.value.length,
    countryList.length,
    provinceList.length,
    formData.province.value.length,
  ]);

  const handleSave = () => {
    const updateOrder = async () => {
      try {
        setIsLoading(true);
        saveLocation();
        const { data } = await axios.post(
          '/customer/web/checkout-service/order',
          {
            ...backendOrderItem,
            customerPhone: formData.phone,
            customerEmail: formData.email,
            orderAddressFK: {
              ...backendOrderItem.orderAddressFK,
              customerName: formData.name,
              no: formData.doorNumber,
              street: formData.streetName,
              city: formData.city,
              postalCodeId: savedPostalCode.id || formData.postalCode.id,
              provinceId: formData.province.id,
              countryId: formData.country.id,
            },
          },
        );
        dispatch(setBackendOrder(data.result));
        notifySuccess();
        handleClose();
      } catch (error) {
        notifyError(error.response.data.error.message);
      } finally {
        setIsLoading(false);
      }
    };
    updateOrder();
  };

  const getPostalCodeFromAuto = async (event) => {
    updateObjFormValue('value', 'postalCode')(event);
    if (event.target.value === '') return;
    const codes = await getPostalCode(event.target.value);
    setPostalCodeData(codes);
  };

  const getCountryFromAuto = async (event) => {
    setCountryName(event.target.value);
    updateObjFormValue('value', 'country')(event);
  };

  const getProvinceFromAuto = async (event) => {
    updateObjFormValue('value', 'province')(event);
  };

  const onPostalCodeClick = (postalCodeObj) => {
    updateTargetValues('postalCode')({
      ...postalCodeObj,
      value: postalCodeObj.zip,
    });
    setPostalCodeData([]);
  };

  const onFormOptionClick = (formObj, field, callback) => {
    updateTargetValues(field)({ ...formObj, value: formObj.name });
    callback();
  };

  const handleSaveAndAddress = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.name === null || formData.name.trim() === '') {
      toast.error(t('invalid_name'));
      return;
    }

    if ((formData.email === null || formData.email.trim() === '') &&
     ( formData.phone === null || formData.phone.trim() === '')) {
      toast.error(t('phone_or_email_required'));
      return;
    }

    if (formData.email !== null && !emailRegex.test(formData.email)) {
      toast.error(t('invalid_email'));
      return;
    }

    if (formData.streetName === null ||formData.streetName.trim() === '') {
      toast.error(t('invalid_street_name'));
      return;
    }

    if (formData.city === null || formData.city.trim() === '') {
      toast.error(t('invalid_city'))
      return;
    }

    if (formData.postalCode === null || formData.postalCode.trim() === '') {
      toast.error(t('invalid_postal_code'));
      return;
    }

    if (countryName === null || countryName.trim() === '' || !config.allowedCountries.includes(countryName.toLowerCase())) {
      toast.error(t('invalid_country'));
      return;
    }

    if (formData.province.value === null || formData.province.value.trim() === '') {
      toast.error(t('invalid_canton'));
      return;
    }
   
    return isUpdate ? handleAddAddress() : handleSave();
  }

  return (
    isOpen && (
      <div className="customize-food show">
        {isLoading && <BaseLoader />}
        <div
          className="customize-main relative d-flex flex-column"
          style={{ maxWidth: '580px', background: '#ccc' }}
        >
          <div
            className="customize-top relative"
            style={{
              marginTop: '16px',
              backgroundColor: '#FFF',
              boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.75)',
            }}
          >
            <h2 className="title">
              <span>{t('add_new_address')}</span>
            </h2>
            <button
              type="button"
              className="close close-customize"
              onClick={handleClose}
            >
              <i className="ti-close" />
            </button>
          </div>
          <div
            className="d-flex flex-column align-items-center p-4 mt-4"
            style={{
              backgroundColor: '#FFF',
              boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.75)',
            }}
          >
            <input
              type="text"
              className="form-control mb-2 mt-2 pl-4"
              placeholder={t('placeholder_name')}
              aria-label="name"
              aria-describedby="basic-addon1"
              value={formData.name}
              onChange={updateForm('name')}
            />
            {!isLogged && (
              <input
                type="text"
                className="form-control mb-2 mt-2 pl-4"
                placeholder={t('placeholder_phone')}
                aria-label="phone number"
                aria-describedby="basic-addon1"
                value={formData.phone}
                onChange={updateForm('phone')}
              />
            )}
            {!isLogged && (
              <input
                type="text"
                className="form-control mb-2 mt-2 pl-4"
                placeholder={t('placeholder_email')}
                aria-label="email address"
                aria-describedby="basic-addon1"
                onChange={updateForm('email')}
                value={formData.email}
              />
            )}
            <input
              type="text"
              className="form-control mb-2 mt-2 pl-4"
              placeholder={t('placeholder_street')}
              aria-label="street name"
              aria-describedby="basic-addon1"
              onChange={updateForm('streetName')}
              value={formData.streetName}
            />
            <input
              type="text"
              className="form-control mb-2 mt-2 pl-4"
              placeholder={t('placeholder_door')}
              aria-label="door number"
              aria-describedby="basic-addon1"
              onChange={updateForm('doorNumber')}
              value={formData.doorNumber}
            />
            <input
              type="text"
              className="form-control mb-2 mt-2 pl-4"
              placeholder={t('placeholder_city')}
              aria-label="city"
              aria-describedby="basic-addon1"
              value={formData.city}
              onChange={updateForm('city')}
            />
            <div className="relative" style={{ width: '100%' }}>
              <input
                type="text"
                className="form-control mb-2 mt-2 pl-4"
                aria-label="postal code"
                placeholder={t('placeholder_postal')}
                aria-describedby="basic-addon1"
                value={savedPostalCode?.zip || formData.postalCode.value}
                disabled={savedPostalCode?.zip}
                onChange={getPostalCodeFromAuto}
              />
              {formData.postalCode.value && (
                <ul
                  className="auto-complete-suggestions"
                  style={{
                    width: '100%',
                    top: '48px',
                    left: 0,
                    position: 'absolute',
                  }}
                >
                  {postalCodeData.map((code, index) => (
                    <li key={index} onClick={() => onPostalCodeClick(code)}>
                      {code.zip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {
              <div className="relative" style={{ width: '100%' }}>
                <input
                  type="text"
                  className="form-control mb-2 mt-2 pl-4"
                  placeholder="Country"
                  aria-label="country"
                  aria-describedby="basic-addon1"
                  value={formData.country.value}
                  onChange={getCountryFromAuto}
                />
                <ul
                  className="auto-complete-suggestions"
                  style={{
                    width: '100%',
                    top: '48px',
                    left: 0,
                    position: 'absolute',
                  }}
                >
                  {countryList
                    .filter(
                      (country) =>
                        formData.country.value &&
                        country.name
                          .toLowerCase()
                          .startsWith(formData.country.value.toLowerCase()),
                    )
                    .map((country, index) => (
                      <li
                        key={index}
                        onClick={() =>
                          onFormOptionClick(country, 'country', () => {
                            setCountryName(country.name);
                            setCountryList([])
                          },
                          )
                        }
                      >
                        {country.name}
                      </li>
                    ))}
                </ul>
              </div>
            }
            {
              <div className="relative" style={{ width: '100%' }}>
                <input
                  type="text"
                  className="form-control mb-2 mt-2 pl-4"
                  placeholder="Province"
                  aria-label="province"
                  aria-describedby="basic-addon1"
                  value={formData.province.value}
                  onChange={getProvinceFromAuto}
                />
                <ul
                  className="auto-complete-suggestions"
                  style={{
                    width: '100%',
                    top: '48px',
                    left: 0,
                    position: 'absolute',
                  }}
                >
                  {provinceList
                    .filter(
                      (province) =>
                        formData.province.value &&
                        province.name
                          .toLowerCase()
                          .startsWith(formData.province.value.toLowerCase()),
                    )
                    .map((province, index) => (
                      <li
                        key={index}
                        onClick={() =>
                          onFormOptionClick(province, 'province', () =>
                            setProvinceList([]),
                          )
                        }
                      >
                        {province.name}
                      </li>
                    ))}
                </ul>
              </div>
            }
          </div>
          <div className="group-btn-170 mgt-30 align-self-end" role="group">
            <buttton
              type="button"
              className="btn btn-white btn-h46 font-16 mgr-15"
              onClick={handleClose}
            >
              {t('cancel')}
            </buttton>
            <button
              type="button"
              className="btn btn-h46 font-16 btn-yellow"
              onClick={handleSaveAndAddress}
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default NewAddressPanel;
