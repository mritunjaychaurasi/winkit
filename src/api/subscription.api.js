import apiClient from './index';
import { SESSION_EXPIRE_URL } from '../constants';


export async function getAllPlans(params) {
	return apiClient
		.get('/subscriptions', { params })
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function buySubscription(params) {
	return apiClient
		.post('/subscriptions/buy-subscription', { params })
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

export async function cancelSubscription(params) {
	return apiClient
		.post('/subscriptions/cancel-subscription', { params })
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}



export async function cancelPendingSubscription(params) {
	return apiClient
		.post('/subscriptions/cancel-pending-subscription', { params })
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}


export async function createSubscriptionHistory(params) {
	return apiClient
		.post('/subscriptions/subscription-history', {params})
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
		
}

	/**
	 * Following function is used to fetch subscrition history of a specific user.
     * @params =  customer id
	 * @response : subscription history
	 * @author : Vinit
	 */
export async function getSubscriptionHistory(params) {
	return apiClient
		.get(`/subscriptions/fetch-subscription-history`, {params})
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
				
}