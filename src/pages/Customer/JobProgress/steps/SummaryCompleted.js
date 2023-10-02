import { Typography } from 'antd';
import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useHistory, useParams } from 'react-router-dom';

import Checkbox from '../../../../components/common/CheckBox';
import StepButton from '../../../../components/StepButton';
import {useJob} from '../../../../context/jobContext';

const { Title } = Typography;

const SummaryCompleted = ({ setCurrentStep, solutions }) => {
  const history = useHistory();
  const [completedSolutions, setCompletedSolutions] = useState([]);
  const { jobId } = useParams();
  const { jobTime, updateJob } = useJob();

  const handleChangeSolutions = (e, solution) => {
    if (e.target.checked) {
      setCompletedSolutions([...completedSolutions, solution]);
    } else {
      setCompletedSolutions(
        completedSolutions.filter(item => item !== solution),
      );
    }
  };

  const handleConfirm = async () => {
    try {
      await updateJob(jobId, { solutions: completedSolutions, jobTime });
      setCurrentStep(5);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    history.replace('/dashboard');
  };

  return (
    <div>
      <Title level={3}>Summary Completed!</Title>
      <JobItemsWrapper>
        {solutions.map(item => (
          <CheckboxStyled
            key={item}
            onChange={e => handleChangeSolutions(e, item)}
          >
            {item}
          </CheckboxStyled>
        ))}
      </JobItemsWrapper>
      <TimeCostWrapper>
        <div>
          Time Spent
          <br />
          <Title level={3}>{Math.round(jobTime / 60)} mins</Title>
        </div>
        <div>
          Cost
          <br />
          <Title level={3}>
            ${((Math.round(jobTime / 60) * 100) / 60).toFixed(0)}
          </Title>
        </div>
      </TimeCostWrapper>
      <StepButtonStyled onClick={handleConfirm}>Confirm</StepButtonStyled>
      <StepButtonStyled type="back" onClick={handleCancel}>
        Cancel Job
      </StepButtonStyled>
    </div>
  );
};

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

const JobItemsWrapper = styled.div`
  margin-top: 30px;
`;

const TimeCostWrapper = styled.div`
  background-color: ${props => props.theme.light};
  display: flex;
  justify-content: space-between;
  padding: 15px;
`;

const CheckboxStyled = styled(Checkbox)`
  margin-bottom: 20px;
  /* display: inline-flex;
span {
  margin-top: -7px;
}
.ant-checkbox{
  margin-top: 0px;
} */

  margin-left: 0px !important;
  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: ${props => props.theme.primary};
    border-color: ${props => props.theme.primary};
    &:focus {
      border-color: ${props => props.theme.primary};
    }
    &:hover {
      border-color: ${props => props.theme.primary};
    }
  }
`;

SummaryCompleted.propTypes = {
  setCurrentStep: PropTypes.func,
  solutions: PropTypes.array,
};

export default memo(SummaryCompleted);
