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
  configureDropDownLists();
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
var display = "";
var subcategory = "";
var selectedOffering = "";

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
        $("#dashboardHeader").text("Order Board Dashboard");
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
  selectedStatus = "";
  selectedOffering = "";
  portfolio = $("#portfolioSelect").val();
  fy = $("#financialYearSelect").val();
  display = $("input[name=displayRadio]:checked").val();
  subcategory = $("input[name=optradio]:checked").val();
  var offeringCheck = $("#offeringSelect :selected").val();
  if (subcategory == null) {
    $("#optradio1").attr("checked", true);
    subcategory = "Level";
  }
  $.each($("input[name='status']:checked"), function () {
    selectedStatus == ""
      ? (selectedStatus = "Approval_Status eq'" + $(this).val() + "'")
      : (selectedStatus =
          selectedStatus + " or Approval_Status eq '" + $(this).val() + "'");
  });
  $.each($("input[name='region']:checked"), function () {
    selectedRegion == ""
      ? (selectedRegion = "Region eq'" + $(this).val() + "'")
      : (selectedRegion =
          selectedRegion + " or Region eq '" + $(this).val() + "'");
  });
  if (offeringCheck != undefined && !offeringCheck.includes("ALL")) {
    $.each($("#offeringSelect :selected"), function () {
      selectedOffering == ""
        ? (selectedOffering = "Offering eq'" + $(this).val() + "'")
        : (selectedOffering =
            selectedOffering + " or Offering eq '" + $(this).val() + "'");
    });
  }
  selectedOffering = selectedOffering.replace("&","%26");
  var isValid =
    selectedRegion == "" ||
    portfolio == "" ||
    selectedStatus == "" ||
    fy == "" ||
    display == "";
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
  var url = "";
  if (selectedOffering == "" || selectedOffering == undefined) {
    url =
      "/_api/web/lists/GetByTitle('OrderBoardDemand')/items?$filter=OP eq '" +
      portfolio +
      "'and(" +
      selectedRegion +
      ")and(" +
      selectedStatus +
      ")and substringof('" +
      fy +
      "',Demand_Period)&$top=30000";
  } else {
    url =
      "/_api/web/lists/GetByTitle('OrderBoardDemand')/items?$filter=OP eq '" +
      portfolio +
      "'and(" +
      selectedOffering +
      ")and(" +
      selectedRegion +
      ")and(" +
      selectedStatus +
      ")and substringof('" +
      fy +
      "',Demand_Period)&$top=30000";
  }
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

  //fetch("orderBoardDemand_result.json", { mode: "cors" })
     fetch(_spPageContextInfo.webAbsoluteUrl + url, objHeaders)
    .then(function (response) {
      console.log("return result 1");
      return response.json();
    })
    .then(function (json) {
      console.log(json);
      var demandResults = json.d.results;
      var supplyResults = [];
      populateTable(demandResults, supplyResults);
    })
    .catch(function (ex) {
      $(".loading").hide();
      $("#recordDiv").attr("hidden", false);
      $("#tableDiv").attr("hidden", true);
      console.log("getOrderBoardListItem error" + ex.message);
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
    console.log("length" + results.length);
    let gridJson = {};
    gridJson = createGridData(results, gridJson);
    //console.log(JSON.stringify(gridJson));
    let tableJson = calculateColumnTotals(gridJson);
    exportTable(tableJson);
    $(".loading").hide();
    $('[data-toggle="toggle"]').change(function (e) {
      // console.log(e.target.dataset.groupid);
      $("*[data-group='" + e.target.dataset.groupid + "']").toggle();
    });
    $("#btnDownload").show();
  } else {
    $(".loading").hide();
    $("#recordDiv").attr("hidden", false);
    $("#tableDiv").attr("hidden", true);
    console.log("return result 3");
  }
}

//#endregion

