$('.loading').show();//umcomment-ankita
//$(".loading").hide();
$(document).ready(function () {
  $("hr").remove();
  var footerHtml = $("footer").html();
  $(".dol-footer")
    .removeAttr("style")
    .html("<div class='row'>" + footerHtml + "</div>");
  $("footer").remove();

  $(".searchContainer [data-id]").on("change", function (e) {
    var $ele = $(e.currentTarget);
    var dataGrid = $ele.closest(".panel-body").find(".customTable").data("dg");
    if ($ele.is(".hasDatepicker")) {
      filterRecords("0", "", dataGrid);
    } else {
      filterRecords($ele.data("id"), $ele.val(), dataGrid);
    }
  });
});

var jsFilePaths = [
  "https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js",
  "https://cdn.datatables.net/buttons/1.5.6/js/dataTables.buttons.min.js",
  "https://cdn.datatables.net/buttons/1.5.6/js/buttons.html5.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xls/0.7.4-a/xls.core.min.js",
  "../SiteAssets/js/libs/bootbox.min.js",
  "../SiteAssets/js/libs/dataTables.checkboxes.min.js",
  "../SiteAssets/js/libs/jqueryUI/jquery-ui.min.js",
];
function loadJSSet() {
  if (jsFilePaths.length > 0) {
    loadJs(jsFilePaths.splice(0, 1), loadJSSet);
  } else {
    getNSetUserId();
  }
}

var currentLoggedInUserEmail = "";
var currentContext = SP.ClientContext.get_current();
var currentWeb = currentContext.get_web();
var currentUser = currentWeb.get_currentUser();
var siteUrl = _spPageContextInfo.webAbsoluteUrl;
var currentUserId = 0;
var isAdminAccess = false;
var myChart = null;
var skillChart1 = null;
var offeringChart1 = null;
var userRolesOffering = [];
var userRoleHighest = "";
var removeRmsId ="";
var insertItems = 0;
var updateItems = 0;
var totalData = 0;
var noOfRows = 0;
var supplyFields = [
  "Region",
  "OP",
  "Offering",
  "Talent_Group",
  "Level",
  "Location",
  "Skill_required",
  "Rms_Id",
  "Name",
  "Joining_Period",
  "Joining_Date",
  "Joining_Status",
  "Gender",
  "DNI",
  "Comment",
  "Tag_1",
  "Tag_2",
  "Tag_3",
  "Tag_4",
  "Tag_5",
];
var fileType = "Demand";
const demandColumn = [
  { data: "Original_ID", title: "OBID", width: "4%", align: "center" },
  { data: "Region", title: "Region", width: "4%", align: "center" },
  { data: "OP", title: "OP", width: "3%", align: "center" },
  { data: "Offering", title: "Offering", width: "4%", align: "center" },
  {
    data: "Talent_Group",
    title: "Talent_Group",
    width: "10%",
    align: "center",
  },
  { data: "Level", title: "Level", width: "8%", align: "center" },
  { data: "Location", title: "Location", width: "8%", align: "center" },
  {
    data: "Skill_required",
    title: "Skill_required",
    width: "6%",
    align: "center",
  },
  {
    data: "H_Catalog_Code",
    title: "H_Catalog_Code",
    width: "8%",
    align: "center",
  },
  {
    data: "H_Catalog_Description",
    title: "H_Catalog_Description",
    width: "5%",
    align: "center",
  },
  {
    data: "Demand_Project_Name",
    title: "Demand_Project_Name",
    width: "10%",
    align: "center",
  },
  {
    data: "Baseline_Period",
    title: "Baseline_Period",
    width: "10%",
    align: "center",
  },
  {
    data: "Baseline_Join_Date",
    title: "Baseline_Join_Date",
    width: "10%",
    align: "center",
  },
  {
    data: "Demand_Period",
    title: "Demand_Period",
    width: "5%",
    align: "center",
  },
  {
    data: "Demand_Join_Date",
    title: "Demand_Join_Date",
    width: "5%",
    align: "center",
  },
  {
    data: "No_of_hires_for_this_skill",
    title: "No_of_hires_for_this_skill",
    width: "5%",
    align: "center",
  },
  {
    data: "Justification",
    title: "Justification",
    width: "25%",
    align: "center",
  },
  {
    data: "Category",
    title: "Category",
    width: "5%",
    align: "center",
  },
  {
    data: "Approval_Status",
    title: "Approval_Status",
    width: "5%",
    align: "center",
  },
  { data: "Rms_Id", title: "Rms_Id", width: "8%", align: "center" },
  {
    data: "Comment",
    title: "Comment",
    width: "5%",
    align: "center",
  },
  {
    data: "Tag_1",
    title: "Tag_1",
    width: "5%",
    align: "center",
  },
  {
    data: "Tag_2",
    title: "Tag_2",
    width: "5%",
    align: "center",
  },
  {
    data: "Tag_3",
    title: "Tag_3",
    width: "5%",
    align: "center",
  },
  {
    data: "Tag_4",
    title: "Tag_4",
    width: "5%",
    align: "center",
  },
  {
    data: "Tag_5",
    title: "Tag_5",
    width: "5%",
    align: "center",
  },
  {
    data: "Created",
    title: "Created Date",
    width: "5%",
    align: "center",
    render: function (data, type, row) {
      return new Date(row.Created).toLocaleString();
    },
  },
];

const supplyColumn = [
  { data: "Region", title: "Region", width: "4%", align: "center" },
  { data: "OP", title: "OP", width: "3%", align: "center" },
  { data: "Offering", title: "Offering", width: "4%", align: "center" },
  {
    data: "Talent_Group",
    title: "Talent_Group",
    width: "10%",
    align: "center",
  },
  { data: "Level", title: "Level", width: "8%", align: "center" },
  { data: "Location", title: "Location", width: "8%", align: "center" },
  {
    data: "Skill_required",
    title: "Skill_required",
    width: "6%",
    align: "center",
  },
  { data: "Rms_Id", title: "Rms_Id", width: "8%", align: "center" },
  { data: "Name", title: "Name", width: "10%", align: "center" },
  {
    data: "Joining_Period",
    title: "Joining_Period",
    width: "10%",
    align: "center",
  },
  {
    data: "Joining_Date",
    title: "Joining_Date",
    width: "10%",
    align: "center",
  },
  {
    data: "Joining_Status",
    title: "Joining_Status",
    width: "5%",
    align: "center",
  },
  { data: "Gender", title: "Gender", width: "5%", align: "center" },
  { data: "DNI", title: "DNI", width: "5%", align: "center" },
  { data: "Comment", title: "Comment", width: "5%", align: "center" },
  {
    data: "Tag_1",
    title: "Tag_1",
    width: "5%",
    align: "center",
  },
  {
    data: "Tag_2",
    title: "Tag_2",
    width: "5%",
    align: "center",
  },
  {
    data: "Tag_3",
    title: "Tag_3",
    width: "5%",
    align: "center",
  },
  {
    data: "Tag_4",
    title: "Tag_4",
    width: "5%",
    align: "center",
  },
  {
    data: "Tag_5",
    title: "Tag_5",
    width: "5%",
    align: "center",
  },
  {
    data: "Created",
    title: "Created Date",
    width: "5%",
    align: "center",
    render: function (data, type, row) {
      return new Date(row.Created).toLocaleString();
    },
  },
];

