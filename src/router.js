import React from 'react';
import { Route, Switch } from 'react-router-dom';
import InviteUserScreenshare from 'pages/InviteUserScreenshare';
import MeetingFeedback from 'pages/Feedback';
// import MeetingFeedbackPartTwo from 'pages/Feedback/Feedbackparttwo';
// import Thankyou from 'pages/Feedback/Thankyou';
import JobDetail from 'pages/JobDetail';
import CustomerProfile from 'pages/Customer/Profile';
import EditTech from 'pages/Technician/EditTech';
import PublicRoute from './routes/PublicRoute';
import MainPage from './pages/Dashboard';
import LandingPage from './pages/Dashboard/landingPage';
import VideoCall from './pages/videoCall';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Courses from './pages/Courses';
import PrivateRoute from './routes/PrivateRoute';
import EmailVerification from './pages/Auth/VerifyEmail';
import ServiceRatePage from './pages/ServiceRate';
import WelcomeTechnicianPage from './pages/WelcomeTechnician';
import TechnicianApplicationPage from './pages/TechnicianApplication';
import JobListPage from './pages/Jobs';
import RequestServicePage from './pages/RequestService';
import ServiceStatusPage from './pages/ServiceStatus';
import SearchTechPage from './pages/SearchTech';
import CustomerRegister from './pages/Customer/Onboarding';
import { CUSTOMER, TECHNICIAN } from './constants';
import CustomerProfileSetup from './pages/Customer/ProfileSetup';
import JobCreate from './pages/Customer/JobCreate';
import AcceptJob from './pages/Customer/AcceptJob';
import JobTechNotFound from './pages/Customer/JobTechNotFound';
import CustomerJobProgress from './pages/Customer/JobProgress';
import TechnicianRegister from './pages/Technician/Register';
import TechnicianProfile from './pages/Technician/Profile';
import JobAlert from './pages/Technician/JobAlert';
import TechJobProgress from './pages/Technician/JobProgress';
import CustomerConfirmation from './pages/Technician/CustomerConfirmation';
import NotFound from './pages/NotFound';
import EarningsTech from './pages/Dashboard/steps/earnings';
import BillingReportsTech from './pages/Dashboard/steps/billingReports';

import CardDetails from 'pages/Customer/Billing/CardDetails';
import JobReports from './pages/Dashboard/steps/jobReports';

import HelpCenter from './pages/Support/HelpCenter';
import Subscription from './pages/Customer/Subscription';


