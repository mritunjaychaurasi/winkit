import apiClient from './index';
import { SESSION_EXPIRE_URL } from '../constants';

export async function getUsers(params) {
  return apiClient
    .get('/users', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function createUser(data) {
  return apiClient
    .post('/users', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function updateUser(data) {
  return apiClient
    .post(`/users/${data.userId}`, data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function getUsers1(params) {
  return apiClient
    .get('/users/res', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}


export async function getUserByParam(data) {
  return apiClient
    .post('/users/get_user_by_param', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
   
}

export async function updateUserByParam(data){
  console.log("updateUserByParam >>>>>>>>>>>> ",data)
  return apiClient
  .post('/users/updateUserByParam',data)
  .then(response =>{
    if(response){
      return response.data;
    }
  })
}