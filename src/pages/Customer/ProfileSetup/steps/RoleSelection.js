import React, { useState } from 'react';
import { Row, Col, Typography } from 'antd';
import styled from 'styled-components';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import PhoneInput from 'react-phone-input-2';
import {
  StepActionContainer,
  StepTitle,
  BodyContainer,
  SectionTitle,
  // WarningText,
} from './style';
import ItemLabel from '../../../../components/ItemLabel';
import AuthInput from '../../../../components/AuthLayout/Input';
import StepButton from '../../../../components/StepButton';
import { openNotificationWithIcon } from '../../../../utils';

// import 'react-phone-input-2/lib/style.css';

const { Text } = Typography;

const RoleSelection = ({
  onNext,
  accountUsers,
  setAccountUsers,
  phoneNumber,
  setPhoneNumber,
  extension,
  setExtension,
}) => {
  const [error, setError] = useState({});
  /*const sty = {
    height: '50px',
    borderRadius: '10px',
    marginTop: '15px',
    borderColor: '#e2e2e2',
  };*/
  /*const handleAccountUser = (e, index, pos) => {
    const { value } = e.target;
    const newArr = [...accountUsers];
    newArr[index][pos] = value;
    setAccountUsers(newArr);
  };
  const handleAddAccountUser = () => {
    setAccountUsers(prev => [
      ...prev,
      {
        name: '',
        email: '',
        role: '',
      },
    ]);
  };*/

  const handlePhoneNumber = (value) => {
    setPhoneNumber(`+${value}`);

    if (!value) {
      setError({ ...error, phoneNumber: 'Please add your phone number.' });
      return;
    }
    setError({ ...error, phoneNumber: null });
  };

  const handleExtension = e => {
    setExtension(e.target.value);
  };

  const handleSubmit = () => {

    if (isPossiblePhoneNumber(phoneNumber) === false || isValidPhoneNumber(phoneNumber) === false){
      return (openNotificationWithIcon('error', 'Error', 'Phone Number Not Valid'))

    }

    if (!phoneNumber) {
      setError({ ...error, phoneNumber: 'Please add your phone number.' });
      return;
    }
    const pattern = new RegExp(/^\+\d[0-9\b]+$/);

    if (!pattern.test(phoneNumber)) {
      setError({ ...error, phoneNumber: 'Please provide valid phone number.' });
      return;
    }
    onNext();
  };

  return (
    <div>

      <Row>
        <Container span={24}>
          <StepTitle>
            Your job is almost ready to go live!
            <br />
            {' '}

          </StepTitle>
          <BodyContainer span={24}>
            <SectionTitle>
              Please provide a phone number for your account to use on job
            </SectionTitle>
            <SubTitle>
              Other users you invite will be asked to provide thier own direct
              number
            </SubTitle>
            <AccountUser>
              <InputWithLabel>
                <ItemLabel style={{ margin: 0 }}>Phone Number</ItemLabel>
                <PhoneInput
                  country="us"
                  countryCodeEditable={false}
                  onlyCountries={['gr', 'fr', 'us', 'in', 'ca']}
                  onChange={handlePhoneNumber}
                />
              </InputWithLabel>
              <InputWithLabel>
                <ItemLabel style={{ margin: 0 }}>Extension</ItemLabel>
                <AuthInput
                  name="extension"
                  size="large"
                  style={{ marginTop: 15 }}
                  placeholder="Extension"
                  value={extension}
                  onChange={handleExtension}

                />
              </InputWithLabel>
            </AccountUser>
          </BodyContainer>
          <StepActionContainer className="steps-action">
            <StepButton type="primary" onClick={handleSubmit}>
              Post Your Job
            </StepButton>
          </StepActionContainer>
        </Container>
      </Row>
    </div>
  );
};

// //  height: "50px";
//     border-radius: "10px";
//     margin-top: "15px";
//     border-color: #e2e2e2;
const Container = styled(Col)`
  display: flex;
  width: 100%;
  border-radius: 10px;
  margin-top: 20px;
  flex-direction: column;
`;

const SubTitle = styled(Text)`
  font-size: 14px;
  font-weight: bold;
  text-align: left;
  margin-bottom: 30px;
`;

/*const AddProfile = styled(Text)`
  font-size: 15px;
  font-weight: bold;
  color: #8c8989;
  text-decoration: underline;
  padding: 30px 0;
  cursor: pointer;
`;*/

const AccountUser = styled.div`
  display: flex;
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
    border : 0px none;
    margin-top:15px;
    margin-left:20px;
  }
   & .react-tel-input{
      margin-top:15px;
   }
  & .react-tel-input .form-control {
    height:50px;   
    border-radius: 10px;
    border : 0px none;   
    margin-left:20px;
  }
   
 
`;
export default RoleSelection;
