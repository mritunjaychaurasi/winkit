import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Select from '../../../../components/common/Select';
import StepButton from '../../../../components/StepButton';
import { openNotificationWithIcon } from '../../../../utils';
import { useSocket } from '../../../../context/socketContext';

const { Option } = Select;

const UpdateTimeEstimate = ({ setCurrentStep, estimateTime, onUpdate }) => {
  const { jobId } = useParams();
  const { socket } = useSocket();

  const handleContinue = () => {
    if (!estimateTime) {
      openNotificationWithIcon(
        'error',
        'validation',
        'Please select a time entry',
      );
      return;
    }
    socket.emit('update-time-confirmation', { id: jobId, time: estimateTime });
    setCurrentStep(6);
  };

  const handleChange = value => {
    onUpdate(value);
  };

  return (
    <div>
      <h2>
        Please update the time estimate and submit to customer for confirmation
      </h2>
      <SelectStyled onChange={handleChange}>
        <Option value={30}>30 mins</Option>
        <Option value={40}>40 mins</Option>
        <Option value={50}>50 mins</Option>
      </SelectStyled>
      <StepButtonStyled onClick={handleContinue}>Done</StepButtonStyled>
    </div>
  );
};

const SelectStyled = styled(Select)`
  width: -webkit-fill-available;
`;

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

UpdateTimeEstimate.propTypes = {
  setCurrentStep: PropTypes.func,
  onUpdate: PropTypes.func,
  estimateTime: PropTypes.number,
};

export default memo(UpdateTimeEstimate);
