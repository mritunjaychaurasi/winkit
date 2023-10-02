import React, { useState } from "react"
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Form from 'react-bootstrap/Form';
import NewInput from "../../../../components/common/Input/NewInput"
import DropDown from "../../../../components/common/DropDown"
import {Button} from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/high-res.css'
import { useAuth } from '../../../../context/authContext';
import Link from 'components/AuthLayout/Link';
import { Form, Modal, Spin } from 'antd';
import {TermsCondition} from '../../../../policy-pages/conditions';
import {privacyPolicy} from '../../../../policy-pages/privacy-policy';
import {cookiePolicy} from '../../../../policy-pages/cookie-policy';
import { openNotificationWithIcon } from '../../../../utils';
import {languages} from '../../../../constants';
import * as AuthApi from '../../../../api/auth.api'
import Logo from "components/common/Logo";
import mixpanel from 'mixpanel-browser';
import { klaviyoTrack } from '../../../../api/typeService.api';
import { useLocation } from 'react-router';
import { useFetchInvite } from 'api/invite.api';


const HelpIsOnItsWay =({setJobFlowStep, jobFlowsDescriptions,setRegisteredUser,guestJobId})=>{

    const [form] = Form.useForm()
    function useQuery() {
    	const { search } = useLocation();
    	return React.useMemo(() => new URLSearchParams(search), [search]);
  	}
  	const query = useQuery();
	const inviteCode = query.get('inviteCode') || 'nothing';
	const { data: inviteData } = useFetchInvite(inviteCode);
    const { register,setToken} = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [linkToLogin,setLinkToLogin] = useState(`/login?job-id=${guestJobId}`)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPrivacyPolicyModalAvailable,setIsPrivacyPolicyModalAvaliable] = useState(false)
    const [isCookiesPolicyModalAvailable,setIsCookiesPolicyModalAvailable] = useState(false)
    const [createButtonDisabled, setCreateButtonDisabled] = useState(false);
    const [boxChanged,setBoxChanged] = useState(false);
    const [privacyBoxChanged,setPrivacyBoxChanged] = useState(false)
    const [dialCode,setDialCode] = useState("")
    const [inputValues, setInputValues] = useState({firstName:'',
                                                    lastName:'', 
                                                    email:'',
                                                    password:'',
                                                    confirmPassword:'',
                                                    extension:'',
                                                    hearAboutUs:'',
                                                    language:'',
                                                    })  
    const [dropDownValue, setDropDownValue] = useState(['English', 'en'])
                                        
    /**
	 * Following function is to handle click on "Create Account" button.
	 * @author : Vinit
	 */                                                    
    const signUp = async (e) => {
        // e.preventDefault();
        if(boxChanged && privacyBoxChanged){
            /**
             * Following function is to register user(Customer).
             * @params =  {firstName, lastName, email, password, confirmPassword, phoneNumber, language, referred_by, userType}
             * @response : res
             * @author : Vinit
             */
            if(phoneNumber ===  "" || phoneNumber.length === (dialCode.length+1)){
                return openNotificationWithIcon('error', 'Error', "Phone Number is required" )
            }else if(phoneNumber.length < 10){
                return openNotificationWithIcon('error', 'Error', "Phone Number is invalid" )                
            }
            let res  = await AuthApi.register({
                timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
                firstName:inputValues.firstName, 
                lastName:inputValues.lastName, 
                email:inputValues.email, 
                password:inputValues.password, 
                confirm_password:inputValues.confirmPassword, 
                extension:inputValues.extension, 
                phoneNumber, 
                language:dropDownValue[0], 
                referred_by:inputValues.hearAboutUs, 
                userType:'customer',
                status:'completed',
                inviteCode: inviteCode,
             })
            console.log(">>>>>>>>>>res >>>>>>>>>>>>>>>>>>>> ",res)
            if(res?.success !== false){
                setCreateButtonDisabled(true);
                // mixpanel code//
				mixpanel.identify(res?.user?.email);
				mixpanel.track('Customer - Registered Successfully');
				// mixpanel code//
                setToken(res.token.accessToken)
                setRegisteredUser(res.user)
                
                if(guestJobId){
                    //Call Klaviyo api
                    const klaviyoData = {
                        email: res?.user?.email,
                        event: 'Job Post Button Click',
                        properties: {
                            $first_name: res?.user?.firstName,
                            $last_name: res?.user?.lastName
                        },
                    };
                    await klaviyoTrack(klaviyoData);   
                }

                setJobFlowStep(jobFlowsDescriptions['creditCardInformation'])
            }else{
                openNotificationWithIcon('error', 'Error', res.message )
            }		

            //let res = await register({firstName:inputValues.firstName, lastName:inputValues.lastName, email:inputValues.email, password:inputValues.password, confirm_password:inputValues.confirmPassword, phoneNumber, language:inputValues.language, referred_by:inputValues.hearAboutUs, userType:'customer' });

        }else{
            openNotificationWithIcon('error', 'Error', 'Please accept terms & Conditions.');
        }
    }

    /**

	 * Following function is to handle change of dropdown fields in the form.
	 * @author : Vinit
	 */
    const handleDropDownChange= (e) => {
        setDropDownValue(e)
    }

    /**

	 * Following function is to handle change of input fields in the form.
	 * @author : Vinit
	 */
    const handleChange = (e) =>{
        const { name, value } = e.target;
        setInputValues({
            ...inputValues,
            [name]: value
        }) 
    }

    /**
	 * Following function is to handle change of phone number field in the form.
	 * @author : Vinit
	 */
    const handlePhoneNumber = (value, data) => {
		setPhoneNumber(`+${value}`);
        setDialCode(data.dialCode)

	};

    /**
	 * Following function is to display "Terms & Conditions" modal.
	 * @author : Vinit
	 */
    const showModal = () => {
        setIsModalVisible(true);
	};
    
    /**
     * Following function is to hide "Terms & Conditions" modal.
     * @author : Vinit
     */
    const handleOk = () => {
        setIsModalVisible(false);
	};
    
    /**
     * Following function is to hide "Terms & Conditions" modal.
     * @author : Vinit
     */
    const handleCancel = () => {
        setIsModalVisible(false);
	};
    
    /**
     * Following function is to hide "Privacy Policy" modal.
     * @author : Vinit
     */
    const handleCancelPrivacyModal = () => {
        setIsPrivacyPolicyModalAvaliable(false);
	}

    /**
     * Following function is to hide "Cookies Policy" modal.
     * @author : Vinit
     */
    const handleCancelCookiesModal = ()=>{
        setIsCookiesPolicyModalAvailable(false)
	}
    
    /**
     * Following function is to hide "Cookies Policy" modal.
     * @author : Vinit
     */
    const handleOkCookiesModal = ()=>{
        setIsCookiesPolicyModalAvailable(false)
	}
    
    /**
     * Following function is to hide "Privacy Policy" modal.
     * @author : Vinit
     */
    const handleOkPrivacyModal = () => {
        setIsPrivacyPolicyModalAvaliable(false);
	};
    
    /**
     * Following function is to show "Privacy Policy" modal.
     * @author : Vinit
     */
    const showPrivacyModal = () => {
        setIsPrivacyPolicyModalAvaliable(true);
	};
    
    /**
     * Following function is to show "Cookie Policy" modal.
     * @author : Vinit
     */
    const showCookiesModal = ()=>{
        setIsCookiesPolicyModalAvailable(true);
	}
    
    /**
     * Following function is to toggle checkbox for "Terms & Conditions".
     * @author : Vinit
     */
    const handleCheck = ()=>{
        setBoxChanged(!boxChanged)
	}
    
    /**
     * Following function is to toggle checkbox for "Privacy Policy & Cookie Policy".
     * @author : Vinit
     */
    const handlePrivacyCheck = ()=>{
		setPrivacyBoxChanged(!privacyBoxChanged)
	}
    return (<>

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

    <Container className="font-nova box-container p-2">
        <Logo />
        <Row className="justify-content-md-center">
            <Col md="auto"><span className="heading heading-color">Help is on its way!</span></Col>
       </Row>    
        <Row className="justify-content-md-center">
            <Col md="auto"><h6 className="textColor">Please fill out the details below so we can finalize your request.</h6></Col>
        </Row>
        <br/>
        <br/>
        <Form form={form} onFinish={signUp}>
            <Row>
                {/* <Col className="textColor text-left myPad text-left">First Name</Col>
                <Col className="textColor text-left myPad text-left">Last Name</Col> */}
                <Col md="6" className="myPad">
                    <Row>
                        {/* <Col className="textColor text-left myPad text-left"> */}
                            <Col className="textColor text-left">
                                First Name
                            </Col>
                        {/* </Col> */}
                    </Row>
                    <Row>
                        <Col>
                            <NewInput type={'text'} name={'firstName'} placeHolder={''} onChange={handleChange} value={inputValues.firstName}/>
                        </Col>
                    </Row>
                </Col>
                <Col md="6" className="myPad">
                    <Row>
                        <Col className="textColor text-left">
                            Last Name
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <NewInput type={'text'} name={'lastName'} placeHolder={''} onChange={handleChange} value={inputValues.lastName}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
            {/* <Row>
                <Col className="myPad parent-class"><NewInput type={'text'} name={'firstName'} placeHolder={''} onChange={handleChange} value={inputValues.firstName}/></Col>
                <Col className="myPad parent-class"><NewInput type={'text'} name={'lastName'} placeHolder={''} onChange={handleChange} value={inputValues.lastName}/></Col>
            </Row> */}
            {/* <Row>
                <Col className="textColor text-left myPad">Email Address</Col>
                <Col className="textColor text-left myPad">Password</Col>
            </Row>
            <Row>
                <Col className="myPad parent-class"><NewInput type={'email'} name={'email'} placeHolder={''} onChange={handleChange} value={inputValues.email}/></Col>
                <Col className="myPad parent-class"><NewInput type={'password'} name={'password'} placeHolder={''} onChange={handleChange} value={inputValues.password}/></Col>
            </Row> */}

            <Row>
                <Col md="6" className="myPad">
                    <Row>
                        <Col className="textColor text-left">
                            Email Address
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <NewInput type={'email'} name={'email'} placeHolder={''} onChange={handleChange} value={inputValues.email}/>
                        </Col>
                    </Row>
                </Col>
                <Col md="6" className="myPad">
                    <Row>
                        <Col className="textColor text-left">
                            Password
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <NewInput type={'password'} name={'password'} placeHolder={''} onChange={handleChange} value={inputValues.password}/>
                        </Col>
                    </Row>
                </Col>
            </Row>


            {/* <Row>
                <Col xs={4} className="textColor text-left myPad">Phone Number</Col>
                <Col xs={2} className="textColor text-left myPad">Extension</Col>
                <Col xs={6} className="textColor text-left myPad">Confirm Password</Col>
            </Row>
            <Row>
                <Col xs={4} className="myPad">
                    <PhoneInput countryCodeEditable={false} name={'phoneNumber'} country="us" onlyCountries={['in', 'gr', 'us', 'ca']} className="p-0" containerClass="" dropdownClass="phoneInputDropdownClass" inputClass="newInput" buttonClass="" searchClass="" value={phoneNumber} onChange={handlePhoneNumber}  />
                </Col>
                <Col className="myPad" xs={2}><NewInput type={'text'} name={'extension'} onChange={handleChange} value={inputValues.extension} placeHolder={''}/></Col>
                <Col className="myPad" xs={6}><NewInput type={'password'} name={'confirmPassword'} onChange={handleChange} value={inputValues.confirmPassword} placeHolder={''} password={inputValues.password}/></Col>
            </Row>   */}


            <Row className="max-width-990-flex-direction-col-reversed">
                <Col md="6" className="myPad">
                    <Row>
                        <Col md="8" className="textColor text-left">
                            <Row className="myPad-15">
                                Phone Number
                            </Row>
                            <Row className="myPad-15">
                                <PhoneInput countryCodeEditable={false} name={'phoneNumber'} country="us" onlyCountries={['in', 'gr', 'us', 'ca']} className="p-0" containerClass="" dropdownClass="phoneInputDropdownClass" inputClass="newInput" buttonClass="" searchClass="" value={phoneNumber} onChange={handlePhoneNumber}  />
                            </Row>
                        </Col>
                        <Col md="4" className="textColor text-left maxWidth-767-margin-top-20">
                            <Row className="myPad-15">
                                Extension
                            </Row>
                            <Row className="myPad-15">
                                <NewInput type={'text'} name={'extension'} onChange={handleChange} value={inputValues.extension} placeHolder={''}/>
                            </Row>
                        </Col>
                    </Row>
                </Col>
                <Col md="6" className="myPad">
                    <Row>
                        <Col className="textColor text-left">
                            Confirm Password
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <NewInput type={'password'} name={'confirmPassword'} onChange={handleChange} value={inputValues.confirmPassword} placeHolder={''} password={inputValues.password}/>
                        </Col>
                    </Row>
                </Col>
            </Row>



            {/* <Row>
                <Col className="textColor text-left myPad">How did you hear about us ?</Col>
                <Col className="textColor text-left myPad">Select Language</Col>
            </Row>
            <Row>
                <Col className="myPad parent-class">
                    <DropDown title={'Other'} dropDownOptions={['Linkedin', 'Facebook', 'Friend', 'Other']} name={'hearAboutUs'} value={dropDownValue} onChange={handleDropDownChange} />
                </Col>
                <Col className="myPad parent-class">
                    <DropDown title={'English'} dropDownOptions={languages} name={'language'} value={dropDownValue} onChange={handleDropDownChange} />
                </Col>
            </Row> */}

            <Row>
                <Col md="6" className="myPad">
                    <Row>
                        <Col className="textColor text-left">
                            How did you hear about us ?
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DropDown title={'Other'} dropDownOptions={['Linkedin', 'Facebook', 'Friend', 'Other']} name={'hearAboutUs'} value={dropDownValue} onChange={handleDropDownChange} />
                        </Col>
                    </Row>
                </Col>
                <Col md="6" className="myPad maxWidth-767-margin-top-20">
                    <Row>
                        <Col className="textColor text-left">
                            Select Language
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DropDown title={'English'} dropDownOptions={languages} name={'language'} value={dropDownValue} onChange=   {handleDropDownChange} />
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Row>
                <Col className="maxWidth-767-display-none">
                    {/* <NewInput type={'text'} placeHolder={'Type'}/> */}
                </Col>
                <Col className="d-flex flex-column justify-content-center mt-20">

                    <div className="checkboxDiv">
                        <label className="ml-2 textColor checkboxContainer" htmlFor="terms&condtion">
                            <input type="checkbox" className="customCheckbox" id="terms&condtion" defaultChecked={boxChanged} onChange={handleCheck} /> 
                            <span className="checkmark"></span>
                        I agree to the <a className="headingColor" href="javascript:void(0)" onClick={ showModal}>Terms & Condtions</a> </label>
                    </div>
                    <div className="checkboxDiv">
                        <label className="ml-2 textColor checkboxContainer" htmlFor="privacy&cookies">
                            <input type="checkbox" className="customCheckbox" id="privacy&cookies" onChange={handlePrivacyCheck}  defaultChecked={privacyBoxChanged}/> 
                            <span className="checkmark"></span>
                         I agree to the <a className="headingColor" href="javascript:void(0)" onClick={ showPrivacyModal}>Privacy Policy</a>  & <a className="headingColor" href="javascript:void(0)" onClick={ showCookiesModal} >Cookies Policy</a> </label>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col className="maxWidth-767-display-none"></Col>
                <Col className="mb-50 padding-0">
                    <div className="d-flex justify-content-around align-items-center mt-4">
                        <div className="textColor">
                            <span>Already have an account? </span>
                            <Link className="headingColor font-weight-normal font-size-15" to={linkToLogin}>Sign in</Link>
                        </div>
                        <Button type="submit"  className ={"app-btn job-accept-btn min-width-0 create-acc-btn"} title="Create account" >
                        {/* <Button onClick={signUp}  className ={"app-btn job-accept-btn"} title="Create account" > */}
                            <span></span>
                            {(createButtonDisabled 
                                ?
                                <Spin className="spinner"/>
                                :
                                <>Create Account</>
                            )}

                        </Button>
                    </div>
                </Col>
            </Row>
        </Form>
    </Container>
    </>)

}

export default HelpIsOnItsWay