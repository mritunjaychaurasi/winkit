import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import * as PropApi from '../api/proposal.api';
import { openNotificationWithIcon } from '../utils';

const ProposalContext = React.createContext({});

function ProposalProvider(props) {
  const [proposal, setProposal] = useState();
  const [isLoading, setIsLoading] = useState(false);
  // const [isUpdating, setIsUpdating] = useState(false);
  const history = useHistory();
  // const [allpropsals,setProposals] = useState()

  const fetchProposal = useCallback(async (propId) => {
    try {
      setIsLoading(true);

      const res = await PropApi.retrieveProposal(propId);
    //   gettAllJobs()
        setProposal(res);
      setIsLoading(false);
      
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon('error', 'Error', 'Job does not exist.');
      history.push('/dashboard');
    }
  }, [history]);

  async function createJob(data) {
    try {
      const res = await PropApi.createProposal(data);

      setProposal(res);

      return res;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Job does not exist.');
    }
  }
//   const gettAllJobs = useCallback(async ()=>{

//     try{
//       let res  = await PropApi.getJobs()
//       return res
      

//     }
//     catch(err){
//       console.log("I am the res -----------",err)
//     }

//   },[])


  async function updateProp(jobId, data) {
    try {
      // setIsUpdating(true);

      await PropApi.updateProposal(jobId, data);
      // setIsUpdating(false);

      await fetchProposal(jobId);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon('error', 'Error', 'Failed to update proposal.');
    }
  }

  return (
    <ProposalContext.Provider
      value={{
        proposal,
        isLoading,
        fetchProposal,
        createJob,
        updateProp,

      }}
      {...props}
    />
  );
}

function useProposal() {
  const context = React.useContext(ProposalContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
}

export { ProposalProvider, useProposal };
