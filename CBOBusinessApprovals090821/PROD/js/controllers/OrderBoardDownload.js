$('.loading').show();
//$(".loading").hide();
$(document).ready(function () {
  $("hr").remove();
  var footerHtml = $("footer").html();
  $(".dol-footer")
    .removeAttr("style")
    .html("<div class='row'>" + footerHtml + "</div>");
  $("footer").remove();
  getNSetUserId();  //Comment on Local environment,Use only on sharepoint
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
        $("#btnDownloadDemand").prop('disabled', true);
        $("#btnDownloadSupply").prop('disabled', true);
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
          if (group == 'OrderBoardDownload'){
            isAccess = true;
            console.log('access provided');
          }
        });
        if(isAccess){
        $(".dashboardContainer").show();
        $("#dashboardHeader").text("Order Board Download");
        $(".uploadSection").css("margin-left", "-10px");
        $(".recordsInserted").css("margin-left", "0px");
        $("#btnDownloadDemand").prop('disabled', false);
        $("#btnDownloadSupply").prop('disabled', false);
        $(".loading").hide();
        }
        else
        {
          $("#btnDownloadDemand").prop('disabled', true);
          $("#btnDownloadSupply").prop('disabled', true);
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

//#region downloadexcel

function exportDemand(fn, dl) {
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
    async: true,
    beforeSend: function(){
      console.log('calling demand');
      $(".loading").show();
     },
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
        return dl
          ? XLSX.write(wb, { bookType: "xlsx", bookSST: true, type: "base64" })
          : XLSX.writeFile(wb, fn || "OrderBoardDemandReport.xlsx");
      }
    },
    error: function (data) {
      console.log("Error:", data);
      console.log($("#txtSomethingWentWrong").val());
    },
    complete: function(){
      console.log('Demand Completed');
      $(".loading").hide();
     }
  });
  return htmlconetnt;
}

function exportSupply(fn, dl) {
  console.log("inside exportSupply");
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
    async: true,
    beforeSend: function(){
      console.log('calling supply');
      $(".loading").show();
     },
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
    complete: function(){
      console.log('Supply Completed');
      $(".loading").hide();
     }
  });
  return htmlcontent;
}
//#endregion

