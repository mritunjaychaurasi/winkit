import React,{useEffect, useState,useRef,createRef} from 'react';
import { Select, Table,Pagination,DatePicker} from 'antd';
import { Row, Col,Button} from 'react-bootstrap';
import {handleRefModal} from '../../../utils'
import Loader from '../../../components/Loader';
import * as PromoApi from '../../../api/promo.api';
let intialRender = true
const TechnicianRewardsTable = ({user})=>{
	const [currentPage, setCurrentPage] = useState(1);
    const [techRewardsData, setTechRewardData] =useState([]);
    const [totalRewardMoney,setTotalRewardMoney]= useState(0);
	const [columns,setColumns] = useState([
		  {
		    title: 'Customer',
		    dataIndex: 'customer',
		    key: 'Customer',
		  },
		  {
		    title: 'Technician Earned($)',
		    dataIndex: 'technician_earn',
		    key: 'spentFor',
		  },
		//   {
		//     title: 'Intital Amount ($)',
		//     dataIndex: 'initalAmount',
		//     key: 'initalAmount',
		//   },
		//   {
		//     title: 'Spent Amount ($)',
		//     dataIndex: 'spentAmount',
		//     key: 'spentAmount',
		//   },
		//   {
		//     title: 'Net Amount ($)',
		//     dataIndex: 'newAmount',
		//     key: 'newAmount',
		//   },
	])
	const [data,setData] = useState([])
	const [showLoader, setShowLoader] = useState(true);
	
	const handlePagination = async (page, pageSize) => {
		console.log(">>>>>>>>>true")
	    setShowLoader(true);
	    setCurrentPage(page);
	    // let filters = { ...mainFilters };
	    page = page;
	    pageSize = pageSize;
	    // filters.technician_user_id = user.id;
	    // let detailsList = await earningDetailsList(filters);
	    // setTotalData(detailsList.totalCount);
	    // commissionCalculator(detailsList);
  };

	useEffect(()=>{
        (async()=>{
            let technician_reward_data
            if(user && user.technician){
                technician_reward_data = await PromoApi.retrievePromoData({
                    "technician_id":user.technician.id,
                    "redeemed":true
                })
                console.log('technician_reward_data',technician_reward_data)
                let totalearned=0;
                let temp = [];
                for (var k in technician_reward_data){
    
                    let obj ={ ...technician_reward_data[k]}
                    totalearned = technician_reward_data[k].technician_earn + totalearned;
                    obj["customer"] = technician_reward_data[k].customer_id.user.firstName+" "+technician_reward_data[k].customer_id.user.lastName
                    temp.push(obj)
                }
                setTotalRewardMoney(totalearned)
                setTechRewardData(temp)
                setShowLoader(false)
                intialRender = false
            }
        })()
	},[user])

	return (
    
       <>
        	<Col xs="12" className="">
	    		<Loader height="100%" className={(showLoader ? "loader-outer" : "d-none")} />
				<Col xs="12" className="pt-5">
	            	<Col xs="12" className="py-3 div-highlighter">
	            		<Row>
		                	<Col md="4" className="pl-5 mb-4">
	                    		<span className="d-block label-total-name">Total Earned Reward</span>	
		                		<span className="d-block label-total-value" title="Coming Soon...">${totalRewardMoney}</span>
		                	</Col>
	                	</Row>
	                </Col>
	            </Col>
	        	<Col xs="12" className="pt-5 pb-3">
	                <h1 className="large-heading">Technician Rewards</h1>
	            </Col>
					<Col xs="12" className="ant-table-structure-outer table-responsive"> 
	                    <div className="highlight-background"></div>
	                    <Table
	                        bordered={false}
	                        pagination={false}
	                        columns={columns}
	                        dataSource={techRewardsData}
	                    />
		            </Col>
		            {/* {discountCount > 0 &&
		            	<Pagination
		                  style={{ float: "right", ",marginRight": "40px" }}
		                  current={currentPage}
		                  onChange={handlePagination}
		                  total={discountCount}
		                />
		            } */}
		            
	        </Col>
    	</>		
	)
};
export default TechnicianRewardsTable;