import React, { memo ,useEffect,useState} from 'react';
import { Row, Input,Select } from 'antd';
import styled from 'styled-components';
import {
  // PageTitle,
  // DescriptionText,
  ItemContainer,
  ItemTitle,
  // StepActionContainer,
} from './style';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCheck} from '@fortawesome/free-solid-svg-icons';
// import TechImages from '../../../../components/TechImages';
// import StepButton from '../../../../components/StepButton';
import H4 from '../../../../components/common/H4';
// import { getFullName } from '../../../../utils';
import * as CustomerService from '../../../../api/customers.api';
import editIcon from '../../../../assets/images/edit.png';
import PhoneInput from 'react-phone-input-2';
import {Button} from 'react-bootstrap';
// import { useHistory } from 'react-router-dom';
import {languages} from   '../../../../constants';
import { useAuth } from 'context/authContext';
import { openNotificationWithIcon } from '../../../../utils';
// const { Text } = Typography;


/*const ratingScale = [
  'Beginner',
  'Basic knowledge but never used professionally',
  'Pretty fluent & limited use professionally',
  'Very fluent and a lot of use professionally',
  'Complete mastery with extensive professional use',
];

const engilshLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Fluent',
  'Native',
];

const averageLevel = experience => {
  let sum = 0;

  // for (const expertise of experience.expertises) {
  //   sum += expertise.rate;
  // }

  // return Math.round(sum / experience.expertises.length);
};*/

