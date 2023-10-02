import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import Checkbox from '../../../../components/common/CheckBox';
import StepButton from '../../../../components/StepButton';
import TextArea from '../../../../components/TextArea';

const SummarizeSolution = ({ setCurrentStep, solutions, setSolutions }) => {
  const [editMode, setEditMode] = useState(false);
  const [curSolution, setCurSolution] = useState('');
  const [suggestSolutions, setSuggestSolutions] = useState([
    'Praesent gravida dui eu lacinia bibendum',
    'Fusce porta id enim',
    'porttitor ornare',
    'Nulla quis quam at nisl pharetra molestie at aget donec ac ante eget est pulviar accumsan ut sit amet nisifinibus tellus',
  ]);

  const history = useHistory();

  const handleChangeSolutions = (e, solution) => {
    if (e.target.checked) {
      setSolutions([...solutions, solution]);
    } else {
      setSolutions(solutions.filter(item => item !== solution));
    }
  };

  const handleConfirm = () => {
    setCurrentStep(13);
  };

  const handleCancel = () => {
    history.replace('/dashboard');
  };

  const handleSaveSolution = () => {
    setSuggestSolutions([...suggestSolutions, curSolution]);
    setCurSolution('');
    setEditMode(false);
  };

  return (
    <div>
      <h2>Summarize the solution</h2>

      <JobItemsWrapper>
        {suggestSolutions.map(item => (
          <CheckboxStyled
            key={item}
            onChange={e => handleChangeSolutions(e, item)}
          >
            {item}
          </CheckboxStyled>
        ))}
      </JobItemsWrapper>
      {editMode && (
        <TextAreaStyled
          value={curSolution}
          onChange={e => setCurSolution(e.target.value)}
        />
      )}
      {!editMode ? (
        <StepButtonStyled onClick={() => setEditMode(true)}>
          Add
        </StepButtonStyled>
      ) : (
        <>
          <StepButtonStyled onClick={handleSaveSolution}>Save</StepButtonStyled>
          <StepButtonStyled onClick={() => setEditMode(false)} type="back">
            Cancel
          </StepButtonStyled>
        </>
      )}
      <StepButtonStyled onClick={handleConfirm}>Confirm</StepButtonStyled>
      <StepButtonStyled onClick={handleCancel} type="back">
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

const CheckboxStyled = styled(Checkbox)`
  margin-bottom: 20px;

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

const JobItemsWrapper = styled.div`
  margin-top: 30px;
`;

const TextAreaStyled = styled(TextArea)`
  margin-top: 20px;
  resize: none;
  height: 70%;
`;

SummarizeSolution.propTypes = {
  setCurrentStep: PropTypes.func,
  solutions: PropTypes.array,
  setSolutions: PropTypes.func,
};

export default memo(SummarizeSolution);
