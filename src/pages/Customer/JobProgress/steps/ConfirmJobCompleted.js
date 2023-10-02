import { Typography } from 'antd';
import React, { memo } from 'react';
import styled from 'styled-components';
import StepButton from '../../../../components/StepButton';

const { Title, Text } = Typography;

const ConfirmJobCompleted = () => (
  <div>
    <Title level={3}>Job completed!</Title>
    <Text>
      Your tech has indicated that they have successfully resolved your issue.
      Please confirm if accurate
    </Text>
    <StepButtonStyled>Confirm</StepButtonStyled>
    <StepButtonStyled type="back">Need more work</StepButtonStyled>
  </div>
);

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

ConfirmJobCompleted.propTypes = {};

export default memo(ConfirmJobCompleted);
