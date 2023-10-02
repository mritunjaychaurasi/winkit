import React, { useEffect, useState } from 'react';
import {
  Row, Col, Form,Modal
} from 'antd';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import PhoneInput from 'react-phone-input-2';
import { StepTitle } from './style';
import messages from '../messages';
// import RightImage from '../../../../assets/images/tech_signup.png';
import FormItem from '../../../../components/FormItem';
// import StepButton from '../../../../components/StepButton';
import {Button} from 'react-bootstrap';
import AuthInput from '../../../../components/AuthLayout/Input';
import AuthInputPassword from '../../../../components/AuthLayout/InputPassword';
import * as AuthApi from '../../../../api/auth.api';
// import { openNotificationWithIcon } from '../../../../utils';
import Link from 'components/AuthLayout/Link';
// import 'react-phone-input-2/lib/style.css';
import { Select } from 'antd';
import {languages} from   '../../../../constants';
import mixpanel from 'mixpanel-browser';
import $ from 'jquery';
import {privacyPolicy} from '../../../../policy-pages/privacy-policy';
import {cookiePolicy} from '../../../../policy-pages/cookie-policy';
import {TermsCondition} from '../../../../policy-pages/conditions';
import {useAuth} from  '../../../../context/authContext';
import TimezoneSelect, { allTimezones } from "react-timezone-select";
import {openNotificationWithIcon} from '../../../../utils'
import * as TechnicianApi from '../../../../api/technician.api';
import Cookies from 'js-cookie';
import {useTools} from '../../../../context/toolContext';
const { Option } = Select;

