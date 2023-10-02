import React,{useState} from 'react';
import * as ChatServiceApi from '../api/chat.api';
import {useAuth} from './authContext';
import {useJob} from './jobContext';
import {TALK_PROJECT_ID} from '../constants'
import * as JobApi from '../api/job.api';
const ChatEngineContext = React.createContext({})

function ChatEngineProvider(props){
	const {updateUserInfo,chatUser,setChatUser} = useAuth();
	const [chatDetails,setChatDetails] = useState(null);
	const {updateJob} = useJob()
	async function newChatUser(data,id){
		try{
			let createdUser = await ChatServiceApi.createChatUser(data)
			if (createdUser?.id){
				setChatUser(createdUser)
				let dataToupdate = {"userChatId":createdUser.id,userId:id,userChatUsername:createdUser.username}
				await updateUserInfo(dataToupdate)
				return createdUser.username
			}
			else{
				// return {"success":false,"message":createdUser.message}
				console.log("user is not created::::")
			}
		}
		catch(err){
			console.log("error in context newChatUser::::",err)
		}


	}
	async function createNewChat(data,id){
		// {
	 // "title": "Chat name",
 	// 	"is_direct_chat": false
	// }
		try{
			let createdChat = await ChatServiceApi.createChat(data,chatUser)
			if(createdChat?.id){
				setChatDetails(createdChat)
				let dataToupdate = {"chatRoomId":createdChat.id}
				updateJob(id,dataToupdate)	
			}
			return createdChat
		}
		catch(err){
			console.log("error in context createNewChat ::::",err)
		}
	}

	async function getChatUser(id){
		try{
			let existingChatUser = await ChatServiceApi.getChatUser(id)
			if(existingChatUser?.id){
				setChatUser(existingChatUser)
			}

		}
		catch(err){
			console.log("error in context getChatUser ::::::",err)
		}
	}

	async function createChatUsers(data){
		try{
			let createdChatUser = await ChatServiceApi.addNewTalkChatUser(data)
			if (createdChatUser){
				let dataToupdate = {"userChatId":data.userIntId,userId:data.id,userChatUsername:data.firstName}
				await updateUserInfo(dataToupdate)
				console.log("Talk user created successfully and user table updated")
				return true
			}
			else{
				console.log("Talk user not created :::")
				return false
			}

		}
		catch(err){
			console.log("error in createChatUsers >>>",err)
		}
	}
	async function getTalkChatUser(data){
		try{
			let talkChatUser = await ChatServiceApi.getTalkChatUser(data)
			if(talkChatUser){
				return talkChatUser
			}
			else{
				return false
			}
		}
		catch(err){
			console.log("error in getChatUser ::",err)
		}
	}
	async function createTalkUserSession(talkChatUser){
		try{

			let sessionCreated = await ChatServiceApi.createUserSession(talkChatUser)
			if(sessionCreated){
				return sessionCreated
			}
			else{
				return false
				console.log("Session Not Created")
			}
		}
		catch(err){
			console.log("error in getTalkChatUsersAndCreateSession >>>",err)
		}
	}

	async function createOrGetTalkChatConversation(data){
		try{
			let conversation = await ChatServiceApi.getTalkChatConversation(data)
			if(!conversation){
				let conversationCreated = await ChatServiceApi.createTalkChatConversation(data)
				if(conversationCreated){
					let newConversation = await ChatServiceApi.getTalkChatConversation(data)
					let dataToupdate = {"chatRoomId":newConversation.id}
					await updateJob(data.id,dataToupdate)
					return newConversation
				}
				else{
					console.log("conversationCreated >>>>>>>>>",conversationCreated)
				}
			}
			console.log("conversation found")
			return conversation
		}
		catch(err){
			console.log("error in createOrGetTalkChatConversation :::",err)
		}
	}

	async function joinTalkChatConversation(data){
		try{
			let conversationInbox =  await ChatServiceApi.joinTalkChatConversation(data)
			console.log("joinTalkChatConversation >>>>",conversationInbox)
			return conversationInbox
		}
		catch(err){
			console.log("error in joinTalkChatConversation")
			return false
		}
	}

	

	return (
		<ChatEngineContext.Provider 
		value={{
				newChatUser,
				createNewChat,
				getChatUser,
				createChatUsers,
				getChatUser,
				createTalkUserSession,
				joinTalkChatConversation,
				createOrGetTalkChatConversation
			}}
			{...props} 
		/>
	);
}

function useChatEngineTools(){
	const context = React.useContext(ChatEngineContext)
	if (context === undefined) {
    	throw new Error('useChatEngineTools must be used within a chatEngineProvider');
  	}
  return context;
}

export {ChatEngineProvider,useChatEngineTools};