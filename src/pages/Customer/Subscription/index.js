import React, { useState, useEffect} from 'react';
import moment from 'moment';
import { LayoutMax } from '../../../components/Layout';
import { Row, Col, Button, Card, Container} from 'react-bootstrap';
import { Input, Spin, Modal,Alert } from 'antd';
import {getAllPlans, buySubscription, cancelSubscription,cancelPendingSubscription,createSubscriptionHistory, getSubscriptionHistory} from "../../../api/subscription.api";
import { useUser } from '../../../context/useContext';
import { useAuth } from '../../../context/authContext';
import Loader from '../../../components/Loader';
import {openNotificationWithIcon,isLiveUser} from '../../../utils';
import * as CustomerApi from '../../../api/customers.api';
import * as PromoApi from '../../../api/promo.api';
import Parser from 'html-react-parser';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import { STRIPE_KEY,STRIPE_TEST_KEY } from '../../../constants';
import AddCardForm from '../Profile/steps/addCardForm';
import mixpanel from 'mixpanel-browser';
// import {retrieveTechnicianBysomeParams} from '../../../api/technician.api'
import * as TechnicianApi from '../../../api/technician.api';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { Select, Table, Pagination, DatePicker } from "antd";
const cardInfoFetched = false;
// const { Option } = Select;
const Subscription = ({user, handleActiveTab}) => {
    let liveUser = isLiveUser(user)
    console.log("liveUser ::::::::::",liveUser)
    const stripePromise = liveUser ? loadStripe(STRIPE_KEY) : loadStripe(STRIPE_TEST_KEY)   
    // const   { user } = useUser();
    const {refetch} = useAuth();
    const [plans, setPlans] = useState([]);
    //let refinePlans = [];
    const [refinePlans, setRefinePlans] = useState([]);
    //let refinePlans_states = [];
    const [isLoading, setIsLoading] = useState(true);
    const [cardsInfo, setCardsInfo] = useState([]);
    const [cardInfoUpdated, setCardInfoUpdated] = useState(cardsInfo);
    const [startClicked, setStartClicked] = useState([]);
    const [subscriptoinModalVisible, setSubscriptoinModalVisible] = useState(false);
    const [isPlanAvailable, setIsPlanAvailable] = useState(false);
    const [activeSubscription, setActiveSubscription] = useState({});
    const [activePlanId, setActivePlanId] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
	const [newCardAdded, setNewCardAdded] = useState(false);
    const [subscriptionHistory,setSubscriptionHistory] = useState([]);
	const [highestPlanRate, setHighestPlanRate] = useState(0);
    const [showBuyMessage,setShowBuyMessage] = useState(false);
    const [clickedPlan, setClickedPlan] = useState([]);
    const [activePlanEmpty, setActivePlanEmpty] = useState(false);
    const [newSubscriptionHistory, setNewSubscriptionHistory] = useState([])
    const [subscriptionHistorySignal,setSubscriptionHistorySignal] = useState(false)
    const [cancelSignal,setCancelSignal] = useState(true)
    const [promoCode, setPromoCode] = useState()
    const [promoAppliedFor, setPromoAppliedFor] = useState()
    const [messageCode, setMessageCode] = useState()
    const [isDisabled, setIsDisabled] = useState()
    const [promoId, setPromoId] = useState("")
    const [isPromoModal, setIsPromoModal] = useState()
    const [isApplied, setIsApplied] = useState()
    const [successMessage, setSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [buyNowPlanData, setBuyNowPlanData] = useState({})
    const [buyNow, setBuyNow] = useState();
    const [usedCoupon, setUsedCoupon]= useState(false);
    const [promoCodes, setPromoCodes] = useState([])
    const [promoData, setPromoData] =useState([]);
    const [promoApplied,setpromoApplied]= useState(false);
    /**
	 * Following function is used to cancel the curent subscrition of user.
	 * @author : Vinit
	 */
     const cancelUserSubscription = async () => {
         if(user && user.customer){

            const data = {
                plan_id: user.customer.subscription.plan_id,
                plan_name: user.customer.subscription.plan_name,
                total_minutes: user.customer.subscription.total_minutes,
                total_seconds: user.customer.subscription.total_seconds,
                time_used: user.customer.subscription.time_used,
                invoice_id: user.customer.subscription.invoice_id,
                subscription_id: user.customer.subscription.subscription_id,
                status: 'Canceled',
                plan_purchased_date: user.customer.subscription.plan_purchased_date,
                plan_inactive_date: new Date(),
            }

            await createSubscriptionHistory({cust_id:user.customer.id,"subscription_history":data})
            await CustomerApi.updateCustomer(user.customer.id,{$unset: {"subscription" :1}, cancelSignal});
            await cancelSubscription({'subscription_id':user.customer.subscription.subscription_id});
                        
            window.location.reload();

        }
    }

    /**
	 * Following function is used to fetch subscrition history of a specific user.
     * @params =  customer id
	 * @response : subscription history
	 * @author : Vinit
	 */
    const fetchSubscriptionHistory = async () => {
        let data = await getSubscriptionHistory(user.customer.id);
        setNewSubscriptionHistory(data)
    }

    useEffect(()=>{
        if(user && user.customer && user.customer.id){
            fetchSubscriptionHistory()
        }
    },[subscriptionHistorySignal])

    useEffect(()=>{
        (async()=>{
            if(user && user.customer && user.customer.id){
                let promolist = await PromoApi.retrieveCustomerPromoCodes({"customer_id":user.customer.id,"redeemed":true})
                setPromoData(promolist)
                if(promolist.length>0){
                    let data=await promolist.map(item=>item.promo_code)
                    let arr =[];
                    if(data.length>0){
                        for (let i=0; i<data.length; i++){
                        let obj = {};
                         obj["value"] = data[i] 
                         obj["label"] = data[i]
                         arr.push(obj)
                        }
                        setPromoCodes(arr)
                        console.log('arr arr arr',arr)
                    }
                }
            }
        })()        
    },[user])
    useEffect(()=>{
        if(newCardAdded){
            refetch();
            console.log("::::::: checking User ::::::::::::::::", user.customer);
            if (user.customer && user.customer.stripe_id && user.customer.stripe_id !== '') {
                buyPlanInit(clickedPlan['plan_id'],clickedPlan['plan_name'],clickedPlan['price_id'],clickedPlan['total_minutes'],clickedPlan['discount']);
                setNewCardAdded(false);
            }
        }
    }, [newCardAdded,user,refetch]);

    useEffect(()=>{
        (async()=>{
            await refetch()
        	let allPlans = await getAllPlans({"liveUser":liveUser});
            setPlans(allPlans.data);
            if(allPlans && allPlans.data && allPlans.data.length > 0){
                let highestPlanPrice = Math.max.apply(Math, allPlans.data.map(function(o) { return o.price.unit_amount; }))
                setHighestPlanRate(highestPlanPrice)
                // console.log("highestPlanPrice",highestPlanPrice)
            }

            for(let i=0;i<=allPlans.data.length - 1 ;i++){
                if(typeof allPlans.data[i]['metadata']['key_features'] === 'string'){
                    allPlans.data[i]['metadata']['key_features'] = JSON.parse(allPlans.data[i]['metadata']['key_features'])
                }
                if(typeof (allPlans.data[i]['metadata'])['key_features_submenu'] === 'string'){
                    allPlans.data[i]['metadata']['key_features_submenu'] = JSON.parse(allPlans.data[i]['metadata']['key_features_submenu'])
                }
                let type = allPlans.data[i]['metadata']['product_type'].charAt(0).toUpperCase()+ allPlans.data[i]['metadata']['product_type'].slice(1);
                if(!(type in refinePlans)){
                    refinePlans[type] = [];
                }
                refinePlans[type].push(allPlans.data[i]);
            }
            setRefinePlans(refinePlans);
            Object.keys(refinePlans).map(function (type) {
                refinePlans[type].map((p, idx)=>{
                    if(p.metadata.key_features_submenu){
                        Object.keys(p.metadata.key_features_submenu).map(function (submenus_key) {
                            console.log(">>>>>>>> submenus_key", submenus_key);
                            p.metadata.key_features_submenu[submenus_key].map((psd, idx)=>{
                                console.log(idx, psd);
                            })
                        })
                    }
                })
            })

            setTimeout(()=>{
                setIsLoading(false);
            },800)
        })();
	},[])
    useEffect(()=>{
      (async()=>{

    })()
    },)

    useEffect(()=>{
        (async()=>{
          
            if(user && plans && plans.length > 0){
                if(user.customer.subscription && user.customer.subscription.plan_id){
                    let activePlan = plans.find(o => o.id === user.customer.subscription.plan_id);
                    // console.log("activePlan in useEffect ::",activePlan)
                    if(activePlan){
                        setActivePlanId(user.customer.subscription.plan_id);
                        if(user.customer.subscription.time_used === user.customer.subscription.total_seconds){
                            setActivePlanEmpty(true)
                        }
                        let activePlanData = {...activePlan}
                        activePlanData['total_amount'] = parseFloat(activePlanData.price.unit_amount/100)-(0.05 * parseFloat(activePlanData.price.unit_amount/100)).toFixed(2)
                        setActiveSubscription(activePlanData);
                        setIsPlanAvailable(true);
                    }else{
                        openNotificationWithIcon("error","Error","Your active plan is no more available.")
                    }
                }
            }

            if(user && user.customer && user.customer.subscription_history){
                setSubscriptionHistory(user.customer.subscription_history)
            }
            if(user && plans && plans.length > 0){

                for(let i=0;i<=plans.length - 1 ;i++){
                    if(typeof plans[i]['metadata']['key_features'] === 'string'){
                        plans[i]['metadata']['key_features'] = JSON.parse(plans[i]['metadata']['key_features'])
                    }
                    if(typeof plans[i]['metadata']['key_features_submenu'] === 'string'){
                        plans[i]['metadata']['key_features_submenu'] = JSON.parse(plans[i]['metadata']['key_features_submenu'])
                    }
                }
            }
        })();
    },[user, plans, refetch])

    //Function will return the total save price
    const getSavePrice = (price, regPrice) => {
        regPrice = parseInt(regPrice);
        price = parseInt(price/100);
        let savePriceDiff = (regPrice-price);
        let savePriceAdd = (regPrice+price)/2;
        let savePrice = (savePriceDiff/savePriceAdd)*100;
        return savePrice.toFixed(2);
    }

    
    const buyPlanInit = async(plan_id,plan_name,price_id,total_minutes,discount) => {            
        if(user){
            let temp = [];
            temp.push(plan_id);
            setStartClicked(temp)
            if (user.customer && user.customer.stripe_id && user.customer.stripe_id !== '') {
                let cardsInfo = await CustomerApi.getStripeCustomerCardsInfo({ stripe_id: user.customer.stripe_id,liveUser:liveUser });
                cardsInfo = (cardsInfo.data ? cardsInfo.data : [])
                console.log("cardsInfo>>>>>>>>>>>",cardsInfo)
                if(cardsInfo.length > 0){
                    console.log("activeSubscription",activeSubscription)
                    if(user.customer.subscription && user.customer.subscription.subscription_id){
                        if(Object.keys(activeSubscription).length !== 0 &&  activeSubscription.metadata.valid_for === "one_month"){
                            let buyDate = new Date(user.customer.subscription.plan_purchased_date)
                            let nowDate = new Date()
                            let diffDays = getDifferenceInDays(buyDate,nowDate)
                            if(diffDays > 30){
                                cancelOldAndBuyNewOne(cardsInfo,price_id, plan_id, plan_name,total_minutes,discount)
                            }
                            else{
                                askModalConfimation(cardsInfo,price_id, plan_id, plan_name,total_minutes,discount)
                            }
                        }                      

                    }else{
                        let subscriptionHistory = user.customer.subscription_history;
                        buyPlan(cardsInfo, price_id, plan_id, plan_name, total_minutes,discount,subscriptionHistory,promoId)
                    }
                }else{
                    let temp = [];
                    setStartClicked(temp)
                    setIsModalOpen(true)
                    setClickedPlan({'plan_id':plan_id,'plan_name':plan_name,'price_id':price_id,'total_minutes':total_minutes,'discount':discount})
                }
            }else{
                let temp = [];
                setStartClicked(temp)
                setIsModalOpen(true)
                setClickedPlan({'plan_id':plan_id,'plan_name':plan_name,'price_id':price_id,'total_minutes':total_minutes,'discount':discount})
            }
        }else{
            openNotificationWithIcon("info","Info","Looking like your session is expired. Please reload your page and try again.")
        }
    }


    /**
     * Function will ask confirmation from client while buying subscription. Since the old subscription is still active.
     * @params =  cardsInfo(Type:Object),price_id(Type:String), plan_id(Type:String), plan_name(Type:String),total_minutes(Type:String),discount(Type:String)
     * @response : no response
     * @author : Manibha
     */
    const askModalConfimation = (cardsInfo,price_id, plan_id, plan_name,total_minutes,discount) => {
        Modal.confirm({
            title: 'Your previous subscription will get expired. Are you sure you want to buy new subscription?',
            okText: "Yes",
            cancelText: "No",
            className:'app-confirm-modal',
            onOk() {
    
                cancelOldAndBuyNewOne(cardsInfo,price_id, plan_id, plan_name,total_minutes,discount)
            },
            onCancel(){
                setStartClicked([])
            }
        }) 
    }

    /**
     * Function will ask confirmation from client while canceling subscription, since the current subscription is still active.
     * @author : Vinit
     */
    const cancelAskModalConfirmation = () => {
            // mixpanel code//
                mixpanel.identify(user.email);
                mixpanel.track('Customer - cancel subscription.');
            // mixpanel code//
        Modal.confirm({
            title: 'Are you sure you want to cancel your current subscription ?',
            okText: "Yes",
            cancelText: "No",
            className:'app-confirm-modal',
            onOk() {
                cancelUserSubscription();
                // mixpanel code//
                    mixpanel.identify(user.email);
                    mixpanel.track('Customer - clicked yes in cancel confirmation.');
                // mixpanel code//
            },
            onCancel(){
                // mixpanel code//
                    mixpanel.identify(user.email);
                    mixpanel.track('Customer - clicked no in cancel confirmation.');
                // mixpanel code//
            }

        }) 
    }

     /**
     * Function is used to calculate difference in days between two dates.
     * @params =  date1(Type:DateObject),date2(Type:DateObject)
     * @response : returns difference in days between two dates
     * @author : Manibha
     */
    function getDifferenceInDays(date1, date2) {
        const diffInMs = Math.abs(date2 - date1);
        return diffInMs / (1000 * 60 * 60 * 24);
    }

    /**
     * Function will new subscription and will keep the old active subscription in subscription history.
     * @params =  cardsInfo(Type:Object),price_id(Type:String), plan_id(Type:String), plan_name(Type:String),total_minutes(Type:String),discount(Type:String)
     * @response : no response
     * @author : Manibha
     */
    const cancelOldAndBuyNewOne = async(cardsInfo,price_id, plan_id, plan_name,total_minutes,discount) =>{
        let cancelDataToSend = {
            'subscription_id':user.customer.subscription.subscription_id
        }
        
        let cRes = await cancelSubscription(cancelDataToSend);
        console.log('cRes :::',cRes)
        if(cRes && cRes.success){
            let subscriptionHistory = user.customer.subscription_history;
            let oldPlanDetails = user.customer.subscription;
            oldPlanDetails['status'] = cRes.data.status;
            oldPlanDetails['plan_inactive_date'] = new Date()
            console.log('look at old data', oldPlanDetails);
            subscriptionHistory.push(oldPlanDetails);
            await createSubscriptionHistory({cust_id:user.customer.id,"subscription_history":oldPlanDetails})
            if(promoId !== ''){
                buyPlan(cardsInfo, price_id, plan_id, plan_name, total_minutes,discount, subscriptionHistory,promoId)
            }
            else{
                buyPlan(cardsInfo, price_id, plan_id, plan_name, total_minutes,discount, subscriptionHistory,promoId)
            }

        }else{
            let temp = [];
            setStartClicked(temp)
            openNotificationWithIcon("error","Error","Failed to cancel old subscription and upgrade new subscription. Please reload your page and try again.")
        }
    }
    const buyPlan = async(cardsInfo, price_id, plan_id, plan_name, total_minutes,discount, subscriptionHistory=[],promoId='') => {
        // console.log("promoId",promoId)
        openNotificationWithIcon("info","Info",'Buying subscription may take upto 1-2 minutes. Please be patient.')

        setShowBuyMessage(true)
        let cardObj = cardsInfo.find(o => o.default_card === "yes");
        let purchaseDate  = moment().format('MM/DD/YYYY hh:mm a');
        let subscribeDataToSend = {
            'customer_id':cardObj['customer'],
            'price_id':price_id,
            'product_id':plan_id,
            'email':user.email,
            'name':user.firstName+' '+user.lastName,
            "liveUser":liveUser,
            'plan_purchased_date': moment(purchaseDate).format('MM-DD-YYYY'),
            'promoId': promoId
        }
        let sRes = await buySubscription(subscribeDataToSend);
        setPromoId('')
        console.log('sRes Data',sRes)
        if(sRes && sRes.success){
            
            setSubscriptionHistorySignal(true);
            let cust_id =user.customer.id;
            let planDetails = {}
            total_minutes = parseInt(total_minutes);
            planDetails['plan_id'] = plan_id;
            planDetails['plan_name'] = plan_name;
            planDetails['plan_purchased_date'] = new Date();
            planDetails['total_minutes'] = total_minutes;
            planDetails['total_seconds'] = total_minutes*60;
            planDetails['time_used'] = 0;
            planDetails['invoice_id'] = sRes.data.latest_invoice;
            planDetails['subscription_id'] = sRes.data.id;
            planDetails['discount'] = discount;
            planDetails['status'] = sRes.data.status;
            setpromoApplied(sRes.promo_code_applied)
            if(subscriptionHistory && subscriptionHistory.length > 0){
            /* 
            code edited to prevent saving subscription history in customer table
            @author : Vinit
             */
                await CustomerApi.updateCustomer(user.customer.id,{"subscription":planDetails})
                // await CustomerApi.updateCustomer(user.customer.id,{"subscription":planDetails,"subscription_history":subscriptionHistory})
                
            }else{
                await CustomerApi.updateCustomer(user.customer.id,{"subscription":planDetails})
            }
            await refetch()
            openNotificationWithIcon("success","Success",sRes.messageToDisplay)
            let temp = [];
            setStartClicked(temp);

            let activePlan = plans.find(o => o.id === plan_id);
            // console.log("activePlan",activePlan)

            setActivePlanId(plan_id);
            let activePlanData = {...activePlan}
            activePlanData['total_amount'] = parseFloat(activePlanData.price.unit_amount/100)-(0.05 * parseFloat(activePlanData.price.unit_amount/100)).toFixed(2) 
            setActiveSubscription(activePlan);
            setIsPlanAvailable(true);
            setShowBuyMessage(false);
            setSubscriptoinModalVisible(false);
            setPlans([...plans]);

        }else if(sRes && sRes.success == false){            
            let new_data = subscriptionHistory
            let purchaseDate  = moment().format('MM/DD/YYYY hh:mm a');
            let planDetails = {}
            total_minutes = parseInt(total_minutes);
            planDetails['plan_id'] = plan_id;
            planDetails['plan_name'] = plan_name;
            planDetails['plan_purchased_date'] = purchaseDate;
            planDetails['total_minutes'] = total_minutes;
            planDetails['total_seconds'] = total_minutes*60;
            planDetails['time_used'] = 0;
            planDetails['invoice_id'] = sRes.data.latest_invoice;
            planDetails['subscription_id'] = sRes.data.id;
            planDetails['discount'] = discount;
            planDetails['status'] = 'Pending';
            new_data.push(planDetails)
            /* 
            code commented to prevent saving subscription history in customer table
            @author : Vinit
             */
            //await CustomerApi.updateCustomer(user.customer.id,{"subscription_history":new_data})
            await refetch()
            openNotificationWithIcon("error","Error",sRes.messageToDisplay)
            let temp = [];
            setStartClicked(temp)
            setShowBuyMessage(false);

        }
    }


    const cancelPendingSubscriptionWithId = async(customer_id,invoice_id) =>{
        console.log('customer_id>>>>>>>>',customer_id,invoice_id)
        let cancelResult = await cancelPendingSubscription({'customer_id':customer_id,'invoice_id':invoice_id,'liveUser':liveUser});
        console.log('cancelResult>>>>>>',cancelResult)
        openNotificationWithIcon("success","Success","Subscription successfully cancelled.")
        await refetch()
    }

    /**
     * To handle tobuy subscription with promocode
     * @params : no params
     * @author : Sahil Sharma
     **/
    const handleTypePromoCode = async(e, name)=>{
        //console.log('On change event value',e, name)
        let coupondata;
        if(e !== null && e.value !== undefined && e.value !== null && e.value !== '' ){
            setPromoCode(e.value)
            setPromoAppliedFor(name)
            if(promoData.length>0){
                coupondata = promoData.find(o => o.promo_code === e.value);
                if(coupondata ){
                    setPromoId(coupondata.promo_id)
                }
            }
        }else{
            setPromoCode('')
            setPromoAppliedFor('')
            setPromoId('')
        }
    }

    function calculatePar(price){
        let finalprice = parseFloat(price)-(0.05 * parseFloat(price))
        return '$'+finalprice.toFixed(2);
    }


    return (
    	<div className="col-12 w-100 ">
            <Row>

                <Col md="12 mt-5 p-5" className="cKkaYX"> 
                    {isLoading &&  
                        <> 
                            <Col md="12" className="px-4 pt-2 text-center"> 
                                <Loader height="100%" className="mt-5" />
                            </Col>
                            <Col md="12" className="px-4 pb-5 pt-3 text-center"> 
                                <h3>Finding active subscription ...</h3>
                            </Col>
                        </>
                    }

                    {!isLoading && !isPlanAvailable &&
                        <div className="divarea text-center">
                            <Row className="justify-content-center">
                            
                            {!isLoading &&
                                <>
                                    {plans && plans.length === 0
                                        ?
                                        <h3 className="py-5">Coming soon...</h3>
                                        :
                                        <>
                                            <Col xs={12} md={12} className="mb-5 text-center">
                                                <h1><b>Ready to start with Geeker?</b></h1>
                                                <h5>Choose the package that suits you.</h5>
                                            </Col>
                                            { showBuyMessage ? 
                                                <Col xs={12} md={12}>
                                                    <Alert md={12} message="Buying subscription may take upto 1-2 minutes. Please be patient." />
                                                </Col>
                                                : '' 
                                            }


                                        <Row className="col-12" >
                                            {
                                                //refinePlans.map((plans, type)=>{
                                                Object.keys(refinePlans).map(function (type) {
                                                    return (
                                                        <Col xs={12} 
                                                        sm={12} 
                                                        md={12} 
                                                        lg={7} className="marginAuto">
                                                            <h3 className="py-5">
                                                                {(type == "Business")? type + "Plans":"Pay as you go"}
                                                            </h3>
                                                            <Row>
                                                        { refinePlans[type].map((p, idx)=>{
                                                            return (
                                                            
                                                            <Col 
                                                                xs={12} 
                                                                sm={12} 
                                                                md={12} 
                                                                lg={6} 
                                                                className={"font-nova" + (p.id === activePlanId ? 'active-plan' : '')}
                                                                key={idx+1}
                                                            >
                                                                <Row className="mb-5 pricing-block mr-1 px-2 py-5 text-center " >
                                                                    <Col xs={12}>
                                                                        <h6><span className='subscriptionHeading'>{p.name}</span></h6>
                                                                        {/* {p.metadata && p.metadata.reg_price &&
                                                                            <h2> {getSavePrice(p.price.unit_amount,p.metadata.reg_price)}% </h2>
                                                                        } */}
                                                                        {type == "Business" && 
                                                                            <>
                                                                            <Row className="">
                                                                                <Col xs={12} className="mb-3">
                                                                                    <span className='price-heading'>
                                                                                        {p.price.currency === 'usd' ? '$' : p.price.currency}{(p.price.unit_amount/100)}
                                                                                    </span>
                                                                                </Col>
                                                                                {/* {p.metadata && p.metadata.reg_price &&
                                                                                    <>
                                                                                    <Col xs={12} className="price-number">
                                                                                        Reg. {p.price.currency === 'usd' ? '$' : p.price.currency}{p.metadata.reg_price}
                                                                                        </Col>
                                                                                    </>
                                                                                }
                                                                                <Col xs={12} className="price-number">
                                                                                    <h5>
                                                                                        You pay: {p.price.currency === 'usd' ? '$' : p.price.currency}{(p.price.unit_amount/100)}
                                                                                    </h5>
                                                                                </Col>
                                                                                
                                                                                {p.metadata && p.metadata.reg_price &&
                                                                                    // <Col xs={12} className="price-number my-2">
                                                                                    //     <h5>
                                                                                    //         You save: {getSavePrice(p.price.unit_amount,p.metadata.reg_price)}%
                                                                                    //     </h5>
                                                                                    // </Col>
                                                                                    <Col xs={12} className="price-number my-2">
                                                                                        <h5>
                                                                                            You save: {p.metadata.discount}%
                                                                                        </h5>
                                                                                    </Col>
                                                                                } */}
                                                                            </Row>
                                                                            </>
                                                                        }
                                                                        {/* {type == "Individual" &&
                                                                            <Row className="mt-3">
                                                                                <Col xs={12} className="price-number">
                                                                                    <h1 style={{marginTop:"1.2em", marginBottom:'1.4em'}}> {p.price.currency === 'usd' ? '$' : p.price.currency}{(p.price.unit_amount/100)} </h1>
                                                                                </Col>
                                                                            </Row>
                                                                        }
                                                                        {p.description &&
                                                                           <p> Monthly </p> 
                                                                        } */}
                                                                        
                                                                        {/* {p.description &&
                                                                           <p> {p.description} </p> 
                                                                        } */}
                                                                    </Col>
                                                                    {/* {p.description &&
                                                                        <Col xs={12} className="price-desc">
                                                                            <p>
                                                                                {p.description}
                                                                            </p> 
                                                                        </Col>
                                                                    } */}

                                                                    <Col xs={12} className="price-key-features">
                                                                            {p.metadata.key_features.map(function(key_f,new_idx){
                                                                            
                                                                                return <p key={new_idx}> <span>&#10003;</span> {Parser(p.metadata.key_features[new_idx])}</p>                                                                         
                                                                            })}
                                                                    
                                                                        {p.metadata.key_features_submenu && 
                                                                            <>
                                                                                    
                                                                                {Object.keys(p.metadata.key_features_submenu).map(function (new_idx) {
                                                                                    return (
                                                                                        <>
                                                                                        <p key={new_idx}> <span>&#10003;</span> {Parser(new_idx)}</p> 
                                                                                
                                                                                        <ul>
                                                                                        { p.metadata.key_features_submenu[new_idx].map((li)=>{
                                                                                            return(
                                                                                                <li>{Parser(li)}</li>
                                                                                            )
                                                                                        })}
                                                                                        </ul>  
                                                                                        </>
                                                                                    )                                                        
                                                                                })}
                                                                            
                                                                            </>
                                                                        }
                                                                    </Col>
                                                                    <Col md={12} className='p-0 mt-2 mb-3'>
                                                                        {p.metadata && p.metadata.reg_price &&
                                                                            <>
                                                                            {/* <Col className="price-number"> */}
                                                                                <span className='reg-pay mr-10'>Reg. <span className='strike-through'>{p.price.currency === 'usd' ? '$' : p.price.currency}{p.metadata.reg_price}</span></span>
                                                                            {/* </Col> */}
                                                                            </>
                                                                        }
                                                                        {/* <Col className="price-number"> */}
                                                                            <span className='reg-pay boldHeading'>
                                                                                You pay: {p.price.currency === 'usd' ? '$' : p.price.currency}{(p.price.unit_amount/100)}
                                                                            </span>
                                                                        {/* </Col> */}
                                                                    </Col>
                                                                    <Col md={12} className="mb-3">
                                                                        <span className='you-save'>You save: {getSavePrice(p.price.unit_amount,p.metadata.reg_price)}%</span>
                                                                    </Col>
                                                                        <>
                                                                            <Col md ={12}>
                                                                                <p className='flat-p'> Get flat 5% off on buy new subscription using promocode</p>
                                                                            </Col>
                                                                            <Col md ={12} className="mb-2 " id={p.name}>
                                                                                <Select 
                                                                                    className={"subscription-dropdown"}
                                                                                    value={promoAppliedFor!=p.name?"Select Promocode":promoCodes.filter(option => 
                                                                                    option.value === promoCode)} 
                                                                                    placeholder="Select Promocode" 
                                                                                    options={promoCodes} 
                                                                                    isClearable={true} 
                                                                                    onChange={(e) => handleTypePromoCode(e, p.name)}>
                                                                                </Select>
                                                                            </Col>
                                                                            { promoId && promoId.length > 0 && promoAppliedFor==p.name &&
                                                                                <>
                                                                                <Row md={12}>
                                                                                    <Col md ={12} className="mb-2" style={{color: "green"}}>
                                                                                        Promocode applied successfully
                                                                                    </Col>
                                                                                    <Col md ={12} className="o-cost" style={{
                                                                                            marginTop: "13px",
                                                                                            fontSize: "15px",
                                                                                            marginLeft: "2px"
                                                                                        }}>
                                                                                        <span>Subscription cost:  </span>
                                                                                        <span style={{textDecoration: "line-through"}}>
                                                                                            {p.price.currency === 'usd' ? '$' : p.price.currency}{(p.price.unit_amount/100)}
                                                                                        </span>
                                                                                    </Col>
                                                                                    <Col md ={12} className="n-cost mb-2" style={{
                                                                                            fontSize: "15px",
                                                                                            marginLeft: "2px",
                                                                                            fontSize: "15px"
                                                                                        }}>
                                                                                            <span>You pay:  </span>
                                                                                            <span style={{color: "green"}}>{calculatePar((p.price.unit_amount/100))}</span>
                                                                                    </Col>
                                                                                </Row>
                                                                                </>
                                                                            }
                                                                        </>
                                                                    
                                                                    <Col xs={12} className=" m-0 p-0">
                                                                        {p.id === activePlanId
                                                                            ?
                                                                                <Button 
                                                                                    className="btn app-btn" 
                                                                                    disabled={true}
                                                                                >
                                                                                    <span/>Active
                                                                                </Button>
                                                                            :
                                                                                <Button 
                                                                                    className="btn app-btn sub-btn mt-3" 
                                                                                    onClick={()=>buyPlanInit(p.id, p.name,p.price.id,p.metadata.total_minutes,p.metadata.discount)}
                                                                                    disabled={startClicked.length > 0}
                                                                                >
                                                                                    <span/>
                                                                                    {console.log("startClicked::::: ", startClicked, startClicked.indexOf(p.id))}
                                                                                    {startClicked.indexOf(p.id) !== -1 
                                                                                        ?
                                                                                            <Spin/>
                                                                                        :
                                                                                            <>Unlock</>
                                                                                    }
                                                                                </Button>
                                                                        }
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                            
                                                        );
                                                        })}
                                                        </Row>
                                                    </Col>
                                                    );
                                                })
                                            }</Row>
                                        </>  
                                    }
                                </>
                            }
                        </Row> 
                        </div>
                        
                    }
                    {!isLoading && isPlanAvailable &&
                        <Card className="text-left">
                            <Card.Header className="bg-light-blue">
                                <h5 className="m-0 font-weight-bold">Active Subscription</h5>
                            </Card.Header>
                            <Card.Body>
                                <Card.Title></Card.Title>
                                
                                <table cellPadding="10" className="my-subscription-table">
                                    <tbody>
                                        <tr>
                                            <td>Subscription ID</td>
                                            <td width="20" className="text-center">:</td>
                                            <td>{user.customer.subscription.subscription_id}</td>
                                        </tr>
                                        <tr>
                                            <td>Subscription Name</td>
                                            <td width="20" className="text-center">:</td>
                                            <td className="text-success font-weight-bold">{activeSubscription.name}</td>
                                        </tr>
                                        <tr>
                                            <td>Total Time</td>
                                            <td width="20" className="text-center">:</td>
                                            <td>{moment.utc((user.customer.subscription.total_minutes*60)*1000).format('HH:mm:ss')}</td>
                                        </tr>
                                        <tr>
                                            <td>Time used</td>
                                            <td width="20" className="text-center">:</td>
                                            <td>{moment.utc(user.customer.subscription.time_used*1000).format('HH:mm:ss')}</td>
                                        </tr>
                                        <tr>
                                            <td>Time left</td>
                                            <td width="20" className="text-center">:</td>
                                            <td>{moment.utc(((user.customer.subscription.total_minutes*60)-user.customer.subscription.time_used)*1000).format('HH:mm:ss')}</td>
                                        </tr>
                                        <tr className="">
                                            <td>Subscription Cost</td>
                                            <td width="20" className="text-center">:</td>
                                            <td>{activeSubscription.price.currency === 'usd' ? '$' : activeSubscription.price.currency}{activeSubscription.price.unit_amount/100}</td>
                                        </tr>
                                    {promoApplied &&
                                        <tr className="">
                                            <td>You paid </td>
                                            <td width="20" className="text-center">:</td>
                                            <td>{activeSubscription.price.currency === 'usd' ? '$' : activeSubscription.price.currency}{activeSubscription.total_amount}</td>
                                        </tr>
                                    }   
                                        
                                        <tr className="">
                                            <td>Purchased date</td>
                                            <td width="20" className="text-center">:</td>
                                            <td>{moment(user.customer.subscription.plan_purchased_date).format('Do MMM, YYYY HH:mm')}</td>
                                        </tr>
                                        <tr>
                                            <td>Status</td>
                                            <td width="20" className="text-center">:</td>
                                            <td className={(user.customer.subscription.status === 'active' || user.customer.subscription.status === 'paid') ? 'text-success' : 'red-text'+"  text-capitalize"}>Active</td>
                                        </tr>

                                    </tbody>
                                </table>
                                <Button className="btn app-btn app-btn-light-blue mr-15" onClick={()=>setSubscriptoinModalVisible(true)}>
                                    <span/> 
                                    {activeSubscription.price.unit_amount === highestPlanRate &&
                                        <>Change</>
                                    }
                                    {highestPlanRate < activeSubscription.price.unit_amount &&
                                        <>Change</>
                                    }
                                    {highestPlanRate === 0 &&
                                        <>Upgrade</>
                                    }
                                    {highestPlanRate > activeSubscription.price.unit_amount &&
                                        <>Upgrade</>
                                    }
                                </Button>
                                <Button className="btn app-btn app-btn-light-blue ml-5" onClick={()=>cancelAskModalConfirmation()}><>Cancel</></Button>
                            </Card.Body>
                        </Card>
                        
                    }

                    {!isLoading && newSubscriptionHistory.length > 0 &&
                        <Card className="text-left mt-4">
                            <Card.Header className="">
                                <h5 className="m-0 font-weight-bold">Subscription History</h5>
                            </Card.Header>
                            <Card.Body className="table-responsive">
                                
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Subscription ID</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Purchased Date</th>
                                            <th>Inactive Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            newSubscriptionHistory.reverse().map((s,i)=>{
                                                return (
                                                    <tr key={i}>
                                                        <td>{s.subscription_id}</td>
                                                        <td className="text-success font-weight-bold">{(s.plan_name ? s.plan_name : "NA")}</td>
                                                        <td className="text-capitalize">{s.status} { s.status  == 'Pending' ?  <Spin/> :'' }</td>                                            
                                                        <td>{moment(s.plan_purchased_date).format('Do MMM, YYYY HH:mm')}</td>
                                                        <td>{moment(s.plan_inactive_date).format('Do MMM, YYYY HH:mm')}</td>
                                                        <td>{ s.status  == 'Pending' ? <button className="btn app-btn app-btn-super-small" onClick={()=>cancelPendingSubscriptionWithId(user.customer.id,s.invoice_id)} >Cancel</button>:''} </td>
                                                    </tr>
                                                )
                                            })
                                        }

                                    </tbody>
                                </table>
                            </Card.Body>
                        </Card>
                        
                    }
                    <Modal className="app-confirm-modal subscription-modal-outer" closable={false} footer={[
                            <button className="btn app-btn" key="submit" type="primary" onClick={()=>setSubscriptoinModalVisible(false)}>
                                Close
                            </button>
                        ]} 
                        visible={subscriptoinModalVisible} 
                    >
                        
                        <Row className="justify-content-center">
                            {isLoading &&  
                                <> 
                                    <Col md="12" className="px-4 pt-2 text-center"> 
                                        <Loader height="100%" className="mt-5" />
                                    </Col>
                                    <Col md="12" className="px-4 pb-5 pt-3 text-center"> 
                                        <h6>Loading all plans ...</h6>
                                    </Col>
                                </>
                            }
                            {!isLoading &&
                                <>
                                    {plans && plans.length === 0
                                        ?
                                        <h3 className="py-5">Coming soon...</h3>
                                        :
                                        <>
                                            <Col xs={12} md={12} className="mb-5 text-center">
                                                <h1><b>Ready to start with Geeker?</b></h1>
                                                <h5>Choose the package that suits you.</h5>
                                            </Col>
                                            <Row className="col-12">
                                            {
                                                //refinePlans.map((plans, type)=>{
                                                Object.keys(refinePlans).map(function (type) {
                                                    return (
                                                        <Col lg={7} className="marginAuto">
                                                            <h3 className="py-5 text-center">
                                                                {(type == "Business")? type + " Plans":"Pay as you go"}
                                                                
                                                            </h3>
                                                            <Row>
                                                       { refinePlans[type].map((p, idx)=>{
                                                        return (
                                                            
                                                            <Col 
                                                                xs={6} 
                                                                sm={6} 
                                                                md={4} 
                                                                lg={6} 
                                                                key={idx+1}
                                                            >
                                                                <Row className={"mb-5 pricing-block mr-3 px-2 py-5 text-center "+ (p.id === activePlanId ? 'active-plan' : '')}>
                                                                    <Col xs={12}>
                                                                        <h6><span className='subscriptionHeading'>{p.name}</span></h6>
                                                                        {/* {p.metadata && p.metadata.reg_price &&
                                                                            <h2> {getSavePrice(p.price.unit_amount,p.metadata.reg_price)}% </h2>
                                                                        } */}
                                                                        {type == "Business" && 
                                                                            <>
                                                                            <Row className="">
                                                                                <Col xs={12} className="mb-3">
                                                                                    <span className='price-heading'>
                                                                                        {p.price.currency === 'usd' ? '$' : p.price.currency}{(p.price.unit_amount/100)}
                                                                                    </span>
                                                                                </Col>
                                                                                {/* {p.metadata && p.metadata.reg_price &&
                                                                                    <>
                                                                                    <Col xs={12} className="price-number">
                                                                                        Reg. {p.price.currency === 'usd' ? '$' : p.price.currency}{p.metadata.reg_price}
                                                                                        </Col>
                                                                                    </>
                                                                                }
                                                                                <Col xs={12} className="price-number">
                                                                                    <h5>
                                                                                        You pay: {p.price.currency === 'usd' ? '$' : p.price.currency}{(p.price.unit_amount/100)}
                                                                                    </h5>
                                                                                </Col> */}
                                                                                
                                                                                {/* {p.metadata && p.metadata.reg_price &&
                                                                                    // <Col xs={12} className="price-number my-2">
                                                                                    //     <h5>
                                                                                    //         You save: {getSavePrice(p.price.unit_amount,p.metadata.reg_price)}%
                                                                                    //     </h5>
                                                                                    // </Col>
                                                                                    <Col xs={12} className="price-number my-2">
                                                                                        <h5>
                                                                                            You save: {p.metadata.discount}%
                                                                                        </h5>
                                                                                    </Col>
                                                                                } */}
                                                                            </Row>
                                                                            </>
                                                                        }
                                                                            {/* {type == "Individual" &&
                                                                                <h1 style={{marginTop:"1.9em", marginBottom:'1.8em'}}> {p.price.currency === 'usd' ? '$' : p.price.currency}{(p.price.unit_amount/100)} </h1>
                                                                            }
                                                                            {p.description &&
                                                                            <p> Monthly </p> 
                                                                            } */}
                                                                    </Col>
                                                                    {/* {p.description &&
                                                                        <Col xs={12} className="price-desc">
                                                                            <p>
                                                                                {p.description}
                                                                            </p> 
                                                                        </Col>
                                                                    } */}

                                                                    <Col xs={12} className="price-key-features">
                                                                            {p.metadata.key_features.map(function(key_f,new_idx){
                                                                            
                                                                                return <p key={new_idx}> <span>&#10003;</span> {Parser(p.metadata.key_features[new_idx])}</p>                                                                         
                                                                            })}
                                                                    
                                                                        {p.metadata.key_features_submenu && 
                                                                            <>
                                                                                    
                                                                                {Object.keys(p.metadata.key_features_submenu).map(function (new_idx) {
                                                                                    return (
                                                                                        <>
                                                                                        <p key={new_idx}> <span>&#10003;</span> {Parser(new_idx)}</p> 
                                                                                
                                                                                        <ul>
                                                                                        { p.metadata.key_features_submenu[new_idx].map((li)=>{
                                                                                            return(
                                                                                                <li>{Parser(li)}</li>
                                                                                            )
                                                                                        })}
                                                                                        </ul>  
                                                                                        </>
                                                                                    )                                                        
                                                                                })}
                                                                            
                                                                            </>
                                                                        }
                                                                    </Col>
                                                                    <Col md={12} className='p-0 mt-2 mb-3'>
                                                                        {p.metadata && p.metadata.reg_price &&
                                                                            <>
                                                                                <span className='reg-pay mr-10'>Reg. <span className='strike-through'>{p.price.currency === 'usd' ? '$' : p.price.currency}{p.metadata.reg_price}</span></span>   
                                                                            </>
                                                                        }
                                                                            <span className='reg-pay boldHeading'>
                                                                                You pay: {p.price.currency === 'usd' ? '$' : p.price.currency}{(p.price.unit_amount/100)}
                                                                            </span>
                                                                    </Col>
                                                                    <Col md={12} className="mb-3">
                                                                        <span className='you-save'>You save: {getSavePrice(p.price.unit_amount,p.metadata.reg_price)}%</span>
                                                                    </Col>
                                                                    
                                                                    
                                                                    <Col xs={12}>

                                                                        {p.id === activePlanId && activePlanEmpty === false &&
                                                                         
                                                                                <Button 
                                                                                    className="btn app-btn sub-btn mt-3" 
                                                                                    disabled={true}
                                                                                >
                                                                                    <span/>Active
                                                                                </Button>
                                                                        }
                                                                         { (activePlanEmpty || p.id !== activePlanId) &&
                                                                                <Button 
                                                                                    className="btn app-btn sub-btn mt-3" 
                                                                                    onClick={()=>buyPlanInit(p.id, p.name,p.price.id,p.metadata.total_minutes,p.metadata.discount)}
                                                                                    disabled={startClicked.indexOf(p.id) !== -1}
                                                                                >
                                                                                    <span/>
                                                                                    {startClicked.indexOf(p.id) !== -1 
                                                                                        ?
                                                                                            <Spin/>
                                                                                        :
                                                                                            <>Unlock</>
                                                                                    }
                                                                                </Button>
                                                                        }
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                            
                                                        );
                                                        })}
                                                        </Row>
                                                        
                                                        </Col>
                                                    );
                                                })
                                            }</Row>
                                        </>  
                                    }
                                </>
                            }
                        </Row>   
                    </Modal>

                    <Elements stripe={stripePromise}>
                        <AddCardForm user={user} cardsInfo={cardInfoUpdated} setCardsInfo={setCardInfoUpdated} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setNewCardAdded={setNewCardAdded}/>     
                    </Elements>

                    
                </Col>
            </Row>
    	</div>
  	);
};


export default Subscription;