function filterRecords(i, value, dataGrid) {
  dataGrid.column(i).search(value).draw();
}
//#region  List Log
function loadBoardListLog() {
  //console.log("fileType: "+fileType);
  var orderBoardQueryDataUrl =
    siteUrl +
    "/_api/web/lists/getbytitle('BoardListLog')/items?$filter=FileType eq '" +
    fileType +
    "'&$select=*,UploadedBy/Title,UploadedBy/EMail,UploadedBy/JobTitle&$expand=UploadedBy/Id&$top=5&$orderby= ID desc";
  $.ajax({
    url: orderBoardQueryDataUrl,
    type: "GET",
    headers: { Accept: "application/json;odata=verbose" },
    async: false,
    success: function (orderBoardData) {
      var totalData = [];
      $(orderBoardData.d.results).each(function (idx, val) {
        var tempData = val;
        totalData.push(tempData);
      });
      ViewingBoardListLogSuccessHandler(totalData);
    },
  });
}

function showsection(type, ele) {
  $(".activeType").removeClass("activeType");
  $(ele).addClass("activeType");
  switch (type) {
    case 1: //transfer
      $(".transferSection").show();
      $(".visaSection").hide();
      break;
    case 2: //visa
      $(".transferSection").hide();
      $(".visaSection").show();
      break;
  }
}

function ViewingBoardListLogSuccessHandler(data) {
  try {
    if (noOfRows == 0) {
      $(".loading").hide();
    }
    function getCOnfig(d, excelFileName) {
      return {
        destroy: true,
        bLengthChange: false,
        dom: "Bfrtip",
        autoWidth: false,
        bInfo: false,
        bFilter: false,
        bPaginate: false,
        buttons: [],
        data: d,
        order: [[0, "desc"]],
        columns: [
          {
            data: "ID",
            title: "Req#",
            width: "0%",
            orderable: false,
            visible: false,
          },
          // {
          // "data": "FileName",
          // title: "File Name",
          // "width": "10%",
          // "orderable": false,
          // align: "center"
          // },
          {
            data: "UploadedBy.Title",
            title: "Uploaded By",
            width: "10%",
            align: "center",
            orderable: false,
          },
          {
            data: "UploadedDate",
            title: "Uploaded Date&Time",
            width: "13%",
            align: "center",
            orderable: false,
            render: function (data, type, row) {
              return new Date(row.Created).toLocaleString();
            },
          },
        ],
        oLanguage: {
          sEmptyTable: "No request raised yet.",
        },
      };
    }

    $("#RequestsText").text("Total Uploads: ");
    $("#RequestsCount").text(data.length);
    $("#RequestsText").closest("label").show();

    $("#InterOfficeTable").DataTable(getCOnfig(data, "Requests"));
  } catch (e) {
    alert(e.message);
  }
}
//#endregion
window.onload = function () {
  $(".dashboardContainer").hide();
  loadJSSet();
};

//#region  user
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

var userApprovalFor = [];

function checkIfUserIsApproval() {
  var isAccess= false;
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
        swal(
          "Error!",
          "You are not authorized to view this form!",
          "error"
        ).then((value) => {
          window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
        });
      } else {
        console.log('user access:',data);
        data.forEach((x)=>{
          var group = x.Title;
          if (group == 'OrderBoardUpload'){
            isAccess = true;
            console.log('access provided');
          }
        });
        if(isAccess){
        $(".dashboardContainer").show();
        initializeDatepickers();
        $("#dashboardHeader").text("Order Board");
        $(".uploadSection").css("margin-left", "-10px");
        $(".recordsInserted").css("margin-left", "0px");
        loadBoardListLog();
        }
        else{
          $(".loading").hide();
          swal(
            "Error!",
            "You are not authorized to view this form!",
            "error"
          ).then((value) => {
            window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
          });
        }
      }
    },
  });
}

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
//#endregion