const Routes = (props) => (
  <Switch>
    <PublicRoute exact path="/" component={Login} props={props} />
  {/*<PrivateRoute exact path="/" component={LandingPage} props={props} />*/}
    <PublicRoute exact path="/video" component={VideoCall} props={props} />
    <PublicRoute exact path="/login" component={Login} props={props} />
    <PublicRoute
      exact
      path="/forgot-password"
      component={ForgotPassword}
      props={props}
    />
    <PublicRoute
      exact
      path="/reset-password"
      component={ResetPassword}
      props={props}
    />
    <PublicRoute exact path="/courses" component={Courses} props={props} />
    <PrivateRoute
      exact
      path="/verify-email"
      component={EmailVerification}
      props={props}
    />

    <PrivateRoute
      exact
      path="/customer/create-job/:jobId"
      permission={CUSTOMER}
      component={JobCreate}
      props={props}
    />
    <PrivateRoute
      exact
      path="/customer/create-job/:jobId/:schedule"
      permission={CUSTOMER}
      component={JobCreate}
      props={props}
    />

    <Route
      exact
      path="/customer/start-profile-setup"
      permission={CUSTOMER}
      component={CustomerProfileSetup}
      props={props}
    />
  
    <PrivateRoute
      exact
      path="/customer/profile-setup"
      permission={CUSTOMER}
      component={CustomerProfileSetup}
      props={props}
    />

    <PublicRoute
      exact
      path="/customer/create-job"
      permission={CUSTOMER}
      component={JobCreate}
      props={props}
    />
    
    <PrivateRoute exact path="/dashboard" component={MainPage} props={props} />
    <PrivateRoute
      exact
      path="/service-rate"
      component={ServiceRatePage}
      props={props}
    />
    <PrivateRoute
      exact
      path="/welcome-technician"
      component={WelcomeTechnicianPage}
      props={props}
    />
    <PrivateRoute
      exact
      path="/technician-application"
      component={TechnicianApplicationPage}
      props={props}
    />
    <PrivateRoute exact path="/jobs" component={JobListPage} props={props} />

    <Route exact path="/customer/card-details" component={CardDetails} props={props} />

    <PrivateRoute exact path = "/job-reports" component={JobReports} props={props}/>


    <PrivateRoute
      exact
      path="/request-service"
      component={RequestServicePage}
      props={props}
    />
    <PrivateRoute
      exact
      path="/service-status"
      component={ServiceStatusPage}
      props={props}
    />
    <PrivateRoute
      exact
      path="/search-tech"
      component={SearchTechPage}
      props={props}
    />
    <PrivateRoute
      exact
      path="/tech/earnings"
      component={EarningsTech}
      props={props}
    />
    <PrivateRoute
      exact
      path="/tech/billing-reports"
      component={BillingReportsTech}
      props={props}
    />

  

    <PublicRoute
      exact
      path="/customer/register/:jobId"
      component={CustomerRegister}
      props={props}
    />
     <PublicRoute
      exact
      path="/customer/register/:jobId/:schedule"
      component={CustomerRegister}
      props={props}
    />
    <PublicRoute
      exact
      path="/customer/register"
      component={CustomerRegister}
      props={props}
    />
    
    <PrivateRoute
      exact
      path="/customer/accept-job/:jobId"
      permission={CUSTOMER}
      component={AcceptJob}
      props={props}
    />
    <PrivateRoute
      exact
      path="/customer/job/:jobId"
      permission={CUSTOMER}
      component={CustomerJobProgress}
      props={props}
    />
    <PrivateRoute
      exact
      path="/customer/job-tech-not-found/:jobId"
      permission={CUSTOMER}
      component={JobTechNotFound}
      props={props}
    />
    <PrivateRoute
      exact
      path="/technician/profile-edit"
      permission={TECHNICIAN}
      component={EditTech}
      props={props}
    />
    <PublicRoute
      exact
      path="/technician/register"
      component={TechnicianRegister}
      props={props}
    />

    <PrivateRoute
      exact
      path="/technician/register_steps"
      permission={TECHNICIAN}
      component={TechnicianRegister}
      props={props}
    />

    <PrivateRoute
      exact
      path="/technician/profile"
      permission={TECHNICIAN}
      component={TechnicianProfile}
      props={props}
    />
    <PrivateRoute
      exact
      path="/customer/profile"
      permission={CUSTOMER}
      component={CustomerProfile}
      props={props}
    />
    <PrivateRoute
      exact
      path="/technician/new-job/:jobId"
      permission={TECHNICIAN}
      component={JobAlert}
      props={props}
    />
    <PrivateRoute
      exact
      path="/technician/job/:jobId"
      permission={TECHNICIAN}
      component={TechJobProgress}
      props={props}
    />
    <PrivateRoute
      exact
      path="/technician/customer-confirmed"
      permission={TECHNICIAN}
      component={CustomerConfirmation}
      props={props}
    />
    <PrivateRoute
      exact
      path="/meeting-feedback/:jobId"
      component={MeetingFeedback}
      props={props}
    />
    <PrivateRoute
      exact
      path="/job-details"
      component={JobDetail}
      props={props}
    />
    <Route
      exact
      path="/invited-user-screenshare/:roomId"
      component={InviteUserScreenshare}
      props={props}
    />

    <Route
      exact
      path="/help-center"
      component={HelpCenter}
      props={props}
    />

    <PrivateRoute
      exact
      path="/subscription"
      component={Subscription}
      props={props}
    />

    <Route component={NotFound} />
  </Switch>
);

export default Routes;
