import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { useUser } from '../context/useContext';
import { useLocation } from 'react-router';
import {useTools} from '../context/toolContext';

const PublicRoute = ({ component: C, props: cProps, ...rest }) => {
  const { user } = useUser();
    const location = useLocation();
    const {setJobId,setTypeForDetails,setStepDeciderDashboard} = useTools()
    const urlParams = new URLSearchParams(location.search)
    if(urlParams.get("jobId")){
      setJobId(urlParams.get("jobId"))
      if(urlParams.get("status") && urlParams.get("status") === "acceptjob"){
        setTypeForDetails("apply")
      }
      setStepDeciderDashboard(6)
    }

    if(urlParams.get("t") && urlParams.get("t") === "sub"){
     setStepDeciderDashboard(10)
    }
    
    let to = "/dashboard"
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "softwares"){
      console.log("user private ::::::::", user);
      to = "/technician/register_steps?t=softwares";
      
    }
  return (
    <Route
      {...rest}
      render={(props) => !user ? (
        <C {...props} {...cProps} match={rest.computedMatch} />
      ) : (
        <Redirect to= {to}/>
      )}
    />
  );
};

PublicRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]).isRequired,
  props: PropTypes.object.isRequired,
};

export default PublicRoute;
