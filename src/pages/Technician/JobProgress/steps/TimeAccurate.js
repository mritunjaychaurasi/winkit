import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import StepButton from '../../../../components/StepButton';

const TimeAccurate = ({ setCurrentStep }) => {
  const handleYes = () => {
    setCurrentStep(2);
  };
  const handleNo = () => {
    setCurrentStep(5);
  };

  return (
    <div>
      <h2>Is the time estimate accurate?</h2>
      <StepButtonStyled onClick={handleYes}>Yes</StepButtonStyled>
      <StepButtonStyled onClick={handleNo} type="back">
        No
      </StepButtonStyled>
    </div>
  );
};

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

TimeAccurate.propTypes = {
  setCurrentStep: PropTypes.func,
};

export default memo(TimeAccurate);
