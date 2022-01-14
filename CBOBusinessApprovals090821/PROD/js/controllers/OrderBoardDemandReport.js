$(".loading").show();
//#region variables
var selectedRegion = "";
var selectedRegionsCSV = [];
var portfolio = "";
var selectedStatus = "";
var fy = "";
var selectedOffering = ""; //leaving it for future use
var selectedGrouping = "";
var selectedSourcing = "";
var selectedSourcingCSV = [];
var filterGPS = null;
var sector = "";
var checkSourcing = false;
//#endregion
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
var OrderBoardDemandUpdateURL =
  _spPageContextInfo.webAbsoluteUrl + "/Pages/OrderBoardDemandUpdate.aspx";

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
        $("#dashboardHeader").text("Order Board Demand Report");
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
  selectedRegionsCSV = [];
  selectedOffering = "";
  selectedGrouping = "";
  selectedSourcing = "";
  selectedSourcingCSV = [];
  filterGPS = null;
  portfolio = $("#portfolioSelect").val();
  fy = $("#financialYearSelect").val();
  subcategory = $("#reportSelect :selected").val();
  selectedGrouping = $("#groupingSelect :selected").val();
  $.each($("input[name='region']:checked"), function () {
    selectedRegion == ""
      ? (selectedRegion = "Region eq'" + $(this).val() + "'")
      : (selectedRegion =
          selectedRegion + " or Region eq '" + $(this).val() + "'");
    selectedRegionsCSV.push($(this).val());
  });
  sector = $('input[name="sector"]:checked').val();
  switch (sector) {
    case "All":
      filterGPS = null;
      break;
    case "GPS":
      filterGPS = "GPS eq 'Yes' or GPS eq 'Y'";
      break;
    case "Commercial":
      filterGPS = "(GPS ne 'Yes' and GPS ne 'Y') or (GPS eq null)";
      break;
  }
  checkSourcing = $("#sourcingCheck4").is(":checked");
  if (checkSourcing) {
    selectedSourcing = "All";
    selectedSourcingCSV = ["All"];
  } else {
    $.each($("input[name='sourcing']:checked"), function () {
      selectedSourcing == ""
        ? (selectedSourcing = "Sourcing eq'" + $(this).val() + "'")
        : (selectedSourcing =
            selectedSourcing + " or Sourcing eq '" + $(this).val() + "'");
      selectedSourcingCSV.push($(this).val());
    });
  }
  var isValid =
    selectedRegion == "" ||
    portfolio == "" ||
    fy == "" ||
    selectedGrouping == "" ||
    selectedSourcing == "";
  if (isValid) {
    $("#validationError").attr("hidden", false);
  } else {
    $("#validationError").attr("hidden", true);
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
  if (!checkSourcing) {
    filter += "(" + selectedSourcing + ") and ";
  }
  if (filterGPS != null && filterGPS != undefined && filterGPS != "") {
    filter += "(" + filterGPS + ") and ";
  }
  filter += "substringof('" + fy + "',Demand_Period)&$top=30000";
  DemandListURL =
    "/_api/web/lists/GetByTitle('OrderBoardDemand')/items?$filter=" + filter;
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
      populateTable(demandResults, {});
    })
    .catch(function (ex) {
      $(".loading").hide();
      $("#recordDiv").attr("hidden", false);
      $("#tableDiv").attr("hidden", true);
      console.log("getOrderBoardDemandListItem error " + ex.message);
    });
}

function populateTable(demandResult, supplyResults) {
  let results = {
    demand: demandResult,
    supply: supplyResults,
  };
  if (results.demand.length > 0) {
    $("#recordDiv").attr("hidden", true);
    $("#tableDiv").attr("hidden", false);
    let gridJson = {};
    gridJson = createGridData(results, gridJson);
    let tableJson = calculateColumnTotals(gridJson);
    exportTable(tableJson);
    $(".loading").hide();
    $('[data-toggle="toggle"]').change(function (e) {
      $("*[data-group='" + e.target.dataset.groupid + "']").toggle();
    });
    $("#btnDownload").show();
  } else {
    $(".loading").hide();
    $("#recordDiv").attr("hidden", false);
    $("#tableDiv").attr("hidden", true);
    console.log("No Records fetched");
  }
}

