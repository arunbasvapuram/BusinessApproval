$(".loading").show();
$(document).ready(function () {
  $(".loading").hide();

  let currentFinancialYearval = getCurrentFinancialYear();
  let currentFinancialYear =
    "FY" + currentFinancialYearval.toString().substr(-2);
  let prevFinancialYear =
    "FY" + (currentFinancialYearval - 1).toString().substr(-2);
  let nextFinancialYear =
    "FY" + (currentFinancialYearval + 1).toString().substr(-2);
  $("#financialYearSelect").append(
    '<option value="' +
      currentFinancialYear +
      '" selected>' +
      currentFinancialYear +
      "</option>" +
      '<option value="' +
      nextFinancialYear +
      '">' +
      nextFinancialYear +
      "</option>"
  );

  $("hr").remove();
  var footerHtml = $("footer").html();
  $(".dol-footer")
    .removeAttr("style")
    .html("<div class='row'>" + footerHtml + "</div>");
  $("footer").remove();
  $("input[name=optradio]").on("change", function () {
    validateForm();
  });
  setOffering();

  $("input[type=checkbox][name=showCols]").change(function () {
    if ($(this).is(":checked")) {
      showColumn(this.value);
    } else {
      hideColumn(this.value);
    }
  });
});

//#region  load scripts
var jsFilePaths = [
  "https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js",
  "https://cdn.datatables.net/buttons/1.5.6/js/dataTables.buttons.min.js",
  "https://cdn.datatables.net/buttons/1.5.6/js/buttons.html5.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.5/xlsx.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.11.0/underscore-min.js",
  "../SiteAssets/js/libs/bootbox.min.js",
  "../SiteAssets/js/libs/dataTables.checkboxes.min.js",
  "../SiteAssets/js/libs/jqueryUI/jquery-ui.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.2/FileSaver.min.js",
];
function loadJSSet() {
  if (jsFilePaths.length > 0) {
    loadJs(jsFilePaths.splice(0, 1), loadJSSet);
  } else {
    getNSetUserId();
  }
}
//#endregion
//#region variables
var currentLoggedInUserEmail = "";
var currentContext = SP.ClientContext.get_current();
var currentWeb = currentContext.get_web();
var currentUser = currentWeb.get_currentUser();
var siteUrl = _spPageContextInfo.webAbsoluteUrl;
var currentUserId = 0;
var isAdminAccess = false;
var totalData = 0;
var noOfRows = 0;
var userApprovalFor = [];
var selectedRegion = "";
var portfolio = "";
var selectedStatus = "";
var fy = "";
var selectedOffering = "";
var selectedSourcing ="";
var checkSourcing = false;
//#endregion

window.onload = function () {
  $(".dashboardContainer").hide();
  loadJSSet();
};
//#region user
$.urlParam = function (name) {
  var results = new RegExp("[?&]" + name + "=([^&#]*)").exec(
    window.location.href
  );
  if (results == null) {
    return null;
  } else {
    return decodeURI(results[1]) || 0;
  }
};
function getNSetUserId() {
  currentContext.load(currentUser);
  currentContext.executeQueryAsync(
    Function.createDelegate(this, this.userContextLoaded),
    Function.createDelegate(this, this.userContextLoadFailed)
  );
}

function userContextLoadFailed() {
  alert("Could not login user");
}

function userContextLoaded() {
  currentLoggedInUserEmail = currentUser.get_email();
  currentUserId = currentContext.get_web().get_currentUser().get_id();
  checkIfUserIsApproval();
}

function checkIfUserIsApproval() {
  var trckQueryDataUrl =
    siteUrl +
    "/_api/web/lists/getbytitle('Approvers')/items?$select=*,Approvers/Title,Approvers/EMail&$expand=Approvers/Id&$filter= Approvers/EMail eq '" +
    currentLoggedInUserEmail +
    "'";
  loadListItems({
    url: trckQueryDataUrl,
    success: function (data) {
      if (data.length === 0) {
        $('.dropdown-menu [href$="?team=1"]').remove();
        $(".loading").hide();
        bootbox.alert(
          "You are not authorized to view this form!!!",
          function () {
            window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
          }
        );
      } else if (!orderBoardLinkAdded) {
        $(".loading").hide();
        bootbox.alert(
          "You are not authorized to view this form!!!",
          function () {
            window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
          }
        );
      } else {
        $(".dashboardContainer").show();
        $("#dashboardHeader").text("Demand Supply Analysis");
        $(".uploadSection").css("margin-left", "-10px");
        $(".recordsInserted").css("margin-left", "0px");
      }
    },
  });
}

//#endregion

