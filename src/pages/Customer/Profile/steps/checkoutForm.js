// import {
//     Elements,
//     CardElement,
//     useStripe,
//     useElements,
//     CardNumberElement,
//     CardExpiryElement,
//     injectStripe,
//     StripeProvider,
//     CardCvcElement
// } from "@stripe/react-stripe-js";
import React, {useState,useEffect} from 'react';
import * as CustomerApi from '../../../../api/customers.api';

import { isLiveUser } from '../../../../utils';
// import mixpanel from 'mixpanel-browser';
import { Table, Modal} from 'antd';
import { Row, Col, Button} from 'react-bootstrap';

// import PhoneInput from 'react-phone-input-2';
// import styled from 'styled-components';
// import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard } from '@fortawesome/free-regular-svg-icons';
import AddCardForm from './addCardForm';


const CheckoutForm = ({user,value,onNext,onPrev,isModalOpen, setIsModalOpen, cardsInfo, setCardsInfo, newCardAdded,setNewCardAdded, showCards,setDisableButton}) => {
    // const stripe = useStripe();
    // const elements = useElements();
    // const [firstName,setFirstName] = useState('')
    // const [Address,setAddress] = useState('')
    // const [editedPhoneNumber,setEditedPhoneNumber] = useState('')
    // const [isDisabled,setIsDisabled] = useState(false)
    // const [cardsInfo,setCardsInfo] = useState([])

    // const [isModalVisible, setIsModalVisible] = useState(false);
    const liveUser = isLiveUser(user)
    const [cardInfoUpdated, setCardInfoUpdated] = useState(cardsInfo);
    const [cards_to_display,setCardsToDisplay] = useState([]);
    // const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(()=>{
        setCardInfoUpdated(cardsInfo)
    },[cardsInfo])


      const showModal = () => {
        // setIsModalVisible(true);
      };

      /*const handleOk = () => {
        setIsModalVisible(false);
      };*/

      /*const handleCancel = () => {
         setIsModalVisible(false);
      };*/

    const markCardAsDefault = (card_id) =>{        
        Modal.confirm({
          title: 'Are you sure you want to make this card as default?',
          okText: 'Yes',
          className:'app-confirm-modal',
          cancelText: 'No',
            async  onOk() {

            await CustomerApi.updateDefaultCard({
                card_id: card_id,
                customer_id: user.customer.stripe_id,
            })

            fetchMyCardsInfo()            

          },
        });
    }
    const removeCustomerCard = (card_id) =>{        
        Modal.confirm({
          title: 'Are you sure you want to remove this card?',
          okText: 'Yes',
          className:'app-confirm-modal',
          cancelText: 'No',
            async  onOk() {

            await CustomerApi.removeCard({
                card_id: card_id,
                customer_id: user.customer.stripe_id,
            })

            fetchMyCardsInfo()            

          },
        });
    }

    const columns = [
        {
            title: '',
            dataIndex: 'last4',
            render: (text, record) => (

                <>  
                   { record.default_card ?       
                        <a href="#"><FontAwesomeIcon icon={faCreditCard} className="mr-2"/>{'Credit Card ************'+text}<span className="default_card_tag">Default</span></a> 
                    : <><FontAwesomeIcon icon={faCreditCard} className="mr-2"/>{'Credit Card ************'+text} </>
                    }  
                </>
            ),
        },        
        {
            title: '',
            dataIndex: 'exp_year',
            render: (text, record) => (
                <>
                     { record.default_card
                        ?  ''
                        :    
                            <div> 
                                <Button className="btn app-btn app-btn-light-blue app-btn-small mr-md-3" onClick={(e)=>{removeCustomerCard(record.id)}} >Remove<span></span></Button> 
                                <Button className="btn app-btn app-btn-light-blue app-btn-small" onClick={(e)=>{markCardAsDefault(record.id)}}>Mark as default<span></span></Button>  
                            </div> 
                        }
                </>
            ),
           onHeaderCell: (column) => {
              return {
                onClick: () => {
                  showModal()
                }
              };
            }

        },       
      
    ];
    async function fetchMyCardsInfo() {
        // console.log("user :::",user)
        if(user && user.customer.stripe_id && user.customer.stripe_id !== ''){
            const customer_info  = await CustomerApi.getStripeCustomerCardsInfo({
                liveUser:liveUser,
                stripe_id: user.customer.stripe_id,
            })
            // console.log("customer_info.data",customer_info.data)
            if(customer_info && customer_info.data){
                setCardsInfo(customer_info.data)
                setCardInfoUpdated(()=>{
                    return [...customer_info.data]
                })
            }
        }
    }
    useEffect( ()=>{
        fetchMyCardsInfo()
    },[user])

    /*useEffect(()=>{
        console.log("newCardAdded changed")
        fetchMyCardsInfo()
    },[newCardAdded])*/
        

    


    /*const handleSubmit = async (event) => {
        // Block native form submission.
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            return;
        }

        // Get a reference to a mounted CardElement. Elements knows how
        // to find your CardElement because there can only ever be one of
        // each type of element.
        var data = {}
        const cardElement = elements.getElement(CardNumberElement);
        data['name'] = firstName
        data['address_line1'] = Address
        // data['metadata'] = {'phone_number':'675124'}

        setIsDisabled(true)

        if (isPossiblePhoneNumber(editedPhoneNumber) === false && isValidPhoneNumber(editedPhoneNumber) === false) {
            setIsDisabled(false)
            return (openNotificationWithIcon('error', 'Error', 'Phone number is not valid'));
        }
        // Use your card Element with other Stripe.js APIs
        stripe.createToken(cardElement,data).then(
            async (payload) => {
                // console.log('payload>>>>>>>>>',payload);
                if(payload['error'] != undefined){
                    openNotificationWithIcon("error","Error",payload['error']['message'])
                    setIsDisabled(false)
                    return;
                }else{                   
                    let retrieve_cust = await CustomerApi.retrieveCustomer(user.customer.id);
                    // console.log('retrieve_cust>>>>>>',retrieve_cust)
                    if(retrieve_cust.stripe_id == undefined){
                        const result_customer  = await CustomerApi.createCustomerStripe({
                            email: user.email,
                        })

                        const result_card  = await CustomerApi.addCardToCustomerStripe({
                            stripe_id: result_customer.id,
                            token_id:payload.token.id,
                            phone_number:editedPhoneNumber,
                        })

                        let temp_data = [...cardsInfo]
                        temp_data.push(result_card)
                        setCardsInfo(temp_data)

                        var customer_id = result_customer.id
                        CustomerApi.updateCustomer(user.customer.id,{"stripe_id":customer_id})

                        // mixpanel code//
                        mixpanel.identify(user.email);
                        mixpanel.track('Customer - Card details added.');
                        // mixpanel code//
                        openNotificationWithIcon("success","Success","Card details has been saved.")
                        setIsDisabled(false)
                    }
                    else{

                        const result_card  = await CustomerApi.addCardToCustomerStripe({
                            stripe_id: retrieve_cust.stripe_id,
                            token_id:payload.token.id,
                            phone_number:editedPhoneNumber,
                        })

                        let temp_data = [...cardsInfo]
                        temp_data.push(result_card)
                        setCardsInfo(temp_data)

                        openNotificationWithIcon("success","Success","Card added successfully")
                        setIsDisabled(false)

                    }
                }
                
            }          
        );    
    };

    const changeNameOnCard = (e) =>{
        setFirstName(e.target.value)
    }

    const changeAddress = (e) =>{
        setAddress(e.target.value)
    }

    const HandlePhoneNumber = (e)=>{
        setEditedPhoneNumber(`+${e}`);
    }*/
    
    useEffect(()=>{
        const seen = new Set();
        console.log("cardInfoUpdated ::::",cardInfoUpdated)
        if(cardInfoUpdated.length > 0){
            const cards_data = cardInfoUpdated.filter(el => {
            const duplicate = seen.has(el.fingerprint);
            seen.add(el.fingerprint);
            return !duplicate;
            });
        setCardsToDisplay(cards_data)
        }
    },[cardInfoUpdated])
    return (
        <Row>
            
            <AddCardForm user={user} cardsInfo={cardInfoUpdated} setCardsInfo={setCardInfoUpdated} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setNewCardAdded={setNewCardAdded} setDisableButton={setDisableButton}/>            
            {showCards &&
                <Col md="12" className="payment-methods-outer p-0 pb-4">
                    <Row>
                        <Col md="8" className="text-left pl-5 py-3">
                            <h6>Payment Methods</h6>
                        </Col>
                        <Col md="4" className="text-right pr-md--5 py-3">
                            <Button 
                                className="btn app-btn app-btn-transparent"
                                onClick={()=>setIsModalOpen(true)}
                            >
                                Add Method<span></span>
                            </Button>
                        </Col>

                        <Col md="12" className="px-4 px-md-5">
                            {cards_to_display.length > 0 
                            ?       
                            <Table dataSource={cards_to_display} columns={columns} rowKey="id" className="myCardTable" pagination={true} />
                            :
                                <table className="table empty-table">
                                    <tbody>
                                    <tr>
                                        <td colSpan="2" className="text-center">No cards available. Please click on Add Method button to add card.</td>
                                    </tr>
                                    </tbody>
                                </table>
                            }
                        </Col>
                    </Row>
                </Col>
            }
        </Row>
    );
};

export default CheckoutForm;