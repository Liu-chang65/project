/* eslint-disable jsx-a11y/label-has-associated-control */
import { isUndefined } from 'lodash';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingOverlay from 'react-loading-overlay';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import usePageOnLoad from '../../../hooks/page/usePageOnLoad';
import DefaultLayout from '../../../layouts/DefaultLayout';
import useUserFetchCurrentUser from '../../../hooks/user/useUserFetchCurrentUser';
import TheHeader from '../../../components/header/TheHeader';
import TheFooter from '../../../components/footer/TheFooter';
import NewAddressForm from '../../../components/checkout/newAddress/NewAddressPanel';
import axios from '../../../lib/axios';
import Confirmation from '../../../components/confirmationpopup/confirmationpopup';
import Logger from '../../../lib/logger';

const getSettings = async () => {
  try {
    const url = `/settings?mediaTypeFilters=LOGO&mediaTypeFilters=FAVI_ICON&mediaTypeFilters=MOBILE_PROFILE_IMAGE&mediaTypeFilters=MOBILE_START_SCREEN&mediaTypeFilters=MOBILE_WELCOME_SCREEN`;
    const response = await axios.get(url);

    return response.data.result;
  } catch (error) {
    Logger.error(error);

    return [];
  }
};

export async function getServerSideProps(context) {
  if (isUndefined(context.params)) {
    if (context.res) {
      context.res.statusCode = 404;
      context.res.end('Not found');
      return <ErrorPage />;
    }
  }

  const branchId = context.params.branch;
  const settings = await getSettings();

  // get current branch
  const { branches } = settings;
  const currentBranch = branches.filter(
    (branch) => branch.id.toString() === branchId,
  )[0];

  return {
    props: {
      settings,
      currentBranch,
    },
  };
}

