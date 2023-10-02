import apiClient from './index';   
import { SESSION_EXPIRE_URL } from '../constants';

export async function create(data) {
    console.log('Data>>>>>',data)
  return apiClient
    .post('/promos', data)
    .then(response => {
      console.log('Response')
      if (response) {
        return response.data;
        // return Promise.resolve(response.data);
      }
      return Promise.reject();
    })  
}
export async function retrievePromoData(data) {
  console.log(data, '>>>data');
  return apiClient
    .post('/promos/getPromoDataByParams', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function retrieveCustomerPromoCodes(data) {
  console.log(data, '>>>data');
  return apiClient
    .post('/promos/getCustomerPromoCodes', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}



