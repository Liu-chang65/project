import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactNotification, { store } from 'react-notifications-component';
import LoadingOverlay from 'react-loading-overlay';
import axios from '../../../lib/axios';

const ConfirmCodeVerifyPhone = ({
  inputValues,
  isOpen,
  onInputHandle,
  verifyPhone,
  handleClose,
  message,
}) => {
  const [codes, setCodes] = useState(['', '', '', '']);
  const { t } = useTranslation(['common']);
  const [isLoading, setIsLoading] = useState(false);

  const hanldeChange = (event, entry) => {
    const text = event.target.value
      ? event.target.value[event.target.value.length - 1]
      : '';
    const copiedCodes = [...codes];
    copiedCodes[entry] = '';
    copiedCodes[entry] = text;
    if (!event.target.value) setCodes(copiedCodes);
    if (!text.match(/^\d+$/)) return;
    setCodes(copiedCodes);
    if (entry !== 3)
      document.getElementById(`verificationNum${entry + 2}`).focus();
  };

  const verifyPhoneNumber = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `customer/verify-phone-code?phone=${
          inputValues.phoneHeader + inputValues.phonenumber
        }&code=${codes.join('')}`,
      );

      if (response.data.success) {
        // update the local storage
        const user = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user'))
          : {};
        user.isPhoneConfirmed = true;
        localStorage.setItem('user', JSON.stringify(user));

        // nextStep();
        setIsLoading(false);
      }
    } catch (error) {
      store.addNotification({
        title: 'Error!',
        message: error.response.data.error.message,
        type: 'danger',
        insert: 'top',
        container: 'top-right',
        dismiss: {
          duration: 3000,
          onScreen: true,
        },
      });
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ReactNotification />
      <div
        className="modal fade modal-box show"
        id="verify-phone"
        onClick={handleClose}
      >
        <div
          className="modal-dialog"
          role="document"
          onClick={(e) => e.stopPropagation()}
        >
          <LoadingOverlay active={isLoading} spinner text="">
            <div className="modal-content" style={{ overflowX: 'hidden' }}>
              <div className="modal-top">
                <h2 className="title">
                  <span>{t('verify_phone_number')}</span>
                </h2>
              </div>
              <div className="modal-main">
                <div className="row px-5">
                  <div className="col-12">
                    {message && (
                      <div className="alert alert-danger col-12">{message}</div>
                    )}
                  </div>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                  }}
                  //   onSubmit={() => handleSubmit(verifyPhoneNumber)}
                  className="form-verity text-center"
                >
                  <div className="label-top relative mt-5">
                    <label>Phone number</label>
                    <div className="box-telephone relative">
                      <span className="area-code inflex-center-center">
                        {inputValues.phoneHeader}
                      </span>
                      <input
                        type="text"
                        //   disabled={phoneEditable}
                        placeholder="364 239 2830"
                        onChange={onInputHandle}
                        name="phonenumber"
                        className="input-radius h56"
                        value={inputValues.phonenumber}
                      />
                      <button
                        type="button"
                        className="vertify-button font-16 font-demi"
                        data-target="#verify-phone"
                        onClick={verifyPhone}
                        data-toggle="modal"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                  <div id="form-otp" className="mb-4">
                    <input
                      maxLength="1"
                      min="0"
                      max="9"
                      name="verificationNum1"
                      id="verificationNum1"
                      pattern="[0-9]{1}"
                      value={codes[0]}
                      onChange={(event) => {
                        hanldeChange(event, 0);
                      }}
                    />
                    <input
                      maxLength="1"
                      min="0"
                      max="9"
                      name="verificationNum2"
                      id="verificationNum2"
                      pattern="[0-9]{1}"
                      value={codes[1]}
                      onChange={(event) => {
                        hanldeChange(event, 1);
                      }}
                    />
                    <input
                      maxLength="1"
                      min="0"
                      max="9"
                      name="verificationNum3"
                      id="verificationNum3"
                      pattern="[0-9]{1}"
                      value={codes[2]}
                      onChange={(event) => {
                        hanldeChange(event, 2);
                      }}
                    />
                    <input
                      maxLength="1"
                      min="0"
                      max="9"
                      name="verificationNum4"
                      id="verificationNum4"
                      pattern="[0-9]{1}"
                      onChange={(event) => {
                        hanldeChange(event, 3);
                      }}
                      value={codes[3]}
                    />
                    {/* {isCodeFormatInvalid() && (
                  <div className="invalid-input">{t('invalid_code')}</div>
                )} */}
                  </div>
                  {/* <div className="mgb-20 mgt-50">
                  <span className="font-18 font-medium text-ghi">
                    {t('didnt_get_code')}
                  </span>
                  <a
                    onClick={() => {}}
                    className="text-yellow font-18 font-demi"
                  >
                    {t('send_again')}
                  </a>
                </div> */}
                  <div className="text-center mgt-30">
                    <button
                      type="submit"
                      className="btn btn-yellow btn-h60 font-20 font-demi w230"
                      data-toggle="modal"
                      data-target="#sign-in"
                      onClick={verifyPhoneNumber}
                    >
                      CONTINUE
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </LoadingOverlay>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </div>
  );
};

export default ConfirmCodeVerifyPhone;