export default function Index(props) {
  useUserFetchCurrentUser();
  usePageOnLoad(props);

  const router = useRouter();
  const { backendOrder } = useSelector((state) => state.cart);
  const accessToken = useSelector(
    (state) => state.authentication.currentUser.accessToken,
  );
  const userDetails = useSelector((state) => state.authentication.basicInfo);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    streetName: '',
    doorNumber: '',
    city: '',
    postalCode: { zip: '', id: '', value: '' },
    province: { name: '', id: '', value: '' },
    country: { name: '', id: '', value: '' },
  });
  const { currentBranch } = props;
  const { t } = useTranslation(['common']); 
  const [isAddressUpdate, setIsAddressUpdate] = useState(false); 
  const updateTargetValues = (name) => (obj) => {
    setFormData({ ...formData, [name]: obj });
  };
  const updateForm = (name) => (event) => {
    setFormData({ ...formData, [name]: event.target.value });
  };
  const updateObjFormValue = (name, field) => (event) => {
    setFormData({
      ...formData,
      [field]: { ...formData[field], [name]: event.target.value },
    });
  };

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const result = await axios.get(
        '/customer/web/profile-service/shipping-addresses',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      setAddresses(result.data.result);
      setIsLoading(true);
    } catch (err) {
      Logger.error('err: ', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    const createAddress = async () => {
      try {
        setIsLoading(true);
        await axios.post('/customer/web/profile-service/shipping-addresses', {
          id: formData.id ? formData.id : undefined,
          customerName: formData.name,
          no: formData.doorNumber,
          street: formData.streetName,
          city: formData.city,
          postalCodeId: formData.postalCode.id,
          countryId: formData.country.id,
          provinceId: formData.province.id,
        });
        toast.success(t('address_success'));
        handleClose();
        fetchAddresses();
      } catch (error) {
        toast.error(error.response.data.error.message);
      } finally {
        setIsLoading(false);
      }
    };
    createAddress();
  };

  const handleRemoveAddress = (addressId) => {
    const removeAddress = async () => {
      try {
        setIsLoading(true);
        await axios.delete(
          `/customer/web/profile-service/shipping-addresses/${addressId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        toast.success(t('remove_api_success'));
        setAddresses(addresses.filter((address) => address.id !== addressId));
      } catch (err) {
        toast.error(err.response.data.error.message);
      } finally {
        setIsLoading(false);
      }
    };
    removeAddress();
  };

  const handleSelectAddress = () => {
    const handleUpdate = async () => {
      try {
        setIsLoading(true);
        const selectedAddress = addresses.find(
          (address) => address.id === selectedAddressId,
        );

        await axios.post(
          '/customer/web/checkout-service/order',
          {
            ...backendOrder,
            orderAddressFK: {
              ...backendOrder.orderAddressFK,
              customerName: selectedAddress.customerName,
              no: selectedAddress.no,
              street: selectedAddress.street,
              city: selectedAddress.city,
              userId: userDetails.id,
              postalCodeId: selectedAddress.postalCodeid,
              countryId: selectedAddress.countryId,
              provinceId: selectedAddress.provinceId,
              formattedAddress: '',
            },
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        router.push(
          '/[branch]/checkout/',
          `/${props.currentBranch.id}/checkout`,
        );
      } catch (error) {
        toast.error(error.response.data.error.message);
      } finally {
        setIsLoading(false);
      }
    };

    handleUpdate();
  };

  const handleEditForm = (addressId) => {
    debugger;
    const addressToBeEdited = addresses.find(
      (address) => address.id === addressId,
    );
    setFormData({
      id: addressToBeEdited.id,
      name: addressToBeEdited.customerName,
      streetName: addressToBeEdited.street,
      doorNumber: addressToBeEdited.no,
      city: addressToBeEdited.city,
      postalCode: {
        id: addressToBeEdited.postalCodesFK.id,
        value: addressToBeEdited.postalCodesFK.zip,
      },
      country: {
        id: addressToBeEdited.countryFK.id,
        value: addressToBeEdited.countryFK.name,
      },
      province: {
        id: addressToBeEdited.provinceFK.id,
        value: addressToBeEdited.provinceFK.name,
      },
    });
    setIsAddressUpdate(true);
    setIsOpen(true);
  };

  const [deletionIndex, setDeletionIndex] = useState(null);

  const handleClose = () => {
    setFormData({
      id: '',
      name: '',
      streetName: '',
      doorNumber: '',
      city: '',
      postalCode: { zip: '', id: '', value: '' },
      province: { name: '', id: '', value: '' },
      country: { name: '', id: '', value: '' },
    });
    setIsOpen(false);
  }

  return (
    <LoadingOverlay active={isLoading} spinner text="">
      <Head>
        <title>Address</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <DefaultLayout>
        <TheHeader />
        <NewAddressForm
          isOpen={isOpen}
          handleClose={handleClose}
          updateForm={updateForm}
          formData={formData}
          isLogged
          handleAddAddress={handleAddAddress}
          updateObjFormValue={updateObjFormValue}
          updateTargetValues={updateTargetValues}
          isUpdate= {isAddressUpdate}
        />
        <section className="wrapper-gray">
          <div className="container">
            <div className="choose-address wrapper-white pd-55">
              <div className="flex-center-between mgb-40">
                <h1 className="font-24 font-demi flex-center">
                  <img src="images/icon/icon-pin-3.svg" alt="" />
                  <span className="mgl-10">{t('shipping_address')}</span>
                </h1>
                <div className="group-btn-170">
                  <button
                    className="btn btn-white btn-h46 font-16 font-demi"
                    type="button"
                    onClick={() => setIsOpen(true)}
                  >
                    <i className="ti-plus mgr-10" /> {t('add_new')}
                  </button>
                </div>
              </div>
              <div className="table-responsive-md">
                <table className="table table-choose">
                  <tbody>
                    {addresses.map((address, i) => (
                      <tr key={address.id}>
                        <td valign="middle">
                          <label className="checkbox-box relative">
                            <input
                              type="checkbox"
                              name="check-1"
                              className="hide-abs"
                              checked={address.id === selectedAddressId}
                              onChange={() => setSelectedAddressId(address.id)}
                            />
                            <span />
                          </label>
                        </td>
                        <Confirmation
                          isOpen={deletionIndex === i}
                          onCancel={() => setDeletionIndex(null)}
                          onConfirm={() => handleRemoveAddress(address.id)}
                        />
                        <td valign="middle">
                          <div className="font-24 addres-name">
                            {address.customerName}
                          </div>
                        </td>
                        <td>
                          <div className="font-24 addre">
                            {`${address.street} ${address.no}`}
                          </div>
                          <div className="font-24 addre">
                            {`${address.postalCodesFK.zip} ${address.city}`}
                          </div>
                          <div className="font-24 addre">
                            {`${address.provinceFK ? address.provinceFK.name : ''
                              } ${address.countryFK ? address.countryFK.name : ''
                              }`}
                          </div>
                        </td>
                        <td valign="middle">
                          <div className="group-button-2">
                            <button
                              type="button"
                              className="btn-default"
                              onClick={() => handleEditForm(address.id)}
                            >
                              {t('edit')}
                            </button>
                            <button
                              type="button"
                              className="btn-default"
                              onClick={() => setDeletionIndex(i)}
                            >
                              {t('remove')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="group-btn-170 mgt-30">
                <button
                  type="button"
                  className="btn btn-yellow btn-h46 font-16 mgr-15"
                  disabled={!selectedAddressId}
                  onClick={handleSelectAddress}
                >
                  {t('done')}
                </button>
                <Link
                  type="button"
                  href="/[branch]/checkout"
                  as={`/${currentBranch.id}/checkout`}
                >
                  <buttton
                    type="button"
                    className="btn btn-white btn-h46 font-16"
                  >
                    {t('go_back')}
                  </buttton>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <TheFooter />
      </DefaultLayout>
    </LoadingOverlay>
  );
}
