import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
// import GoogleLogin from 'react-google-login';
// import FacebookLogin from 'react-facebook-login';
// import { FaFacebook } from 'react-icons/fa';
import { Row, Col, Alert} from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import { Form ,Modal, Spin} from 'antd';
// import { FB_APP_ID, GOOGLE_CLIENT_ID } from 'constants/social';
import Header from 'components/NewHeader';
import * as ReferPeopleApi from '../../../api/refer.api';
import FormItem from 'components/FormItem';
import InputPassword from 'components/AuthLayout/InputPassword';
import Input from 'components/AuthLayout/Input';
import Link from 'components/AuthLayout/Link';
import { useAuth } from '../../../context/authContext';
import {privacyPolicy} from '../../../policy-pages/privacy-policy';
import {cookiePolicy} from '../../../policy-pages/cookie-policy';
import {TermsCondition} from '../../../policy-pages/conditions';
// import { useHistory } from 'react-router-dom';
import { Select } from 'antd';
import {languages,LANDING_PAGE_URL} from '../../../constants';
import mixpanel from 'mixpanel-browser';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import {openNotificationWithIcon} from '../../../utils'
import { useLocation } from 'react-router';
import {useTools} from '../../../context/toolContext';
import { useFetchInvite } from 'api/invite.api';