//#region Upload Demand Excel
function uploadDemand() {
  $('.loading').show();//umcomment-ankita
  console.log("export called");
  var regex = /^([a-zA-Z0-9\s_()\\.\-:])+(.xlsx|.xls)$/;
  if (regex.test($("#uploadapproval1").val().toLowerCase())) {
    var xlsxflag = false;
    if ($("#uploadapproval1").val().toLowerCase().indexOf(".xlsx") > 0) {
      xlsxflag = true;
    }
    if (typeof FileReader != "undefined") {
      var fileName = $("#uploadapproval1")
        .val()
        .substring(
          $("#uploadapproval1").val().lastIndexOf("\\") + 1,
          $("#uploadapproval1").val().length
        );
      refreshLogs();
      var reader = new FileReader();
      reader.onload = function (e) {
        var data = e.target.result;
        var data = "";
        var bytes = new Uint8Array(e.target.result);
        var length = bytes.byteLength;
        for (var i = 0; i < length; i++) {
          data += String.fromCharCode(bytes[i]);
        }
        if (xlsxflag) {
          var workbook = XLSX.read(data, { type: "binary" }, { raw: false });
        } else {
          var workbook = XLS.read(data, { type: "binary" });
        }
        var sheet_name_list = workbook.SheetNames;
        var cnt = 0;
        sheet_name_list.forEach(function (y) {
          if (xlsxflag) {
            var exceljson = XLSX.utils.sheet_to_json(workbook.Sheets[y], {
              raw: false,
            });
          } else {
            var exceljson = XLS.utils.sheet_to_row_object_array(
              workbook.Sheets[y]
            );
          }
          if (exceljson.length > 0 && cnt == 0) {
            noOfRows = exceljson.filter((x) => x.Comment != null).length;
            exceljson.forEach(function (excelRow) {
              if (
                excelRow != null &&
                Object.keys(excelRow).length > 0 &&
                excelRow["Comment"] != null
              ) {
                totalData++;
                if (excelRow["OBID"] != null) {
                  console.log(
                    "getOrderBoardDemandListItem called:" + excelRow["OBID"]
                  );
                  getOrderBoardDemandListItem(
                    excelRow["OBID"].toString().trim(),
                    excelRow
                  ); //get and update
                } else {
                  console.log(
                    "createOrderBoardDemandListItem called FOR COUNT:" + cnt
                  );
                  createOrderBoardDemandListItem(excelRow); //insert
                }
              }
            });
            cnt++;
          }
        });
        //$('.loading').hide();
        $("#uploadapproval1").val("");
        //bootbox.alert("Upload Complete!!!");
        createBoardListLogItem(fileName, "Demand");
        // console.log("totalData:"+totalData);
      };
      if (xlsxflag) {
        reader.readAsArrayBuffer($("#uploadapproval1")[0].files[0]);
      } else {
        reader.readAsBinaryString($("#uploadapproval1")[0].files[0]);
      }
    } else {
      $(".loading").hide();
      alert("Sorry! Your browser does not support HTML5!");
    }
  } else {
    $(".loading").hide();
    swal("Format Error!", "Please upload a valid Excel file!", "error");
    //bootbox.alert("Please upload a valid Excel file!");
  }
}
function getOrderBoardDemandListItem(IDValue, excelRow) {
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
  fetch(
    _spPageContextInfo.webAbsoluteUrl +
      "/_api/web/lists/GetByTitle('OrderBoardDemand')/items?$filter=Id eq '" +
      IDValue +
      "'&$select=Id,Offering&$orderby=Id",
    objHeaders
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      var results = json.d.results;
      if (results.length > 0) {
        for (i in results) {
          // console.log("updateOrderBoardListItem called:"+IDValue);
          updateOrderBoardDemandListItem(results[i].ID, excelRow);
        }
      } else {
        //console.log("createOrderBoardListItem L1 called:"+IDValue);
        createOrderBoardDemandListItem(excelRow);
      }
    })
    .catch(function (ex) {
      console.log("getOrderBoardDemandListItem error" + ex.message);
    });
}
function updateOrderBoardDemandListItem(itemID, excelRow) {
  $.ajax({
    url:
      _spPageContextInfo.webAbsoluteUrl +
      "/_api/web/lists/GetByTitle('OrderBoardDemand')/items(" +
      itemID +
      ")",
    type: "POST",
    data: JSON.stringify({
      __metadata: {
        type: "SP.Data.OrderBoardDemandListItem",
      },
      Region: excelRow["Region"] != null ? excelRow["Region"] : null,
      OP: excelRow["OP"] != null ? excelRow["OP"] : null,
      Offering: excelRow["Offering"] != null ? excelRow["Offering"] : null,
      Talent_Group:
        excelRow["Talent_Group"] != null ? excelRow["Talent_Group"] : null,
      Sub_TG:
        excelRow["Sub_TG"] != null ? excelRow["Sub_TG"] : null,
      Level: excelRow["Level"] != null ? excelRow["Level"] : null,
      Location: excelRow["Location"] != null ? excelRow["Location"] : null,
      Rms_Id: excelRow["Rms_Id"] != null ? excelRow["Rms_Id"] : null,
      Skill_required:
        excelRow["Skill_required"] != null ? excelRow["Skill_required"] : null,
      H_Catalog_Code:
        excelRow["H_Catalog_Code"] != null ? excelRow["H_Catalog_Code"] : null,
      H_Catalog_Description:
        excelRow["H_Catalog_Description"] != null
          ? excelRow["H_Catalog_Description"]
          : null,
      Demand_Project_Name:
        excelRow["Demand_Project_Name"] != null
          ? excelRow["Demand_Project_Name"]
          : null,
      Baseline_Period:
        excelRow["Baseline_Period"] != null
          ? excelRow["Baseline_Period"]
          : null,
      Baseline_Join_Date:
        excelRow["Baseline_Join_Date"] != null
          ? excelRow["Baseline_Join_Date"]
          : null,
      Demand_Period:
        excelRow["Demand_Period"] != null ? excelRow["Demand_Period"] : null,
      Demand_Join_Date:
        excelRow["Demand_Join_Date"] != null
          ? excelRow["Demand_Join_Date"]
          : null,
      No_of_hires_for_this_skill:
        excelRow["No_of_hires_for_this_skill"] != null
          ? excelRow["No_of_hires_for_this_skill"]
          : null,
      Justification:
        excelRow["Justification"] != null ? excelRow["Justification"] : null,
      Category: excelRow["Category"] != null ? excelRow["Category"] : null,
      Approval_Status:
        excelRow["Approval_Status"] != null
          ? excelRow["Approval_Status"]
          : null,
      Comment: excelRow["Comment"],
      Tag_1: excelRow["Tag_1"] != null ? excelRow["Tag_1"] : null,
      Tag_2: excelRow["Tag_2"] != null ? excelRow["Tag_2"] : null,
      Tag_3: excelRow["Tag_3"] != null ? excelRow["Tag_3"] : null,
      Tag_4: excelRow["Tag_4"] != null ? excelRow["Tag_4"] : null,
      Tag_5: excelRow["Tag_5"] != null ? excelRow["Tag_5"] : null,
      Sourcing:
        excelRow["Sourcing"] != null ? excelRow["Sourcing"] : null,
      GPS:
        excelRow["GPS"] != null ? excelRow["GPS"] : null,
      Action: "AUDIT",
    }),
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "IF-MATCH": "*",
      "X-HTTP-Method": "MERGE",
    },
    async: false,
    success: function (data, status, xhr) {
      console.log("success");
      updateItems++;
      $("#UpdateRequestsCount").text(updateItems);
      if (noOfRows == insertItems + updateItems) {
        $(".loading").hide();
        noOfRows = 0;
        swal("Good job!", "Upload Complete!", "success");
        //bootbox.alert("Upload Complete!!!");
      }
    },
    error: function (xhr, status, error) {
      console.log("updateOrderBoardDemandListItem error");
      $(".loading").hide();
    },
  });
}
function createOrderBoardDemandListItem(excelRow) {
  $.ajax({
    url:
      _spPageContextInfo.webAbsoluteUrl +
      "/_api/web/lists/GetByTitle('OrderBoardDemand')/items",
    type: "POST",
    data: JSON.stringify({
      __metadata: {
        type: "SP.Data.OrderBoardDemandListItem",
      },
      Region: excelRow["Region"],
      OP: excelRow["OP"],
      Offering: excelRow["Offering"],
      Talent_Group: excelRow["Talent_Group"],
      Sub_TG: excelRow["Sub_TG"],
      Level: excelRow["Level"],
      Location: excelRow["Location"],
      Rms_Id: excelRow["Rms_Id"],
      Skill_required: excelRow["Skill_required"],
      H_Catalog_Code: excelRow["H_Catalog_Code"],
      H_Catalog_Description: excelRow["H_Catalog_Description"],
      Demand_Project_Name: excelRow["Demand_Project_Name"],
      Baseline_Period: excelRow["Baseline_Period"],
      Baseline_Join_Date: excelRow["Baseline_Join_Date"],
      Demand_Period: excelRow["Demand_Period"],
      Demand_Join_Date: excelRow["Demand_Join_Date"],
      No_of_hires_for_this_skill: excelRow["No_of_hires_for_this_skill"],
      Justification: excelRow["Justification"],
      Category: excelRow["Category"],
      Approval_Status: excelRow["Approval_Status"],
      Comment: excelRow["Comment"],
      Tag_1: excelRow["Tag_1"],
      Tag_2: excelRow["Tag_2"],
      Tag_3: excelRow["Tag_3"],
      Tag_4: excelRow["Tag_4"],
      Tag_5: excelRow["Tag_5"],
      Sourcing: excelRow["Sourcing"],
      GPS: excelRow["GPS"],
      Action: "AUDIT",
    }),
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "X-HTTP-Method": "POST",
    },
    async: false,
    success: function (data, status, xhr) {
      console.log("success");
      insertItems++;
      $("#InsertRequestsCount").text(insertItems);
      if (noOfRows == insertItems + updateItems) {
        $(".loading").hide();
        noOfRows = 0;
        swal("Good job!", "Upload Complete!", "success");
        //bootbox.alert("Upload Complete!!!");
      }
    },
    error: function (xhr, status, error) {
      console.log("error");
      $(".loading").hide();
    },
  });
}
function findRemoveRmsIdFromDemand() {
  console.log('removeRmsId:'+removeRmsId);
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
  fetch(
    _spPageContextInfo.webAbsoluteUrl +
      "/_api/web/lists/GetByTitle('OrderBoardDemand')/items?$filter=" +
      removeRmsId,
    objHeaders
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      var results = json.d.results;
      var resultLength = results.length;
      var demandUpdated=0;
      if (results.length > 0) {
        for (i in results) {
          removeRmsIdFromDemand(results[i].ID);
          demandUpdated++;
          if(resultLength == demandUpdated )
          {swal("Good job!", "Upload Complete!", "success");}
        }
      } 
      else
      {swal("Good job!", "Upload Complete!", "success");}
    })
    .catch(function (ex) {
      console.log("FindRemoveRmsIdFromDemand error" + ex.message);
    });
}
function removeRmsIdFromDemand(itemID) {
  $.ajax({
    url:
      _spPageContextInfo.webAbsoluteUrl +
      "/_api/web/lists/GetByTitle('OrderBoardDemand')/items(" +itemID+")",
    type: "POST",
    data: JSON.stringify({
      __metadata: {
        type: "SP.Data.OrderBoardDemandListItem",
      },
      
      Rms_Id: null,
      Comment: "Removing Rms_ID as status is Declined in Supply side",
      Action: "AUDIT",
    }),
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "IF-MATCH": "*",
      "X-HTTP-Method": "MERGE",
    },
    async: false,
    success: function (data, status, xhr) {
      console.log("removed RmsId from Demand side OBID: "+itemID);
    },
    error: function (xhr, status, error) {
      console.log("removeRmsIdFromDemand error");
      $(".loading").hide();
    },
  });
}
function createBoardListLogItem(fileName, fileType) {
  $.ajax({
    url:
      _spPageContextInfo.webAbsoluteUrl +
      "/_api/web/lists/GetByTitle('BoardListLog')/items",
    type: "POST",
    data: JSON.stringify({
      __metadata: {
        type: "SP.Data.BoardListLogListItem",
      },
      Title: "OrderBoard",
      FileName: fileName,
      FileType: fileType,
      UploadedById: currentContext.get_web().get_currentUser().get_id(),
    }),
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "X-HTTP-Method": "POST",
    },
    success: function (data, status, xhr) {
      console.log("success creating Log");
      loadBoardListLog();
    },
    error: function (xhr, status, error) {
      console.log("error creating Log");
    },
  });
}

