import React, { useEffect, useState, useRef, createRef } from "react";
import { Select, Table, Pagination, DatePicker } from "antd";
import { Row, Col } from "react-bootstrap";
import { useAuth } from "../../../context/authContext";
import { useJob } from "../../../context/jobContext";
import { useServices } from "../../../context/ServiceContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import Loader from "../../../components/Loader";
import { useBillingDetails } from "../../../context/billingDetailsContext";
import mixpanel from "mixpanel-browser";
import ReactToPrint from "react-to-print";
import Invoice from "../../../components/Result/invoice";
import { isLiveUser } from "../../../utils";
import * as BillApi from '../../../api/billingDetails.api';
const { Option } = Select;

const sortOptions = [
  <Option key={"asc"} value="asc">
    Withdrawals: Low to high
  </Option>,
  <Option key={"desc"} value="desc">
    Withdrawals: High to low
  </Option>,
];
let initialLoad = true;
let DATE_OPTIONS = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

const BillingReportTech = ({ setcurrentStep, setjobId, setType }) => {
  const { job, fetchJob } = useJob();
  const { user } = useAuth();
  let liveUser = isLiveUser(user);
  const { totalTimeSeconds, totalEarnings } = useServices();
  // let tech = user.technician;
  const [allBillings, setAllBillings] = useState([]);
  const [allBillingsWithoutFilters, setAllBillingsWithoutFilters] = useState(
    []
  );
  const [showLoader, setShowLoader] = useState(true);
  const { billingDetailsList } = useBillingDetails();
  let invoiceRefs = useRef();
  const [chargeData, setChargeData] = useState("");
  const [jobDataToPrint, setJobDataToPrint] = useState({});
  const [transactionTypeOptions, setTransactionTypeOptions] = useState([]);
  const [selectedTransactionType, setSelectedTransactionType] = useState("");
  const [selectedFilterDate, setSelectedFilterDate] = useState("");
  const [transactionSelected, settransactionSelected] = useState("All");
  const [selectedSort, setselectedSort] = useState("");
  const [totalData, setTotalCount] = useState(1);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [theDefDates, setMainDates] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState({});
  let dateFilterRef = useRef();
  const { RangePicker } = DatePicker;
  // console.log(totalTimeSeconds,">>>>")

  if (user) {
    DATE_OPTIONS["timeZone"] = user.timezone;
  }
  const runFilters = async () => {
    let filters = {};
    if (fromDate !== null && toDate !== null) {
      filters.createdAt = { $gte: fromDate, $lte: toDate };
    }
    if (transactionSelected !== "" && transactionSelected !== "All") {
      filters.transaction_type = transactionSelected;
    }

    if (transactionSelected && transactionSelected == "not set") {
      filters.transaction_type = "";
    }
    filters.customer_user_id = user.id;
    filters.page = 1;
    filters.pageSize = 10;
    // console.log('filters.>>>>>',filters)
    let detailsList = await billingDetailsList(filters);
    setAllBillings(detailsList.data);
    setTotalCount(detailsList.totalCount);
  };

  useEffect(() => {
    // console.log("toDate :::: ",toDate)
    if (initialLoad === false) {
      // console.log("inside filter runnig funcs")
      runFilters();
    }
    initialLoad = false;
  }, [transactionSelected, fromDate, toDate]);

  useEffect(() => {
    (async () => {
      let detailsList = await billingDetailsList({
        customer_user_id: user.id,
        page: 1,
        pageSize: 10,
      });
      if (detailsList.data && detailsList.data) {
        // console.log('detailsList for billing::: ',detailsList)
        invoiceRefs = detailsList.data.map(() => createRef());
        setAllBillings(detailsList.data);
        setTotalCount(detailsList.totalCount);
        setAllBillingsWithoutFilters(detailsList.data);

        const unique_transaction_type = [
          ...new Set(detailsList.data.map((item) => item.transaction_type)),
        ];
        // console.log("unique_transaction_type",unique_transaction_type)
        var filtered = unique_transaction_type.filter(function (el) {
          return el != "";
        });
        filtered.push("not set");
        setTimeout(function () {
          setTransactionTypeOptions(filtered);
          setShowLoader(false);
        }, 1000);
      } else {
        setShowLoader(false);
      }
    })();
  }, []);

  const handlePagination = async (page, pageSize) => {
    setShowLoader(true);
    // console.log("new issue ")
    setCurrentPage(page);
    let filters = {};
    filters["customer_user_id"] = user.id;
    filters["page"] = page;
    filters["pageSize"] = pageSize;

    if (fromDate !== null && toDate !== null) {
      filters.createdAt = { $gte: fromDate, $lte: toDate };
    }
    if (transactionSelected !== "" && transactionSelected !== "All") {
      filters.transaction_type = transactionSelected;
    }

    if (transactionSelected && transactionSelected == "not set") {
      filters.transaction_type = "";
    }

    let detailsList = await billingDetailsList(filters);
    setAllBillings(detailsList.data);
    setShowLoader(false);
  };
  const sortData = (val) => {
    setselectedSort(val);
    let tempArr = [...allBillings];
    if (val === "asc") {
      tempArr.sort(function (a, b) {
        return a.total_amount - b.total_amount;
      });
    } else {
      tempArr.sort(function (a, b) {
        return b.total_amount - a.total_amount;
      });
    }
    // console.log("tempArr ::: ",tempArr)
    setAllBillings(tempArr);
  };

  const handleFilterClear = () => {
    setMainDates([null, null]);

    // dateFilterRef.current.value = ""

    settransactionSelected("All");
    setselectedSort("");
    // console.log("setAllBillings :::::::::::",setAllBillings)
    setAllBillings(allBillingsWithoutFilters);
    setFromDate(null);
    setToDate(null);
  };

  const filterData = (val, type) => {
    setShowLoader(true);
    settransactionSelected(val);
    let tempArr = [];
    if (type === "transaction_type") {
      let billingData = allBillingsWithoutFilters;

      let filterDate = "";
      if (selectedFilterDate !== "") {
        filterDate = new Date(selectedFilterDate);
        filterDate = filterDate.setHours(0, 0, 0, 0);
      }

      if (val === "All") {
        setSelectedTransactionType("");
        if (filterDate) {
          filterByDateInit(filterDate);
        } else {
          // setAllBillings([...allBillingsWithoutFilters])
          setShowLoader(false);
        }
      } else {
        setSelectedTransactionType(val);
        billingData.map((b, i) => {
          if (b.transaction_type === val) {
            if (filterDate) {
              let d = new Date(b.createdAt);
              d = d.setHours(0, 0, 0, 0);
              if (filterDate === d) {
                tempArr.push(b);
              }
            } else {
              tempArr.push(b);
            }
          }
          if (i + 1 === billingData.length) {
            setAllBillings(tempArr)
            setShowLoader(false);
          }
          return true;
        });
      }
    }
    setShowLoader(false)
  };

  const filter_date = (dates) => {
    setMainDates(dates);
    if (dates != null) {
      if (dates[0] != null && dates[1] != null) {
        const start_date = moment(dates[0]).format("YYYY-MM-DD");
        const end_date = moment(dates[1]).format("YYYY-MM-DD");
        const from_dt = `${start_date} 00:00:00`;
        const to_dt = `${end_date} 23:59:59`;
        setFromDate(from_dt);
        setToDate(to_dt);
      }
    } else {
      setFromDate(null);
      setToDate(null);
    }
  };

  const hms_convert = (t) => {
    if (t) {
      let d = Number(t);
      let h = Math.floor(d / 3600);
      let m = Math.floor((d % 3600) / 60);
      let s = Math.floor((d % 3600) % 60);
      let hFormat = h <= 9 ? "0" + h : h;
      let mFormat = m <= 9 ? "0" + m : m;
      let sFormat = s <= 9 ? "0" + s : s;
      let hDisplay = h > 0 ? hFormat + ":" : "00:";
      let mDisplay = m > 0 ? mFormat + ":" : "00:";
      let sDisplay = s > 0 ? sFormat : "00";
      return hDisplay + mDisplay + sDisplay;
    } else {
      return "00:00:00";
    }
  };
  const push_to_job_detail = (e) => {
    // console.log("push_to_job_detail>>>>>>>>>",e.currentTarget.name)
    const jobId = e.currentTarget.name;
    // fetchJob(jobId)
    setjobId(jobId);
    setType("details");
    mixpanel.identify(user.email);
    if (user.userType === "technician") {
      mixpanel.track("Technician  - Job details", { JobId: jobId });
    } else {
      mixpanel.track("Customer - Job details", { JobId: jobId });
    }
    setcurrentStep(6);
  };

  /**
 * This function is updated to get the billing report data for job to show total amount in invoice according to the billing report.
 * @params : d(Type:object)
 * @response: no response
 * @author : Manibha
 **/
  const getDataToPrint = async (d) => {
	const billData =  await BillApi.getBillingDetailsByJob(d.id) 
	if(billData){
		setChargeData(billData);
	}
	await fetchJob(d.id);
	if (d && d.payment_id && d.payment_id.includes("prod_")) {
		setSubscriptionData(user.customer.subscription);
	} 
  };

  useEffect(() => {
    if (job) {
      // console.log("jobData",job)
      setJobDataToPrint(job);
    }
  }, [job]);

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      // width: '20%',
      render: (text) => (
        <span>{new Date(text).toLocaleTimeString("en-US", DATE_OPTIONS)}</span>
      ),
    },
    {
      title: "Tech",
      dataIndex: "technician_user_id",
      // width: '20%',
      render: (text) => (
        <span>
          {text
            ? (text.firstName ? text.firstName : "") +
              " " +
              (text.lastName ? text.lastName : "")
            : ""}
        </span>
      ),
    },

    {
      title: "Trans. Type",
      dataIndex: "transaction_type",
      // width: '15%'
    },
    {
      title: "Status",
      dataIndex: "transaction_status",
      // width: '30%',
      render: (text) => (
        <span>{text && text === "Processing" ? text + "..." : text}</span>
      ),
    },
    {
      title: "Withdrawals",
      dataIndex: "total_amount",
      // width: '30%',
      render: (text) => <span>{text ? "$" + text : "$0.00"}</span>,
    },
    {
      title: "Invoice",
      dataIndex: "job_id",
      // width: '30%',
      render: (text) => (
        <div className="invoice-download-btn" title="Print/Save Invoice">
          <ReactToPrint
            trigger={() => <FontAwesomeIcon icon={faPrint} />}
            content={() => invoiceRefs.current}
            onBeforeGetContent={() => getDataToPrint(text)}
            // onBeforeGetContent={(e) => changeInvoiceData(text)}
          />
          <div style={{ display: "none" }}>
            <ComponentRef text={text} ref={invoiceRefs} />
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "job_id",
      // width: '30%',
      render: (text) => (
        <span>
          <button
            className="btn app-btn app-btn-super-small normal-font"
            onClick={push_to_job_detail}
            name={text && text.id ? text.id : text}
          >
            <span></span>View job
          </button>
        </span>
      ),
    },
  ];
  const ComponentRef = React.forwardRef((props, ref) => {
    // console.log("prosp",props)
    return (
      <div ref={ref}>
        <Invoice
          chargeData={chargeData}
          job={jobDataToPrint}
          subscriptionData={subscriptionData}
          billingData={allBillings}
        />
      </div>
    );
  });

  /*const filterByDate = (e) => {
    	if(e.target.value){
    		filterByDateInit(e.target.value)
    	}else{
    		setSelectedFilterDate('')
    		setAllBillings(allBillingsWithoutFilters)
    	}
    }*/

  const filterByDateInit = (d) => {
    setShowLoader(true);
    setSelectedFilterDate(d);
    if (allBillingsWithoutFilters.length > 0) {
      let tempData = [];
      let nowDate = new Date(d);
      nowDate = nowDate.setHours(0, 0, 0, 0);

      allBillingsWithoutFilters.map((b, i) => {
        let d = new Date(b.createdAt);
        d = d.setHours(0, 0, 0, 0);
        if (nowDate === d) {
          if (selectedTransactionType && selectedTransactionType !== "") {
            if (b.transaction_type === selectedTransactionType) {
              tempData.push(b);
            }
          } else {
            tempData.push(b);
          }
        }
        if (i + 1 === allBillingsWithoutFilters.length) {
          setAllBillings(tempData);
          setShowLoader(false);
        }
        return true;
      });
    } else {
      setShowLoader(false);
    }
  };

  return (
    <>
      <Col xs="12" className="">
        <Loader
          height="100%"
          className={showLoader ? "loader-outer" : "d-none"}
        />

        <Col xs="12" className="pt-5 pb-3">
          <h1 className="large-heading">Billing Reports</h1>
        </Col>

        <Col xs="12" className="">
          <Col xs="12" className="py-3 div-highlighter">
            <Row>
              <Col md="4" className="pl-5">
                <span className="d-block label-total-name">
                  Available Balance
                </span>
                <span
                  className="d-block label-total-value"
                  title="Coming Soon..."
                >
                  $0.00
                </span>
              </Col>
              <Col md="4" className="pl-5 div-highlighter-border">
                <span className="d-block label-total-name">
                  Total Amount{" "}
                  {user && user.userType === "technician" ? "Earned" : "Billed"}
                </span>
                <span className="d-block label-total-value">
                  ${totalEarnings != null ? totalEarnings : 0}
                </span>
              </Col>
              <Col md="4" className="pl-5">
                <span className="d-block label-total-name">
                  Total Amount of Time
                </span>
                <span className="d-block label-total-value">
                  {hms_convert(totalTimeSeconds)}
                </span>
              </Col>
            </Row>
          </Col>
        </Col>

        <Col md="12" className="filters-outer py-4 mt-2">
          <Row>
            <Col xs="12" md="4" lg="3">
              <label className="label-name">Transaction Date</label>
              <RangePicker
                onCalendarChange={filter_date}
                value={theDefDates}
                className="form-control bottom-border-only"
              />
            </Col>
            <Col xs="12" md="4" lg="3">
              <label className="label-name">Transactions Type</label>
              <Select
                style={{ width: "100%" }}
                placeholder="Transactions Type"
                value={transactionSelected}
                onChange={(e) => {
                  filterData(e, "transaction_type");
                }}
                className="form-control bottom-border-only filter-element"
              >
                <option key={"All"} value={"All"}>
                  All
                </option>
                {transactionTypeOptions.map((t) => {
                  return (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  );
                })}
              </Select>
            </Col>
            <Col xs="1"></Col>
            <Col xs="12" md="3" className="float-right">
              <label className="label-name">Sort By</label>
              <Select
                style={{ width: "100%" }}
                placeholder="Sort By"
                onChange={sortData}
                value={selectedSort}
                className="form-control bottom-border-only filter-element"
              >
                {sortOptions}
              </Select>
            </Col>
            <Col className="text-right" md="2">
              <label className="label-name"> &nbsp; </label> <br />
              <button
                onClick={handleFilterClear}
                className="app-btn app-btn-super-small"
              >
                {" "}
                <span></span> Clear{" "}
              </button>
            </Col>
          </Row>
        </Col>

        <Col md="12" className="py-4 mt-1 table-responsive">
          <Col xs="12" className="table-structure-outer table-responsive">
            {/*<Table>
		            		<thead>
			            		<tr>
			            			<th width="30"></th>
			            			<th className="label-name">Date</th>
			            			<th className="label-name">Tech</th>
			            			<th className="label-name">Trans. Type</th>
			            			<th className="label-name">Status</th>
			            			<th className="label-name">Withdrawals</th>
			            			<th width="30"></th>
			            		</tr>
			            	</thead>
			            	<tbody>
		            		{ 
		            			allBillings.map((d,i)=>{
		            				return (
		            					<tr key={i}>
				            				<td width="30"></td>
				            				<td className="cell-value first-value">{moment(d.date).format('DD/MM/YYYY')}</td>
				            				<td className="cell-value">{d.technician}</td>
				            				<td className="cell-value">{d.trans_type}</td>
				            				<td className="cell-value">{d.Status}</td>
				            				<td className="cell-value">${(d.Amount ? d.Amount : 0)}</td>
				            				<td className="cell-value green-text font-weight-bold last-value">${(d.Balance ? d.Balance : 0)}</td>
				            				<td width="30"></td>
				            			</tr>
		            				)
		            			})
		            		}
		            		</tbody>
		            	</Table>*/}
            <Col xs="12" className="ant-table-structure-outer table-responsive">
              <div className="highlight-background"></div>
              <Table
                bordered={false}
                pagination={false}
                columns={columns}
                dataSource={allBillings}
              />
              {totalData !== 0 && (
                <Pagination
                  style={{ float: "right", "margin-right": "40px" }}
                  current={currentPage}
                  onChange={handlePagination}
                  total={totalData}
                />
              )}
            </Col>
          </Col>
        </Col>
      </Col>
    </>
  );
};
export default BillingReportTech;
