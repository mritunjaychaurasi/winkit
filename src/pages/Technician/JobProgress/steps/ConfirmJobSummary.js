import { Typography } from 'antd';
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import StepButton from '../../../../components/StepButton';

const { Title, Text } = Typography;

const ConfirmJobSummary = ({ setCurrentStep }) => {
  const handleConfirm = () => {
    setCurrentStep(8);
  };

  return (
    <div>
      <Title level={3}>Please confirm job summary</Title>
      <Text>Please confirm the job summary</Text>
      <StepButtonStyled onClick={handleConfirm}>Confirm</StepButtonStyled>
      <StepButtonStyled type="back">Cancel</StepButtonStyled>
    </div>
  );
};

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

ConfirmJobSummary.propTypes = {
  setCurrentStep: PropTypes.func,
};

export default memo(ConfirmJobSummary);
