import { Typography } from 'antd';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import StepButton from '../../../../components/StepButton';
import { useJob } from '../../../../context/jobContext';
import { useSocket } from '../../../../context/socketContext';

const { Title, Text } = Typography;

const CustomerTimeApproval = ({ setCurrentStep, estimateTime }) => {
  const { jobId } = useParams();
  const history = useHistory();
  const { updateJob } = useJob();
  const { socket } = useSocket();

  const handleApprove = async () => {
    try {
      await updateJob(jobId, { estimatedTime: estimateTime });
      socket.emit('time-estimate-approve', { id: jobId, approved: true });
      setCurrentStep(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = () => {
    socket.emit('time-estimate-approve', { id: jobId, approved: false });
    history.replace('/dashboard');
  };

  return (
    <div>
      <Title level={3}>Time estimate approval</Title>
      <Text>
        Your tech expects the job to take longer than originally estimated
      </Text>

      <TimeEstimatedWrapper>
        <Text>New Estimate</Text>
        <TimeStyled level={2}>
          {estimateTime}
          {' '}
          mins
        </TimeStyled>
      </TimeEstimatedWrapper>
      <StepButtonStyled onClick={handleApprove}>Approve</StepButtonStyled>
      <StepButtonStyled type="back" onClick={handleDecline}>
        Decline
      </StepButtonStyled>
    </div>
  );
};

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

const TimeEstimatedWrapper = styled.div`
  margin-top: 20px;
`;

const TimeStyled = styled(Title)`
  margin-top: 0px !important;
`;

CustomerTimeApproval.propTypes = {
  setCurrentStep: PropTypes.func,
  estimateTime: PropTypes.number,
};

export default memo(CustomerTimeApproval);
