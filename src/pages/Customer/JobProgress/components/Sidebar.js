import React, { memo, useState } from 'react';
import TempConfirm from '../steps/Confirm';
import ConfirmIssueSummary from '../steps/ConfirmIssueSummary';
import ConfirmTechMatch from '../steps/ConfirmTechMatch';
import CustomerJobInProgress from '../steps/CustomerJobInProgress';
import CustomerTimeApproval from '../steps/CustomerTimeApproval';
import SummaryCompleted from '../steps/SummaryCompleted';
import TechMatchConfirmed from '../steps/TechMatchConfirmed';
import WaitForTechSummary from '../steps/WaitForTechSummary';

const CustomerSidebar = ({ currentStep, setCurrentStep, invited }) => {
  const [updatedEstimateTime, setUpdatedEstimateTime] = useState(0);
  const [updatedIssue, setUpdatedIssue] = useState('');
  const [solutions, setSolutions] = useState([]);

  const getStep = () => {
    if (currentStep === 0) {
      // When Tech receives the email
      return <ConfirmTechMatch setCurrentStep={setCurrentStep} invited={invited} />;
    }
    if (currentStep === 1) {
      // When tech confirms the match, it should be redirected to Time Accurate screen
      return (
        <TechMatchConfirmed
          setCurrentStep={setCurrentStep}
          onUpdateEstimateTime={setUpdatedEstimateTime}
          onUpdateIssue={setUpdatedIssue}
        />
      );
    }
    if (currentStep === 2) {
      // When tech confirms time is accurate, He should be redirected to confirm Job Summary screen
      return (
        <CustomerTimeApproval
          setCurrentStep={setCurrentStep}
          estimateTime={updatedEstimateTime}
        />
      );
    }
    if (currentStep === 3) {
      //  When tech match is not confirmed, he will be redirected to wrong category page
      return (
        <ConfirmIssueSummary
          setCurrentStep={setCurrentStep}
          issue={updatedIssue}
        />
      );
    }
    if (currentStep === 4) {
      // If tech selects wrong category option from Wrong category screen, He should be redirect to select right category.
      return <ConfirmTechMatch setCurrentStep={setCurrentStep} invited={true} />;
    }
    if (currentStep === 5) {
      return <TempConfirm setCurrentStep={setCurrentStep} />;
    }
    if (currentStep === 6) {
      return (
        <WaitForTechSummary
          setCurrentStep={setCurrentStep}
          setSolutions={setSolutions}
        />
      );
    }
    if (currentStep === 7) {
      return (
        <SummaryCompleted
          setCurrentStep={setCurrentStep}
          solutions={solutions}
        />
      );
    }
    return <div />;
  };
  return <div>{getStep()}</div>;
};

export default memo(CustomerSidebar);