function TechSignup({
  onNext, 
  userInfo, 
  setUserInfo, 
  setTechnicianRate,
  setLanguage,
  language,
  technicianRate,
  setAdditionalLanguage,
  additionalLanguage,
  timezone,
  setTimezoneValue,
  verificationEmailHandler,
  setRegisterRes,
  register,
  setRegister,
  certifiedIn,
  setCertifiedIn
}) {

    // const [showError,setshowError] = useState(false)
    // const [registerRes, setRegisterRes] = useState(null);
    const registerRes = null;
    const { setUserToken } = useAuth();
    const [alertMessagePhone, setAlertMessagePhone] = useState('');
    const [alertMessageEmail,setAlertMessageEmail] = useState('');
    const [alertMessageLanguage,setAlertMessageLanguage] = useState('');
    const [alertMessageTimezone,setAlertMessageTimezone] = useState('');
    const [alertMessageAdditionalLanguage, setAlertMessageAdditionalLanguage] = useState('')
    // const [boxChanged,setBoxChanged] = useState(false);
    // const [openTermsCondition,setOpenTermsCondition] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const {getCountryCategory} = useTools();
    const [boxChanged,setBoxChanged] = useState(false);
    // const [openTermsCondition,setOpenTermsCondition] = useState(true);
    const [isPrivacyPolicyModalAvailable,setIsPrivacyPolicyModalAvaliable] = useState(false)
    // const [createButtonDisabled, setCreateButtonDisabled] = useState(false);
    const [privacyBoxChanged,setPrivacyBoxChanged] = useState(false)
    const [isCookiesPolicyModalAvailable,setIsCookiesPolicyModalAvailable] = useState(false)
    
    
  
    useEffect(()=>{
        if(registerRes != null){
            setUserToken(registerRes)
            window.location.reload()
            // history.push("/")
        }
    },[registerRes])


    const [phoneNumber, setPhoneNumber] = useState('');
    const layout = {
        labelCol: { span: 24 },
        wrapperCol: { span: 24 },
    };


    // Functions for modal condition code
    const handleCheck = ()=>{
        console.log("i am in")
        console.log("boxChanged:::::",boxChanged) 
        setBoxChanged(!boxChanged)
    }

    const handlePrivacyCheck = ()=>{
        setPrivacyBoxChanged(!privacyBoxChanged)
    }
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


    //code for modals ended here

    /*const handleCheck = ()=>{
        setBoxChanged(!boxChanged)
    }*/

    /*const handleOpenTermsCondition = async()=>{
        setOpenTermsCondition(!openTermsCondition)
    }*/
    const [form] = Form.useForm();
    // const useDefaultPhoneInputProps = () => {
    //   const [value, setValue] = useState('')
    //   return {
    //     placeholder: 'Enter phone number',
    //     value: value,
    //     onChange: HandlePhoneNumber,
    //     // Test with this commented out as well:
    //     country: "US",
    //   }
    // }
    useEffect(() => {
        form.setFieldsValue({
            ...userInfo,
        });
    }, [form, userInfo]);
    
    const HandlePhoneNumber = (e) => {
        setPhoneNumber(`+${e}`);
        setAlertMessagePhone("");
        setAlertMessageEmail("");
        setAlertMessageLanguage("");
        setAlertMessageAdditionalLanguage("");
        setAlertMessageTimezone("")
    };

    // const handleNext = ()=>{
    //   onNext()
    // }

    const onSignUp = async (value) => {
        // console.log("Tech profile", value);
        const res = await AuthApi.checkEmail({ email: value.email });

        if (isPossiblePhoneNumber(phoneNumber) === false && isValidPhoneNumber(phoneNumber) === false) {
            // return (openNotificationWithIcon('error', 'Error', 'Phone Number Not Valid'));
            setAlertMessagePhone("Phone Number Not Valid")
            return false;
        }
         // console.log("language",language)
        if(!language || language === ''){
            // return openNotificationWithIcon('error', 'Error', 'Language field required');
            setAlertMessageLanguage("Language field required")
            return false;
        }
        // console.log("language",language)
         // console.log("additionalLanguage",additionalLanguage)
        // console.log("language == additionalLanguage",language == additionalLanguage)
        if(language && additionalLanguage && language === additionalLanguage){
            setAlertMessageAdditionalLanguage("Language and Additional Language should not be same.")
            openNotificationWithIcon('error', 'Error', 'Language and Additional Language should not be same.') ;
            return false;
        }

        if(!timezone || timezone === ''){
            // return openNotificationWithIcon('error', 'Error', 'Language field required');
            setAlertMessageTimezone("Timezone field required")
            return false;
        }
        /*if(!boxChanged){
             openNotificationWithIcon('error', 'Error', 'Please accept terms & Conditions') ;
             return;
        }*/
        // boxChanged
        if (res.success) {
            
            value.phonenumber = phoneNumber;
            setTechnicianRate(value.technicianRate);
            delete value.technicianRate;
            console.log("value ::::::::",value);
            setUserInfo(value);
            if(!boxChanged){
            openNotificationWithIcon('error', 'Error', 'Please accept terms & Conditions');
            return ;      
            }
            if(!privacyBoxChanged){
                openNotificationWithIcon('error', 'Error', 'Please accept Cookie Policy');
                return ;      
            }

            const result =  AuthApi.register({ ...value, confirm_password: value.password, userType: 'technician',timezone:timezone});
            
            result.then(async (res)=>{
                console.log("res regi is ",res)
                if(res && res.user){
                    register = res.user;
                    
                    if(register){
                        Cookies.set('user_id',res?.user?.id ,{"path":'/',"domain":process.env.REACT_APP_COOKIE_DOMAIN})
                        verificationEmailHandler({email:register.email})
                        let category = getCountryCategory(timezone)
                        await TechnicianApi.createTechnician({
                            user: res.user.id,
                            profile: { confirmId: { phoneNumber: value.phonenumber } },
                            language : language,
                            additionalLanguage : additionalLanguage,
                            registrationStatus : "softwares",
                            commissionCategory:category,
                            promo_code : (`${res.user.firstName}${res.user.lastName}`).replace(/ /g,'').toLocaleUpperCase(),
                            tag:'signedUp'
                        });
                        console.log("techDetails :::::::::: ",register);
                        openNotificationWithIcon(
                            'success',
                            'Success',
                            'You have signed up successfully',
                        );
                        setRegister(register);
                        console.log("tech:::::::::::: ", register.id);
                        //setOpenModal(true)
                        
                        // if(value){
                        //     // mixpanel code//
                        // mixpanel.identify(value.email);
                        // mixpanel.track('Technician - signup successfull');
                        // }
                        setRegisterRes(res);
                    }  

                }else{

                    if(res.success !== undefined){                        
                        let errorMsg = (res.message ? res.message : '')
                        openNotificationWithIcon(
                            'error',
                            'Error',
                            errorMsg,
                        );
                        mixpanel.identify(value.email);
                        mixpanel.track('Technician - signup failed.'+errorMsg);
                    }

                    
                }
            });
            // mixpanel code//
      
        } else {
            // openNotificationWithIcon('error', 'Error', 'Email address already exists');
            setAlertMessageEmail("Email address already exists")
            return false;
        }
    };

    useEffect(() => {
        setTimeout(function(){
            var inputWidth = $(".first-name-input").width();
            if(inputWidth){
                $(".language-select").css({"width":(inputWidth+12)+'px'})
            }
        },100)
    }, []);

console.log(" :::::::option ::::::::::", Option);
    return (
       
        <Container className="tech-register-page">

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

            <StepTitle><p>Apply to be a Geek</p></StepTitle>
            <div className="center">       
                <Form className="items-center " form={form} onFinish={onSignUp} {...layout}>
                    <FormSectionContainer span={24} gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="firstName"
                                label="First Name *"
                                className = "mt-3 mb-1"
                                rules={[
                                    {
                                        required: true,
                                        message: <FormattedMessage {...messages.firstName} />,
                                    },
                                    () => ({
                                        validator(_, value) {
                                            const re = /^[a-zA-ZÀ-ÖØ-öø-ÿ-' ]*$/;
                                            if (!re.test(String(value))) {
                                                return Promise.reject(
                                                    new Error(
                                                        'No numbers or special characters are allowed.',
                                                    ),
                                                );
                                            }
                                            if (value && value.length > 30) {
                                                return Promise.reject(
                                                    new Error('Maximum length is 30 characters.'),
                                                );
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <AuthInput
                                    name="firstName"
                                    size="large"
                                    placeholder="First Name"
                                    border="none"
                                    borderbottom = "2px solid #B2B7BC"
                                    border_radius="0px"
                                    className="first-name-input pl-0"
                                />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="lastName"
                                label="Last Name *"
                                className = "mt-3 mb-1"                            
                                rules={[
                                    {
                                        required: true,
                                        message: <FormattedMessage {...messages.lastName} />,
                                    },
                                    () => ({
                                        validator(_, value) {
                                            const re = /^[a-zA-ZÀ-ÖØ-öø-ÿ-' ]*$/;
                                            if (!re.test(String(value))) {
                                                return Promise.reject(
                                                    new Error(
                                                        'No numbers or special characters are allowed.',
                                                    ),
                                                );
                                            }
                                            if (value && value.length > 30) {
                                                return Promise.reject(
                                                    new Error('Maximum length is 30 characters.'),
                                                );
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <AuthInput
                                    name="lastName"
                                    size="large"
                                    placeholder="Last Name"
                                    border="none"
                                    borderbottom = "2px solid #B2B7BC"
                                    border_radius="0px"
                                    className="pl-0"
                                />
                            </FormItem>
                        </Col>
                    </FormSectionContainer>
              
                    <FormSectionContainer span={24} gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="email"
                                label="Email *"
                                className = {"mt-3 mb-1" + (alertMessageEmail !== '' ? ' red-border-bottom-input' : '')}
                                rules={[
                                    {
                                        type: 'email',
                                        message: <FormattedMessage {...messages.emailVail} />,
                                    },
                                    {
                                        required: true,
                                        message: <FormattedMessage {...messages.email} />,
                                    },
                                    () => ({
                                        validator(_, value) {
                                            if (value && value.length > 70) {
                                                return Promise.reject(
                                                    new Error('Maximum length is 70 characters.'),
                                                );
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <AuthInput name="email" size="large" placeholder="Email"  border="none"
                                    borderbottom = "2px solid #B2B7BC"
                                    autoComplete="off"
                                    border_radius="0px" 
                                    className="pl-0"
                                />

                            </FormItem>
                            {alertMessageEmail !== '' &&
                                <div className="input-error-msg">{alertMessageEmail}</div>
                            }
                            
                            
                            <FormItem
                                name="password"
                                label="Password *"
                                className = "mt-3 mb-1"
                                rules={[
                                    () => ({
                                        validator(_, value) {
                                            const re = /^(?=.*[a-z])(?=.*[0-9])(?=.*[\^$*.[\]{}()?\-“!@#%&/,><’:;|_~`])\S{6,99}$/;
                                            if (!re.test(String(value))) {
                                                return Promise.reject(
                                                    new Error(
                                                        'Passwords must include at least six numbers, letters, and special characters (like ! and &).',
                                                    )
                                                );
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <AuthInputPassword
                                    name="password"
                                    size="large"
                                    placeholder="Password"
                                    border="none"
                                    borderbottom = "2px solid #B2B7BC"
                                    border_radius="0px"
                                    autocomplete="off"
                                />
                            </FormItem>
                        </Col>
                        
                        <Col span={12}>
                            
                            <FormItem
                                name="language"
                                label="Language *" 
                                className = "mt-4 mb-1"
                                initialValues= "English"
                            >
                                <LanguageSelect
                                    showSearch
                                    style={{ width: 200 }}
                                    defaultValue='English'
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    onChange = {(value,option)=>{
                                        
                                        setAlertMessageLanguage("")
                                        if(option.children && option.children === additionalLanguage){
                                            setAlertMessageLanguage("Language and Additional Language should not be same.")
                                        }
                                        setLanguage(option.children)
                                        
                                    }}
                                    filterSort={(optionA, optionB) =>
                                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                    }
                                    className = {"language-select"+ (alertMessageLanguage !== '' ? ' red-border-bottom-input' : '')}
               
                                >
                                    {languages.map((item,index)=>{
                                        return <Option value={index}>{item[0]}</Option>
                                    })}
                                </LanguageSelect>  

                            </FormItem>
                            {alertMessageLanguage !== '' &&
                                <div className="input-error-msg">{alertMessageLanguage}</div>
                            }
                            { /*showError ?<p className="error-msg">Language Required</p> :""*/}

                            <FormItem
                                name="additionalLanguage"
                                label="Additional Language" 
                                className = "mt-4 mb-1"
                                initialValues= "English"
                            >
                                <AdditionalLanguageSelect
                                    showSearch
                                    style={{ width: 200 }}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    onChange = {(value,option)=>{
                                        let allAdditionalLanguage = [];
                                        setAlertMessageAdditionalLanguage("")
                                        if(option.children && option.children === additionalLanguage){
                                            setAlertMessageAdditionalLanguage("Language and Additional Language should not be same.")
                                        }
                                        option.forEach(element => {
                                            allAdditionalLanguage.push(element.children)
                                        });
                                        setAdditionalLanguage(allAdditionalLanguage)
                                        
                                    }}
                                    filterSort={(optionA, optionB) =>
                                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                    }
                                    className = {"language-select"+ (alertMessageAdditionalLanguage !== '' ? ' red-border-bottom-input' : '')}
                                    mode="multiple"
                                >
                                    {languages.map((item,index)=>{
                                        return <Option value={index}>{item[0]}</Option>
                                    })}
                                </AdditionalLanguageSelect>  

                            </FormItem>
                            {alertMessageAdditionalLanguage !== '' &&
                                <div className="input-error-msg">{alertMessageAdditionalLanguage}</div>
                            } 
                            
                            
                        </Col>

                    </FormSectionContainer>
                    <FormSectionContainer span={24} gutter={16}>
                        <Col span={12} className="timezone-input mt-3">
                            <FormItem
                                name="phonenumber"
                                label="Phone Number *"
                                className = {"mt-3 mb-1 suffix"+ (alertMessagePhone !== '' ? ' red-border-bottom-input' : '')}
                                
                            >
                                <InputWithLabel background={"#EDF4FA"}>
                                    <PhoneInput 
                                        value={phoneNumber} 
                                        countryCodeEditable={false} 
                                        onChange={HandlePhoneNumber} 
                                        country="us" 
                                        onlyCountries={['in', 'gr', 'us', 'ca']}
                                    />

                                    {alertMessagePhone !== '' &&
                                        <div className="input-error-msg">{alertMessagePhone}</div>
                                    }
                                </InputWithLabel>
                            </FormItem>
                        </Col>
                        <Col span={12} className="timezone-input mt-3">
                            <div className="ant-col ant-col-24 ant-form-item-label">
                                <label for="tech-timezone" className="" title="Timezone *">Timezone *</label>
                            </div>
                            <TimezoneSelect
                                value={timezone}
                                onChange={setTimezoneValue}
                                timezones={{
                                    ...allTimezones
                                }}
                                className = "mb-1 pl-0"
                                id="tech-timezone"
                            />
                            {alertMessageTimezone !== '' &&
                                <div className="input-error-msg">{alertMessageTimezone}</div>
                            }
                        </Col>
                        
                    </FormSectionContainer>

                    <FormSectionContainer span={24} gutter={16}>
                            <Col span={21} className="text-center mt-5 ">
                                <TerminaryRow>
                                    <Col span={12}>
                                        <input type="checkbox" id="terms&condtion" onChange={handleCheck}  defaultChecked={boxChanged}/> 
                                        <label className="ml-2" htmlFor="terms&condtion"> I agree to the <a href="javascript:void(0)" onClick={ showModal}>Terms & Condtions</a> </label>
                                    </Col>
                                      <Col span={12} >
                                        <input type="checkbox" id="privacy&cookies" onChange={handlePrivacyCheck}  defaultChecked={privacyBoxChanged}/> 
                                        <label className="ml-2" htmlFor="privacy&cookies"> I agree to the <a href="javascript:void(0)" onClick={ showPrivacyModal}>Privacy Policy</a>  & <a href="javascript:void(0)" onClick={ showCookiesModal}>Cookies Policy</a> </label>
                                      </Col>

                                </TerminaryRow>
                               
                            </Col>

                    </FormSectionContainer>

                    <FormSectionContainer span={24} gutter={16}>
                            <Col span={21}  className="text-center mt-2 ">
                                    
                            </Col>

                    </FormSectionContainer>

                    <FormSectionContainer span={24} gutter={16}>

                        {/*<Col span={21} className="mt-5">
                            <div className="text-center">
                              <input type="checkbox" id="terms&condtion" onChange={handleCheck}  defaultChecked={boxChanged}/> 
                              <label className="ml-2" htmlFor="terms&condtion"> I agree to the <a href="javascript:void(0)" onClick={ showModal}>Terms & Condtions</a> </label>
                            </div>
                        </Col>*/}

                            <Col span={21} className="mt-3">
                                <Button htmlType = "submit" className="app-btn" type="primary">
                                    Next<span></span>
                                </Button>
                            </Col>
                              
                           <Col className="text-center mt-3" span={21}>         
                              <Link className="linkColor app-link font-weight-normal" to='/login'>   
                                  Already have an account? Sign In.
                              </Link>
                             </Col>


                    </FormSectionContainer>
                </Form>
            </div>
            
        </Container>

    )
}

const Container = styled(Col)`
  display: flex;
  width: 100%;
  border-radius: 10px;
  margin-top: 20px;
  justify-content:center;
  flex-direction: column;
  background-color:transparent;


`;

/*const Image = styled.img`
  margin-left: 30px;
`;*/

const FormSectionContainer = styled(Row)`
  width: 100%;
  margin-bottom:none;

  @media screen and (max-width: 763px) {
      display:block !important;
      .ant-col-12{
          width:100% !important;
          max-width:none !important;
      }
}
`;

const TerminaryRow = styled(Row)`
      display: flex !important;
    flex-direction: column  !important;
    align-items: baseline  !important;
    align-content: center  !important;
  @media screen and (max-width: 763px) {
      display:block !important;
      .ant-col-12{
          width:100% !important;
          max-width:none !important;
      }
}
`;


const LanguageSelect = styled(Select)`

  border:0px none;
  

  & .ant-select-selection-search {
    width:360px;
    @media screen and (max-width: 763px) {
        width:260px;
    }
  }

`
const AdditionalLanguageSelect = styled(Select)`

  border:0px none;
  

  & .ant-select-selection-search {
    width:360px;
    @media screen and (max-width: 763px) {
        width:260px;
    }
  }

`

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
   
    margin-top: 15px;
    
    margin-top:15px;
    margin-left:50px;
  }
  & .react-tel-input .form-control {
    height:50px; 
    border:0px none;
    width:70% !important;
    background:transparent;
    border-radius: 0px;
    border-bottom : 2px solid #B2B7BC; 
  }

  & .react-tel-input .selected-flag {
    background:${props => props.background}
    border: 1px solid #B2B7BC;
    border-left: none;
    border-right: none;
    border-top: none;
  }
  }
  & .react-tel-input .flag-dropdown {
    background:transparent;
    border: 0px none;
    bottom :1px;
  }

`;

export default TechSignup;
