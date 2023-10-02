import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import StepButton from '../../../../components/StepButton';
import { useSocket } from '../../../../context/socketContext';

const ConfirmWithCustomer = ({ setCurrentStep, estimateTime }) => {
  const { jobId } = useParams();
  const { socket } = useSocket();

  const handleContinue = () => {
    socket.emit('confirm-with-customer', { id: jobId, time: estimateTime });
    setCurrentStep(14);
  };

  return (
    <div>
      <h2>Confirm With Customer</h2>
      <p>Please explain the need to update to the customer and click confirm</p>
      <StepButtonStyled onClick={handleContinue}>Confirm</StepButtonStyled>
    </div>
  );
};

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

ConfirmWithCustomer.propTypes = {
  setCurrentStep: PropTypes.func,
  estimateTime: PropTypes.number,
};

export default memo(ConfirmWithCustomer);
