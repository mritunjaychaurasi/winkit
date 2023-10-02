import React,{useEffect,useState} from 'react';
import { Row, Col, ListGroup } from 'react-bootstrap';
import * as DOM from 'react-router-dom';
import style from 'styled-components';
import './leftSidebar.css';
import UserReviewButton from '../../components/UserReviewButton/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faHome,
	faDollarSign,
	faCog,
	faTimes,faHandHoldingUsd, faMoneyCheck,faFileInvoice

} from '@fortawesome/free-solid-svg-icons';
import {
	faChartBar,
	faQuestionCircle,
	faUserCircle,

} from '@fortawesome/free-regular-svg-icons';
import logo from '../../assets/images/logo.png';
import $ from 'jquery';
import { roleStatus } from '../../utils/index';
// import { VERSION } from '../../constants';
function LeftSidebar({
	user,
	setcurrentStep,
	currentStep,
	toggle,
	setType,
	activeMenu,
	setActiveMenu,
	showMenu = true,
})  {
	/*const changeIt = () => {
		setcurrentStep(2);
		console.log('I am changing');
	};*/

	//Check Current Step and render leftsidebar component according it.
	useEffect(()=>{
		
		const matchStep = localStorage.getItem('CurrentStep')
		if(matchStep == 2){
			setActiveMenu('job-reports')
			setcurrentStep(2)
		}
		else if(matchStep==3){
			setActiveMenu('billing-reports')
			setcurrentStep(3)
		}
		else if(matchStep==1){
			setActiveMenu('earnings')
			setcurrentStep(1)
		}
		else if(matchStep==4){
			setActiveMenu('settings')
			setcurrentStep(4)
		}
		else if(matchStep==5){
			setActiveMenu('settings')
			setcurrentStep(5)
		}		
		else if(matchStep==7){
			setActiveMenu('home')
			setcurrentStep(0)
		}
		else if(matchStep==8){
			setActiveMenu('refferal')
			setcurrentStep(8)
		}
		else if(matchStep==9){
			setActiveMenu('invite')
			setcurrentStep(9)
		}
		else if(matchStep==10){
			setActiveMenu('subscriptions')
			setcurrentStep(10)
		}
		else if(matchStep==11){
			setActiveMenu('active_techs')
			setcurrentStep(11)
		}

		else if(matchStep==14){
			setActiveMenu('technician_transactions')
			setcurrentStep(14)
    	}
		else if(matchStep == 12){
			setActiveMenu('discount_referal')
			setcurrentStep(12)
		}
		// else if(matchStep == 25){
		// 	setActiveMenu('techncian_rewards')
		// 	setcurrentStep(25)
		// }
		else{
			console.log("inside else part...")
			setActiveMenu('home')
			setcurrentStep(0)
		}

	},[])
	const HandleHide = () => {
		toggle();
		console.log('aaaaaaaaaaaaaaaaaaaaaa')
	};
	const handleLogoClick = (e) => {
		e.preventDefault();
		setcurrentStep(0);	
		setActiveMenu('home');
	}

	const callChatFunction = () => {
		console.log("inside ::: chat call function ")
		// try{
		// 	let btn = document.getElementsByTagName("button")
		// 	for(var k in btn){
	 //    console.log("typeof(btn[k]) === Object",typeof(btn[k]) === "object")
	 //    console.log("condition :2 ::::::::::",typeof(btn[k]) === "object")
	 //    if(typeof(btn[k]) === "object"){
	 //    		console.log("inside condition 1")
		//     	if(btn[k].getAttribute("data-garden-id") === "buttons.icon_button"){
		//     		console.log("inside condition 2")
		//     		btn[k].click()
		//     	} 
		//     }
	 //   }
		// }
		// catch(err){
		// 	console.log("error in callChatFunction :::::",err)
		// }
		$('#helpCenter-button').trigger('click')
	}

	
	return (
		<Row>
			<Col xs={12} className="pt-5">
				<div className="bar-logo-box">
					<Link to="/" onClick={(e)=>handleLogoClick(e)}>
							<Image src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" />
					</Link>
					<button
						className="mobile-toggle-bar"
						onClick={() => {
							HandleHide();
						}}
					>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>
			</Col>
			{showMenu && (
				<Col xs={12} className="mt-5 side-menu-bar px-3">
					<ListGroup className="list-group" >
						<ListGroup.Item className={activeMenu === 'home' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
							<button
								onClick={() => {
									setcurrentStep(0);
									setActiveMenu('home');
								}}
							>
								<FontAwesomeIcon icon={faHome} />
								<span
									className="pl-3"
								>
									Home
								</span>
							</button>
						</ListGroup.Item>
						<ListGroup.Item
							className={activeMenu === 'job-reports' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
							<button
								onClick={() => {
									setcurrentStep(2);
									setActiveMenu('job-reports');
								}}
							>
								<FontAwesomeIcon icon={faChartBar} />
								<span
									className="pl-3"
								>
									Job Reports
								</span>
							</button>
						</ListGroup.Item>
						
						{user && user.userType === 'technician' && user?.technician?.tag !== 'employed' && (
							<ListGroup.Item
							className={
								activeMenu === 'earnings' || activeMenu === 'billing-reports'
									? 'active'
									: ''
							}
							onClick={() => {
								HandleHide();
							}} 
						>
							<button
								onClick={() => {
									setcurrentStep(1);
									setActiveMenu('earnings');
								}}
							>
								<FontAwesomeIcon icon={faDollarSign} />
								<span className="pl-3">
									My Earnings
								</span>
							</button>
							</ListGroup.Item>
						)}

						{user && user.userType === 'customer' && (
							<ListGroup.Item
							className={
								activeMenu === 'earnings' || activeMenu === 'billing-reports'
									? 'active'
									: ''
							}
							onClick={() => {
								HandleHide();
							}} 
						>
							<button
								onClick={() => {
									setcurrentStep(3);
									setActiveMenu('billing-reports');
								}}
							>
								<FontAwesomeIcon icon={faDollarSign} />
								<span className="pl-3">
									Billing Reports
								</span>
							</button>
							</ListGroup.Item>
						)}
						
						{user && user.userType === 'customer' && user.roles[0] == 'owner' && (
						<ListGroup.Item
							className={activeMenu === 'subscriptions' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
							
							<button
								onClick={() => {
									setcurrentStep(10);
									setActiveMenu('subscriptions');
								}}
							>
								<FontAwesomeIcon icon={faHandHoldingUsd} />
								<span
									className="pl-3"
								>
									Subscriptions
								</span>
							</button>
							
						</ListGroup.Item>
						)}
						{user &&
								user.userType === "technician" ?
								(
									<ListGroup.Item 
										className={activeMenu === 'active_techs' ? 'active' : ''}
										onClick={() => {
											HandleHide();
										}}
									>
									
										<button
											onClick={() => {
												setcurrentStep(11);
												setActiveMenu('active_techs');
											}}
										>
											<FontAwesomeIcon icon={faUserCircle} />
											<span
												className="pl-3"
											>
												Active Technicians
											</span>
										</button>
					
									</ListGroup.Item>
								)
								:
								<ListGroup.Item 
										className={activeMenu === 'discount_referal' ? 'active' : ''}
										onClick={() => {
											HandleHide();
										}}
									>
									
										<button
											onClick={() => {
												setcurrentStep(12);
												setActiveMenu('discount_referal');
											}}
										>
											<FontAwesomeIcon icon={faFileInvoice} />
											<span
												className="pl-3"
											>
												Refer and Earn
											</span>
										</button>
					
									</ListGroup.Item>
						}
						{/* {user &&
								user.userType === "technician"  &&
							<ListGroup.Item 
									className={activeMenu === 'techncian_rewards' ? 'active' : ''}
									onClick={() => {
										HandleHide();
									}}
								>
								
									<button
										onClick={() => {
											setcurrentStep(25);
											setActiveMenu('techncian_rewards');
										}}
									>
										<FontAwesomeIcon icon={faFileInvoice} />
										<span
											className="pl-3"
										>
											Technician Rewards
										</span>
									</button>
				
								</ListGroup.Item>
						} */}

						{user.userType == 'technician' &&
						<ListGroup.Item
							className={activeMenu === 'technician_transactions' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
						<button
							onClick={() => {
								// setcurrentStep(7);
								setActiveMenu('technician_transactions');
								setcurrentStep(14);
							}}
						>
							<FontAwesomeIcon icon={faMoneyCheck} />
							<span
								className="pl-3"
							>
								Transactions
							</span>
						</button>
					</ListGroup.Item>
								
						}

					{user && user.userType === "customer" && (!user.roles || user.roles.indexOf(roleStatus.USER) === -1) && (
						<ListGroup.Item 
							className={activeMenu === 'invite' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
							<button
								onClick={() => {
									setcurrentStep(9);
									setActiveMenu('invite');
								}}
							>
								<FontAwesomeIcon icon={faUserCircle} />
								<span className="pl-3">
									User Management
								</span>
							</button>
						</ListGroup.Item>
					)}

						<ListGroup.Item
							className={activeMenu === 'settings' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
							{user && user.userType === 'technician' && (
								<button
									onClick={() => {
										setcurrentStep(4);
										setActiveMenu('settings');
									}}
								>
									<FontAwesomeIcon icon={faCog} />
									<span
										className="pl-3"
									>
										Settings
									</span>
								</button>
							)}
							{user && user.userType === 'customer' && (
								<button
									onClick={() => {
										setcurrentStep(5);
										setActiveMenu('settings');
									}}
								>
									<FontAwesomeIcon icon={faCog} />
									<span
										className="pl-3"
									>
										Settings
									</span>
								</button>
							)}
						</ListGroup.Item>
						<ListGroup.Item
							className={activeMenu === 'helpCenter' ? 'active' : ''}
							onClick={() => {
								HandleHide();
							}}
						>
							<button
								onClick={() => {
									if(user && user.userType =="technician"){
										setcurrentStep(111);
									}
									setActiveMenu('helpCenter');
									callChatFunction();
								}}
							>
								<FontAwesomeIcon icon={faQuestionCircle} />
								<span
									className="pl-3"
								>
									Help Center
								</span>
							</button>
						</ListGroup.Item>

					</ListGroup>
				</Col>
			)}
			{!showMenu && user && user.userType === 'technician' && (
				<button
					className="app-btn app-btn-transparent mt-5 ml-4 customer-history-btn"
					title="Coming soon"
					target="_blank"
				>
					<span />
					Customer History
				</button>
			)}

			<UserReviewButton />

			{/*<p>VERSION - {VERSION}</p>*/}
		</Row>

	);
}

const Link = style(DOM.Link)`
		cursor:pointer;
`;
const Image = style.img`
		display: block;
		width: 120px;
`;

export default LeftSidebar;
