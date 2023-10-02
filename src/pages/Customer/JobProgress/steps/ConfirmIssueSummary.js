import { Typography } from 'antd';
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import StepButton from '../../../../components/StepButton';
import TextArea from '../../../../components/TextArea';
import { useJob } from '../../../../context/jobContext';
import { useSocket } from '../../../../context/socketContext';

const { Title, Text } = Typography;

const ConfirmIssueSummary = ({ setCurrentStep, issue }) => {
  const { jobId } = useParams();
  const { history } = useHistory();
  const { updateJob } = useJob();
  const { socket } = useSocket();

  const handleConfirm = async () => {
    try {
      await updateJob(jobId, { issueDescription: issue });

      socket.emit('confirm-issue-summary', { id: jobId, confirmed: true });
      setCurrentStep(4);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    socket.emit('confirm-issue-summary', { id: jobId, confirmed: false });
    history.push('/dashboard');
  };

  return (
    <div>
      <Title level={3}>Please confirm the issue summary</Title>
      <Text>
        As soon as you feel your tech properly summarized your issue, Please
        confirm below
      </Text>
      <TextAreaStyled rows={15} value={issue} />
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

const TextAreaStyled = styled(TextArea)`
  margin-top: 20px;
  resize: none;
  height: 70%;
`;

ConfirmIssueSummary.propTypes = {
  setCurrentStep: PropTypes.func,
  issue: PropTypes.string,
};

export default memo(ConfirmIssueSummary);
