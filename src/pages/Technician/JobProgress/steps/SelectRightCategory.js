import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import Select from '../../../../components/common/Select';
import StepButton from '../../../../components/StepButton';
import { openNotificationWithIcon } from '../../../../utils';

const { Option } = Select;

const SelectRightCategory = () => {
  const history = useHistory();
  const [selectedCategory, setSelectedCategory] = useState('');
  const handleContinue = () => {
    if (selectedCategory === '') {
      openNotificationWithIcon(
        'error',
        'Validation Error',
        'Please select a category',
      );
      return;
    }
    history.replace('/dashboard');
  };

  const handleChange = value => {
    setSelectedCategory(value);
  };

  return (
    <div>
      <h2>Please select the right category</h2>
      <SelectStyled defaultValue="lucy" onChange={handleChange}>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="Yiminghe">yiminghe</Option>
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

SelectRightCategory.propTypes = {};
export default memo(SelectRightCategory);
