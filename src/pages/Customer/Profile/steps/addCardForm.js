import React, {useState} from 'react';
import {
	// Elements,
	// CardElement,
	useStripe,
	useElements,
	CardNumberElement,
	CardExpiryElement,
	// injectStripe,
	// StripeProvider,
	CardCvcElement
} from "@stripe/react-stripe-js";
import * as CustomerApi from '../../../../api/customers.api';
import { openNotificationWithIcon ,isLiveUser} from '../../../../utils';
import mixpanel from 'mixpanel-browser';
import { Input,Spin,Modal} from 'antd';
import { Row, Col, Button} from 'react-bootstrap';
import { useUser } from '../../../../context/useContext';
import PhoneInput from 'react-phone-input-2';
import styled from 'styled-components';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons';


const AddCardForm = ({user,cardsInfo,setCardsInfo,isModalOpen,setIsModalOpen, setNewCardAdded,setDisableButton=false}) => {
	const stripe = useStripe();
	const elements = useElements();
	// const [firstName,setFirstName] = useState('')
	// const [Address,setAddress] = useState('')
	const [zip,setZip] = useState('')
	const [editedPhoneNumber,setEditedPhoneNumber] = useState('')
	const [isDisabled,setIsDisabled] = useState(false)
	const liveUser = isLiveUser(user)
	const { refetch } = useUser();
	// const title =  "Please enter your credit card information. \n You won't be charged for anything here! This is to make your job easier, so you won't need to enter it at every stage again.\n  Again, you won't be charged here.";
	// console.log('card title:::::::::::::',title);
	const handleSubmit = async (event) => {
		// Block native form submission.
		event.preventDefault();

		if(!isDisabled){
			setIsDisabled(true);

			if (!stripe || !elements) {
				// Stripe.js has not loaded yet. Make sure to disable
				// form submission until Stripe.js has loaded.
				return;
			}

			// Get a reference to a mounted CardElement. Elements knows how
			// to find your CardElement because there can only ever be one of
			// each type of element.
			var data = {}
			const cardElement = elements.getElement(CardNumberElement);
			// data['name'] = firstName
			// data['address_line1'] = Address
			data['zipcode'] = zip
			// data['metadata'] = {'phone_number':'675124'}


			// if (isPossiblePhoneNumber(editedPhoneNumber) === false && isValidPhoneNumber(editedPhoneNumber) === false) {
			// 	setIsDisabled(false)
			// 	return (openNotificationWithIcon('error', 'Error', 'Phone number is not valid'));
			// }
			// Use your card Element with other Stripe.js APIs
			stripe.createToken(cardElement,data).then(
				async (payload) => {
					console.log('payload>>>>>>>>>>>>>>>>>>>>',payload)
					if(payload['error']){
						openNotificationWithIcon("error","Error",payload['error']['message'])
						setIsDisabled(false);
						setNewCardAdded(false);
						return;
					}else{                   
						let retrieve_cust = await CustomerApi.retrieveCustomer(user.customer.id);
						console.log('addCardForm handleSubmit retrieve_cust::',retrieve_cust)
						if(!retrieve_cust.stripe_id || retrieve_cust.stripe_id === '' || retrieve_cust.stripe_id == null){
							
							checkCardAndAddCardToCustomer(cardElement,data,payload,true,false)
							
						}else{
							checkCardAndAddCardToCustomer(cardElement,data,payload,false,retrieve_cust.stripe_id)							
						}
					}
					
				}          
			);    
		}
	};

	async function checkCardAndAddCardToCustomer(cardElement,data,payload,newCustomer,stripe_customer_id){
		stripe.createToken(cardElement,data).then(
			async (payloadTwo) => {
				console.log('payloadTwo>>>>>>>>>>>>>>>>>>>>',payloadTwo)
				if(payloadTwo['error']){
					openNotificationWithIcon("error","Error",payloadTwo['error']['message'])
					setIsDisabled(false);
					setNewCardAdded(false);
					return;
				}else{
					// const card_valid  =  await CustomerApi.checkCardValidation({token_id:payloadTwo.token.id,liveUser:liveUser}) 
					// if(card_valid['success']){
						if(newCustomer){
							console.log('addCardForm handleSubmit createCustomerStripe ::')
							const result_customer  = await CustomerApi.createCustomerStripe({
								email: user.email,
								liveUser:liveUser
							})

							var customer_id = result_customer.id
							CustomerApi.updateCustomer(user.customer.id,{"stripe_id":customer_id})
							stripe_customer_id = customer_id
						}
						


						const result_card  = await CustomerApi.addCardToCustomerStripe({
							liveUser:liveUser,
							stripe_id: stripe_customer_id,
							token_id:payload.token.id,
						})
						
						if(result_card['error'] != undefined){
							 openNotificationWithIcon("error","Error",result_card['error']['message'])
							 setIsDisabled(false)
							  // mixpanel code//
							mixpanel.identify(user.email);
							mixpanel.track('Customer - Card not added due to some error in card.');
							// mixpanel code//
						}else{
							 if(cardsInfo){
								let temp_data = []
								if(cardsInfo && cardsInfo != null && Array.isArray(cardsInfo)){
									temp_data = [...cardsInfo]
								}							
								if(newCustomer){
									result_card['default_card'] = true;
								}
								temp_data.push(result_card)
								setCardsInfo(temp_data)
							}
							
							// mixpanel code//
							mixpanel.identify(user.email);
							mixpanel.track('Customer - Card details added.');
							// mixpanel code//
							await refetch()
							openNotificationWithIcon("success","Success","Card details has been saved.")
							setIsDisabled(false)
							setIsModalOpen(false)
							setNewCardAdded(true);
						}
					// }else{
					// 	openNotificationWithIcon("error","Error","Card is invalid. Please try a different card.")
					// 	setIsDisabled(false)
					// }
				}               
		})
	}
	// const changeNameOnCard = (e) =>{
	// 	setFirstName(e.target.value)
	// }

	// const changeAddress = (e) =>{
	// 	setAddress(e.target.value)
	// }

	const changeZip = (e) =>{
		setZip(e.target.value)
	}	

	// const HandlePhoneNumber = (e)=>{
	// 	setEditedPhoneNumber(`+${e}`);
	// }

	return (
		<Modal
			title={<><div className='text-center mb-3'><span>Please fill out the details below so we can finalize your request</span><br/>
			<span className='text-center'>Don't worry, you won't be charged now. Billing begins only when a Geeker starts helping you.</span><br/><span className='text-center'>New user? Your first 6 minutes are free!</span></div><br/>
			</>}
			visible={isModalOpen}
			onOk={() => {}}
			onCancel={() => {setIsModalOpen(false); if(setDisableButton){setDisableButton(false)}} }
			closable={false}
			className="add-card-modal-outer"
			footer={[
				<Button key="back" onClick={() => {
					setIsModalOpen(false); if(setDisableButton){setDisableButton(false)}
				}} className="btn app-btn app-btn-light-blue modal-footer-btn">
					<span></span>Close
				</Button>,
				<Button
					loading={false}
					className={"btn app-btn modal-footer-btn "+(isDisabled ? "disabled-btn" : "")}
					disabled={isDisabled}
					onClick={handleSubmit}
				  >
					<span></span>
					{isDisabled 
					? 
						<Spin/>
					:
						<>Add Card</>
					}
				</Button>,
			]}
			>
				{/* <Col md="12" className="card-validation-message mb-5">
					To validate the card, we will pre-authorize a charge which will be returned within 24 hrs.
				</Col> */}
				<Col md="12" className="pb-4 m-auto add-card-form-outer text-left">
					<form>
						<Row>
							<Col md="12" className= "card-element-outer mt-2 mb-4">
								<Col xs="12" className="pl-0 pb-2">
									<label className="label-name">Card Number</label>              
								</Col>
								<Col xs="12" className= "card-element-inner pb-3 iframe-outer" >
									<CardNumberElement  options={{placeholder:"CC#"}} />
								</Col>                            
							</Col>

							<Col md="4" className= "card-element-outer mt-2 mb-4">
								<Col xs="12" className="pl-0 pb-2">
									<label className="label-name">Expiry Date</label>         
								</Col>
								<Col xs="12" className= "card-element-inner pb-3 iframe-outer" >
									<CardExpiryElement/> 
								</Col>
							</Col>

							<Col md="4" className= "card-element-outer mt-2 mb-4 cvv-item-outer">
								<Col xs="12" className="pl-0 pb-2">
									<label className="label-name">CVV</label>         
								</Col>
								<Col xs="12" className= "card-element-inner pb-3 iframe-outer" >
									<CardCvcElement/>
									<FontAwesomeIcon  icon={faQuestionCircle} className="card-icon" title="CVV code mentioned on the back of the Credit & Debit Card."/>
								</Col>
							</Col>
							
							<Col md="4" className= "card-element-outer mt-2 mb-4">
								<Col xs="12" className="pl-0">
									<label className="label-name">Zip</label>         
								</Col>
								<Col xs="12" className= "card-element-inner" >
								<Input onFocus={(e) => { e.target.style.boxShadow = 'none' }} placeholder="XXX" onChange={changeZip} required/>
								</Col>
							</Col>

							{/* <Col md="12" className= "card-element-outer my-4">
								<Col xs="12" className= "card-element-inner" >
									<label className="label-name">Name on a Card</label>              
									<Input placeholder="Card`s Holder Name" onChange={changeNameOnCard} required/>
								</Col>
							</Col> */}

							{/* <Col md="8" className= "card-element-outer my-4">
								<Col xs="12" className= "card-element-inner" >
									<label className="label-name">Address</label>              
									<Input placeholder="Enter address" onChange={changeAddress} required/>
								</Col>
							</Col>
							<Col></Col> */}
							{/*<Col md="4" className= "card-element-outer my-4">
								<Col xs="12" className= "card-element-inner card-billing-phone" >
									<InputWithLabel>
										<label className="label-name">Billing Phone</label>
										<PhoneInput placeholder="" countryCodeEditable={false} onChange={HandlePhoneNumber} country="us" onlyCountries={['in', 'gr', 'us', 'ca']} /> 
									</InputWithLabel>                   
								</Col>
							</Col>*/}

							{/*<Col md="12" className= "mb-4">
								<button type="submit" className="app-btn" disabled={isDisabled}>
									<span></span> 
									Add Card                
								</button>
							</Col>*/}
							{isDisabled ? <span></span> : ''}
						</Row>

					</form>            
				</Col>
			</Modal>
	);
};


 const InputWithLabel = styled.div`
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

export default AddCardForm;