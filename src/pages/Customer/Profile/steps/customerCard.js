import React, {useState,useEffect} from 'react';
import styled from 'styled-components';
// import { Row, Col} from 'antd';
// import { useAuth } from 'context/authContext';
// import { useHistory } from 'react-router-dom';
import * as CustomerApi from '../../../../api/customers.api';
import * as CommonFunctions from '../../../../utils/'
// import {Button} from 'react-bootstrap';
// import { openNotificationWithIcon } from '../../../../utils';
// import mixpanel from 'mixpanel-browser';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import MyCheckoutForm from './checkoutForm';
import { STRIPE_KEY,STRIPE_TEST_KEY } from '../../../../constants';

const  CustomerCard =  ({user,value,onNext,onPrev,isModalOpen,setIsModalOpen, newCardAdded, setNewCardAdded, showCards,setDisableButton}) => {
  // const formRef = useRef();
  const customer = (user ? user.customer : {})
  // const history = useHistory()
  const [cardsInfo,setCardsInfo] = useState([])
  let liveUser = CommonFunctions.isLiveUser(user)
  const stripePromise = liveUser ? loadStripe(STRIPE_KEY) : loadStripe(STRIPE_TEST_KEY)

  useEffect(()=>{
      if(user){
        fetchMyCardsInfo()
      }
    },[user])

  async function fetchMyCardsInfo() {
     if(user && user.customer && user.customer.stripe_id !== ""){
          const customer_info  = await CustomerApi.getStripeCustomerCardsInfo({
              liveUser:liveUser,
              stripe_id: user.customer.stripe_id,
          })
          setCardsInfo(customer_info.data)
          console.log('customer_info.data :::',customer_info.data)
      }

  }
  return (
    <div>
        <SectionEmail>                  
            <Elements stripe={stripePromise}>
                <MyCheckoutForm user={user} values={customer} onNext={onNext} onPrev={onPrev} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}  cardsInfo={cardsInfo} setCardsInfo={setCardsInfo} newCardAdded={newCardAdded} setNewCardAdded={setNewCardAdded} fetchMyCardsInfo={fetchMyCardsInfo} showCards={showCards} setDisableButton={setDisableButton}/>
            </Elements>
        </SectionEmail>

       
    </div>
  );
};

/*const flexedDiv = styled.div`
  display:flex;
  justify-content:flex-around;

`*/

const SectionEmail = styled.section`
  width:100%
  margin: auto;

  & .ant-col-12{
    display:inline-block;
    width: 40%;
    margin-left: 15px;
    padding:30px;
    margin-top:20px;
  }

  & .ant-col-20{
    padding-left: 20px;
  }
`;

CustomerCard.propTypes = {};

export default CustomerCard;