const { Option } = Select;
const CustomerRegister = () => {
	const [form] = Form.useForm()
	function useQuery() {
    	const { search } = useLocation();
    	return React.useMemo(() => new URLSearchParams(search), [search]);
  	}
  	const query = useQuery();
	const inviteCode = query.get('inviteCode') || 'nothing';
	const { data: inviteData } = useFetchInvite(inviteCode);
	const { register} = useAuth();
	// const { verificationEmailHandler } = useAuth();
	const [phoneNumber, setPhoneNumber] = useState('');
	const [extension, setExtension] = useState('');
	const {setOpenModal, setHearAboutUsModal} = useTools()
	const [language,setLanguage] = useState('English')
	// const [AdditionalLanguage,setAdditionLanguage] = useState('');
	const AdditionalLanguage = '';
	const [showError,setshowError] = useState(false)
	const [alertMessagePhone, setAlertMessagePhone] = useState('');
	const [alertMessage, setAlertMessage] = useState('');
	const [alertMessageEmail, setAlertMessageEmail] = useState('');
	const [languageErrorMsg, setLanguageErrorMsg] = useState({});
	const [boxChanged,setBoxChanged] = useState(false);
	// const [openTermsCondition,setOpenTermsCondition] = useState(true);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isPrivacyPolicyModalAvailable,setIsPrivacyPolicyModalAvaliable] = useState(false)
	const [linkToLogin,setLinkToLogin] = useState('/login')
	const [createButtonDisabled, setCreateButtonDisabled] = useState(false);
	const [privacyBoxChanged,setPrivacyBoxChanged] = useState(false)
	const [isCookiesPolicyModalAvailable,setIsCookiesPolicyModalAvailable] = useState(false)
	const location = useLocation();
	const [haveValue,setHaveValue] = useState(false)

	useEffect(() => {
		if (inviteData) {
			form.setFieldsValue({
				["email"]: inviteData?.email
			})
		}
	}, [form, inviteData])
	
	useEffect(()=>{
		if(true){
			// console.log(location)
			// let url = location.pathname
			let urlArr = location.pathname.split("/").filter(item => item != '')
			console.log("urlArr :::::::: ",urlArr)
			let count = urlArr.length
			// console.log("count ::::: ",count)
			if(count >= 2){
				let indexOfregister = urlArr.findIndex((item)=> item == 'register')
				let job_id_index = indexOfregister + 1
				let indexOfYes = urlArr.findIndex((item) => item =='yes')
				if(indexOfYes == -1){
					setLinkToLogin(`/login?job-id=${urlArr[job_id_index]}`)
				}
				else{
					setLinkToLogin(`/login?job-id=${urlArr[job_id_index]}&status=schedule`)
				}
			}
			// console.log(!true)
		}
	},[location.pathname]);
	//location.pathname added by Rajat
	/*const find_id_from_url =() =>{
		let params = new URLSearchParams(location.search)
		return params.get('jobId')
	}*/
		
	const { jobId } = useParams();
	const { schedule } = useParams();
	const search = useLocation().search;
 	const referred_by_user = new URLSearchParams(search).get('referred_by');
 	let referred_by_value = ''

	const showModal = () => {
		setIsModalVisible(true);
	};

	const showPrivacyModal = () => {
		setIsPrivacyPolicyModalAvaliable(true);
	};

    const handleOk = () => {
		setIsModalVisible(false);
	};

	const handleOkPrivacyModal = () => {
		setIsPrivacyPolicyModalAvaliable(false);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	const showCookiesModal = ()=>{
		setIsCookiesPolicyModalAvailable(true);
	}

	const handleCancelPrivacyModal = () => {
		setIsPrivacyPolicyModalAvaliable(false);
	}
	const handleCancelCookiesModal = ()=>{
		setIsCookiesPolicyModalAvailable(false)
	}

	const handleOkCookiesModal = ()=>{
		setIsCookiesPolicyModalAvailable(false)
	}

	const HandlePhoneNumber = (e) => {
		setPhoneNumber(`+${e}`);
		setAlertMessagePhone("");
		setAlertMessageEmail("");
	};

	const handleExtension = e => {
		setExtension(e.target.value);
	};
	const handleCheck = ()=>{
		console.log("i am in")
		console.log("boxChanged:::::",boxChanged) 
		setBoxChanged(!boxChanged)
	}

	const handlePrivacyCheck = ()=>{
		setPrivacyBoxChanged(!privacyBoxChanged)
	}

	/*const handleOpenTermsCondition = async()=>{
		setOpenTermsCondition(!openTermsCondition)
	}*/

	const onSignUp = async (values) => {  
		console.log("registering customer ")
		// setHearAboutUsModal(true);
		setAlertMessagePhone("")
		setAlertMessageEmail("")
		setLanguageErrorMsg({});
		// console.log("phoneNumber",phoneNumber,language)
		if (isPossiblePhoneNumber(phoneNumber) === false && isValidPhoneNumber(phoneNumber) === false) {
				// return 
				setAlertMessagePhone("Phone Number Not Valid")
				return false;
		}
		
		if(language && AdditionalLanguage && language === AdditionalLanguage){
			let msg = 'Language and Additional Language should not be same.';
			let temp = {'language':msg,'additionalLanguage':msg}
			setLanguageErrorMsg(temp);
			return false;      
		}
		if(!boxChanged){
			openNotificationWithIcon('error', 'Error', 'Please accept terms & Conditions');
			return false;      
		}
		if(!privacyBoxChanged){
			openNotificationWithIcon('error', 'Error', 'Please accept Cookie Policies');
			return false;      
		}
		if(referred_by_user ==  null){
			referred_by_value = null
		}else{
			referred_by_value = 'usr_'+referred_by_user
		}
		if(language !== '' ){
			setCreateButtonDisabled(true);
			setshowError(false)
			let res = await register({ 
								...values,
								userType: 'customer',
								phoneNumber:phoneNumber,
								extension:extension,
								timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
								billing: {
									cardNumber:'',
									expiryDate:'',
									nameOnCard:'',
									address:'',
									cvv:'',
								},
								language:language,
								additionalLanguage:AdditionalLanguage,
								status:'completed',
								jobId:(jobId ? jobId : ''),
								scheduleJob:(schedule?true:false),
								referred_by:referred_by_value,
								inviteCode: inviteCode,
							});
			console.log("in the customer res ::::: ",res)
			if(res.message === "Network Error"){
				// setLoading(false)
				setCreateButtonDisabled(false);
				res.message = 'Seems like you are offline. Please try reloading the page.'
				return;
			}
			if(referred_by_user !== ""){
				const responseForTotalRefers = await ReferPeopleApi.checkReferEmail({"email":values['email']})
				console.log("totalEntries ::::::::::::",responseForTotalRefers.totalCount)
				if(responseForTotalRefers.totalCount === 0){
					console.log("called create ref :: ")
					await ReferPeopleApi.createRefer({'user':'usr_'+referred_by_user,'email':values['email'],'status':"Completed"})
				}
				
			}
			
			
			// verificationEmailHandler({email:values.email})

			if(res && res['userIntId']){
				// mixpanel code//
				mixpanel.identify(values.email);
				mixpanel.track('Customer - Registered Successfully');
				// mixpanel code//		
			}else{
				setCreateButtonDisabled(false);
				if(res && res.message && res.message === "The email already exists."){
					setAlertMessageEmail("Email address already exists")
					mixpanel.identify(values.email);
					mixpanel.track(res.message,{ 'Email': values.email});
				}else{
					if(res && res.message){
					mixpanel.identify(values.email);
					mixpanel.track(res.message,{ 'Email': values.email});
					setAlertMessage(res.message)
					}
				}
				return false;
			}
		}
		else{
			setOpenModal(true)
			setshowError(true)
		}
		
		
	};

	return (
		
		<div className="w-100 register-page customer-register-page">

		<Modal title="Terms & Conditions"  className="app-confirm-modal" closable={false}  footer={[
				<button className="btn app-btn" key="submit" type="primary" onClick={handleCancel}>
					Close
				</button>
			]} visible={isModalVisible} onOk={handleOk} >
			{TermsCondition()}
			
		</Modal>

		<Modal title="Privacy Policy"  className="app-confirm-modal" closable={false}  footer={[
				<button className="btn app-btn" key="submit" type="primary" onClick={handleCancelPrivacyModal}>
					Close
				</button>
			]} visible={isPrivacyPolicyModalAvailable} onOk={handleOkPrivacyModal} >
			{privacyPolicy()}
		</Modal>

		<Modal title="Cookies Policy"  className="app-confirm-modal" closable={false}  footer={[
				<button className="btn app-btn" key="submit" type="primary" onClick={handleCancelCookiesModal}>
					Close
				</button>
			]} visible={isCookiesPolicyModalAvailable} onOk={handleOkCookiesModal} >
			{cookiePolicy()}
		</Modal>



		<Header link={LANDING_PAGE_URL} />
				<SectionEmail>     
				 <Row md={12} className="justify-content-center">
						<div >  
							<p className="subtitle">Let’s get you the help you need,<br/>First tell us a little about yourself  </p>    
						</div>
					</Row>     
					<Row>
						<Col span="24">
							{alertMessage !== '' &&
								<Alert variant="danger" className="w-100 text-center">
										{alertMessage}
								</Alert>
							}
						</Col>
					</Row>
					<Form form={form} className="items-center " onFinish={onSignUp}
					layout="vertical">
						<Col md={12}>
							<Row className="d-flex">
									<Col md={5}>                 
											<RegForm
												name="firstName"
												label="FIRST NAME *"
												className="mt-3 mb-1 p-0"
												rules={[
													{
														required: true,
														message: 'Please input your First Name!',
													},
													() => ({
														validator(_, value) {
															const re = /^[a-zA-Z ]*$/;
															if (!re.test(String(value))) {
																return Promise.reject(
																	'No numbers or special characters are allowed',
																);
															}
															if (value && value.length > 30) {
																return Promise.reject('Maximum length is 30 characters');
															}
															return Promise.resolve();
														},
													}),
												]}
											>
										<RegInput
											name="firstName"
											size="small"
											placeholder="First Name"
											className="p-0"

										/>
										 
										</RegForm>
									</Col>
									<Col md={2}></Col>
									<Col md={5}>
											<RegForm
												name="lastName"
												label="LAST NAME *"
												className="mt-3 mb-1 p-0"
												rules={[
													{
														required: true,
														message: 'Please input your Last Name!',
													},
													() => ({
														validator(_, value) {
															const re = /^[a-zA-Z ]*$/;
															if (!re.test(String(value))) {
																return Promise.reject(
																	'No numbers or special characters are allowed',
																);
															}
															if (value && value.length > 30) {
																return Promise.reject('Maximum length is 30 characters');
															}
															return Promise.resolve();
														},
													}),
												]}
											>
												<RegInput name="lastName" size="small" placeholder="Last Name" className="p-0" />
											</RegForm>
									 </Col>
									</Row>
						</Col>
						<Col md={12}>
						<Row className="d-flex">
							 <Col md={5} xs={12}>
					 
									<RegForm
										name="email"
										label="EMAIL"
										className = {"mt-3 mb-1 p-0" + (alertMessageEmail !== '' ? ' red-border-bottom-input' : '')}
										rules={[
											{
												type: 'email',
												message: 'Check the format of the email you entered',
											},
											{
												required: true,
												message: 'Please input your E-mail.',
											},
											() => ({
												validator(_, value) {
													if (value && value.length > 70) {
														return Promise.reject('Maximum length is 70 characters');
													}
													return Promise.resolve();
												},
											}),
										]}
									>
										<RegInput name="email" size="small" placeholder="Email" className="p-0" disabled={!!inviteData?.email} />  
									</RegForm>
									{alertMessageEmail !== '' &&
										<div className="input-error-msg">{alertMessageEmail}</div>
									}
							</Col>
							 <Col md={2}></Col>

								<Col md={5} xs={12}>
										<RegForm
											name="language"
											label="LANGUAGE *"
											className="mt-3 mb-1 p-0 p-0"
											initialValue= "English"

											 >
											<LanguageSelect
												showSearch
												defaultValue="English"
												 optionFilterProp="children"
												filterOption={(input, option) =>
												
													option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
												onChange = {(value,option)=>{
													setLanguage(option.children)
													setLanguageErrorMsg({});
													if(AdditionalLanguage && AdditionalLanguage === option.children){
															let temp = {'language':'Language and Additional Language should not be same.'}
															setLanguageErrorMsg(temp);
														}
												}}
												filterSort={(optionA, optionB) =>
													optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
												}
											>
											{languages.map((item,index)=>{										
												return <Option value={index} key={index}>{item[0]}</Option>												
											})}
											</LanguageSelect>  

										</RegForm>
									 { showError ?<p className="error-msg">Language Required</p> :""}
									 { languageErrorMsg['language'] !== '' ?<p className="error-msg">{languageErrorMsg['language']}</p> :""}
								</Col>
							</Row>
						</Col>
						<Col md={12} xs={12}>

							<Row className="d-flex">
								<Col md={5} xs={12}>
									<RegForm
										name="password"
										label="PASSWORD *"
										className="mt-3 mb-1 p-0"
										rules={[
											{
												required: true,
												message: 'Please input your password.',
											},
											({getFieldValue}) => ({
												validator(_, value) {
													// console.log('value',value)
													// eslint-disable-next-line no-useless-escape
													const re = /^(?=.*[a-z])(?=.*[0-9])(?=.*[\^$*.\[\]{}()?\-“!@#%&/,><’:;|_~`])\S{6,99}$/;
													if (!re.test(String(value))) {
														return Promise.reject(
															'Passwords must include at least six numbers, letters, and special characters (like ! and &)',
														);
													}
													return Promise.resolve();
												},
											}),
										]}
									>
										<RegInputPassword
											name="password"
											size="large"
											placeholder="Password"
											className="p-0"
											onChange={(e)=>{
												if(e.target.value != ''){
													setHaveValue(true)
												}
												else{
													setHaveValue(false)
												}
											}}
										/>
									</RegForm>
										
								</Col>
								
								<Col md={2}></Col>
								<Col md={5} xs={12}>
									<RegForm
										name="confirm_password"
										label="CONFIRM PASSWORD *"
										className="mt-3 mb-1 p-0"
										rules={[
											{
												required: true,
												message: 'Please input your confirm password.',
											},
											({ getFieldValue }) => ({
												validator(_, value) {
													if (!value || getFieldValue('password') === value) {
														return Promise.resolve();
													}
													else{
														return Promise.reject(
														'The two passwords that you entered do not match!',
														);
													}
													
												},
											}),
										]}
									>
										<RegInputPassword
											name="confirm_password"
											size="large"
											placeholder="Confirm Password"
											className="p-0"
											disabled = {!haveValue}
										/>
									</RegForm>
								</Col>

							</Row>

						</Col>  
						<Col md={12}>
							<Row className="d-flex" span={24} gutter={16}></Row>

						</Col>  
						<Col md={12} xs={12}>
							<Row className="d-flex">
								<Col md={5} xs={12}>
									<Row className="d-flex">
										<Col md={7} xs={12}>
											<FormItem
												name="phonenumber"
												label="PHONE NUMBER *"
												className = {"mt-3 mb-1 p-0 suffix"+(alertMessagePhone !== '' ? ' red-border-bottom-input' : '')}
											>
												<InputWithLabel>
													<PhoneInput value={phoneNumber} countryCodeEditable={false} onChange={HandlePhoneNumber} country="us" onlyCountries={['in', 'gr', 'us', 'ca']} className="p-0" />
												</InputWithLabel>
											</FormItem>
											{alertMessagePhone !== '' &&
												<div className="input-error-msg">{alertMessagePhone}</div>
											}
										</Col>
										<Col md={5} xs={12}>
											<RegForm
														name="extension"
														label="EXTENSION"        
														className="mt-3 mb-1 p-0"          
												>
													<RegInput
															name="extension"
															size="small"
															placeholder="Extension(optional)"
															className="extension-input p-0"
															onChange={handleExtension}
													/>

												</RegForm>
										</Col>
									</Row>
								</Col>
							</Row>
						</Col>  
						<Col md={12}>
								<Row>
									<Col md={5}>                     
									 </Col>
								</Row>
						</Col>
						<Row className="">
							<div className="display-flex col-md-12 flex-column align-items-baseline justify-content-center">
									<Col md={12} xs={12} className=" mt-5 text-center">
											<input type="checkbox" id="terms&condtion" onChange={handleCheck}  defaultChecked={boxChanged}/> 
											<label className="ml-2" htmlFor="terms&condtion"> I agree to the <a href="javascript:void(0)" onClick={ showModal}>Terms & Condtions</a> </label>
									</Col>

									<Col md={12} xs={12} className=" mt-2 text-center">
											<input type="checkbox" id="privacy&cookies" onChange={handlePrivacyCheck}  defaultChecked={privacyBoxChanged}/> 
											<label className="ml-2" htmlFor="privacy&cookies"> I agree to the <a href="javascript:void(0)" onClick={ showPrivacyModal}>Privacy Policy</a>  & <a href="javascript:void(0)" onClick={ showCookiesModal}>Cookies Policy</a> </label>
									</Col>
							</div>

							<Col md={12} xs={12} className="text-center">
									<RegButton
										type="primary"
										size="large"
										htmlType="submit"
										loading={false}
										title="Click to create account."
										className="app-btn mt-2"
										disabled={createButtonDisabled}
									>
									<span></span>
									{(createButtonDisabled 
										?
										<Spin className="spinner"/>
										:
										<>Create Account</>
									)}
									</RegButton>
							</Col>
						</Row>

					</Form>
				</SectionEmail>
				<SectionEmail>
				<div>
					<Row className="justify-content-md-center">
					 <Col className="text-center mt-3" span={24}>         
							<Link className="linkColor app-link font-weight-normal" to={linkToLogin}>   
									Already have an account? Sign In.
							</Link>
					</Col>
					 </Row>
				</div>
				</SectionEmail>
			 
		</div>
	);
};



const SectionEmail = styled.section`
	width:60%
	margin: auto;
	@media screen and (max-width: 763px) {
		width:90%
	}
	& .ant-col-12{
		display:inline-block;
		width: 40%;
		margin-left: 15px;
	}

	& .ant-col-20{
		padding-left: 15px;
	}
`;



const RegForm = styled(FormItem)`
	&.ant-form-item-has-error {
		margin-bottom: 6px;
	}

`;

const RegInput = styled(Input)`
	border-radius: 10px;
	padding: 15px 20px;
	font-family: 'Open-Sans', sans-serif;
`;

const RegInputPassword = styled(InputPassword)`
	border-radius: 10px;
	padding: 15px 0px;
	font-family: 'Open-Sans', sans-serif;

 & .ant-input-suffix {
	margin-left:0px !important;
	border-bottom: 2px #d0d0d0 solid;
 }

`;

const RegButton = styled.button`
	border-radius: 10px;
	padding: 15px 20px;
	font-family: 'Open-Sans', sans-serif;
	border: 1px solid #707070;
	outline: none;
	background: #383838;
	color: white;
	font-size: 18px;
	font-weight: 600;
	min-width: 250px;
	cursor:pointer;
`;

const LanguageSelect = styled(Select)`

	border:0px none;
	margin-bottom:none;

	& .ant-select-selector{
		margin-top:18px;
	}

`

/*const FormSectionContainer = styled(Row)`
	width: 100%;
	margin-bottom:none;
`;*/



export const InputWithLabel = styled.div`
	display: flex;
	flex-direction: column;
	text-align: left;
	margin-right: 30px;
	position: relative;
	&:last-child {
		margin-right: 0;
	}
	& input{
		height:50px;
		padding:10px;
		border-radius: 10px;
		margin-top: 15px;
		border : 2px solid #F3F3F3;
		margin-top:15px;
		margin-left:20px;
	}
	& .react-tel-input .form-control {
		height:50px;   
	}
`;

CustomerRegister.propTypes = {};

export default CustomerRegister;