function refreshLogs() {
  insertItems = 0;
  updateItems = 0;
  totalData = 0;
  removeRmsId ="";
  $("#InsertRequestsCount").text(insertItems);
  $("#UpdateRequestsCount").text(updateItems);
}
//#endregion

function checkIfDeclined(itemID, excelRow){
  console.log("checkIfDeclined : ",excelRow["Joining_Status"]);
  if(excelRow["Joining_Status"].toLowerCase() === "declined" || excelRow["Joining_Status"].toLowerCase() === "decline"){
    return true;
  }
  return false;
}
function deleteFromDemand(rms_id){
  console.log("Removing the Declined rms_id : "+rms_id);
  //findRemoveRmsIdFromDemand(rms_id);
  if (rms_id != undefined) {
      removeRmsId == ""
        ? (removeRmsId = "Rms_Id eq'" + rms_id + "'")
        : (removeRmsId =
          removeRmsId + " or Rms_Id eq '" + rms_id+ "'");
  }
}

//#region Upload Supply Excel
function uploadSupply() {
  $('.loading').show();//umcomment-ankita
  console.log("export called");
  var regex = /^([a-zA-Z0-9\s_()\\.\-:])+(.xlsx|.xls)$/;
  if (regex.test($("#uploadapproval1").val().toLowerCase())) {
    var xlsxflag = false;
    if ($("#uploadapproval1").val().toLowerCase().indexOf(".xlsx") > 0) {
      xlsxflag = true;
    }
    if (typeof FileReader != "undefined") {
      var fileName = $("#uploadapproval1")
        .val()
        .substring(
          $("#uploadapproval1").val().lastIndexOf("\\") + 1,
          $("#uploadapproval1").val().length
        );
      refreshLogs();
      var reader = new FileReader();
      reader.onload = function (e) {
        var data = e.target.result;
        var data = "";
        var bytes = new Uint8Array(e.target.result);
        var length = bytes.byteLength;
        for (var i = 0; i < length; i++) {
          data += String.fromCharCode(bytes[i]);
        }
        if (xlsxflag) {
          var workbook = XLSX.read(data, { type: "binary" }, { raw: false });
        } else {
          var workbook = XLS.read(data, { type: "binary" });
        }
        var sheet_name_list = workbook.SheetNames;
        var cnt = 0;
        sheet_name_list.forEach(function (y) {
          if (xlsxflag) {
            var exceljson = XLSX.utils.sheet_to_json(workbook.Sheets[y], {
              raw: false,
            });
          } else {
            var exceljson = XLS.utils.sheet_to_row_object_array(
              workbook.Sheets[y]
            );
          }
          if (exceljson.length > 0 && cnt == 0) {
            noOfRows = exceljson.filter((x) => x.Comment != null).length;
            var commentJson = exceljson.filter((x) => x.Comment != null);
            //console.log(commentJson);
            commentJson.forEach(function (excelRow) {
              if (excelRow != null && Object.keys(excelRow).length > 0) {
                totalData++;
                if (excelRow["Rms_Id"] != null && excelRow["Rms_Id"] != "") {
                  console.log(
                    "getOrderBoardSupplyListItem called:" + excelRow["Rms_Id"]
                  );                  
                  getOrderBoardSupplyListItem(
                    excelRow["Rms_Id"].toString().trim(),
                    excelRow
                  ); //get and update
                } else {
                  console.log("Null or Blank Rms_Id received");
                  //createOrderBoardDemandItem(excelRow); //insert
                }
              }
            });
            cnt++;
          }
        });
        $("#uploadapproval1").val("");
        createBoardListLogItem(fileName, "Supply");
      };
      if (xlsxflag) {
        reader.readAsArrayBuffer($("#uploadapproval1")[0].files[0]);
      } else {
        reader.readAsBinaryString($("#uploadapproval1")[0].files[0]);
      }
    } else {
      $(".loading").hide();
      alert("Sorry! Your browser does not support HTML5!");
    }
  } else {
    $(".loading").hide();
    swal("Format Error!", "Please upload a valid Excel file!", "error");
    //bootbox.alert("Please upload a valid Excel file!");
  }
}
function getOrderBoardSupplyListItem(IDValue, excelRow) {
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
  fetch(
    _spPageContextInfo.webAbsoluteUrl +
      "/_api/web/lists/GetByTitle('OrderBoardSupply')/items?$filter=Rms_Id eq '" +
      IDValue +
      "'&$select=Id,Offering&$orderby=Id",
    objHeaders
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      var results = json.d.results;
      if (results.length > 0) {
        for (i in results) {
          updateOrderBoardSupplyListItem(results[i].ID, excelRow);
        }
      } else {
        createOrderBoardSupplyListItem(excelRow);
      }
    })
    .catch(function (ex) {
      console.log("getOrderBoardSupplyListItem error" + ex.message);
    });
}
function updateOrderBoardSupplyListItem(itemID, excelRow) {
  $.ajax({
    url:
      _spPageContextInfo.webAbsoluteUrl +
      "/_api/web/lists/GetByTitle('OrderBoardSupply')/items(" +
      itemID +
      ")",
    type: "POST",
    data: JSON.stringify({
      __metadata: {
        type: "SP.Data.OrderBoardSupplyListItem",
      },
      Region: excelRow["Region"] != null ? excelRow["Region"] : null,
      OP: excelRow["OP"] != null ? excelRow["OP"] : null,
      Offering: excelRow["Offering"] != null ? excelRow["Offering"] : null,
      Talent_Group:
        excelRow["Talent_Group"] != null ? excelRow["Talent_Group"] : "",
      Level: excelRow["Level"] != null ? excelRow["Level"] : null,
      Location: excelRow["Location"] != null ? excelRow["Location"] : null,
      Skill_required:
        excelRow["Skill_required"] != null ? excelRow["Skill_required"] : null,
      Rms_Id: excelRow["Rms_Id"] != null ? excelRow["Rms_Id"] : null,
      Name: excelRow["Name"] != null ? excelRow["Name"] : null,
      Joining_Period:
        excelRow["Joining_Period"] != null ? excelRow["Joining_Period"] : null,
      Joining_Date:
        excelRow["Joining_Date"] != null ? excelRow["Joining_Date"] : null,
      Joining_Status:
        excelRow["Joining_Status"] != null ? excelRow["Joining_Status"] : null,
      Gender: excelRow["Gender"] != null ? excelRow["Gender"] : null,
      DNI: excelRow["DNI"] != null ? excelRow["DNI"] : null,
      Comment: excelRow["Comment"],
      Sourcing: excelRow["Sourcing"] != null ? excelRow["Sourcing"] : null,
      Tag_1: excelRow["Tag_1"] != null ? excelRow["Tag_1"] : null,
      Tag_2: excelRow["Tag_2"] != null ? excelRow["Tag_2"] : null,
      Tag_3: excelRow["Tag_3"] != null ? excelRow["Tag_3"] : null,
      Tag_4: excelRow["Tag_4"] != null ? excelRow["Tag_4"] : null,
      Tag_5: excelRow["Tag_5"] != null ? excelRow["Tag_5"] : null,
      Action: "AUDIT",
    }),
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "IF-MATCH": "*",
      "X-HTTP-Method": "MERGE",
    },
    async: false,
    success: function (data, status, xhr) {
      console.log("Supply file updated :  success");
      console.log("Supply file updated :  checkIfDeclined : "+ excelRow["Rms_Id"].toString().trim()+ " : Status : "+excelRow["Joining_Status"]);
      if(checkIfDeclined( excelRow["Rms_Id"].toString().trim(),excelRow)){
        deleteFromDemand(excelRow["Rms_Id"].toString().trim())
      }
      updateItems++;
      $("#UpdateRequestsCount").text(updateItems);
      if (noOfRows == insertItems + updateItems) {
        $(".loading").hide();
        noOfRows = 0;
        if (removeRmsId == "" || removeRmsId == undefined){
          swal("Good job!", "Upload Complete!", "success");
          }
          else{findRemoveRmsIdFromDemand();}  
        //bootbox.alert("Upload Complete!!!");
      }
    },
    error: function (xhr, status, error) {
      console.log("updateOrderBoardSupplyListItem error");
      $(".loading").hide();
    },
  });
}
function createOrderBoardSupplyListItem(excelRow) {
  $.ajax({
    url:
      _spPageContextInfo.webAbsoluteUrl +
      "/_api/web/lists/GetByTitle('OrderBoardSupply')/items",
    type: "POST",
    data: JSON.stringify({
      __metadata: {
        type: "SP.Data.OrderBoardSupplyListItem",
      },
      Region: excelRow["Region"] != null ? excelRow["Region"] : null,
      OP: excelRow["OP"] != null ? excelRow["OP"] : null,
      Offering: excelRow["Offering"] != null ? excelRow["Offering"] : null,
      Talent_Group:
        excelRow["Talent_Group"] != null ? excelRow["Talent_Group"] : "",
      Level: excelRow["Level"] != null ? excelRow["Level"] : null,
      Location: excelRow["Location"] != null ? excelRow["Location"] : null,
      Skill_required:
        excelRow["Skill_required"] != null ? excelRow["Skill_required"] : null,
      Rms_Id: excelRow["Rms_Id"] != null ? excelRow["Rms_Id"] : null,
      Name: excelRow["Name"] != null ? excelRow["Name"] : null,
      Joining_Period:
        excelRow["Joining_Period"] != null ? excelRow["Joining_Period"] : null,
      Joining_Date:
        excelRow["Joining_Date"] != null ? excelRow["Joining_Date"] : null,
      Joining_Status:
        excelRow["Joining_Status"] != null ? excelRow["Joining_Status"] : null,
      Gender: excelRow["Gender"] != null ? excelRow["Gender"] : null,
      DNI: excelRow["DNI"] != null ? excelRow["DNI"] : null,
      Comment: excelRow["Comment"],
      Sourcing: excelRow["Sourcing"] != null ? excelRow["Sourcing"] : null,
      Tag_1: excelRow["Tag_1"] != null ? excelRow["Tag_1"] : null,
      Tag_2: excelRow["Tag_2"] != null ? excelRow["Tag_2"] : null,
      Tag_3: excelRow["Tag_3"] != null ? excelRow["Tag_3"] : null,
      Tag_4: excelRow["Tag_4"] != null ? excelRow["Tag_4"] : null,
      Tag_5: excelRow["Tag_5"] != null ? excelRow["Tag_5"] : null,
      Action: "AUDIT",
    }),
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "X-HTTP-Method": "POST",
    },
    async: false,
    success: function (data, status, xhr) {
      console.log("success");
      insertItems++;
      $("#InsertRequestsCount").text(insertItems);
      if (noOfRows == insertItems + updateItems) {
        $(".loading").hide();
        noOfRows = 0;
        if (removeRmsId == "" || removeRmsId == undefined){
          swal("Good job!", "Upload Complete!", "success");
          }
          else{findRemoveRmsIdFromDemand();}     
        //bootbox.alert("Upload Complete!!!");
      }
    },
    error: function (xhr, status, error) {
      console.log("createOrderBoardSupplyListItem error");
      $(".loading").hide();
    },
  });
}

