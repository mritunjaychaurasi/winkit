import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import Spinner from '../../../components/Spinner';
import { useJob } from '../../../context/jobContext';
import InviteTech from './steps/InviteTech';
import {useAuth} from  '../../../context/authContext';
// import ProposalList from './steps/ProposalList';
const AcceptJob = () => {
  const { jobId } = useParams();
  const { job, fetchJob } = useJob();
  const {user,updateUserInfo,refetch} = useAuth();
  // const [step,setStep] = useState(0);
  const step = 0;

  useEffect(() => {
    fetchJob(jobId);
  }, [jobId]);

  if (!job) return <Spinner />;

  return (
    <div className="w-85">
      {/* {step==0 && <ProposalList step={step} setStep={setStep} user={user} job={job} />} */}
      {step===0 && <InviteTech user={user} refetch={refetch} updateUserInfo = {updateUserInfo} job={job} />}
    </div>
  );
};

export default AcceptJob;
