import React from 'react';
import PropTypes from 'prop-types';
import Footer2 from './Footer2';
import Footer from './Footer';

const SelectFooter = ({ currentStep, setCurrentStep }) => {
  const getFooter = () => {
    if (currentStep === 11) {
      return <Footer2 setCurrentStep={setCurrentStep} />;
    }
    return <Footer />;
  };
  return <div>{getFooter()}</div>;
};

SelectFooter.propTypes = {
  currentStep: PropTypes.number,
  setCurrentStep: PropTypes.func,
};

export default SelectFooter;