//#endregion

//#region downloadexcel

function exportDemand(fn, dl) {
  $('.loading').show();//umcomment-ankita
  var htmlconetnt = "<table id='htmlconetnt'><thead><tr>";
  var fields = [
    "ID",
    "Region",
    "OP",
    "Offering",
    "Talent_Group",
    "Sub_TG",
    "Level",
    "Location",
    "Skill_required",
    "H_Catalog_Code",
    "H_Catalog_Description",
    "Demand_Project_Name",
    "Baseline_Period",
    "Baseline_Join_Date",
    "Demand_Period",
    "Demand_Join_Date",
    "No_of_hires_for_this_skill",
    "Justification",
    "Category",
    "Approval_Status",
    "Rms_Id",
    "Sourcing",
    "GPS",
    "Comment",
    "Tag_1",
    "Tag_2",
    "Tag_3",
    "Tag_4",
    "Tag_5",
  ];
  for (var k = 0; k < fields.length; k++) {
    if (fields[k] == "ID") {
      htmlconetnt += "<th>OBID</th>";
    }
    // else if(fields[k] == "Title"){
    //     htmlconetnt+="<th>OP</th>";
    // }
    else {
      htmlconetnt += "<th>" + fields[k] + "</th>";
    }
  }
  htmlconetnt += "</tr></thead>";
  var siteURL =
    _spPageContextInfo.webAbsoluteUrl +
    "/_api/web/lists/GetByTitle('OrderBoardDemand')/items?$select=*&$top=20000&&$orderby=ID desc";
  $.ajax({
    url: siteURL,
    type: "GET",
    headers: { Accept: "application/json;odata=verbose" },
    async: false,
    success: function (data) {
      var items = data.d.results;
      var htmlconetnt1 = "";
      if (items.length > 0) {
        for (var index = 0; index < items.length; index++) {
          htmlconetnt1 += "<tr>";
          for (var k = 0; k < fields.length; k++) {
            if (items[index][fields[k]] == null || fields[k] == "Comment") {
              htmlconetnt1 += "<td></td>";
            } else {
              htmlconetnt1 += "<td>" + items[index][fields[k]] + "</td>";
            }
          }
          htmlconetnt1 += "</tr>";
        }
        htmlconetnt =
          htmlconetnt + "<tbody>" + htmlconetnt1 + "</tbody>" + "</table>";
        $("#template").html("");
        $("#template").append(htmlconetnt);
        var elt = document.getElementById("htmlconetnt");
        var wb = XLSX.utils.table_to_book(elt, { sheet: "Order Board Demand" });
        $(".loading").hide();
        return dl
          ? XLSX.write(wb, { bookType: "xlsx", bookSST: true, type: "base64" })
          : XLSX.writeFile(wb, fn || "OrderBoardDemandReport.xlsx");
      } else {
        htmlconetnt =
          htmlconetnt + "<tbody>" + htmlconetnt1 + "</tbody>" + "</table>";
        $("#template").html("");
        $("#template").append(htmlconetnt);
        var elt = document.getElementById("htmlconetnt");
        var wb = XLSX.utils.table_to_book(elt, { sheet: "Order Board Demand" });
        $(".loading").hide();
        return dl
          ? XLSX.write(wb, { bookType: "xlsx", bookSST: true, type: "base64" })
          : XLSX.writeFile(wb, fn || "OrderBoardDemandReport.xlsx");
      }
    },
    error: function (data) {
      console.log("Error:", data);
      console.log($("#txtSomethingWentWrong").val());
    },
  });
  return htmlconetnt;
}