//#region downloadexcel to add
function exportToExcel(fn, dl) {
  console.log("downloading");
  $(".loading").show();
  // var htmlcontent =$("#tableDiv").html();
  // //console.log(htmlcontent);
  // $('#template').html('');
  // $('#template').append(htmlcontent);
  var elt = document.getElementById("grid"); //getting html of grid to export
  var wb = XLSX.utils.table_to_book(elt, { sheet: "Order Board Dashboard" });
  $(".loading").hide();
  return dl
    ? XLSX.write(wb, { bookType: "xlsx", bookSST: true, type: "base64" })
    : XLSX.writeFile(wb, fn || "DashboardReport.xlsx");
}
//#endregion

//#region helpermethods
function getCurrentFinancialYear() {
  var financial_year = "";
  var today = new Date();
  if (today.getMonth() + 1 <= 3) {
    financial_year = today.getFullYear();
  } else {
    financial_year = today.getFullYear() + 1;
  }
  return financial_year;
}

function configureDropDownLists() {
  var CBO = [
    ["Show All", "ALL"],
    ["Application Modernization & Innovation", "AM&I"],
    ["Cloud Engineering", "CE"],
    ["Core Industry Solutions", "CIS"],
    ["Core Technology Operations", "CTO"],
    ["Core Consulting Group","CCG"],
    ["Operations Tranformation", "OT"],
  ];
  var SA = [
    ["Show All", "ALL"],
    ["Strategy", "S"],
    ["Analytics & Cognitive", "A&C"],
    ["Cross-Consulting Group", "CCG"],
    ["Hybrid Solutions", "HS"],
  ];
  var CM = [["Show All", "ALL"]];
  var EP = [
    ["Show All", "ALL"],
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
  thead.classList.add("headerBody");
  table.appendChild(thead);
  for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i];
    let rowTbody = getRow(row.catAgg, row.categoryName, true, row.categoryName);
    tbody.appendChild(rowTbody);
    let subRows = row.subCategories;
    for (let j = 0; j < subRows.length; j++) {
      const subRow = subRows[j];
      let subRowElement = getRow(
        subRow.subCatAgg,
        subRow.subCategoryName,
        false,
        row.categoryName
      );
      tbody.appendChild(subRowElement);
    }
  }

  table.classList.add("dash-grid");
  table.appendChild(tbody);
  //console.log(tableDiv);
  tableDiv.appendChild(table);
}

