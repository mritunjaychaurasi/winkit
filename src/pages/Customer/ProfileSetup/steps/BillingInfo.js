import React, { useState } from 'react';
import { Row, Col, Typography } from 'antd';
import {Button} from "react-bootstrap";
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  StepActionContainer,
  StepTitle,
  BodyContainer,
  // WarningText,
} from './style';
// import ItemLabel from '../../../../components/ItemLabel';
// import AuthInput from '../../../../components/AuthLayout/Input';
// import StepButton from '../../../../components/StepButton';

const { Text } = Typography;

const BillingInfo = ({
  onNext,
  cardNumber,
  setCardNumber,
  expiryDate,
  setExpiryDate,
  nameOnCard,
  setNameOnCard,
  address,
  setAddress,
  cvv,
  setCvv
}) => {
  const [error, setError] = useState({});

  /*const handleCardNumber = e => {
    setCardNumber(e.target.value);
    if (!e.target.value) {
      setError({ ...error, cardNumber: 'Please fill out Card Number field.' });
    } else {
      setError({ ...error, cardNumber: null });
    }
  };*/

  /*const handleExpiryDate = e => {
    setExpiryDate(e.target.value);
    if (!e.target.value) {
      setError({ ...error, expiryDate: 'Please fill out Expiry Date field.' });
    } else {
      setError({ ...error, expiryDate: null });
    }
  };*/

  /*const handleCvv = e => {
    setCvv(e.target.value);
    if (e.target.value === '') {
      setError({ ...error, cvv: 'Please fill out CVV field.' });
    } else {
      setError({ ...error, cvv: null });
    }
  };*/

  /*const handleAddress = e => {
    setAddress(e.target.value);
    if (e.target.value === '') {
      setError({ ...error, address: 'Please fill out Address field.' });
    } else {
      setError({ ...error, address: null });
    }
  };*/

  /*const handleNameOnCard = e => {
    setNameOnCard(e.target.value);
    if (e.target.value === '') {
      setError({ ...error, nameOnCard: 'Please fill out Name on Card field.' });
    } else {
      setError({ ...error, nameOnCard: null });
    }
  };*/

  const handleSubmit = () => {
    if (!cardNumber && !expiryDate && !cvv && !nameOnCard && !address) {
      setError({
        ...error,
        cardNumber: 'Please fill out Card Number field.',
        expiryDate: 'Please fill out Expiry Date field.',
        cvv: 'Please fill out CVV field.',
        nameOnCard: 'Please fill out Name on Card field.',
        address: 'Please fill out Address field.',
      });
    } else if (!expiryDate && !cvv && !nameOnCard && !address) {
      setError({
        ...error,
        expiryDate: 'Please fill out Expiry Date field.',
        cvv: 'Please fill out CVV field.',
        nameOnCard: 'Please fill out Name on Card field.',
        address: 'Please fill out Address field.',
      });
    } else if (!cvv && !nameOnCard && !address) {
      setError({
        ...error,
        cvv: 'Please fill out CVV field.',
        nameOnCard: 'Please fill out Name on Card field.',
        address: 'Please fill out Address field.',
      });
    } else if (!nameOnCard && !address) {
      setError({
        ...error,
        nameOnCard: 'Please fill out Name on Card field.',
        address: 'Please fill out Address field.',
      });
    } else if (!address) {
      setError({ ...error, address: 'Please fill out Address field.' });
    } else {
      onNext({
        billing: {
          cardNumber,
          expiryDate,
          nameOnCard,
          cvv,
          address,
        },
      });
    }
  };

  return (
    <div>
      <Row>
        <Container span={24}>
          <StepTitle>Billing Info</StepTitle>
          <BodyContainer span={24}>
            
          </BodyContainer>
          <StepActionContainer className="steps-action">
            <Button type="primary" onClick={handleSubmit} className="btn app-btn">
              <span></span>
              Create My Account
            </Button>
          </StepActionContainer>
        </Container>
      </Row>
    </div>
  );
};

const Container = styled(Col)`
  display: flex;
  width: 100%;
  border-radius: 10px;
  margin-top: 20px;
  flex-direction: column;
`;

/*const AccountUser = styled.div`
  display: flex;
`;*/

/*const InputWithLabel = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-right: 30px;
  margin-bottom: 50px;
  position: relative;
  &.expiry-date {
    .warning {
      bottom: -40px;
    }
  }
  &.cvv {
    .warning {
      bottom: -40px;
    }
  }
  &.card-number {
    min-width: 500px;
  }
  &.address {
    min-width: 700px;
  }
  &:last-child {
    margin-right: 0px;
  }
`;*/

/*const WarnningText = styled(Text)`
  font-weight: bold;
  font-style: italic;
`;*/

BillingInfo.propTypes = {
  onNext: PropTypes.func.isRequired,
};

export default BillingInfo;
