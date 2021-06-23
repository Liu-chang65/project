import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from '../../../lib/axios';
import {
  setBackendOrder,
  setFinalAmount,
} from '../../../store/actions/cart.actions';

const CheckoutProductCard = ({
  orderItem,
  thumb,
  setIsLoading,
  backendOrder,
  setOrder,
}) => {
  const { t } = useTranslation(['common']);
  const { currency } = useSelector((state) => state.root.settings);
  const dispatch = useDispatch();

  const handleDuplicate = () => {
    const updateOrder = async () => {
      const itemToUpdate = backendOrder.orderItems.find(
        (lineItem) => lineItem.id === orderItem.id,
      );

      try {
        setIsLoading(true);
        const { data } = await axios.post(
          '/customer/web/checkout-service/order',
          {
            ...backendOrder,
            orderItems: [
              ...backendOrder.orderItems.filter(
                (lineItem) => lineItem.id !== orderItem.id,
              ),
              {
                ...itemToUpdate,
                quantity: itemToUpdate.quantity + 1,
              },
            ],
          },
        );
        dispatch(setBackendOrder(data.result));
        dispatch(setFinalAmount(data.result.finalAmount));
        setOrder(data.result);
        toast.success(t('api_duplicated_suc'));
      } catch (error) {
        toast.error(error.response.data.error.message);
      } finally {
        setIsLoading(false);
      }
    };

    updateOrder();
  };

  const handleRemove = () => {
    const updateOrder = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.post(
          '/customer/web/checkout-service/order',
          {
            ...backendOrder,
            orderItems: [
              ...backendOrder.orderItems.filter(
                (lineItem) => lineItem.id !== orderItem.id,
              ),
            ],
          },
        );
        dispatch(setBackendOrder(data.result));
        dispatch(setFinalAmount(data.result.finalAmount));
        setOrder(data.result);
        toast.success(t('api_duplicated_suc'));
      } catch (error) {
        toast.error(error.response.data.error.message);
      } finally {
        setIsLoading(false);
      }
    };

    updateOrder();
  };

  return (
    <div className="menu-item menu-item-1 flex-center mb-2">
      <div className="cover-item">
        <img src={thumb} alt="" title="" style={{ width: '200px' }} />
      </div>
      <div className="text-item">
        <h1 className="font-weight-bold font-36 mgb-10">
          X{orderItem.quantity} {orderItem.mealName}
        </h1>
        <div className="desc font-22 text-xam mgb-30">
          {orderItem.orderItemChoices.reduce(
            (choiceDisplay, choice, index) =>
              `${choiceDisplay} x${choice.quantity} ${choice.choiceItemName}${
                index === orderItem.orderItemChoices.length - 1 ? '' : ','
              }`,
            '',
          )}
        </div>
        <div className="action-item flex-center font-24 font-medium">
          <button type="button" className="btn-default" onClick={handleRemove}>
            {t('remove')}
          </button>
          <button type="button" className="btn-default">
            {t('edit')}
          </button>
          <button
            type="button"
            className="btn-default"
            onClick={handleDuplicate}
          >
            {t('duplicate')}
          </button>
        </div>
      </div>
      <div className="align-items-center price-item text-yellow font-medium font-56">
        <span className="mr-2 font-24">{`${currency}`}</span>{' '}
        {(
          orderItem.mealPrice -
          (orderItem.discount || 0) +
          orderItem.orderItemChoices.reduce(
            (acc, lineItem) =>
              acc + lineItem.quantity * lineItem.choiceItemPrice,
            0,
          )
        ).toFixed(2) * (orderItem.quantity)}
        {orderItem.discount > 0 && <div className="price-item font-16 text-gray old-price">
          <span className="mr-2 font-24">{`${currency}`}{' '}{((orderItem.mealPrice) * (orderItem.quantity)).toFixed(2)}</span>
        </div>}
      </div>      
    </div>
  );
};

export default CheckoutProductCard;