//#endregion

//#region downloadexcel to add
function exportToExcel(fn, dl) {
  console.log("downloading");
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
  return dl
    ? XLSX.write(wb, { bookType: "xlsx", bookSST: true, type: "base64" })
    : XLSX.writeFile(wb, fn || "OfferingReport.xlsx");
}
//#endregion

//#region helpermethods
function getCurrentFinancialYear() {
  var financial_year = "";
  var today = new Date();
  if (today.getMonth() + 1 < 7) {
    financial_year = today.getFullYear();
  } else {
    financial_year = today.getFullYear() + 1;
  }
  return financial_year;
}

function createOption(ddl, text, value) {
  var opt = document.createElement("option");
  opt.value = value;
  opt.text = text;
  ddl.options.add(opt);
}
function EnableDisableOffering() {
  var report = $("#reportSelect").val();
  if (report == "Skill_required" || report == "Level" || report == "Sourcing") {
    $("#divOffering").show();
  } else {
    $("#divOffering").hide();
  }
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
  thead.appendChild(
    getFusedHead(data.header.head, data.header.subhead, "Leverage")
  );
  thead.classList.add("headerBody");
  table.appendChild(thead);
  for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i];
    if (row.categoryName !== null) {
      let rowTbody = getRow(
        row.catAgg,
        row.categoryName,
        true,
        row.categoryName
      );
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
  }

  table.classList.add("dash-grid");
  table.appendChild(tbody);
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
  th.setAttribute("colspan", "2");
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
    _th.appendChild(mainHead_th);
    tr.appendChild(_th);
  }
  return tr;
}
function getRow(rowData, firstCell, islabel, group) {
  let rowclass = "";
  islabel ? (rowclass = "labels") : (rowclass = "subRowHead");
  let tr = document.createElement("tr");
  tr.classList.add(rowclass);
  let selectedGrouping = $("#groupingSelect :selected").val();
  let subCategory = $("#reportSelect :selected").val();
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
      // try {
      const baseline = cellData(
        rowPeriod.baseline == undefined ? 0 : rowPeriod.baseline,
        firstCell == "Totals" || rowPeriod.period == "Grand Total"
          ? false
          : true,
        OrderBoardDemandUpdateURL,
        portfolio,
        selectedRegionsCSV.join(","),
        selectedSourcingCSV.join(","),
        filterGPS,
        selectedGrouping,
        rowPeriod.categoryName,
        rowPeriod.period
      );
      selectedGrouping == "Baseline_Period" ? tr.appendChild(baseline) : "";
      const demand = cellData(
        rowPeriod.demand == undefined ? 0 : rowPeriod.demand,
        firstCell == "Totals" || rowPeriod.period == "Grand Total"
          ? false
          : true,
        OrderBoardDemandUpdateURL,
        portfolio,
        selectedRegionsCSV.join(","),
        selectedSourcingCSV.join(","),
        filterGPS,
        selectedGrouping,
        rowPeriod.categoryName,
        rowPeriod.period
      );
      selectedGrouping == "Demand_Period" ? tr.appendChild(demand) : "";
    }
    return tr;
  } else {
    let dummy_th = document.createElement("th");
    dummy_th.style.padding = 0;
    dummy_th.style.width = 0;
    dummy_th.style.border = "0px";
    let _th = document.createElement("th");
    _th.innerText = firstCell;
    tr.appendChild(dummy_th);
    tr.appendChild(_th);
    for (let i = 0; i < rowData.length; i++) {
      const rowPeriod = rowData[i];
      const baseline = cellData(
        rowPeriod.baseline == undefined ? 0 : rowPeriod.baseline,
        firstCell == "Totals" || rowPeriod.period == "Grand Total"
          ? false
          : true,
        OrderBoardDemandUpdateURL,
        portfolio,
        selectedRegionsCSV.join(","),
        selectedSourcingCSV.join(","),
        filterGPS,
        selectedGrouping,
        rowPeriod.categoryName,
        rowPeriod.period,
        rowPeriod.subCategoryName,
        subCategory
      );
      selectedGrouping == "Baseline_Period" ? tr.appendChild(baseline) : "";
      const demand = cellData(
        rowPeriod.demand == undefined ? 0 : rowPeriod.demand,
        firstCell == "Totals" || rowPeriod.period == "Grand Total"
          ? false
          : true,
        OrderBoardDemandUpdateURL,
        portfolio,
        selectedRegionsCSV.join(","),
        selectedSourcingCSV.join(","),
        filterGPS,
        selectedGrouping,
        rowPeriod.categoryName,
        rowPeriod.period,
        rowPeriod.subCategoryName,
        subCategory
      );
      selectedGrouping == "Demand_Period" ? tr.appendChild(demand) : "";
      tr.setAttribute("data-group", group);
    }
    return tr;
  }
}

