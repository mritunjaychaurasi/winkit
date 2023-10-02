import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import Checkbox from '../../../../components/common/CheckBox';

import StepButton from '../../../../components/StepButton';
import { openNotificationWithIcon } from '../../../../utils';

const WrongCategory = ({ setCurrentStep }) => {
  const history = useHistory();
  const [tier2, settier2] = useState(false);
  const [wrongCategory, setWrongCategory] = useState(false);

  const handleContinue = () => {
    if (!tier2 && !wrongCategory) {
      openNotificationWithIcon(
        'error',
        'Validation error',
        'Please select at least one option',
      );
      return;
    }

    if (wrongCategory) {
      setCurrentStep(4);
      return;
    }
    history.replace('/dashboard');
  };

  return (
    <div>
      <h2>Please select the right category</h2>
      <div>
        <CheckboxStyled name="toer2" onChange={e => settier2(e.target.checked)}>
          Tier 2 Job
        </CheckboxStyled>
      </div>
      <div>
        <CheckboxStyled
          name="wrongCategory"
          onChange={e => setWrongCategory(e.target.checked)}
        >
          Wrong category
        </CheckboxStyled>
      </div>
      <StepButtonStyled htmlType="submit" onClick={handleContinue}>
        Continue
      </StepButtonStyled>
    </div>
  );
};

const CheckboxStyled = styled(Checkbox)`
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

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

WrongCategory.propTypes = {
  setCurrentStep: PropTypes.func,
};

export default memo(WrongCategory);
