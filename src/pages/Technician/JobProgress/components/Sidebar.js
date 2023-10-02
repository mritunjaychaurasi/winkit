import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import ConfirmCustomersIssue from '../steps/ConfirmCustomersIssue';
import ConfirmJobSummary from '../steps/ConfirmJobSummary';
import ConfirmMatch from '../steps/ConfirmMatch';
import ConfirmWithCustomer from '../steps/ConfirmWithCustomer';
import SelectRightCategory from '../steps/SelectRightCategory';
import SignOffWithCustomer from '../steps/SignOffWithCustomer';
import SummarizeSolution from '../steps/SummarizeSolution';
import TechJobInProgress from '../steps/TechJobInProgress';
import TimeAccurate from '../steps/TimeAccurate';
import UpdateTimeEstimate from '../steps/UpdateTimeEstimate';
import WaitForIssueSummaryConfirmation from '../steps/WaitForIssueSummaryConfirmation';
import WaitForSolutionConfirmation from '../steps/WaitForSolutionConfirmation';
import WaitForTimeEstimateApprove from '../steps/WaitForTimeEstimateApprove';
import WrongCategory from '../steps/WrongCategory';

const TechSidebar = ({ currentStep, setCurrentStep }) => {
  const [updatedEstimateTime, setUpdatedEstimateTime] = useState();
  const [solutions, setSolutions] = useState([]);

  const getStep = () => {
    if (currentStep === 0) {
      // When Tech receives the email
      return <ConfirmMatch setCurrentStep={setCurrentStep} />;
    }
    if (currentStep === 1) {
      // When tech confirms the match, it should be redirected to Time Accurate screen
      return <TimeAccurate setCurrentStep={setCurrentStep} />;
    }
    if (currentStep === 2) {
      // When tech confirms time is accurate, He should be redirected to confirm Job Summary screen
      return <ConfirmJobSummary setCurrentStep={setCurrentStep} />;
    }
    if (currentStep === 3) {
      //  When tech match is not confirmed, he will be redirected to wrong category page
      return <WrongCategory setCurrentStep={setCurrentStep} />;
    }
    if (currentStep === 4) {
      // If tech selects wrong category option from Wrong category screen, He should be redirect to select right category.
      return <SelectRightCategory setCurrentStep={setCurrentStep} />;
    }
    if (currentStep === 5) {
      // If tech selects time is not accurate, he should be redirected to udpate time estimate screen
      return (
        <UpdateTimeEstimate
          setCurrentStep={setCurrentStep}
          estimateTime={updatedEstimateTime}
          onUpdate={setUpdatedEstimateTime}
        />
      );
    }
    if (currentStep === 6) {
      // When tech submits his updated time estimate, He should be redirected to confirm with customer screen
      return (
        <ConfirmWithCustomer
          setCurrentStep={setCurrentStep}
          estimateTime={updatedEstimateTime}
        />
      );
    }
    if (currentStep === 7) {
      return <ConfirmCustomersIssue setCurrentStep={setCurrentStep} />;
    }
    if (currentStep === 8) {
      return <ConfirmCustomersIssue setCurrentStep={setCurrentStep} />;
    }
    if (currentStep === 9) {
      return (
        <WaitForIssueSummaryConfirmation setCurrentStep={setCurrentStep} />
      );
    }
    if (currentStep === 10) {
      return (
        <SummarizeSolution
          setCurrentStep={setCurrentStep}
          solutions={solutions}
          setSolutions={setSolutions}
        />
      );
    }
    if (currentStep === 11) {
      return <TechJobInProgress setCurrentStep={setCurrentStep} />;
    }
    if (currentStep === 12) {
      return <WaitForSolutionConfirmation setCurrentStep={setCurrentStep} />;
    }
    if (currentStep === 13) {
      return (
        <SignOffWithCustomer
          setCurrentStep={setCurrentStep}
          solutions={solutions}
        />
      );
    }
    if (currentStep === 14) {
      return <WaitForTimeEstimateApprove setCurrentStep={setCurrentStep} />;
    }
    return <div></div>;
  };

  return <div>{getStep()}</div>;
};

TechSidebar.propTypes = {
  currentStep: PropTypes.number,
  setCurrentStep: PropTypes.func,
};
export default memo(TechSidebar);
