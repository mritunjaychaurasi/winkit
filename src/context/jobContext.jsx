import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import * as JobApi from '../api/job.api';

import { openNotificationWithIcon } from '../utils';

const JobContext = React.createContext({});

function JobProvider(props) {
  const [job, setJob] = useState();
  const [method,setMethod] = useState("ComputerAudio")
  const [jobTime, setJobTime] = useState(0);
  const [jobIds,setJobIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [isUpdating, setIsUpdating] = useState(false);
  const history = useHistory();
  const [allJobs,setAllJobs] = useState();
  const [techJobs,settechJobs] = useState([]);
  const [totalJobs,setTotalJobs] = useState(0)
  const fetchJob = useCallback(async (jobId) => {
    try {
      setIsLoading(true);

      const res = await JobApi.retrieveJob(jobId);
      setJob(res);
      setIsLoading(false);
      
    } catch (err) {
      setIsLoading(false);
      // openNotificationWithIcon('error', 'Error', 'Job does not exist.');
      // history.push('/dashboard');
    }
  }, [history]);

  async function createJob(data) {
    try {
      console.log(data,">>the job data")
      const res = await JobApi.createJob(data);
      setJob(res);
      return res;
    } catch (err) {
      // openNotificationWithIcon('error', 'Error', 'Job does not exist.');
    }
  }
  const gettAllJobs = useCallback(async ()=>{

    try{
      let res  = await JobApi.getJobs()
      return res
      

    }
    catch(err){
      console.log("I am the res -----------",err)
    }

  },[])
  // Fetching pageNum from localstorage if it's available.
  //async function fetchJobByParams(data,pagination={ page: 1,pageSize:10 }){
  async function fetchJobByParams(data,pagination={ page: localStorage.getItem('pageNum')?localStorage.getItem('pageNum') : 1,pageSize:10 }){
    try{

      let res = await JobApi.findJobByParams(data,pagination)
      setAllJobs(res.jobs)
      console.log("response ::::: 1",res)
      setTotalJobs(res.totalPages)
      
      return res

    }
    catch(err){
      setIsLoading(false);
      // window.location.reload();
      // openNotificationWithIcon('error', 'Error', 'Failed to fetch jobs.');
    }
  }
  // findJobByParams
  async function updateJob(jobId, data) {
    try {
      // setIsUpdating(true);

      await JobApi.updateJob(jobId, data);
      // setIsUpdating(false);

      await fetchJob(jobId);
    } catch (err) {
      setIsLoading(false);
      // openNotificationWithIcon('error', 'Error', 'Failed to update job.');
    }
  }

  async function createJobAsGuest(data, token) {
    try {
      // console.log("createJobAsGuest data:",data, token)
      const res = await JobApi.createJobAsGuest(data,token);
      // console.log("res in context",res)
      return res
    } catch (err) {
      // openNotificationWithIcon('error', 'Error', 'Job does not exist.');
    }
  }

  async function getTotalJobs(data) {
    try {
      // console.log("getTotalJobs data:",data)
      const res = await JobApi.getTotalJobs(data);
      // console.log("res in context",res)
      return res
    } catch (err) {
      // openNotificationWithIcon('error', 'Error', 'Job does not exist.');
    }
  }

  async function getTotalJobsTechnician(data) {
    try {
      // console.log("getTotalJobs data:",data)
      const res = await JobApi.getTotalJobsTechnician(data);
      // console.log("res in context",res)
      return res
    } catch (err) {
      // openNotificationWithIcon('error', 'Error', 'Job does not exist.');
    }
  }

  async function getTotalPaidJobs(data) {
    try {
      console.log("getTotalPaidJobs data:",data)
      const res = await JobApi.getTotalPaidJobs(data);
      console.log("res in context",res)
      return res
    } catch (err) {
      // openNotificationWithIcon('error', 'Error', 'Job does not exist.');
    }
  }

  return (
    <JobContext.Provider
      value={{
        job,
        isLoading,
        fetchJob,
        createJob,
        updateJob,
        setJob,
        jobTime,
        setJobTime,
        allJobs,
        gettAllJobs,
        fetchJobByParams,
        method,
        setMethod,
        setJobIds,
        jobIds,
        techJobs,
        settechJobs,
        totalJobs,
        setTotalJobs,
        setAllJobs,
        createJobAsGuest,
        getTotalJobs,
        getTotalJobsTechnician,
        getTotalPaidJobs,
        setJob
      }}
      {...props}
    />
  );
}

function useJob() {
  const context = React.useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
}

export { JobProvider, useJob };