function ProfileReview({user,onNext,setCustomer}) {
  // const history = useHistory()
  const [showInput,setShowInput] = useState(false)
  const {email,customer:{id:customerId,phoneNumber}} = user ;
  const [editedPhoneNumber,setEditedPhoneNumber] = useState(phoneNumber)
  const [showNameInput,setShowNameInput] = useState(false)
  const { updateUserInfo } = useAuth();
  const [firstName,setFirstName] = useState(user.firstName)
  const [lastName,setLastName] = useState(user.lastName)
  const { Option } = Select;
  const [language,setLanguage] = useState(user.customer.language)
  const [additionalLanguage,setAdditionalLanguage] = useState(user.customer.additionalLanguage)
  const [showlangInput,setShowlangInput] = useState(false)
  const [showAddlangInput,setShowAddlangInput] = useState(false)
  const [showExtensionInput,setShowExtensionInput] = useState(false)
  const [editedExtension,setEditedExtension] = useState(user.customer.extension)

  useEffect(()=>{
    setEditedPhoneNumber(user.customer.phoneNumber)
    if(user.customer.extension){
      console.log("user.id ::::: ",user.id)
      console.log("user.customer.extension :::::: ::",user.customer.extension)
      setEditedExtension(user.customer.extension)
    }
  },[user])



  const HandlePhoneNumber = (e)=>{

    setEditedPhoneNumber(`+${e}`);

  }

  const handleExtensionChange = (e)=>{
      console.log("editedExtension ::::: ",editedExtension)
      CustomerService.updateCustomer(customerId,{"extension":editedExtension})
      openNotificationWithIcon("success","Success","Changes saved successfully.")
      setShowExtensionInput(false)   
  }
  const inputHandler = ()=>{
    onNext()
    setCustomer(user.customer)
    setShowInput(!showInput)
  }
  const handleNumberChange = ()=>{
    CustomerService.updateCustomer(customerId,{"phoneNumber":editedPhoneNumber})
    openNotificationWithIcon("success","Success","Changes saved successfully.")   
    setShowInput(false)
  }
  const handleLangChange = ()=>{
    CustomerService.updateCustomer(customerId,{"language":language})
    openNotificationWithIcon("success","Success","Changes saved successfully.")   
    setShowlangInput(false)
  }


  const handleAddLangChange = ()=>{
    CustomerService.updateCustomer(customerId,{"additionalLanguage":additionalLanguage})
    openNotificationWithIcon("success","Success","Changes saved successfully.")   
    setShowAddlangInput(false)
  }

  const extensionEditHandler = async()=>{
    console.log("editedExtension :::::: ",editedExtension)
    await CustomerService.updateCustomer(customerId,{"extension":editedExtension})
     setShowExtensionInput(!showExtensionInput);
    }

  const handleNameChange = () => {
    let fcheck = firstName.replace(/ +/g,'');
    let lcheck = lastName.replace(/ +/g,'');
    if(fcheck !== '' && lcheck !== ''){
       updateUserInfo({"userId":user.id,"firstName":firstName,"lastName":lastName})  
       openNotificationWithIcon("success","Success","Changes saved successfully.")   
       setShowNameInput(false)  
    }else{
       openNotificationWithIcon("error","Error","One of the names seems to be empty.")  
    }     
  }

  const editNameInputHandler = ()=>{
      if(showNameInput){
        setShowNameInput(false)
      }else{
        setShowNameInput(true)
      }      
  }

   const editLangInputHandler = ()=>{
      if(showlangInput){
        setShowlangInput(false)
      }else{
        setShowlangInput(true)
      }      
  }

  const editAddLangInputHandler = ()=>{
      if(showAddlangInput){
        setShowAddlangInput(false)
      }else{
        setShowAddlangInput(true)
      }      
  }


  

  const changeFirstname = (e) =>{
    setFirstName(e.target.value)
  }


  const changeLastname = (e)=>{
    setLastName(e.target.value)
  }



  return (
    <Container>
      {/*<DescriptionText>First, review your profile</DescriptionText>*/}
      <BodyContainer>
        <Section>
          <ItemContainer className= "editContainer">
            <ItemTitle>NAME</ItemTitle>
            <Row>
             {!showNameInput ? <H4>{firstName} {lastName}</H4> :  
              
              <>
                <label className="font-weight-bold">First Name</label>              
                <Input placeholder="Enter First Name" onChange={changeFirstname} value={firstName} className="customer-edit-profile-input"/>
                <label className="font-weight-bold">Last Name</label>        
                <Input placeholder="Enter Last Name" onChange={changeLastname} value={lastName} className="customer-edit-profile-input" />
                <Button onClick={handleNameChange} className="app-btn small-btn btn mt-3 customer-edit-profile-btn">
                  <FontAwesomeIcon  icon={faCheck}/><span></span>
                </Button>              
            </>}
            </Row>
            <div className="EditIcons" >
                <img onClick={editNameInputHandler} src={editIcon} width="20px" height="20px" alt="Edit" />
              </div>
          </ItemContainer>
          <ItemContainer className= "editContainer">
            <ItemTitle>EMAIL</ItemTitle>
            <Row>
              <H4>{email}</H4>
            </Row>
          </ItemContainer>
        </Section>
        <Section>
         <ItemContainer className= "editContainer">
            <ItemTitle>Primary Language</ItemTitle>
            <Row >
            {!showlangInput ? <H4>{language}</H4> :  
               <>
              <Select
                    showSearch
                    optionFilterProp="children"
                    style={{ width: 200, textAlign:'left' }}
                    defaultValue={language}
                    filterOption={(input, option) =>
                    
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange = {(value,option)=>{
                      setLanguage(option.children)
                    }}
                    className="background-class"
                  >
                    {languages.map((item,index)=>{
                      if(index === 2){
                        return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                      }
                      else{
                        return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                      }                    
                    })}
                  </Select>

                  <Button onClick={handleLangChange} className="app-btn small-btn btn ml-3 customer-edit-profile-btn">
                    <FontAwesomeIcon  icon={faCheck}/><span></span>
                  </Button>            
                </>
              }
              <div className="EditIcons" >
                <img onClick={editLangInputHandler} src={editIcon} width="20px" height="20px" alt="Edit" />
              </div>
            </Row>
          </ItemContainer>
        </Section>

                <Section>
         <ItemContainer className= "editContainer">
            <ItemTitle>Additional Languages</ItemTitle>
            <Row >
            {!showAddlangInput ? <H4>{additionalLanguage}</H4> :  
               <>
              <Select
                    showSearch
                    optionFilterProp="children"
                    style={{ width: 200, textAlign:'left' }}
                    defaultValue={additionalLanguage}
                    filterOption={(input, option) =>
                    
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange = {(value,option)=>{
                      setAdditionalLanguage(option.children)
                    }}
                    className="background-class"
                  >
                    {languages.map((item,index)=>{
                      if(index === 2){
                        return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                      }
                      else{
                        return <Option key={`lang_${index}`} value={index} >{item[0]}</Option>
                      }                    
                    })}
                  </Select>

                  <Button onClick={handleAddLangChange} className="app-btn small-btn btn ml-3 customer-edit-profile-btn">
                    <FontAwesomeIcon  icon={faCheck}/><span></span>
                  </Button>            
                </>
              }
              <div className="EditIcons" >
                <img onClick={editAddLangInputHandler} src={editIcon} width="20px" height="20px" alt="Edit" />
              </div>
            </Row>
          </ItemContainer>
        </Section>


        <Section className="phone-edit-outer">
          <ItemContainer className= "editContainer">
            <ItemTitle>Phone Number</ItemTitle>
            <Row >

             {!showInput ? <H4>{editedPhoneNumber}</H4> :  
             <>
             <InputWithLabel>
                    <PhoneInput value={editedPhoneNumber} countryCodeEditable={false} onChange={HandlePhoneNumber} country="us" onlyCountries={['in', 'gr', 'us', 'ca']} />                    
              </InputWithLabel>
              <Button onClick={handleNumberChange} className = "app-btn small-btn btn ml-3 customer-edit-profile-btn">
                <FontAwesomeIcon  icon={faCheck}/><span></span>
              </Button>              

              
            </>}
              <div className="EditIcons" >
                <img onClick={inputHandler} src={editIcon} width="20px" height="20px" alt="Edit" />
              </div>
            </Row>
          </ItemContainer>

          <ItemContainer className= "editContainer">
            <ItemTitle>Extension</ItemTitle>
            <Row >

             {!showExtensionInput ? <H4>{editedExtension}</H4> :  
             <>
             <InputWithLabel>            
                  <Input onChange={(e)=>{setEditedExtension(e.target.value)}} type="number" value={editedExtension} className="customer-edit-profile-input"/>                    
              </InputWithLabel>
              <Button onClick={handleExtensionChange} className = "app-btn small-btn btn ml-3 customer-edit-profile-btn">
                <FontAwesomeIcon  icon={faCheck}/><span></span>
              </Button>              

              
            </>}
              <div className="EditIcons" >
                <img onClick={extensionEditHandler} src={editIcon} width="20px" height="20px" alt="Edit" />
              </div>
            </Row>
          </ItemContainer>

        </Section>
      </BodyContainer>
    </Container>
  );
}

const Container = styled.div`
  background: transparent;  

  & .margin-class{
    margin-top:10px;
  }

  & .background-class{
      background-color:transparent;
      border-bottom: solid 1px #999;
  }

  & .margin-class-left{
    margin-left:15px;
  }
`;
/*const LevelText = styled(Text)`
  font-size: 15;
  font-weight: bold;
  text-align: left;
`;
const OtherLangLevel = styled(Text)`
  font-size: 15;
  font-weight: bold;
  text-align: left;
  margin-bottom: 10px;
  padding-left: 10px;
`;
const LevelDescription = styled(Text)`
  font-style: italic;
  padding-top: 15px;
`;*/
const BodyContainer = styled.div`
  background: transparent;
  margin-bottom: 50px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  // padding: 40px;
  flex: 1;

`;
/*const OtherLan = styled.div`
  display: flex;
  align-items: center;
`;
const SoftwareRightSection = styled.div`
  padding-left: 30px;
  display: flex;
  flex-direction: column;
  text-align: left;
`;
const SoftwareImage = styled.img`
  width: 50px;
  height: 50px;
`;*/
const Section = styled(Row)`
  width: 100%;
`;
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



export default memo(ProfileReview);