//#region Fetch Records- to modify
function validateForm() {
  selectedRegion = "";
  selectedOffering = "";
  selectedSourcing ="";
  portfolio = $("#portfolioSelect").val();
  fy = $("#financialYearSelect").val();
  subcategory = $("#reportSelect :selected").val();
  //var offeringCheck = $("#offeringSelect :selected").val();
  selectedOffering = $("#offeringSelect :selected").val();
  selectedOffering = selectedOffering.replace("&", "%26");
  $.each($("input[name='region']:checked"), function () {
    selectedRegion == ""
      ? (selectedRegion = "Region eq'" + $(this).val() + "'")
      : (selectedRegion =
          selectedRegion + " or Region eq '" + $(this).val() + "'");
  });
  checkSourcing = $("#sourcingCheck4").is(":checked");
  if (checkSourcing) {
    selectedSourcing = "All";
  } else {
    $.each($("input[name='sourcing']:checked"), function () {
      selectedSourcing == ""
        ? (selectedSourcing = "Sourcing eq'" + $(this).val() + "'")
        : (selectedSourcing =
            selectedSourcing + " or Sourcing eq '" + $(this).val() + "'");
    });
  }
  var isValid =
    selectedRegion == "" ||
    portfolio == "" ||
    fy == "" ||
    selectedOffering == "" || selectedSourcing == "";
  if (isValid) {
    $("#validationError").attr("hidden", false);
    //alert('this is validate Form');
  } else {
    $("#validationError").attr("hidden", true);
    //alert('this is fetchRecords');
    fetchRecords();
  }
}
function fetchRecords() {
  $(".loading").show();
  $("#recordDiv").attr("hidden", true);
  fetchDemandList();
}

function fetchDemandList() {
  var DemandListURL = "";
  var filter = "OP eq '" + portfolio + "' and(" + selectedRegion + ") and ";
  if (selectedOffering != undefined && selectedOffering != "" ) {
    filter += "(Offering eq '" +selectedOffering +"') and ";
  }
  if (!checkSourcing) {
    filter += "(" + selectedSourcing + ") and ";
  }

  filter += "substringof('" +fy +"',Demand_Period)&$top=30000";
  DemandListURL = "/_api/web/lists/GetByTitle('OrderBoardDemand')/items?$filter="+filter;
  console.log(
    "DemandListURL:",
    _spPageContextInfo.webAbsoluteUrl + DemandListURL
  );
     
  var objHeaders = {
    type: "GET",
    headers: {
      accept: "application/json;odata=verbose",
    },
    async: false,
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
  };

  // fetch("http://localhost:8080/orderBoardDemand_Result.json", {
  //   mode: "cors",
  //   headers: { "Access-Control-Allow-Origin": "*" },
  // })
  fetch(_spPageContextInfo.webAbsoluteUrl + DemandListURL, objHeaders)
    .then(function (response) {
      console.log("return result demand");
      return response.json();
    })
    .then(function (json) {
      console.log(json);
      var demandResults = json.d.results;
      cleanseData(demandResults);
    })
    .catch(function (ex) {
      $(".loading").hide();
      $("#recordDiv").attr("hidden", false);
      $("#tableDiv").attr("hidden", true);
      console.log("getOrderBoardDemandListItem error " + ex.message);
    });
}

function fetchSupplyList(demandResults) {
  var SupplyListURL = "";
  var filter = "OP eq '" + portfolio + "' and(" + selectedRegion + ") and ";
  if (selectedOffering != undefined && selectedOffering != "" ) {
    filter += "(Offering eq '" +selectedOffering +"') and ";
  }
  if (!checkSourcing) {
    filter += "(" + selectedSourcing + ") and ";
  }
  filter += "substringof('" +fy +"',Joining_Period)&$top=30000";
  SupplyListURL ="/_api/web/lists/GetByTitle('OrderBoardSupply')/items?$filter="+filter;
  console.log(
    "SupplyListURL:",
    _spPageContextInfo.webAbsoluteUrl + SupplyListURL);

  var objHeaders = {
    type: "GET",
    headers: {
      accept: "application/json;odata=verbose",
    },
    async: false,
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
  };

  //fetch("http://localhost:8080/orderBoardSupply_result.json", { mode: "cors" })
  fetch(_spPageContextInfo.webAbsoluteUrl + SupplyListURL, objHeaders)
    .then(function (response) {
      console.log("return result supply");
      return response.json();
    })
    .then(function (json) {
      console.log(json);
      var supplyResults = json.d.results;
      populateTable(demandResults, supplyResults);
    })
    .catch(function (ex) {
      $(".loading").hide();
      $("#recordDiv").attr("hidden", false);
      $("#tableDiv").attr("hidden", true);
      console.log("getOrderBoardSupplyListItem error " + ex.message);
    });
}

