import React,{useState, useEffect} from 'react';
import { Col, Tabs, Tab, Button} from 'react-bootstrap';

import ScreenSteps from '../../../components/ScreenSteps';
import ProfileReview from './steps/profilereview';
import EditCustomer from './steps/editCustomer';
import CustomerCard from './steps/customerCard';
import Subscription from '../Subscription';
import { useAuth } from '../../../context/authContext';
// import LeftSidebar from '../../../components/Sidebar/LeftSidebar';
// import RightSidebar from '../../../components/Sidebar/RightSidebar';
import Loader from '../../../components/Loader';
import { useUser } from '../../../context/useContext';

import { roleStatus, openNotificationWithIcon } from '../../../utils/index';
import Box from '../../../components/common/Box';
import mixpanel from 'mixpanel-browser';
// import * as CustomerApi from '../../../api/customers.api';
/*import { DashboardTab, DashboardTabPane } from '../../../components/Dashboard/Tabs';
import { TabsHeader } from "../../Dashboard/components/Tabs"*/


const CustomerProfile = () =>{

 	const [currentStep, setCurrentStep] = useState(0);
	const {refetch,user} = useAuth();
	const [customer,setCustomer] = useState('')
	// const [showLoader, setShowLoader] = useState(false);
	const showLoader = false;
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [newCardAdded, setNewCardAdded] = useState(false);
	const [defaultActiveTab, setDetaultActiveTab] = useState("Manage Account")

	 useEffect(()=>{
	      // code added by manibha because phone number was not getting updated
	      refetch() 
	  },[currentStep])


	const onNext = () => {
		setCurrentStep(currentStep+1)
	}
	const prev = () =>{
    console.log("its called..............",currentStep)
	 	setCurrentStep(currentStep-1)
	}

  const handleActiveTab = (k) => {
    console.log("active kye",k)
    if(k.toLowerCase() === 'buy prepaid minutes'){
      refetch()
    }
    setDetaultActiveTab(k)
  }

	const steps = [{
      title: 'profileReview',
      content: <ProfileReview user={user} setCustomer={setCustomer} onNext={onNext} />,
    },
    {
      title: 'editCustomer',
      content: <EditCustomer user={user} values={user.customer}  onNext={onNext} onPrev={prev} />,
    },
    {
      title: 'customeCard',
      content: <CustomerCard user={user} values={user.customer} onNext={onNext} onPrev={prev} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} newCardAdded={newCardAdded} setNewCardAdded={setNewCardAdded} showCards={true}/>,
    },
    // {
    //   title: 'subscription',
    //   content: <Subscription user={user} handleActiveTab={handleActiveTab} />,
    // }
    ];

    const push_to_pricing_plans = (e) => {
        if(user){
            // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Customer - Buy Subscription');
            mixpanel.people.set({
                $first_name: user.firstName,
                $last_name: user.lastName,
            });
            // mixpanel code//
        }
        
        if(user && user.customer){
            // history.push('/subscription')
        }else{
            openNotificationWithIcon('error', 'Error', 'Something went wrong. Please logout and login again to continue.');
        }        
        
    };


	return (
        <>
        	<Col md="12" className="">
	    		<Loader height="100%" className={(showLoader ? "loader-outer" : "d-none")} />

	            <Col md="12" className="py-4 mt-1">
	            	<Col xs="12" className="p-0">

                	<Tabs activeKey={defaultActiveTab} onSelect={handleActiveTab} id="uncontrolled-tab-example" className="mb-3 tabs-outer">

    						  	<Tab eventKey="Manage Account" title="Manage Account" className="col-md-12 p-0">
    						    	<ScreenSteps stepsContent={steps[0].content} />
    						  	</Tab>
                    	{user?.userType === "customer" &&
		                       	user?.roles?.length> 0 && user.roles.indexOf(roleStatus.USER) === -1 && (
							  	  	<Tab eventKey="Card Details" title="Card Details" className="col-md-12 p-0">
							    	  	<ScreenSteps stepsContent={steps[2].content} />
							  	  	</Tab>
	                      	)}
                      		{/*{user?.userType === "customer" &&
                       			user?.roles?.length> 0 && user.roles.indexOf(roleStatus.USER) === -1 && (
                        			<Tab
                                		eventKey="Buy prepaid minutes"
                                		title="My Subscriptions"
                                		className="col-md-12 p-0"
                          			>
                          				<ScreenSteps stepsContent={steps[3].content} />
                            			
                        			</Tab>
                      		)}*/}
									
						</Tabs>		
		            </Col>
	            </Col>
	        </Col>
        </>

		)
}

export default CustomerProfile
