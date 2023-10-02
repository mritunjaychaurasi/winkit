import apiClient from './index';
import { SESSION_EXPIRE_URL } from '../constants';

export async function getCustomers(params) {
	return apiClient
		.get('/customers', { params })
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function createCustomer(data) {
	return apiClient
		.post('/customers', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function retrieveCustomer(customerId) {
	return apiClient
		.get(`/customers/${customerId}`)
		.then(response => {
			if (response) {
				// console.log('response>>>>>>>>>..',response)
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function updateCustomer(customerId, data) {
	return apiClient
		.put(`/customers/${customerId}`, data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function removeCustomer(customerId) {
	return apiClient
		.delete(`/customers/${customerId}`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function createCustomerStripe(data) {
	return apiClient
		.post('/customers/add-customer-to-stripe', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function addCardToCustomerStripe(data) {
	return apiClient
		.post('/customers/add-card-to-customer', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function getStripeCustomerCardsInfo(data) {
	return apiClient
		.post('/customers/get-stripe-customer-cards', data)
		.then(response => {
			if (response) {
				return response;
			}
			return Promise.reject();
		})
		
}



export async function chargeCustomer(data) {
	console.log('data>>>>>>>>>>>',data)
	return apiClient
		.post('/customers/charge-customer', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function retrieveCharge(data) {
	console.log('data>>>>>>>>>>>',data)
	return apiClient
		.post('/customers/retrieve-charge', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function updateDefaultCard(data) {
	console.log('data>>>>>>>>>>>',data)
	return apiClient
		.post('/customers/update-default-card', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function removeCard(data) {
	console.log('data>>>>>>>>>>>',data)
	return apiClient
		.post('/customers/remove-customer-card', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function getCustomerSubscription(data) {

	return apiClient
		.post('/customers/getCustomerSubscription', data)
		.then(response => {
			console.log("SubS api response :::",response)
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function meetingEndEmails(data) {
	console.log('data>>>>>>>>>>>',data)
	return apiClient
		.post('/customers/meeting-closed-emails', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function checkIfOrganisationHasSubscription(data) {
	console.log('data>>>>>>>>>>>',data)
	return apiClient
		.post('/customers/check-organisation-subscription', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function checkCardValidation(data) {
	console.log('data>>>>>>>>>>>',data)
	return apiClient
		.post('/customers/check-card-validation', data)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}



export async function takeChargeFromCustomer(data){
	console.log("takeChargeFromCustomer ::::::::: ",data)
	return apiClient
	.post("customers/take-charge-from-customer",data)
	.then(response => {
		if(response){
			return response.data;
		}
		return Promise.reject()
	})
	
}



/**
 * Api to handle Discount from referal
 * @params : data(Type:Object)
 * @response : if have referal discount then update the referal table
 * @author : Manibha
 **/
export async function handleReferralDiscount(data){
	console.log("handleReferralDiscount ::::::::: ",data)
	return apiClient
	.post("customers/handle-referal-discount",data)
	.then(response => {
		if(response){
			return response.data;
		}
		return Promise.reject()
	})
	
}