function populateTable(demandResult, supplyResults) {
  let results = {
    demand: demandResult,
    supply: supplyResults,
  };
  if (
    results.demand.length > 0
    // && results.supply.length > 0
  ) {
    $("#recordDiv").attr("hidden", true);
    $("#tableDiv").attr("hidden", false);
    // console.log(url);
    // console.log(results);
    let gridJson = {};
    gridJson = createGridData(results, gridJson);
    // console.log("gridJson");
    // console.log(JSON.stringify(gridJson));
    let tableJson = calculateColumnTotals(gridJson);
    // console.log("gridJson totals");
    // console.log(JSON.stringify(tableJson));
    exportTable(tableJson);
    $(".loading").hide();
    $('[data-toggle="toggle"]').change(function (e) {
      // console.log(e.target.dataset.groupid);
      $("*[data-group='" + e.target.dataset.groupid + "']").toggle();
    });
    // $("#btnDownload").show();
    $("#showBaselineCol").prop("checked", false);
    hideColumn("Baseline");
    $("#tableControls").show();
  } else {
    $(".loading").hide();
    $("#recordDiv").attr("hidden", false);
    $("#tableDiv").attr("hidden", true);
    console.log("return result 3");
  }
}

function cleanseData(demandResults) {
  console.log("cleansedata called");
  var cleansedData = [];
  demandResults.forEach(async (item) => {
    var project = item.Demand_Project_Name;
    var justification = item.Justification;
    var tag1 = item.Tag_1;
    var tag2 = item.Tag_2;
    var tag3 = item.Tag_3;
    var tag4 = item.Tag_4;
    var tag5 = item.Tag_5;

    if (project != null && project != undefined && project.length > 0) {
      var cleanData = project.replace("</div>", "");
      cleanData = cleanData.replace(/<.*>/, "");
      item.Demand_Project_Name = cleanData;
    }
    if (
      justification != null &&
      justification != undefined &&
      justification.length > 0
    ) {
      var cleanData = justification.replace("</div>", "");
      cleanData = cleanData.replace(/<.*>/, "");
      item.Justification = cleanData;
    }
    if (tag1 != null && tag1 != undefined && tag1.length > 0) {
      var cleanData = tag1.replace("</div>", "");
      cleanData = cleanData.replace(/<.*>/, "");
      item.Tag_1 = cleanData;
    }
    if (tag2 != null && tag2 != undefined && tag2.length > 0) {
      var cleanData = tag2.replace("</div>", "");
      cleanData = cleanData.replace(/<.*>/, "");
      item.Tag_2 = cleanData;
    }
    if (tag3 != null && tag3 != undefined && tag3.length > 0) {
      var cleanData = tag3.replace("</div>", "");
      cleanData = cleanData.replace(/<.*>/, "");
      item.Tag_3 = cleanData;
    }
    if (tag4 != null && tag4 != undefined && tag4.length > 0) {
      var cleanData = tag4.replace("</div>", "");
      cleanData = cleanData.replace(/<.*>/, "");
      item.Tag_4 = cleanData;
    }
    if (tag5 != null && tag5 != undefined && tag5.length > 0) {
      var cleanData = tag5.replace("</div>", "");
      cleanData = cleanData.replace(/<.*>/, "");
      item.Tag_5 = cleanData;
    }
    if (
      item.Tag_1 == null ||
      item.Tag_1 == undefined ||
      item.Tag_1.toString().toUpperCase() != "CAMPUS"
    ) {
      cleansedData.push(item);
    }
  });
  //var cleansedData = demandResults.filter(function (e) {return Tag_1.toString().toUpperCase()!="CAMPUS"});
  fetchSupplyList(cleansedData);
}
//#endregion

//#region downloadexcel to add
function exportToExcel(fn, dl) {
  console.log("downloading");
  let showbaselineCol = $("#showBaselineCol").is(":checked");
  !showbaselineCol ? $("#showBaselineCol").click() : "";
  $(".loading").show();
  $(".subRowHead").hide();
  $(".subRowHead").toggle();
  var elt = document.getElementById("grid"); //getting html of grid to export
  var wb = XLSX.utils.table_to_book(elt, { sheet: "Order Board Report" });
  $(".loading").hide();
  $(".subRowHead").toggle();
  $("input[type=checkbox][data-toggle='toggle']:checked").prop(
    "checked",
    false
  );
  !showbaselineCol ? $("#showBaselineCol").click() : "";
  return dl
    ? XLSX.write(wb, { bookType: "xlsx", bookSST: true, type: "base64" })
    : XLSX.writeFile(wb, fn || "OfferingReport.xlsx");
}
//#endregion

//#region helpermethods
function getCurrentFinancialYear() {
  var financial_year = "";
  var today = new Date();
  if (today.getMonth() + 1 < 6) {
    financial_year = today.getFullYear();
  } else {
    financial_year = today.getFullYear() + 1;
  }
  return financial_year;
}

function setOffering() {
  if ($("#financialYearSelect").val() != "FY21") {
    configureDropDownLists();
  } else {
    configureDropDownListsFY21();
  }
}