function exportSupply(fn, dl) {
  console.log("inside exportSupply");
  $(".loading").show();
  var htmlcontent = "<table id='htmlcontent'><thead><tr>";
  /*var fields = ["ID","Region","Title","Offering","Talent_Group","Level","Location","Skill_required","H_Catalog_Code","H_Catalog_Description","Demand_Project_Name","Demand_Period","Demand_Join_Date","No_of_hires_for_this_skill","Justification","Category","Approval_Status","Rms_Id","Name","Joining_Location","Joining_Level","Joining_Period","Joining_Date","Joining_Status","Gender","DNI","Comment","Tag_1","Tag_2","Tag_3","Tag_4","Tag_5"];*/

  var fields = [
    "Region",
    "OP",
    "Offering",
    "Talent_Group",
    "Location",
    "Level",
    "Skill_required",
    "Rms_Id",
    "Name",
    "Joining_Period",
    "Joining_Date",
    "Joining_Status",
    "Gender",
    "DNI",
    "Comment",
    "Sourcing",
    "Tag_1",
    "Tag_2",
    "Tag_3",
    "Tag_4",
    "Tag_5",
  ];

  for (var k = 0; k < fields.length; k++) {
    /*if(fields[k] == "ID"){
            htmlcontent+="<th>OBID</th>";
        }
        else if(fields[k] == "Title"){
            htmlcontent+="<th>OP</th>";
        }
        else{*/
    htmlcontent += "<th>" + fields[k] + "</th>";
    /*}*/
  }
  htmlcontent += "</tr></thead>";
  var siteURL =
    _spPageContextInfo.webAbsoluteUrl +
    "/_api/web/lists/GetByTitle('OrderBoardSupply')/items?$select=*&$top=20000&&$orderby=ID desc";
  $.ajax({
    url: siteURL,
    type: "GET",
    headers: { Accept: "application/json;odata=verbose" },
    async: false,
    success: function (data) {
      var items = data.d.results;
      var htmlcontent1 = "";
      if (items.length > 0) {
        for (var index = 0; index < items.length; index++) {
          htmlcontent1 += "<tr>";
          for (var k = 0; k < fields.length; k++) {
            if (items[index][fields[k]] == null || fields[k] == "Comment") {
              htmlcontent1 += "<td></td>";
            } else {
              htmlcontent1 += "<td>" + items[index][fields[k]] + "</td>";
            }
          }
          htmlcontent1 += "</tr>";
        }
        htmlcontent =
          htmlcontent + "<tbody>" + htmlcontent1 + "</tbody>" + "</table>";
        $("#template").html("");
        $("#template").append(htmlcontent);
        var elt = document.getElementById("htmlcontent");
        var wb = XLSX.utils.table_to_book(elt, { sheet: "Order Board Supply" });
        $(".loading").hide();
        return dl
          ? XLSX.write(wb, { bookType: "xlsx", bookSST: true, type: "base64" })
          : XLSX.writeFile(wb, fn || "OrderBoardSupplyReport.xlsx");
      } else {
        htmlcontent =
          htmlcontent + "<tbody>" + htmlcontent1 + "</tbody>" + "</table>";
        $("#template").html("");
        $("#template").append(htmlcontent);
        var elt = document.getElementById("htmlcontent");
        var wb = XLSX.utils.table_to_book(elt, { sheet: "Order Board Supply" });
        $(".loading").hide();
        return dl
          ? XLSX.write(wb, { bookType: "xlsx", bookSST: true, type: "base64" })
          : XLSX.writeFile(wb, fn || "OrderBoardSupplyReport.xlsx");
      }
    },
    error: function (err) {
      $(".loading").hide();
      console.log("err", err);
      console.log($("#txtSomethingWentWrong").val());
    },
  });
  return htmlcontent;
}
//#endregion

