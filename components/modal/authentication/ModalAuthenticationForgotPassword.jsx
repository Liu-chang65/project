import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
// import { couldStartTrivia } from 'typescript';
import { toggleForgotPasswordModal } from '../../../store/actions/authentication.actions';
import axios from '../../../lib/axios';
import BaseLoader from "../../base/BaseLoader";

const ModalAuthenticationForgotPassword = () => {
	const dispatch = useDispatch();
	const logo = useSelector((state) => state.root.logo);
	const { isForgotPasswordModalVisible } = useSelector(state => state.authentication);
	const { t } = useTranslation(['common']);
	const { register, handleSubmit, watch, errors } = useForm();
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	// reset the message on open close
	useEffect(() => {
		setMessage('');
	}, [isForgotPasswordModalVisible]);

	const boundToggleForgotPasswordModal = () =>
		dispatch(toggleForgotPasswordModal());

	const onSubmit = async (data) => {
		const { email } = data;

		setIsLoading(true);
		try {
			const response = await axios.post(
				'customer/request-password-reset',
				{
					emailAddress: email,
				}
			);

			setMessage(t('password_reset_success'));
			setTimeout(() => {
				boundToggleForgotPasswordModal();
			}, 4000);
		} catch (error) {
			const res = error.response;
			const msg = res.data?.error?.message || t('an_error_happened');
			setErrorMessage(msg);
		}finally{
			setIsLoading(false);
		}
	};

	return (
		<div>
			<div
				className="modal fade modal-box show"
				id="forget-password"
				onClick={boundToggleForgotPasswordModal}
			>
				<div
					className="modal-dialog"
					role="document"
					onClick={(e) => e.stopPropagation()}
				>
					{isLoading && <BaseLoader />}
					<div className="modal-content">
						<div className="text-center pdt-30 relative">
							<a href="" title="">
								<img className="logo-s" src={logo} />
							</a>
						</div>
						<div className="modal-top">
							<h2 className="title">
								<span>{t('forgot_password')}</span>
							</h2>
						</div>
						<div className="modal-main">
							{message.length === 0 && (
								<form
									className="form-verity text-center"
									onSubmit={handleSubmit(onSubmit)}
								>
									<div className="desc font-20 mgb-20">
										<p>
											We will send a verification code to
											your phone number to continue
											logging in.
										</p>
									</div>
									<div className="name-bg">
										<input
											type="text"
											placeholder="Enter your email"
											className="input-radius btn-h50"
											name="email"
											onChange={() => {setErrorMessage('')}}
											ref={register({
												required: true,
												pattern: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
											})}
										/>
										{errors.email?.type === 'required' && (
											<div className="invalid-input">
												{t('input_required')}
											</div>
										)}
										{errors.email?.type === 'pattern' && (
											<div className="invalid-input">
												{t('invalid_email')}
											</div>
										)}
										{errorMessage && (
											<div className="invalid-input">
												{errorMessage}
											</div>)
										}
									</div>
									<div className="text-center mgt-30">
										<button
											type="submit"
											className="btn btn-yellow btn-h60 font-20 font-demi w230"
										>
											{t('send')}
										</button>
									</div>
								</form>
							)}
							{message.length !== 0 && (
								<div className="text-center py-10 desc font-20 mgb-20">
									<p>{message}</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="modal-backdrop fade show" />
		</div>
	);
};

export default ModalAuthenticationForgotPassword;
