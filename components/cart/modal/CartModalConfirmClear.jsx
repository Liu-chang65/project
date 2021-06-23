import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { closeCartClearModal, openDeliveryPickupModal, setCurrentActiveProductId } from '../../../store/actions/layout.actions';
import { resetCart } from '../../../store/actions/cart.actions';

const CartModalConfirmClear = () => {
  const { t } = useTranslation(['common']);
  const dispatch = useDispatch();
  const { isCartClearModalActive } = useSelector((state) => state.layout);
  const boundCloseCartModal = () => dispatch(closeCartClearModal());
  const clearCart = () =>  {
    dispatch(setCurrentActiveProductId(0));
    dispatch(resetCart());
    dispatch(closeCartClearModal()); 
    dispatch(openDeliveryPickupModal());
  }

  useEffect(() => {
    console.log('open clear cart');
  }, [isCartClearModalActive])

  if (!isCartClearModalActive) return '';

  return (
    <div>
      <div className="modal fade modal-box show" id="confirm-meal">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-top">
              <h2 className="font-32 font-demi text-center mgb-30 font-header-color">
                <span>{t('confirm')}</span>
              </h2>
            </div>
            <div className="modal-main">
              <div className="desc font-demi font-20 text-center font-body-color">
                {t('change_delivery_type_clear')}
              </div>
              <div className="text-center mgt-30">
                <button
                  type="button"
                  className="btn btn-yellow btn-h60 font-20 font-demi w230 mgr-15"
                  onClick={boundCloseCartModal}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className="btn btn-white btn-h60 font-20 font-demi w230"
                  onClick={clearCart}
                >
                  {t('clear')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </div>
  );
};

export default CartModalConfirmClear;
