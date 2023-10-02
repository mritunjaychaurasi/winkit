import React,{useEffect, useState, useCallback} from 'react';
import { Table,Pagination} from 'antd';
import { Row, Col, Button} from 'react-bootstrap';
import {Select,DatePicker} from 'antd';
// import Styled from 'styled-components';
import {useAuth} from '../../../context/authContext';
import {useServices} from '../../../context/ServiceContext';
// import LeftSidebar from '../../../components/Sidebar/LeftSidebar';
// import RightSidebar from '../../../components/Sidebar/RightSidebar';
// import TopBar from '../components/TopBar';
// import { TabsHeader } from "../components/Tabs";
// import { DashboardTab, DashboardTabPane } from '../../../components/Dashboard/Tabs';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import Loader from '../../../components/Loader';
import {useEarningDetails} from '../../../context/earningDetailsContext';
import '.././index.css'
import { data } from 'jquery';
import { openNotificationWithIcon } from '../../../utils';
import { useUser } from '../../../context/useContext';
const { Option } = Select;
/*const transactionTypeOptions = [
	<Option key={'all'} value={'all'}>All</Option>,
	<Option key={'credit'} value={'Credit Card'}>Credit Card</Option>,
	<Option key={'debit'} value={'Debit Card'}>Debit Card</Option>
]*/

const sortOptions = [
	<Option key={'asc'} value="asc">Earnings: Low to high</Option>,
	<Option key={'desc'} value="desc">Earnings: High to low</Option>
]
let DATE_OPTIONS = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' ,hour: '2-digit', minute:'2-digit' }
let initialLoad= true
const TechnicianTransactons = ({user})=>{
	const { refetch } = useUser();
	const [showLoader,setShowLoader] = useState(true)
	// const [detailSubmission, setDetailSubmission] = useState();
	const [payPeriodData, setPayPeriodData]	= useState([]);
	const { getStripeAccountStatus,generateAccountLink,createStripeAccount,detailSubmission,disable,getStripeAccountLoginLink } = useServices()
    const [columns,setColumns]  = useState([
		{
	        title: 'Name',
	        dataIndex: 'name',  
			key: 'name',
	        // width: '20%',  
	    },
		{
	        title: 'Email',
	        dataIndex: 'email',  
			key: 'email',
	        // width: '20%',  
	    },
		{
	        title: 'Pay Period',
	        dataIndex: 'payPeriod',  
			key:"payPeriod"
	        // width: '20%',  
	    },
        {
	        title: 'Earnings ($)',
	        dataIndex: 'earnings',  
			key:"earnings"

	        // width: '20%',  
	    },
        {
	        title: 'Status',
	        dataIndex: 'status',
            key: 'status', 
	        // width: '20%',  
	    },
		{
	        title: 'PayDate',
	        dataIndex: 'payDate',
            key: 'payDate', 
	        // width: '20%',  
	    },
    ])	
	const {totalTimeSeconds,totalEarnings } = useServices();
    const {fetchTransactions,getDetailsOfPaycycles,totalPaidAmount} = useEarningDetails()
    useEffect(()=>{
		(async () => {
			if(user && user.technician){
				
				let query = {}
				query['technician'] = user.technician.id
				fetchTransactions(query)
				setTimeout(() => {
					setShowLoader(false);
				}, 1000);
			}	
		})();
    },[user])
	useEffect(()=>{
		(async () => {
			if(user.technician && user.technician.accountId){
				await getStripeAccountStatus(user.technician.accountId)
			}
		})();
	},[detailSubmission])
	useEffect(()=>{
		(async () => {	
			if(user){
				let res = await getDetailsOfPaycycles(user.id,user.technician.id)
				if(res?.payperiodArr){
					setPayPeriodData(res.payperiodArr)
				}
			}
		})();
	},[user])

	const removePlusFromNumber = (phoneNumber) => {
		const newPhoneNumber = JSON.stringify(phoneNumber.replace('+', ''))
		return newPhoneNumber
	}
	return (
        <>       
        	<Col xs="12" className="">
	    		<Loader height="100%" className={(showLoader ? "loader-outer" : "d-none")} />
				<Col xs="12" className="mt-3">
					<Col xs="12" className="py-3">
						<Row>
						{user && user.technician && !user.technician.accountId &&
							(<Col md={{ span: 4, offset: 8}}>
								<Button className='btn app-btn' disabled={disable} size="lg" 
								onClick ={()=>{
									createStripeAccount(user)
								}} >Create Stripe Account</Button>
							</Col>)
						}
						{detailSubmission === false &&
							(<Col md={{ span: 4, offset: 8}}>
								<Button className ='btn app-btn' disabled={disable} size="lg" 
								onClick = {()=> {
								generateAccountLink(user)}}
								>
								Complete your stripe account</Button>	
							</Col>)
						}
						{detailSubmission === true &&
							(<Col md={{ span: 3, offset: 9}}>
								<Button className ='btn app-btn' disabled={disable} size="lg" 
								onClick = {()=> {
									getStripeAccountLoginLink(user)}}
								>
								Stripe Login</Button>	
							</Col>)
						}						
						</Row>
					</Col>
	            </Col>

	            <Col md="12" className="py-4 mt-1 table-responsive">
	            	<Col xs="12" className="table-structure-outer table-responsive p-0">		            
		            	<Col xs="12" className="ant-table-structure-outer table-responsive p-0"> 
		                    <div className="highlight-background"></div>
		                    <Table
		                        bordered={false}
		                        pagination={false}
		                        columns={columns}
		                        dataSource={payPeriodData}
		                        className="earnings-table"
		                    />
		                </Col>
		            </Col>
	            </Col>
	        </Col>
        </>
	)
};
export default TechnicianTransactons;