function configureDropDownLists() {
  var CBO = [
    ["Application Modernization & Innovation", "AM&I"],
    ["Cloud Engineering", "CE"],
    ["Core Industry Solutions", "CIS"],
    ["Core Technology Operations", "CTO"],
    ["Operations Tranformation", "OT"],
  ];
  var SA = [
    ["Strategy", "S"],
    ["Analytics & Cognitive", "A&C"],
    ["Cross-Consulting Group", "CCG"],
    ["Hybrid Solutions", "HS"],
  ];
  var CM = [["Show All", "ALL"]];
  var EP = [
    ["Emerging Solutions", "ES"],
    ["F&E Performance", "F&E"],
    ["Oracle", "Oracle"],
    ["SAP", "SAP"],
    ["Supply Chain", "SC"],
    ["Tech Services Optimization", "TSO"],
  ];
  var HC = [["Show All", "ALL"]];
  var MA = [["Show All", "ALL"]];
  let offerings = { CBO: CBO, SA: SA, CM: CM, EP: EP, HC: HC, MA: MA };
  var ddl2 = document.getElementById("offeringSelect");
  ddl2.options.length = 0;
  var portfolio = $("#portfolioSelect").val();
  var Offering = portfolio.replace("&", "");
  for (i = 0; i < offerings[Offering].length; i++) {
    createOption(ddl2, offerings[Offering][i][0], offerings[Offering][i][1]);
  }
}

function configureDropDownListsFY21() {
  var CBO = [
    ["System Engineering", "SE"],
    ["Operations Tranformation", "OT"],
    ["Cloud Engineering", "CE"],
    ["Core Industry Solutions", "CIS"],
  ];
  var SA = [
    ["Strategy", "S"],
    ["Analytics & Cognitive", "A&C"],
    ["Cross-Consulting Group", "CCG"],
    ["Hybrid Solutions", "HS"],
  ];
  var CM = [["Show All", "ALL"]];
  var EP = [
    ["Emerging Solutions", "ES"],
    ["F&E Performance", "F&E"],
    ["Oracle", "Oracle"],
    ["SAP", "SAP"],
    ["Supply Chain", "SC"],
    ["Tech Services Optimization", "TSO"],
  ];
  var HC = [["Show All", "ALL"]];
  var MA = [["Show All", "ALL"]];
  let offerings = { CBO: CBO, SA: SA, CM: CM, EP: EP, HC: HC, MA: MA };
  var ddl2 = document.getElementById("offeringSelect");
  ddl2.options.length = 0;
  var portfolio = $("#portfolioSelect").val();
  var Offering = portfolio.replace("&", "");
  for (i = 0; i < offerings[Offering].length; i++) {
    createOption(ddl2, offerings[Offering][i][0], offerings[Offering][i][1]);
  }
}

function createOption(ddl, text, value) {
  var opt = document.createElement("option");
  opt.value = value;
  opt.text = text;
  ddl.options.add(opt);
}
function EnableDisableOffering() {
  var report = $("#reportSelect").val();
  if (report == "Skill_required" || report == "Level") {
    $("#divOffering").show();
  } else {
    $("#divOffering").hide();
  }
}
//#endregion

//#region  Dash-grid

