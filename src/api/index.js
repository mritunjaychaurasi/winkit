import axios from 'axios';

import { SECRET_KEY, SERVER_MEETING_URL,SERVER_URL ,CHAT_URL,CHAT_PROJECT_PRIVATE_KEY,TALK_SECRET_CHAT_KEY,TALK_PROJECT_URL,TALK_PROJECT_ID,AMBASSODOR_USERNAME,AMBASSODOR_TOKEN,AMBASSODOR_URL} from '../constants';

export const meetingApiClient = axios.create({
  baseURL : `${SERVER_MEETING_URL}/api`
})


const apiClient = axios.create({
  baseURL: `${SERVER_URL}/api`,
});

apiClient.interceptors.request.use((request) => {
  const accessToken = localStorage.getItem(SECRET_KEY);

  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }

  return request;
});

export const apiClientJitsi = axios.create({
  baseURL: `https://winkit.ml`,
});



apiClientJitsi.interceptors.request.use((request) => {
  return request;
});

export const chatApiClient = axios.create({
  baseURL:`${CHAT_URL}`
});
chatApiClient.interceptors.request.use((request) => {
  request.headers['PRIVATE-KEY'] = CHAT_PROJECT_PRIVATE_KEY;
  return request;
});

export const talkChatApiClient = axios.create({
  baseURL : `${TALK_PROJECT_URL}/v1/${TALK_PROJECT_ID}`
})

talkChatApiClient.interceptors.request.use((request) => {
  request.headers.Authorization= `Bearer ${TALK_SECRET_CHAT_KEY}`;
  return request;
});


export const ambassdorApiClient = axios.create({
  baseURL : `${AMBASSODOR_URL}/${AMBASSODOR_USERNAME}/${AMBASSODOR_TOKEN}`
})



export default apiClient;