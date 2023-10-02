import React from 'react';
import styled from 'styled-components';
// import { Steps } from 'antd';
import PropTypes from 'prop-types';

// const { Step } = Steps;

const ScreenSteps = props => {
  const { stepsContent } = props;
  return (
    <StepContainer>
      <StepsContent>{stepsContent}</StepsContent>
      
    </StepContainer>
  );
};

ScreenSteps.propTypes = {
  stepsContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  // current: PropTypes.number,
  // steps: PropTypes.array,
};

ScreenSteps.defaultProps = {
  stepsContent: '',
  // current: 0,
  // steps: [{ title: '' }],
};

const StepContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StepsContent = styled.div`
  margin-top: 0vh;
  text-align: center;
`;
/*const StepsTabContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 13vh !important;
`;*/
/*const StepsTab = styled(Steps)`
  width: min-content !important;
  .ant-steps-item-tail::after {
    display: none !important;
  }
  .ant-steps-label-vertical .ant-steps-item-content {
    display: none !important;
  }
  .ant-steps-item-icon {
    width: 12px !important;
    height: 12px !important;
    margin: 0 !important;
  }
  .ant-steps-item-icon .ant-steps-icon-dot {
    width: 12px !important;
    height: 12px !important;
    margin: 0 !important;
  }
  .ant-steps-item-container, .ant-steps-item-content {
    width: 35px !important;
  }
  .ant-steps-item-finish
    .ant-steps-item-icon
    > .ant-steps-icon
    .ant-steps-icon-dot {
    background: rgba(0, 0, 0, 0.25);
  }
`;*/

export default ScreenSteps;