function exportTable(data) {
  let tableDiv = document.getElementById("tableDiv");
  let oldtable = document.getElementById("grid");
  oldtable ? oldtable.remove() : "";
  let table = document.createElement("table");
  table.setAttribute("id", "grid");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");
  // console.log(data.header.head);
  thead.appendChild(
    getFusedHead(data.header.head, data.header.subhead, "Leverage")
  );
  thead.appendChild(getSubHead(data.header.head, data.header.subhead));
  thead.classList.add("headerBody");
  table.appendChild(thead);
  for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i];
    if (row.categoryName !== null) {
      let rowTbody = getRow(
        row.catAgg,
        row.categoryName,
        true,
        row.categoryName,
        data.header.subhead
      );
      tbody.appendChild(rowTbody);
      let subRows = row.subCategories;
      for (let j = 0; j < subRows.length; j++) {
        const subRow = subRows[j];
        let subRowElement = getRow(
          subRow.subCatAgg,
          subRow.subCategoryName,
          false,
          row.categoryName,
          data.header.subhead
        );
        tbody.appendChild(subRowElement);
      }
    }
  }

  table.classList.add("dash-grid");
  table.appendChild(tbody);
  //console.log(tableDiv);
  tableDiv.appendChild(table);
}
function getSubHead(headData, subHeadData) {
  let _tr = document.createElement("tr");
  _tr.classList.add("header");
  for (let i = 0; i < headData.length; i++) {
    for (let i = 0; i < subHeadData.length; i++) {
      const subHead = subHeadData[i];
      let _th = document.createElement("th");
      var text = document.createTextNode(subHead);
      _th.appendChild(text);
      _th.setAttribute("data-colGroup", subHead);
      _tr.appendChild(_th);
    }
  }
  return _tr;
}
function getFusedHead(headData, subHeadData, firstCell) {
  let tr = document.createElement("tr");
  tr.classList.add("header");
  let th = document.createElement("th");
  th.classList.add("static");
  th.innerText = firstCell;
  th.setAttribute("rowspan", "2");
  th.setAttribute("colspan", "2");
  tr.appendChild(th);
  for (let i = 0; i < headData.length; i++) {
    const head = headData[i];
    let _th = document.createElement("th");
    _th.setAttribute("colspan", subHeadData.length);
    _th.style.padding = 0;
    var text = document.createTextNode(head);
    _th.appendChild(text);
    _th.setAttribute("data-headGroup", "mainHead");
    tr.appendChild(_th);
  }
  return tr;
}
function getRow(rowData, firstCell, islabel, group, subHead) {
  let rowclass = "";
  islabel ? (rowclass = "labels") : (rowclass = "subRowHead");
  let tr = document.createElement("tr");
  tr.classList.add(rowclass);
  if (islabel) {
    let th = document.createElement("th");
    th.classList.add("rowHead");
    let label = document.createElement("label");
    label.setAttribute("for", firstCell);
    label.innerText = firstCell;
    let input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("name", firstCell);
    input.setAttribute("id", firstCell);
    input.setAttribute("data-toggle", "toggle");
    input.setAttribute("data-groupid", group);

    th.appendChild(input);
    th.appendChild(label);
    th.setAttribute("colspan", "2");
    tr.appendChild(th);
    for (let i = 0; i < rowData.length; i++) {
      const rowPeriod = rowData[i];
      subHead.forEach((subHeadName) => {
        const dataElement = document.createElement("td");
        dataElement.setAttribute("data-colGroup", subHeadName);
        dataElement.innerText =
          rowPeriod[subHeadName] == undefined
            ? 0
            : Math.round(rowPeriod[subHeadName]);
        tr.appendChild(dataElement);
      });
    }
    return tr;
  } else {
    let dummy_th = document.createElement("th");
    dummy_th.style.padding = 0;
    dummy_th.style.width = 0;
    dummy_th.style.border = "0px";
    // dummy_th.style.display = "unset";
    let _th = document.createElement("th");
    _th.innerText = firstCell;
    tr.appendChild(dummy_th);
    tr.appendChild(_th);
    for (let i = 0; i < rowData.length; i++) {
      const rowPeriod = rowData[i];
      subHead.forEach((subHeadName) => {
        const dataElement = document.createElement("td");
        dataElement.setAttribute("data-colGroup", subHeadName);
        dataElement.innerText =
          rowPeriod[subHeadName] == undefined
            ? 0
            : Math.round(rowPeriod[subHeadName]);
        tr.appendChild(dataElement);
      });
      tr.setAttribute("data-group", group);
    }
    return tr;
  }
}
//hide column
function hideColumn(columnName) {
  $(
    `th[data-colGroup='${columnName}'], td[data-colGroup='${columnName}'] `
  ).hide();
  //adjust the colspan of mainHead
  let mainHead = $(`th[data-headGroup='mainHead']`);
  mainHead.attr("colspan", parseInt(mainHead.attr("colspan")) - 1);
}
//show column
function showColumn(columnName) {
  $(
    `th[data-colGroup='${columnName}'], td[data-colGroup='${columnName}'] `
  ).show();
  //adjust the colspan of mainHead
  let mainHead = $(`th[data-headGroup='mainHead']`);
  mainHead.attr("colspan", parseInt(mainHead.attr("colspan")) + 1);
}
//#endregion Dash-grid

//utility- convert json keys to lower case
function ConvertKeysToLowerCase(obj) {
  let output = {};
  for (i in obj) {
    if (Object.prototype.toString.apply(obj[i]) === "[object Object]") {
      output[i.toLowerCase()] = ConvertKeysToLowerCase(obj[i]);
    } else if (Object.prototype.toString.apply(obj[i]) === "[object Array]") {
      output[i.toLowerCase()] = [];
      output[i.toLowerCase()].push(ConvertKeysToLowerCase(obj[i][0]));
    } else {
      output[i.toLowerCase()] = obj[i];
    }
  }
  return output;
}

