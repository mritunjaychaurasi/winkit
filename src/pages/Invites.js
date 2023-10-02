import React,{useEffect,useState} from "react";
import { Row, Col, Button, Modal, Alert } from "react-bootstrap";
import moment from "moment";
import { Form, Select, Spin } from "antd";
import FormItem from "../components/FormItem";
import { useFetchInvites, useInviteUserMutation,fetchInvites } from "../api/invite.api";
import Input from "../components/AuthLayout/Input";
import Box from "../components/common/Box";
import { useUser } from "../../src/context/useContext";
import { roleStatus } from "../utils/index";
import * as userService from '../api/users.api'
// import { IconBase } from "react-icons/lib";
const { Option } = Select;

const Invite = () => {
  const [showAction,setShowAction] = useState(false)
  const [userRole,setUserRole] = useState('user')
  const { user ,refetch} = useUser();
  const [showAdminBtn,setShowAdminBtn] = useState(false)
  const [showInviteModal, setShow] = React.useState(false);
  let { data: inviteList } = useFetchInvites();
  const [mainData,setMainData] = useState(inviteList)
  const currentInvite = inviteList?.data?.find(
    (inv) => inv.email === user.email
  );
  let [invites,setInvites] = useState([])
  let {
    mutate: inviteNewUser,
    isLoading,
    isSuccess,
    data,
  } = useInviteUserMutation();
  const [inviteData, setInviteData] = React.useState({
    email: "",
    role: "user",
  });
  const handleClose = () => {
    setShow(false);
    console.log("data :::: ",data)
    data = {}
    console.log(data)
  };
  useEffect(()=>{
    let invites = mainData?.data?.filter((inv) => inv.email !== user.email);
      if (currentInvite) {
        invites.unshift(currentInvite);
      }
      setInvites(invites)
  },[mainData])

  useEffect(()=>{
    if(user.roles.includes("admin") && inviteList){
      let inv_arr = inviteList.data.filter((ele)=>ele.parentId === user.id && ele.status === "completed")
      console.log("inv_arr ::::",inv_arr)
      if(inv_arr.length > 0){
        setShowAdminBtn(true)
      }
    }
    setMainData(inviteList)
  },[inviteList])

  React.useEffect(() => {
    if (data?.success) {
      handleClose();
    }
  }, [data, isSuccess]);

  useEffect(()=>{
    setUserRole(user.roles[0])
    if(user.roles.includes("owner")){
      setShowAction(true)
    }

  },[user])

  const onChange = (key, value) => {
    setInviteData({ ...inviteData, [key]: value });
  };
  const handleBlockEvents = async(blockStatus,id)=>{
    const data = {userId:id,blocked:blockStatus}
    await userService.updateUser(data)
    let inviteData = await fetchInvites()
    inviteList = inviteData
    setMainData(inviteData)
  }
  const onSubmit = (values) => {
    inviteNewUser(inviteData);
  };
  return (
    <>
      <Row className="col-md-12">
        <Col xs="12" className="">
          {data?.success && (
            <Alert variant="success" className="w-100">
              {data.message}
            </Alert>
          )}
          <Col
            xs="12"
            className="pt-5 pb-3 d-flex justify-content-between align-items-center"
          >

            <h1 className="large-heading">Users List</h1>

            <Button
              onClick={() => setShow(true)}
              className="btn app-btn btn btn-primary"
            >
              Invite
            </Button>
          </Col>

          <Col md="12" className="py-4 mt-1 table-responsive">
            <Col xs="12" className="table-structure-outer table-responsive">
              <table className="w-100">
                <thead>
                  <tr>
                    <th className="label-name">Email</th>
                    <th className="label-name">Status</th>

                    <th className="label-name">Invited Date</th>
                    <th className="label-name">Role</th>
                    {(showAction || showAdminBtn) && <th className="label-name">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-primary">
                    <td className="cell-value">
                      {user.roles.indexOf(roleStatus.OWNER) > -1
                        ? user.email
                        : mainData?.parent?.email}
                    </td>
                    <td className="cell-value">Completed</td>
                    <td className="cell-value">N/A</td>
                    <td className="cell-value">owner</td>
                    {(showAction || showAdminBtn) && <td className="cell-value"></td>}
                  </tr>
                  {invites?.length > 0 ? (
                    invites.map((invite, i) => (
                      <tr
                        className={
                          user.email === invite.email ? "table-active" : ""
                        }
                        key={i}
                      >
                        <td className="cell-value">
                          {user.email === invite.email
                            ? `${invite.email} (You)`
                            : invite.email}
                        </td>

                        <td className="cell-value">{invite.status}</td>
                        <td className="cell-value">
                          {moment(invite.createdAt).format(
                            "DD/MM/yyyy, H:mm a"
                          )}
                        </td>

                        <td className="cell-value">{invite.role}</td>
                        {(showAction || (userRole == 'admin' && invite.parentId == user.id)) && (user.email != invite.email) && invite.status=="completed" ? <>
                          <td  className="cell-value">
                          {invite.userId && invite.userId.blocked && invite.userId.blocked 
                            ?<Button onClick={()=>{handleBlockEvents(false,invite.userId.id)}} className="btn btn-success app-btn-small">Unblock</Button> 
                            :<Button onClick={()=>{handleBlockEvents(true,invite.userId.id)}} className="btn btn-danger app-btn-small">Block</Button>
                          }
                          </td>
                          </>
                          :
                          <>
                            {
                              showAdminBtn ? 
                              <td className="cell-value"></td>
                              :<></>
                            }
                          </>
                        }
                      </tr>
                    ))
                  ) : (
                  <>
                    {user.roles.indexOf(roleStatus.OWNER) > -1
                        ?  <></>
                      :
                      <tr>
                        <td colspan="3" align="middle">
    
                            <Box>
                              <div className="divarea">
                                <p>No data available.</p>
                              </div>
                            </Box>
    
                          </td>
                        </tr>
                    }
                  </>)}
                  
                </tbody>
              </table>
            </Col>
          </Col>
        </Col>
      </Row>
      <Modal show={showInviteModal} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Invite New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data && !data.success && (
            <Alert variant="danger" className="w-100">
              {data.message}
            </Alert>
          )}
          <Form className="items-center" onFinish={onSubmit}>
            <FormItem
              name="email"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                {
                  required: true,
                  message: "Please input your E-mail.",
                },
              ]}
            >
              <Input
                name="email"
                size="large"
                placeholder="Email"
                className="email-login-class px-3"
                onChange={(e) => onChange("email", e.target.value)}
              />
            </FormItem>
            <Select
              size="large"
              style={{ width: "100%", borderRadius: 20 }}
              placeholder="Role type"
              defaultValue={inviteData.role}
              onChange={(value) => onChange("role", value)}
            >
              <Option value="user">User</Option>
              {!user.roles ||
                (user?.roles.indexOf(roleStatus.ADMIN) === -1 && (
                  <Option value="admin">Admin</Option>
                ))}
            </Select>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={false}
              className="btn app-btn mt-3"
              disabled={!!isLoading}
            >
              <span />
              {isLoading ? <Spin /> : "Send Invite"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Invite;
