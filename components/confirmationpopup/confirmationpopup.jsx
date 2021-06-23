import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ConfirmationPopup({isOpen,
  onConfirm,
  onCancel, message}) {
  const { t } = useTranslation(['common']);
  const newmessage = message || t('confirm');
  if (!isOpen) {
    return null;
  }
  return (
    <div>
      <div
        className="modal fade modal-box show"
        id="search-filter"
        role="dialog"
        aria-hidden="true"
        onClick={onCancel}
      >
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()} role="document">
          <div className="modal-content">
            <div className="modal-top">
              <h2 className="title">
                <span>{newmessage}</span>
              </h2>
              <button
                onClick={onCancel}
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti-close" />{' '}
              </button>
            </div>
            <div className="modal-main">
              <div className="container">
                <div className="cols">
                  <div className="col-12 d-flex flex-column align-items-center">
                    <div className="font-18 my-3">
                      Are you sure You Want to do this ?
                    </div>
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={onConfirm}
                        className="btn btn-yellow mr-4"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-white"
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </div>
  );
}