//#region AuditData
function retrieveAuditData() {
  $('.loading').show();//umcomment-ankita
  var AuditList = "OrderBoardDemandAuditList";
  if (fileType == "Demand") {
    AuditList = "OrderBoardDemandAuditList";
  } else {
    AuditList = "OrderBoardSupplyAuditList";
  }
  var fromDate = $(".fromDate").datepicker("getDate");
  var fromdateNew = new Date(fromDate),
    fromyr = fromdateNew.getFullYear(),
    frommonth =
      fromdateNew.getMonth() + 1 < 10
        ? "0" + (fromdateNew.getMonth() + 1)
        : fromdateNew.getMonth() + 1,
    fromday =
      fromdateNew.getDate() < 10
        ? "0" + fromdateNew.getDate()
        : fromdateNew.getDate(),
    newFromDate = fromyr + "-" + frommonth + "-" + fromday + "T00:00:00.000Z";
  var toDate = $(".toDate").datepicker("getDate");
  var todateNew = new Date(toDate),
    toyr = todateNew.getFullYear(),
    tomonth =
      todateNew.getMonth() + 1 < 10
        ? "0" + (todateNew.getMonth() + 1)
        : todateNew.getMonth() + 1,
    today =
      todateNew.getDate() < 10
        ? "0" + todateNew.getDate()
        : todateNew.getDate(),
    newtoDate = toyr + "-" + tomonth + "-" + today + "T23:59:59.000Z";
  var trckQueryDataUrl =
    siteUrl +
    "/_api/web/lists/getbytitle('" +
    AuditList +
    "')/items?$filter=Created ge datetime'" +
    newFromDate +
    "' and Created le datetime'" +
    newtoDate +
    "'";

  loadListItems({
    url: trckQueryDataUrl,
    success: visaQuerySuccessHandler,
  });
}

function visaQuerySuccessHandler(data) {
  try {
    var column = demandColumn;
    var columnOrder = [[0, "asc"]];
    var exportColumn = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
    ];
    if (fileType == "Demand") {
      column = demandColumn;
      columnOrder = [[0, "asc"]];
      exportColumn = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,26
      ];
    } else {
      column = supplyColumn;
      columnOrder = [[7, "asc"]];
    }

    $(".loading").hide();
    function getCOnfig(d, excelFileName) {
      return {
        // destroy: true,
        bLengthChange: false,
        dom: "Bfrtip",
        autoWidth: false,
        scrollX: true,
        responsive: true,
        buttons: [
          {
            extend: "excel",
            exportOptions: {
              columns: exportColumn,
            },
            text: "Export to Excel",
            titleAttr: "Excel",
            title: "Order Board Audit",
            filename: excelFileName,
            className: "gridcommandbutton",
          },
        ],
        bInfo: true,
        data: d,
        order: columnOrder,
        columns: column,
        oLanguage: {
          sEmptyTable: "No Data Found",
        },
      };
    }
    if ($.fn.DataTable.isDataTable("#orderBoardAuditTable")) {
      $("#orderBoardAuditTable").DataTable().destroy();
    }

    $("#orderBoardAuditTable tbody").empty();
    $("#orderBoardAuditTable thead").empty();
    searchGrid = $("#orderBoardAuditTable").DataTable(
      getCOnfig(data, "OrderBoardAudit")
    );

    $("#orderBoardAuditTable").data("dg", searchGrid);
  } catch (e) {
    alert(e.message);
  }
}

function PullAuditData() {
  retrieveAuditData();
}

function initializeDatepickers() {
  $(".fromDate").datepicker({ maxDate: new Date() });
  $(".toDate").datepicker({ maxDate: new Date() });

  $(document).on("change", ".hasDatepicker", function (e) {
    dateValidator(e.currentTarget);
  });

  function dateValidator(ele) {
    var isValid = false;
    var $ele = $(ele);
    if (
      $ele.val() &&
      $ele.val().length == 10 &&
      $ele.val().indexOf("/") != -1
    ) {
      var eleDate = new Date($ele.val());
      if (
        !isNaN(eleDate.getMonth()) &&
        eleDate.getFullYear() >= 1900 &&
        eleDate.getFullYear() <= 2100
      ) {
        isValid = true;
      }
    }
    if (!isValid) {
      $ele.val("");
    }
  }
}

function monthDiff(dateFrom, dateTo) {
  return (
    dateTo.getMonth() -
    dateFrom.getMonth() +
    12 * (dateTo.getFullYear() - dateFrom.getFullYear())
  );
}

//#endregion

