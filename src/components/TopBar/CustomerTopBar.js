import React from 'react';
import { Col, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import mixpanel from 'mixpanel-browser';
import { isMobile } from 'react-device-detect';
import { useUser } from '../../context/useContext';
import { openNotificationWithIcon } from '../../utils';
// import { roleStatus } from '../../utils';
import { klaviyoTrack } from '../../api/typeService.api';
import { REACT_APP_ROLLBAR_TOKEN } from '../../constants';
import Rollbar from 'rollbar';


const rollbarConfig = {
  accessToken:REACT_APP_ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
};
const rollbar = new Rollbar(rollbarConfig);

const CustomerTopBar = ({ setcurrentStep, setActiveMenu }) => {
  const history = useHistory();
  const { user } = useUser();

  const push_to_profile_setup = async (e) => {
    console.log('>>>>>>>>>>>>push_to_profile_setup ::::::: TopBar');
    try{
      if (user) {
        // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track('Customer - Post a job');
        mixpanel.people.set({
          $first_name: user.firstName,
          $last_name: user.lastName,
        });
        // mixpanel code//
      }
  
      if (user) {
        const klaviyoData = {
          email: user.email,
          event: 'Job Post Button Click',
          properties: {
            $first_name: user.firstName,
            $last_name: user.lastName,
          },
        };
        // throw new Error("No jobs");

        await klaviyoTrack(klaviyoData);
  
        if (window.localStorage.getItem('extraMin')) {
          window.localStorage.removeItem('extraMin');
        }
        if (window.localStorage.getItem('secs')) {
          window.localStorage.removeItem('secs');
        }
          window.location.href = '/customer/profile-setup';
      } else {
            openNotificationWithIcon('error', 'Error', 'Something went wrong. Please logout and login again.');
      }
    }catch(e){
      rollbar.warning("Test Warning");
      rollbar.error(e);
    }

  };

  return (

    <Col className="text-left pt-4 pr-0">
      <Button onClick={push_to_profile_setup} className="btn app-btn app-btn-large">
        <span />
        + Post a job
      </Button>
    </Col>

  );
};
export default CustomerTopBar;
