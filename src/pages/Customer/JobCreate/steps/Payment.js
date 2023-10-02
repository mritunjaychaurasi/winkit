import React, { useEffect, useState } from "react"
import {
	Elements,
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
import { openNotificationWithIcon ,isLiveUser, GAevent} from '../../../../utils';
import mixpanel from 'mixpanel-browser';
import { Form,Input,Spin,Modal} from 'antd';
import { Row, Col, Button} from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/high-res.css'
import NewInput from "../../../../components/common/Input/NewInput"
import {ArrowRightOutlined, ArrowLeftOutlined} from "@ant-design/icons"
import { STRIPE_KEY,STRIPE_TEST_KEY } from '../../../../constants';
import * as CommonFunctions from '../../../../utils/'
import {loadStripe} from '@stripe/stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight,faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Logo from "components/common/Logo";
import { useAuth } from "context/authContext";
import { useJob } from "context/jobContext";
import { isMobile, isTablet } from 'react-device-detect';

const Payment = ({user,cardsInfo,jobFlowsDescriptions,setJobFlowStep,setGuestJobId,guestJobId,job}) =>{
    const [form] = Form.useForm()
    const FormItem = Form.Item;
    const {refetch} = useAuth();
    // const [phoneNumber, setPhoneNumber] = useState('');
    const elements = useElements();
    const {updateJob, createJob, setJob} = useJob()
    const stripe = useStripe();
    // const [formData,setFormData] = useState({nameOnCard:'',
    //                                          address:'',
    //                                          city:'',
    //                                          state:'',
    //                                          zip:'',
    //                                         })
    const [formData,setFormData] = useState({zip:'',
                                            })

    const [createButtonDisabled, setCreateButtonDisabled] = useState(false);

    let liveUser = CommonFunctions.isLiveUser(user)
    const stripePromise = liveUser ? loadStripe(STRIPE_KEY) : loadStripe(STRIPE_TEST_KEY)
    const onNext = ()=>{
        console.log("onNext >>>>>. ",onNext)
    }
    const onBack = ()=>{
        setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
    }
    useEffect(()=>{
    },[])

    /**
	 * Following function is to handle change of input fields in the form.
	 * @author : Vinit
	 */
     const handleChange = (e) =>{
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        }) 
    }

    /**
	 * Following function is to handle change of phone number field in the form.
	 * @author : Vinit
	 */
    //  const handlePhoneNumber = (e) => {
	// 	setPhoneNumber(`+${e}`);
	// };

    /**
	 * Following function is to handle click on "next/right arrow" button.
	 * @author : Vinit
	 */  
    const handleForm = ()=>{
        // e.preventDefault()
        setCreateButtonDisabled(true);
        const cardElement = elements.getElement(CardNumberElement);
        // formData['phoneNumber'] = phoneNumber
        var dataToStripe ={}
        dataToStripe['metadata'] = formData

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            return;
        }
        
        stripe.createToken(cardElement,dataToStripe).then(
            async (payload) => {
                console.log('payload>>>>>>>>>>>>>>>>>>>>',payload)
                if(payload['error']){
                    openNotificationWithIcon("error","Error",payload['error']['message'])
                    setCreateButtonDisabled(false);
                    // setIsDisabled(false);
                    // setNewCardAdded(false);
                    return;
                }else{                   
                    let retrieve_cust = await CustomerApi.retrieveCustomer(user?.customer?.id);
                    console.log('addCardForm handleSubmit retrieve_cust::',retrieve_cust)
                    if(!retrieve_cust.stripe_id || retrieve_cust.stripe_id === '' || retrieve_cust.stripe_id == null){
                        
                        checkCardAndAddCardToCustomer(cardElement,dataToStripe,payload,true,false)
                        
                    }else{
                        checkCardAndAddCardToCustomer(cardElement,dataToStripe,payload,false,retrieve_cust.stripe_id)							
                    }
                }
                
            }          
        );

        async function checkCardAndAddCardToCustomer(cardElement,data,payload,newCustomer,stripe_customer_id){
            stripe.createToken(cardElement,data).then(
                async (payloadTwo) => {
                    console.log('payloadTwo>>>>>>>>>>>>>>>>>>>>',payloadTwo)
                    if(payloadTwo['error']){
                        setCreateButtonDisabled(false);
                        openNotificationWithIcon("error","Error",payloadTwo['error']['message'])
                        return;
                    }else{
                        const card_valid  =  await CustomerApi.checkCardValidation({token_id:payloadTwo.token.id,liveUser:liveUser}) 
                        if(card_valid['success']){
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
                                    // setCardsInfo(temp_data)
                                }
                                
                                // mixpanel code//
                                mixpanel.identify(user.email);
                                mixpanel.track('Customer - Card details added.');
                                // mixpanel code//
                                openNotificationWithIcon("success","Success","Card details has been saved.")
                                // setUser(user)
                                refetch()
                                // commented by ridhima dhir after confirming with sahil 09-12-2022
                                //updateJob(guestJobId,{"customer":user.customer.id,"status":"Pending"})
                                let btnclicked = localStorage.getItem("btnClicked")
                                console.log("My console", btnclicked)
                                if (btnclicked == 0) {
                                    if(isMobile || isTablet){
                                        let jobID = await createUpdateJob("Draft")
                                        return window.location.href = "/customer/profile-setup?jobId="+jobID+"&newpost=yes&isMobilePost=yes"
                                    }else{
                                        createUpdateJob("Pending")
                                        setJobFlowStep(jobFlowsDescriptions['jobAlivePage'])
                                        GAevent('Conversion', 'new_job', 'Conversion', user.customer.id)
                                        console.log("My console if")
                                    }
                                } else if (btnclicked == 1) {
                                    createUpdateJob("Pending")
                                    setJobFlowStep(jobFlowsDescriptions['scheduleJob'])
                                    console.log("My console else")
                                }
                                localStorage.removeItem("btnClicked")
                            }
                        }else{
                            openNotificationWithIcon("error","Error","Card is invalid. Please try a different card.")
                            setCreateButtonDisabled(false);
                        }
                    }               
            })
        }
    }

    /**
	 * Following function is to create and update job after discussion with sahil nagpal as this is a old code. Just status is now dynamic
	 * @author : Ridhima Dhir
     * @date : 09-12-2022
	 */
    const createUpdateJob= async(status)=>{
        let jobId = "";
        if (guestJobId) {
            jobId = guestJobId
            updateJob(guestJobId, { "customer": user.customer.id, "status": status })
        } else {
            let temp = { ...job }
            temp.software = job.software.id
            temp.status = status
            if(temp.id){
                updateJob(temp.id, {"status": status })
                jobId = guestJobId
            }else{
                if (job.subSoftware && job.subSoftware.id) {
                    temp.subSoftware = job.subSoftware.id
                }
                const jobData = await createJob(temp)
                console.log("jobID ::::3", jobData)
                setJob(jobData)
                jobId = jobData.id
            }
        }
        return jobId
    }

    /**
	 * Following function is to handle "back/left arrow btn" in the form.
	 * @author : Vinit
	 */
    const handleBack = () => {
        onBack();
    }

    /**
	 * Following function is to handle onFinishFail in the form.
	 * @author : Vinit
	 */
    const failfunc = () => {
        console.log("My console fail")
    }

    return (
        <div className=" mx-auto">
            <Logo user={user} />
            <Col md="12" className="pb-4 m-auto add-card-form-outer text-left font-nova pad-0">
                <Form onFinishFailed={failfunc} onFinish={handleForm}>
                    <Row className="justify-content-md-center">
                        <Col md="auto text-center">
                            <span className="heading-color letter-spacing-0-16 payment-font">Payment</span>
                        </Col>
                    </Row>    
                    <Row className="justify-content-center">
                        <Col md="auto">
                            <h6 className="textColor font-size-17 letter-spacing-0-09 text-center">Please fill out the details below so we can finalize your request.</h6>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col md="auto">
                            <h6 className="textColor font-size-17 letter-spacing-0-09 text-center">Don't worry, you won't be charged now. Billing begins only when a Geeker starts helping you.</h6>

                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col md="auto">
                            <h6 className="textColor font-size-17 letter-spacing-0-09 text-center">New user? Your first 6 minutes are free!</h6>
                        </Col>
                    </Row>
                    <Row className='mt-5'>
                        <Col md="12" className="pad-right-35 maxWidth-953-padding-right-15 mg-b">
                            <span className='headingColor font-size-18'>CARD INFO</span>
                            {/* <Row>
                                <Col className="textColor myPad-15 m-top-15 font-size-15">Name on card</Col>
                            </Row>
                            <Row>
                                <Col className=""><NewInput type={'text'} name={'nameOnCard'} placeHolder={''} onChange={handleChange} value={formData.nameOnCard}/></Col>
                            </Row> */}
                            <Row>
                                <Col className="textColor myPad-15 font-size-15 pr-20">Credit Card number </Col>
                            </Row>
                            <Row xs="12" className= "myPad-15 " >
                                <Col className="newInput margin-bottom-24">
                                    <CardNumberElement className="margin-top-28 maxWidth-953-margin-left-7" options={{placeholder:"CC#"}} />
                                </Col>
                            </Row>
                            <Row className="custom-class">
                                <Col className="textColor myPad-15 my-pl-0 font-size-15 mg-b myPad-0 " md={4}>
                                    <Row className="pad-left-15 " >
                                        Expiration
                                    </Row>
                                    <Row className="padding-right-0 maxWidth-953-padding-right-15 myPad-15 myPad-15 newInput ml-0">
                                        <CardExpiryElement className="margin-top-28 maxWidth-953-margin-left-15"/> 
                                    </Row>
                                </Col>
                                <Col className="textColor myPad-15 font-size-15 mg-b myPad-0" md={4}>
                                    <Row className="maxWidth-953-padding-left-15 ml-0">
                                        CVV
                                    </Row>
                                    <Row className="pad-0 pad-right-13 maxWidth-953-padding-left-15 newInput maxWidth-953-margin-left-0 custom-class">
                                        <CardCvcElement className="margin-top-28 margin-left-15"/>
                                    </Row>
                                </Col>
                                <Col className="textColor myPad-15 font-size-15 my-pr-0 mg-b myPad-0" md={4}>
                                    <Row className="maxWidth-953-padding-left-15 ml-0">
                                        Zip
                                    </Row>
                                    <Row className="pad-0 pad-right-13 maxWidth-953-padding-left-15 ml-0">
                                        <NewInput type={'text'} name={'zip'} placeHolder={'XXX'} onChange={handleChange} value={formData.zip}/>    
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        {/* <Col md="6" className="pad-left-35 maxWidth-953-padding-left-15 maxWidth-953-margin-top-20">
                            <span className='headingColor  font-size-18'>BILLING INFO</span>
                            <Row>
                                <Col className="textColor myPad-15 m-top-15 font-size-15">Address</Col>
                            </Row>
                            <Row>
                                <Col className="myPad-15"><NewInput type={'text'} name={'address'} placeHolder={''} onChange={handleChange} value={formData.address}/></Col>
                            </Row>
                            <Row>
                                <Col className="textColor myPad-15 font-size-15">City</Col>
                            </Row>
                            <Row>
                                <Col className="myPad-15"><NewInput type={'text'} name={'city'} placeHolder={''} onChange={handleChange} value={formData.city}/></Col>
                            </Row>
                            <Row className="">
                                <Col className="textColor myPad-15 font-size-15" md={6}>
                                    <Row className="pad-left-15">
                                        State
                                    </Row>
                                    <Row className="padding-right-0 maxWidth-953-padding-right-15 myPad-15">
                                        <NewInput type={'text'} name={'state'} placeHolder={''} onChange={handleChange} value={formData.state}/>    
                                    </Row>
                                </Col>
                                <Col md={1}></Col>
                                <Col className="textColor myPad-15 font-size-15" md={5}>
                                    <Row className="maxWidth-953-padding-left-15">
                                        Zip
                                    </Row>
                                    <Row className="pad-0 pad-right-13 maxWidth-953-padding-left-15">
                                        <NewInput type={'text'} name={'zip'} placeHolder={'XXX'} onChange={handleChange} value={formData.zip}/>    
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col className='textColor myPad-15 font-size-15'>Phone number</Col>
                            </Row>
                            <Row>
                                <Col className="myPad-15">
                                    <PhoneInput countryCodeEditable={false} name={'phoneNumber'} country="us" onlyCountries={['in', 'gr', 'us', 'ca']} className="p-0" containerClass="" inputClass="newInput" buttonClass="" searchClass="" value={phoneNumber} onChange={handlePhoneNumber}  />
                                </Col>
                            </Row>
                        </Col> */}
                    </Row>
                    <Row className="m-top-25 d-flex justify-content-between my-pad-15">
                        {/* <Col md={6}> */}
                            <Button onClick={handleBack} className="grey-btn-color prev-btn sm-btn-back disabled-border" disabled={createButtonDisabled}>
                                <span></span>
                                <FontAwesomeIcon icon={faArrowLeft} className="arr-size" />
                            </Button>
                            {/* <Button className="grey-btn-color ml-4 decline-btn app-btn sm-btn-back">
                                <span></span>Decline
                            </Button> */}
                        {/* </Col>
                        <Col md={6}> */}
                            <FormItem>
                                <Button type="submit"  className="next-btn float-right green-back-color sm-btn-color disabled-border" disabled={createButtonDisabled}>
                                <span></span>
                                {(createButtonDisabled 
                                    ?
                                    <Spin className="spinner spinner-pos"/>
                                    :
                                    <FontAwesomeIcon icon={faArrowRight} className="arr-size" />
                                )} 
                                </Button>
                            </FormItem>
                        {/* </Col> */}
                    </Row>
                </Form>            
            </Col>
        </div>
    )
}

export default Payment