function createGridData(results, gridJson) {
  let headerObject = {};
  let demandRecords = results.demand;
  let supplyRecords = results.supply;
  let uniqueDemandPeriod = _.keys(
    _.countBy(demandRecords, function (data) {
      return data.Demand_Period;
    })
  );
  let uniqueDemandPeriodSorted = _.sortBy(
    uniqueDemandPeriod,
    function (period) {
      return period;
    }
  );
  let numberOfUniquePeriods = 13;
  let period_FY = uniqueDemandPeriodSorted[0].substr(
    0,
    uniqueDemandPeriodSorted[0].length - 2
  );
  let demandPeriods = [];
  for (let i = 1; i <= numberOfUniquePeriods; i++) {
    demandPeriods.push(period_FY + (i < 10 ? "0" + i : i));
  }
  headerObject.head = demandPeriods;
  let uniqueJoiningStatus = _.keys(
    _.countBy(supplyRecords, function (data) {
      return data.Joining_Status;
    })
  );
  console.log("uniqueJoiningStatus", uniqueJoiningStatus);
  headerObject.subhead = ["Baseline", "Demand", "Joined", "YTJ", "RTMO", "Gap"]; //, "Joined", "YTJ", "RTMO", "Open", "Joined", "YTJ"];
  gridJson.header = headerObject;
  let rowsArray = [];

  // _.map(results, function (val) {
  //   val.Joining_Period = val.Joining_Period
  //     ? val.Joining_Period
  //     : val.Demand_Period;
  //   updatedJoiningPeriodsResult.push(val);
  // });

  let demandOfferingGroup = _.groupBy(demandRecords, function (value) {
    //Made the report talent_group wise -> please refer offering in variable names as talent_group here onwards
    // return value.Offering;
    return value.Talent_Group;
  });
  let supplyOfferingGroup = _.groupBy(supplyRecords, function (value) {
    //Made the report talent_group wise -> please refer offering in variable names as talent_group here onwards
    // return value.Offering;
    return value.Talent_Group;
  });
  console.log("supplyOfferingGroup");
  console.log(supplyOfferingGroup);

  //Create unified object for demand and supply side
  let offeringGroup = demandOfferingGroup;
  Object.keys(supplyOfferingGroup).forEach((offering) => {
    if (offeringGroup[offering]) {
      offeringGroup[offering] = offeringGroup[offering].concat(
        supplyOfferingGroup[offering]
      );
    } else {
      offeringGroup[offering] = supplyOfferingGroup[offering];
    }
  });

  //Create demand, baseline and joining period groups
  let data = _.map(offeringGroup, function (group) {
    let rowObject = {};
    // let categoryName = group[0].Offering;
    let categoryName = group[0].Talent_Group;
    rowObject.categoryName = categoryName;

    let demandPeriodGroup = _.groupBy(group, function (value) {
      return value.Demand_Period;
    });
    delete demandPeriodGroup.undefined;
    console.log("demandPeriodGroup");
    console.log(Object.keys(demandPeriodGroup));
    let baselinePeriodGroup = _.groupBy(group, function (value) {
      return value.Baseline_Period;
    });
    delete baselinePeriodGroup.undefined;
    console.log("baselinePeriodGroup");
    console.log(Object.keys(baselinePeriodGroup));
    let joiningPeriodGroup = _.groupBy(group, function (value) {
      return value.Joining_Period;
    });
    delete joiningPeriodGroup.undefined;
    console.log("joiningPeriodGroup");
    console.log(Object.keys(joiningPeriodGroup));

    let choiceGroup = _.groupBy(group, function (value) {
      //return value.Location;
      return value[subcategory];
    });

    rowObject.catAgg = createCategoryData(
      demandPeriodGroup,
      baselinePeriodGroup,
      joiningPeriodGroup,
      demandPeriods
    );
    rowObject.catAgg = _.sortBy(rowObject.catAgg, function (catAggObj) {
      return catAggObj.period;
    });
    rowObjectCatAggLength = rowObject.catAgg.length;
    // console.log("rowObjectCatAggLength");
    // console.log(rowObjectCatAggLength);
    for (let i = 0; i < demandPeriods.length; i++) {
      const demandPeriod = rowObject.catAgg[i];
      // console.log(demandPeriods[i], demandPeriod ? demandPeriod.period : "");
      if (demandPeriods[i] != (demandPeriod ? demandPeriod.period : "")) {
        rowObject.catAgg.splice(i, 0, {});
      }
      // console.log(rowObject.catAgg[i]);
    }
    rowObject.subCategories = createSubCategoryData(choiceGroup, demandPeriods);
    rowsArray.push(rowObject);
    return { rowsArray };
  });

  gridJson.rows = rowsArray;
  // console.log(rowsArray);
  return gridJson;
}
function checkAllSourcing() {
  checkSourcing = $("#sourcingCheck4").is(":checked");
  if (checkSourcing) {
    $("#sourcingCheck1").prop("checked", true);
    $("#sourcingCheck2").prop("checked", true);
    $("#sourcingCheck3").prop("checked", true);
  } else {
    $("#sourcingCheck1").prop("checked", false);
    $("#sourcingCheck2").prop("checked", false);
    $("#sourcingCheck3").prop("checked", false);
  }
}

