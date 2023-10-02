import { Typography } from 'antd';
import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import StepButton from '../../../../components/StepButton';
import TextArea from '../../../../components/TextArea';
import { useSocket } from '../../../../context/socketContext';

const { Title } = Typography;

const ConfirmCustomerIssue = ({ setCurrentStep }) => {
  const { jobId } = useParams();
  const [issueBreakdown, setissueBreakdown] = useState('');
  const { socket } = useSocket();

  const handleConfirm = () => {
    socket.emit('issue-breakdown', { id: jobId, issueBreakdown });
    setCurrentStep(9);
  };

  const handleCancel = () => {};

  const handleChangeText = e => {
    setissueBreakdown(e.target.value);
  };

  return (
    <div>
      <Title level={3}>Confirm the customer&apos;s issue</Title>
      <TextAreaStyled rows={15} onChange={handleChangeText} />
      <StepButtonStyled onClick={handleConfirm}>Submit</StepButtonStyled>
      <StepButtonStyled type="back" onClick={handleCancel}>
        Cancel session
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

ConfirmCustomerIssue.propTypes = {
  setCurrentStep: PropTypes.func,
};

export default memo(ConfirmCustomerIssue);