//#region  Delete
function deleteDemand() {
  $(".loading").show(); //umcomment-ankita
  console.log("export called");
  var regex = /^([a-zA-Z0-9\s_()\\.\-:])+(.xlsx|.xls)$/;
  if (regex.test($("#uploadapproval1").val().toLowerCase())) {
    var xlsxflag = false;
    if ($("#uploadapproval1").val().toLowerCase().indexOf(".xlsx") > 0) {
      xlsxflag = true;
    }
    if (typeof FileReader != "undefined") {
      var fileName = $("#uploadapproval1")
        .val()
        .substring(
          $("#uploadapproval1").val().lastIndexOf("\\") + 1,
          $("#uploadapproval1").val().length
        );
      refreshLogs();
      var reader = new FileReader();
      reader.onload = function (e) {
        var data = e.target.result;
        var data = "";
        var bytes = new Uint8Array(e.target.result);
        var length = bytes.byteLength;
        for (var i = 0; i < length; i++) {
          data += String.fromCharCode(bytes[i]);
        }
        if (xlsxflag) {
          var workbook = XLSX.read(data, { type: "binary" }, { raw: false });
        } else {
          var workbook = XLS.read(data, { type: "binary" });
        }
        var sheet_name_list = workbook.SheetNames;
        var cnt = 0;
        sheet_name_list.forEach(function (y) {
          if (xlsxflag) {
            var exceljson = XLSX.utils.sheet_to_json(workbook.Sheets[y], {
              raw: false,
            });
          } else {
            var exceljson = XLS.utils.sheet_to_row_object_array(
              workbook.Sheets[y]
            );
          }
          if (exceljson.length > 0 && cnt == 0) {
            noOfRows = exceljson.filter((x) => x.Comment != null).length;
            exceljson.forEach(function (excelRow) {
              if (
                excelRow != null &&
                Object.keys(excelRow).length > 0 &&
                excelRow["Comment"] != null
              ) {
                totalData++;
                if (excelRow["OBID"] != null) {
                  console.log(
                    "deleteOrderBoardDemandListItem called:" + excelRow["OBID"]
                  );
                  deleteOrderBoardDemandListItem(
                    excelRow["OBID"].toString().trim()
                  ); //get and delete
                }
              }
            });
            cnt++;
          }
        });
        //$('.loading').hide();
        $("#uploadapproval1").val("");
        // createBoardListLogItem(fileName, "Demand");
      };
      if (xlsxflag) {
        reader.readAsArrayBuffer($("#uploadapproval1")[0].files[0]);
      } else {
        reader.readAsBinaryString($("#uploadapproval1")[0].files[0]);
      }
    } else {
      $(".loading").hide();
      alert("Sorry! Your browser does not support HTML5!");
    }
  } else {
    $(".loading").hide();
    swal("Format Error!", "Please upload a valid Excel file!", "error");
    //bootbox.alert("Please upload a valid Excel file!");
  }
}
function deleteOrderBoardDemandListItem(IDValue) {
  $.ajax({
    url:
      _spPageContextInfo.webAbsoluteUrl +
      "/_api/web/lists/GetByTitle('OrderBoardDemand')/items(" +
      IDValue +
      ")",
    type: "POST",
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "IF-MATCH": "*",
      "X-HTTP-Method": "DELETE",
    },
    async: false,
    success: function (data, status, xhr) {
      console.log("success");
      insertItems++;
      $("#InsertRequestsCount").text(insertItems);
      if (noOfRows == insertItems + updateItems) {
        $(".loading").hide();
        noOfRows = 0;
        swal("Good job!", "Delete Complete!", "success");
      }
    },
    error: function (xhr, status, error) {
      console.log("error");
      $(".loading").hide();
    },
  });
}

// function deleteSupply() {
//   $('.loading').show();//umcomment-ankita
//   console.log("export called");
//   var regex = /^([a-zA-Z0-9\s_()\\.\-:])+(.xlsx|.xls)$/;
//   if (regex.test($("#uploadapproval1").val().toLowerCase())) {
//     var xlsxflag = false;
//     if ($("#uploadapproval1").val().toLowerCase().indexOf(".xlsx") > 0) {
//       xlsxflag = true;
//     }
//     if (typeof FileReader != "undefined") {
//       var fileName = $("#uploadapproval1")
//         .val()
//         .substring(
//           $("#uploadapproval1").val().lastIndexOf("\\") + 1,
//           $("#uploadapproval1").val().length
//         );
//       refreshLogs();
//       var reader = new FileReader();
//       reader.onload = function (e) {
//         var data = e.target.result;
//         var data = "";
//         var bytes = new Uint8Array(e.target.result);
//         var length = bytes.byteLength;
//         for (var i = 0; i < length; i++) {
//           data += String.fromCharCode(bytes[i]);
//         }
//         if (xlsxflag) {
//           var workbook = XLSX.read(data, { type: "binary" }, { raw: false });
//         } else {
//           var workbook = XLS.read(data, { type: "binary" });
//         }
//         var sheet_name_list = workbook.SheetNames;
//         var cnt = 0;
//         sheet_name_list.forEach(function (y) {
//           if (xlsxflag) {
//             var exceljson = XLSX.utils.sheet_to_json(workbook.Sheets[y], {
//               raw: false,
//             });
//           } else {
//             var exceljson = XLS.utils.sheet_to_row_object_array(
//               workbook.Sheets[y]
//             );
//           }
//           if (exceljson.length > 0 && cnt == 0) {
//             noOfRows = exceljson.filter((x) => x.Comment != null).length;
//             exceljson.forEach(function (excelRow) {
//               if (
//                 excelRow != null &&
//                 Object.keys(excelRow).length > 0 &&
//                 excelRow["Comment"] != null
//               ) {
//                 totalData++;
//                 if (excelRow["Rms_Id"] != null) {
//                   console.log(
//                     "deleteOrderBoardSupplyListItem called:" + excelRow["Rms_Id"]
//                   );
//                   deleteOrderBoardSupplyListItem(excelRow["Rms_Id"].toString().trim()); //get and delete
//                 }
//                 }
//             });
//             cnt++;
//           }
//         });
//         //$('.loading').hide();
//         $("#uploadapproval1").val("");
//        // createBoardListLogItem(fileName, "Demand");
//       };
//       if (xlsxflag) {
//         reader.readAsArrayBuffer($("#uploadapproval1")[0].files[0]);
//       } else {
//         reader.readAsBinaryString($("#uploadapproval1")[0].files[0]);
//       }
//     } else {
//       $(".loading").hide();
//       alert("Sorry! Your browser does not support HTML5!");
//     }
//   } else {
//     $(".loading").hide();
//     swal("Format Error!", "Please upload a valid Excel file!", "error");
//     //bootbox.alert("Please upload a valid Excel file!");
//   }
// }
// function deleteOrderBoardSupplyListItem(IDValue) {
//   $.ajax({
//     url:
//       _spPageContextInfo.webAbsoluteUrl +
//       "/_api/web/lists/GetByTitle('OrderBoardSupply')/items?$filter=Rms_Id eq '" +IDValue,
//     type: "POST",
//     headers: {
//       Accept: "application/json;odata=verbose",
//       "Content-Type": "application/json;odata=verbose",
//       "X-RequestDigest": $("#__REQUESTDIGEST").val(),
//       "IF-MATCH": "*",
//       "X-HTTP-Method": "DELETE",
//     },
//     async: false,
//     success: function (data, status, xhr) {
//       console.log("success");
//       insertItems++;
//       $("#InsertRequestsCount").text(insertItems);
//       if (noOfRows == insertItems + updateItems) {
//         $(".loading").hide();
//         noOfRows = 0;
//         swal("Good job!", "Delete Complete!", "success");
//       }
//     },
//     error: function (xhr, status, error) {
//       console.log("error");
//       $(".loading").hide();
//     },
//   });
// }
//#endregion
//#endregion helper methods

function Switch() {
  var isChecked = document.getElementById("sliderSwitch").checked;
  if (isChecked) {
    //console.log("Checked");
    $("#btnUploadSupply").show();
    $("#btnDownloadSupply").show();
    $("#btnDownloadDemand").hide();
    $("#btnUploadDemand").hide();
    // $("btnDeleteDemand").hide();
    // $("btnDeleteSupply").show();
    fileType = "Supply";
  } else {
    //console.log("NotChecked");
    $("#btnUploadSupply").hide();
    $("#btnDownloadSupply").hide();
    $("#btnDownloadDemand").show();
    $("#btnUploadDemand").show();
    // $("btnDeleteDemand").show();
    // $("btnDeleteSupply").hide();
    fileType = "Demand";
  }
  loadBoardListLog();
}
//#endregion