function updateSorcing(){
  if (!($("#sourcingCheck1").is(":checked") && $("#sourcingCheck2").is(":checked") && $("#sourcingCheck3").is(":checked") )){
    $("#sourcingCheck4").prop("checked", false);
  }
}

function createCategoryData(
  demandPeriodGroup,
  baselinePeriodGroup,
  joiningPeriodGroup,
  periods
) {
  let catObj;
  let catAgg = [];

  periods.map((value, index, array) => {
    catObj = {};
    // let data1 = _.map(demandPeriodGroup, function (group1, key1) {});

    // "Baseline", "Demand", "Joined", "YTJ", "RTMO"
    catObj["Demand"] = demandPeriodGroup[value]
      ? demandPeriodGroup[value].reduce(function (p, c) {
          return (
            p +
            (parseInt(c.No_of_hires_for_this_skill)
              ? parseInt(c.No_of_hires_for_this_skill)
              : 0) // changing to 0 as we are ignoring blanks
          );
        }, 0)
      : 0;
    catObj["Baseline"] = baselinePeriodGroup[value]
      ? baselinePeriodGroup[value].reduce(function (p, c) {
          return (
            p +
            (parseInt(c.No_of_hires_for_this_skill)
              ? parseInt(c.No_of_hires_for_this_skill)
              : 0) // changing to 0 as we are ignoring blanks
          );
        }, 0)
      : 0;
    let Joining_Status_counts = _.countBy(
      joiningPeriodGroup[value],
      function (data) {
        return data.Joining_Status;
      }
    );
    catObj["Joined"] = Joining_Status_counts.Joined
      ? Joining_Status_counts.Joined
      : 0;
    catObj["YTJ"] = Joining_Status_counts.YTJ ? Joining_Status_counts.YTJ : 0;
    catObj["RTMO"] = Joining_Status_counts.RTMO
      ? Joining_Status_counts.RTMO
      : 0;
    catObj["Gap"] =
      catObj["Joined"] +
      0.6 * (catObj["YTJ"] + catObj["RTMO"]) -
      catObj["Demand"];
    catObj.period = value;
    catAgg.push(catObj);
    return catObj;
  });
  return catAgg;
}

function createSubCategoryData(choiceGroup, demandPeriods) {
  let subCatArr = [];
  let subCatObj;
  //for each level\Location\subcategory
  let data2 = _.map(choiceGroup, function (group, key) {
    subCatObj = {};

    //Group by demand period
    let demandPeriodGroup = _.groupBy(group, function (value) {
      return value.Demand_Period;
    });
    let baselinePeriodGroup = _.groupBy(group, function (value) {
      return value.Baseline_Period;
    });
    let joiningPeriodGroup = _.groupBy(group, function (value) {
      return value.Joining_Period;
    });

    let subCatAgg = [];

    subCatObj.subCategoryName = group[0][subcategory];
    //for each demand period
    demandPeriods.map((value, index, array) => {
      let obj = {};

      // let data1 = _.map(demandPeriodGroup, function (group1, key1) {});
      // console.log(demandPeriodGroup[value].length);
      // obj = joiningPeriodGroup[value]
      //   ? ConvertKeysToLowerCase(
      //       _.countBy(joiningPeriodGroup[value], function (data) {
      //         return data.Joining_Status;
      //       })
      //     )
      //   : {};
      // "Baseline", "Demand", "Joined", "YTJ", "RTMO"
      obj["Demand"] = demandPeriodGroup[value]
        ? demandPeriodGroup[value].reduce(function (p, c) {
            return (
              p +
              (parseInt(c.No_of_hires_for_this_skill)
                ? parseInt(c.No_of_hires_for_this_skill)
                : 0) // changing to 0 as we are ignoring blanks
            );
          }, 0)
        : 0;
      obj["Baseline"] = baselinePeriodGroup[value]
        ? baselinePeriodGroup[value].reduce(function (p, c) {
            return (
              p +
              (parseInt(c.No_of_hires_for_this_skill)
                ? parseInt(c.No_of_hires_for_this_skill)
                : 0) // changing to 0 as we are ignoring blanks
            );
          }, 0)
        : 0;
      let Joining_Status_counts = _.countBy(
        joiningPeriodGroup[value],
        function (data) {
          return data.Joining_Status;
        }
      );
      obj["Joined"] = Joining_Status_counts.Joined
        ? Joining_Status_counts.Joined
        : 0;
      obj["YTJ"] = Joining_Status_counts.YTJ ? Joining_Status_counts.YTJ : 0;
      obj["RTMO"] = Joining_Status_counts.RTMO ? Joining_Status_counts.RTMO : 0;
      obj["Gap"] =
        obj["Joined"] + 0.6 * (obj["YTJ"] + obj["RTMO"]) - obj["Demand"];
      obj.period = value;
      subCatAgg.push(obj);
      return obj;
    });
    subCatObj.subCatAgg = subCatAgg;
    subCatObj.subCatAgg = _.sortBy(
      subCatObj.subCatAgg,
      function (subCatAggObj) {
        return subCatAggObj.period;
      }
    );
    subCatObjsubCatAggLength = subCatObj.subCatAgg.length;
    for (let i = 0; i < demandPeriods.length; i++) {
      const demandPeriod = subCatObj.subCatAgg[i];
      if (demandPeriods[i] != (demandPeriod ? demandPeriod.period : "")) {
        subCatObj.subCatAgg.splice(i, 0, {});
      }
    }
    subCatArr.push(subCatObj);
  });
  return subCatArr;
}