function getSubHead(subHeadData) {
  let _tr = document.createElement("tr");
  _tr.classList.add("header");
  for (let i = 0; i < subHeadData.length; i++) {
    const subHead = subHeadData[i];
    let _th = document.createElement("th");
    var text = document.createTextNode(subHead);
    _th.appendChild(text);
    _tr.appendChild(_th);
  }
  return _tr;
}
function getFusedHead(headData, subHeadData, firstCell) {
  let tr = document.createElement("tr");
  tr.classList.add("header");
  let th = document.createElement("th");
  th.classList.add("static");
  th.innerText = firstCell;
  tr.appendChild(th);
  for (let i = 0; i < headData.length; i++) {
    const head = headData[i];
    let _th = document.createElement("th");
    _th.setAttribute("colspan", subHeadData.length);
    _th.style.padding = 0;
    let _tr = document.createElement("tr");
    _tr.setAttribute("colspan", subHeadData.length);
    var text = document.createTextNode(head);
    var mainHead_th = document.createElement("th");
    mainHead_th.appendChild(text);
    mainHead_th.setAttribute("colspan", subHeadData.length);
    _tr.appendChild(mainHead_th);
    _th.appendChild(_tr);
    _th.appendChild(getSubHead(subHeadData));
    tr.appendChild(_th);
  }
  return tr;
}
function getRow(rowData, firstCell, islabel, group) {
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
    tr.appendChild(th);
    for (let i = 0; i < rowData.length; i++) {
      const rowPeriod = rowData[i];
      const baseline = document.createElement("td");
      baseline.innerText =
        rowPeriod.baseline == undefined ? 0 : rowPeriod.baseline;
      tr.appendChild(baseline);
      const demand = document.createElement("td");
      demand.innerText = rowPeriod.demand == undefined ? 0 : rowPeriod.demand;
      tr.appendChild(demand);
      const open = document.createElement("td");
      open.innerText = rowPeriod.open == undefined ? 0 : rowPeriod.open;
      // tr.appendChild(open);
      const joined = document.createElement("td");
      joined.innerText = rowPeriod.joined == undefined ? 0 : rowPeriod.joined;
      // tr.appendChild(joined);
      const ytj = document.createElement("td");
      ytj.innerText = rowPeriod.ytj == undefined ? 0 : rowPeriod.ytj;
      // tr.appendChild(ytj);
    }
    return tr;
  } else {
    let _th = document.createElement("th");
    _th.innerText = firstCell;
    tr.appendChild(_th);
    for (let i = 0; i < rowData.length; i++) {
      const rowPeriod = rowData[i];
      const baseline = document.createElement("td");
      baseline.innerText =
        rowPeriod.baseline == undefined ? 0 : rowPeriod.baseline;
      tr.appendChild(baseline);
      const demand = document.createElement("td");
      demand.innerText = rowPeriod.demand == undefined ? 0 : rowPeriod.demand;
      tr.appendChild(demand);
      const open = document.createElement("td");
      open.innerText = rowPeriod.open == undefined ? 0 : rowPeriod.open;
      // tr.appendChild(open);
      const joined = document.createElement("td");
      joined.innerText = rowPeriod.joined == undefined ? 0 : rowPeriod.joined;
      // tr.appendChild(joined);
      const ytj = document.createElement("td");
      ytj.innerText = rowPeriod.ytj == undefined ? 0 : rowPeriod.ytj;
      // tr.appendChild(ytj);
      tr.setAttribute("data-group", group);
    }
    return tr;
  }
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
  console.log("test");
  let uniqueDemandPeriodSorted = _.sortBy(uniqueDemandPeriod, function (
    period
  ) {
    return period;
  });
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
  headerObject.subhead = ["Baseline", "Demand"]; //, "Open", "Joined", "YTJ"];
  gridJson.header = headerObject;
  let rowsArray = [];

  // _.map(results, function (val) {
  //   val.Joining_Period = val.Joining_Period
  //     ? val.Joining_Period
  //     : val.Demand_Period;
  //   updatedJoiningPeriodsResult.push(val);
  // });

  let demandOfferingGroup = _.groupBy(demandRecords, function (value) {
    return value.Offering;
  });
  let supplyOfferingGroup = _.groupBy(supplyRecords, function (value) {
    return value.Offering;
  });
  console.log(demandOfferingGroup, supplyOfferingGroup);
  let offeringGroup = demandOfferingGroup;
  Object.keys(supplyOfferingGroup).forEach((offering) => {
    if (offeringGroup[offering]) {
      offeringGroup[offering].concat(supplyOfferingGroup[offering]);
    } else {
      offeringGroup[offering] = supplyOfferingGroup[offering];
    }
  });

  let data = _.map(offeringGroup, function (group) {
    let rowObject = {};
    let categoryName = group[0].Offering;
    rowObject.categoryName = categoryName;

    let demandPeriodGroup = _.groupBy(group, function (value) {
      return value.Demand_Period;
    });
    let baselinePeriodGroup = _.groupBy(group, function (value) {
      return value.Baseline_Period;
    });
    let joiningPeriodGroup = _.groupBy(group, function (value) {
      return value.Joining_Period;
    });

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
  console.log(rowsArray);
  return gridJson;
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
    let data1 = _.map(demandPeriodGroup, function (group1, key1) {});
    // console.log(demandPeriodGroup[value].length);
    catObj = joiningPeriodGroup[value]
      ? ConvertKeysToLowerCase(
          _.countBy(joiningPeriodGroup[value], function (data) {
            return data.Joining_Status;
          })
        )
      : {};
    catObj.demand = demandPeriodGroup[value]
      ? demandPeriodGroup[value].reduce(function (p, c) {
          return (
            p +
            (parseInt(c.No_of_hires_for_this_skill)
              ? parseInt(c.No_of_hires_for_this_skill)
              : 1)
          );
        }, 0)
      : 0;
    catObj.baseline = baselinePeriodGroup[value]
      ? baselinePeriodGroup[value].reduce(function (p, c) {
          return (
            p +
            (parseInt(c.No_of_hires_for_this_skill)
              ? parseInt(c.No_of_hires_for_this_skill)
              : 1)
          );
        }, 0)
      : 0;
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

      let data1 = _.map(demandPeriodGroup, function (group1, key1) {});
      // console.log(demandPeriodGroup[value].length);
      obj = joiningPeriodGroup[value]
        ? ConvertKeysToLowerCase(
            _.countBy(joiningPeriodGroup[value], function (data) {
              return data.Joining_Status;
            })
          )
        : {};
      obj.demand = demandPeriodGroup[value]
        ? demandPeriodGroup[value].reduce(function (p, c) {
            return (
              p +
              (parseInt(c.No_of_hires_for_this_skill)
                ? parseInt(c.No_of_hires_for_this_skill)
                : 1)
            );
          }, 0)
        : 0;
      obj.baseline = baselinePeriodGroup[value]
        ? baselinePeriodGroup[value].reduce(function (p, c) {
            return (
              p +
              (parseInt(c.No_of_hires_for_this_skill)
                ? parseInt(c.No_of_hires_for_this_skill)
                : 1)
            );
          }, 0)
        : 0;
      obj.period = value;
      subCatAgg.push(obj);
      return obj;
    });
    subCatObj.subCatAgg = subCatAgg;
    subCatObj.subCatAgg = _.sortBy(subCatObj.subCatAgg, function (
      subCatAggObj
    ) {
      return subCatAggObj.period;
    });
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
    let catAggTotal = getRowTotal(row.catAgg);
    row.catAgg.push(catAggTotal);
    row.subCategories.forEach((subCat) => {
      let subCatAggTotal = getRowTotal(subCat.subCatAgg);
      subCat.subCatAgg.push(subCatAggTotal);
    });
  });

  let totals = {
    categoryName: "Totals",
    catAgg: [],
    subCategories: [],
  };
  for (let i = 0; i < tableJson.header.head.length; i++) {
    totals.catAgg.push({
      baseline: 0,
      demand: 0,
      open: 0,
      pending: 0,
      joined: 0,
      ytj: 0,
      period: tableJson.header.head[i],
    });
    //console.log(totals.catAgg[i]);
    for (let k = 0; k < tableJson.rows.length; k++) {
      let col = tableJson.rows[k].catAgg[i];
      totals.catAgg[i].baseline =
        totals.catAgg[i].baseline + (col.baseline ? col.baseline : 0);
      totals.catAgg[i].demand =
        totals.catAgg[i].demand + (col.demand ? col.demand : 0);
      totals.catAgg[i].open = totals.catAgg[i].open + (col.open ? col.open : 0);
      totals.catAgg[i].pending =
        totals.catAgg[i].pending + (col.pending ? col.pending : 0);
      totals.catAgg[i].joined =
        totals.catAgg[i].joined + (col.joined ? col.joined : 0);
      totals.catAgg[i].ytj = totals.catAgg[i].ytj + (col.ytj ? col.ytj : 0);
    }
  }
  //console.log(totals);
  tableJson.rows.push(totals);
  return tableJson;
}

function getRowTotal(row) {
  let rowTotal = {
    baseline: 0,
    demand: 0,
    open: 0,
    pending: 0,
    joined: 0,
    ytj: 0,
  };
  console.log(row);
  //"Baseline","Open", "Pending", "Joined", "YTJ"
  row.forEach((agg) => {
    rowTotal.baseline = rowTotal.baseline + (agg.baseline ? agg.baseline : 0);
    rowTotal.demand = rowTotal.demand + (agg.demand ? agg.demand : 0);
    rowTotal.open = rowTotal.open + (agg.open ? agg.open : 0);
    rowTotal.pending = rowTotal.pending + (agg.pending ? agg.pending : 0);
    rowTotal.joined = rowTotal.joined + (agg.joined ? agg.joined : 0);
    rowTotal.ytj = rowTotal.ytj + (agg.ytj ? agg.ytj : 0);
  });
  rowTotal.period = "Grand Total";
  return rowTotal;
}