function cellData(
  innerText,
  isLink,
  url,
  Title,
  Region,
  Sourcing,
  filterGPS,
  periodType,
  offering,
  period,
  subcategoryName,
  subcategoryType
) {
  try {
    // form URL
    if (isLink && innerText != 0) {
      // form URL
      let URL =
        url +
        "?" +
        "Title=" +
        Title +
        "&Region=" +
        Region +
        "&Sourcing=" +
        Sourcing +
        "&periodType=" +
        periodType +
        "&offering=" +
        offering +
        "&period=" +
        period;
      subcategoryType
        ? (URL += "&" + subcategoryType + "=" + subcategoryName)
        : "";
      URL += "&filterGPS=" + filterGPS;

      let encodedURL = encodeURI(URL);
      //form cell
      let cell = document.createElement("td");
      let linkTag = document.createElement("a");
      linkTag.setAttribute("target", "_blank");
      linkTag.setAttribute("href", encodedURL);
      linkTag.innerText = innerText ? innerText : 0;
      cell.appendChild(linkTag);
      return cell;
    } else {
      let cell = document.createElement("td");
      cell.innerText = innerText ? innerText : 0;
      return cell;
    }
  } catch (error) {
    console.log("cellData ERROR", error);
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
  headerObject.subhead = []; //, "Joined", "YTJ", "RTMO", "Open", "Joined", "YTJ"];
  gridJson.header = headerObject;
  let rowsArray = [];
  let demandOfferingGroup = _.groupBy(demandRecords, function (value) {
    return value.Offering;
  });
  //Create offeringGroup
  let offeringGroup = demandOfferingGroup;
  //Create demand, baseline and joining period groups
  let data = _.map(offeringGroup, function (group) {
    let rowObject = {};
    let categoryName = group[0].Offering;
    rowObject.categoryName = categoryName;

    let demandPeriodGroup = _.groupBy(group, function (value) {
      return value.Demand_Period;
    });
    delete demandPeriodGroup.undefined;

    let baselinePeriodGroup = _.groupBy(group, function (value) {
      return value.Baseline_Period;
    });
    delete baselinePeriodGroup.undefined;

    let choiceGroup = _.groupBy(group, function (value) {
      return value[subcategory];
    });

    rowObject.catAgg = createCategoryData(
      demandPeriodGroup,
      baselinePeriodGroup,
      [],
      demandPeriods,
      categoryName
    );
    rowObject.catAgg = _.sortBy(rowObject.catAgg, function (catAggObj) {
      return catAggObj.period;
    });
    rowObjectCatAggLength = rowObject.catAgg.length;
    for (let i = 0; i < demandPeriods.length; i++) {
      const demandPeriod = rowObject.catAgg[i];
      if (demandPeriods[i] != (demandPeriod ? demandPeriod.period : "")) {
        rowObject.catAgg.splice(i, 0, {});
      }
    }
    rowObject.subCategories = createSubCategoryData(
      choiceGroup,
      demandPeriods,
      categoryName
    );
    rowsArray.push(rowObject);
    return { rowsArray };
  });
  //sort rows by offering or by leverage
  rowsArray = _.sortBy(rowsArray, function (rowObj) {
    return rowObj.categoryName;
  });
  gridJson.rows = rowsArray;
  return gridJson;
}

function createCategoryData(
  demandPeriodGroup,
  baselinePeriodGroup,
  joiningPeriodGroup,
  periods,
  categoryName
) {
  let catObj;
  let catAgg = [];

  periods.map((value, index, array) => {
    catObj = {};
    catObj.categoryName = categoryName;
    catObj.demand = demandPeriodGroup[value]
      ? demandPeriodGroup[value].reduce(function (p, c) {
          return (
            p +
            (parseInt(c.No_of_hires_for_this_skill)
              ? parseInt(c.No_of_hires_for_this_skill)
              : 0) // changing to 0 as we are ignoring blanks
          );
        }, 0)
      : 0;
    catObj.baseline = baselinePeriodGroup[value]
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
    catObj.joined = Joining_Status_counts.Joined
      ? Joining_Status_counts.Joined
      : 0;
    catObj.ytj = Joining_Status_counts.YTJ ? Joining_Status_counts.YTJ : 0;
    catObj.rtmo = Joining_Status_counts.RTMO ? Joining_Status_counts.RTMO : 0;
    catObj.period = value;
    catAgg.push(catObj);
    return catObj;
  });
  return catAgg;
}

function createSubCategoryData(choiceGroup, demandPeriods, categoryName) {
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
    let subCategoryName = group[0][subcategory];
    subCatObj.subCategoryName = subCategoryName;
    //for each demand period
    demandPeriods.map((value, index, array) => {
      let obj = {};
      obj.categoryName = categoryName;
      obj.subCategoryName = subCategoryName;
      obj.demand = demandPeriodGroup[value]
        ? demandPeriodGroup[value].reduce(function (p, c) {
            return (
              p +
              (parseInt(c.No_of_hires_for_this_skill)
                ? parseInt(c.No_of_hires_for_this_skill)
                : 0) // changing to 0 as we are ignoring blanks
            );
          }, 0)
        : 0;
      obj.baseline = baselinePeriodGroup[value]
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
      obj.joined = Joining_Status_counts.Joined
        ? Joining_Status_counts.Joined
        : 0;
      obj.ytj = Joining_Status_counts.YTJ ? Joining_Status_counts.YTJ : 0;
      obj.rtmo = Joining_Status_counts.RTMO ? Joining_Status_counts.RTMO : 0;
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
      period: tableJson.header.head[i],
    });
    //console.log(totals.catAgg[i]);
    for (let k = 0; k < tableJson.rows.length; k++) {
      if (tableJson.rows[k].categoryName !== null) {
        let col = tableJson.rows[k].catAgg[i];
        totals.catAgg[i].baseline =
          totals.catAgg[i].baseline + (col.baseline ? col.baseline : 0);
        totals.catAgg[i].demand =
          totals.catAgg[i].demand + (col.demand ? col.demand : 0);
      }
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
    rtmo: 0,
  };
  // console.log(row);
  //"Baseline","Open", "Pending", "Joined", "YTJ"
  if (row.categoryName !== null) {
    row.forEach((agg) => {
      rowTotal.baseline = rowTotal.baseline + (agg.baseline ? agg.baseline : 0);
      rowTotal.demand = rowTotal.demand + (agg.demand ? agg.demand : 0);
    });
    rowTotal.period = "Grand Total";
  }
  return rowTotal;
}