function calculateColumnTotals(tableJson) {
  tableJson.header.head.push("Grand Total");
  tableJson.rows.forEach((row) => {
    let catAggTotal = getRowTotal(row.catAgg, tableJson.header.subhead);
    // console.log("catAggTotal");
    // console.log(catAggTotal);
    row.catAgg.push(catAggTotal);
    row.subCategories.forEach((subCat) => {
      let subCatAggTotal = getRowTotal(
        subCat.subCatAgg,
        tableJson.header.subhead
      );
      // console.log("subCatAggTotal");
      // console.log(subCatAggTotal);
      subCat.subCatAgg.push(subCatAggTotal);
    });
  });

  let subHead = tableJson.header.subhead;
  let totals = {
    categoryName: "Totals",
    catAgg: [],
    subCategories: [],
  };
  for (let i = 0; i < tableJson.header.head.length; i++) {
    let columnTotals = {
      // baseline: 0,
      // demand: 0,
      // open: 0,
      // pending: 0,
      // joined: 0,
      // ytj: 0,
      // rtmo: 0,
      period: tableJson.header.head[i],
    };
    for (let i = 0; i < subHead.length; i++) {
      const subHeadName = subHead[i];
      columnTotals[subHeadName] = 0;
    }
    totals.catAgg.push(columnTotals);

    //console.log(totals.catAgg[i]);
    for (let k = 0; k < tableJson.rows.length; k++) {
      if (tableJson.rows[k].categoryName !== null) {
        let col = tableJson.rows[k].catAgg[i];
        // console.log(subHead);
        subHead.forEach((subHeadName) => {
          totals.catAgg[i][subHeadName] =
            totals.catAgg[i][subHeadName] +
            (col[subHeadName] ? col[subHeadName] : 0);
        });
        // totals.catAgg[i].baseline =
        //   totals.catAgg[i].baseline + (col.baseline ? col.baseline : 0);
        // totals.catAgg[i].demand =
        //   totals.catAgg[i].demand + (col.demand ? col.demand : 0);
        // totals.catAgg[i].open =
        //   totals.catAgg[i].open + (col.open ? col.open : 0);
        // totals.catAgg[i].pending =
        //   totals.catAgg[i].pending + (col.pending ? col.pending : 0);
        // totals.catAgg[i].joined =
        //   totals.catAgg[i].joined + (col.joined ? col.joined : 0);
        // totals.catAgg[i].ytj = totals.catAgg[i].ytj + (col.ytj ? col.ytj : 0);
        // totals.catAgg[i].rtmo =
        //   totals.catAgg[i].rtmo + (col.rtmo ? col.rtmo : 0);
      }
    }
  }
  //console.log(totals);
  tableJson.rows.push(totals);
  return tableJson;
}

function getRowTotal(row, subHead) {
  let rowTotal = {
    // baseline: 0,
    // demand: 0,
    // open: 0,
    // pending: 0,
    // joined: 0,
    // ytj: 0,
    // rtmo: 0,
  };
  // console.log(subHead);
  for (let i = 0; i < subHead.length; i++) {
    const subHeadName = subHead[i];
    rowTotal[subHeadName] = 0;
  }
  // console.log(row);

  if (row.categoryName !== null) {
    row.forEach((agg) => {
      Object.keys(rowTotal).forEach((subHead) => {
        rowTotal[subHead] =
          rowTotal[subHead] + (agg[subHead] ? agg[subHead] : 0);
      });
      // rowTotal.baseline = rowTotal.baseline + (agg.baseline ? agg.baseline : 0);
      // rowTotal.demand = rowTotal.demand + (agg.demand ? agg.demand : 0);
      //// rowTotal.open = rowTotal.open + (agg.open ? agg.open : 0);
      //// rowTotal.pending = rowTotal.pending + (agg.pending ? agg.pending : 0);
      // rowTotal.joined = rowTotal.joined + (agg.joined ? agg.joined : 0);
      // rowTotal.ytj = rowTotal.ytj + (agg.ytj ? agg.ytj : 0);
      // rowTotal.rtmo = rowTotal.rtmo + (agg.rtmo ? agg.rtmo : 0);
    });
    rowTotal.period = "Grand Total";
  }
  return rowTotal;
}
