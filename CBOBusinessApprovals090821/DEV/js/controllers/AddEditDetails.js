$(".loading").show();
$(document).ready(function () {
  console.log('calling from ready state');
  //post succesfull auth call loadPage
  $("hr").remove();
  var footerHtml = $("footer").html();
  $(".dol-footer")
    .removeAttr("style")
    .html("<div class='row'>" + footerHtml + "</div>");
  $("footer").remove();
  $(document).on("click", "#saveRecords", function () {
    SaveDetails();
  });
  //loadPage();//Comment on sharepoint environment,Use only on local
  //getNSetUserId();  //Comment on Local environment,Use only on sharepoint
});

//#region  load scripts
function loadPage()
{
  console.log("calling loadPage");
  setCurrentPeriodYear();
  console.log("currentPeriod-" + currentPeriod);
  console.log("currentFY-" + currentFY);
  $(".loading").hide();  
  fetchParams();
}
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
window.onload = function () {
  $(".dashboardContainer").hide();
  loadJSSet();
};
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
var currentPeriod = "";
var currentFY = "";
var itemUpdate = [];
var updateItems = 0;
var errorItems = 0;
var originalFY = "";
var originalPeriod = "";
//var Ob_Id=0;
//#endregion

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
  console.log('userContextLoaded');
  currentLoggedInUserEmail = currentUser.get_email();
  currentUserId = currentContext.get_web().get_currentUser().get_id();
  checkIfUserIsApproval();
}

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
          if (group == 'OrderBoardDemandUpdate'){
            isAccess = true;
            console.log('access provided');
          }
        });
        if(isAccess){
        $(".dashboardContainer").show();
        $("#dashboardHeader").text("Demand Details");
        $(".uploadSection").css("margin-left", "-10px");
        $(".recordsInserted").css("margin-left", "0px");
        loadPage();
        }
        else
        {
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

//#endregion

//#region Fetch Records
function fetchParams() {
  var queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var _Id ="0";
  _Id = urlParams.get("obid");
  console.log("Id: ", _Id);
  if (_Id == null|| _Id == "" || _Id == "0") { 
    // $(".loading").hide();   
    // $("#dashboardHeader").text("Edit Demand Details");
  }
  else
  {
    //$("#dashboardHeader").text("Edit Demand Details");
   // $(".loading").show();
    fetchDemandDetails(_Id);
    //$(".loading").hide();
  }  
}

function fetchDemandDetails(_Id) {
  var DemandListURL =  "/_api/web/lists/GetByTitle('OrderBoardDemand')/items("+_Id+")";
  var siteURLFetch= _spPageContextInfo.webAbsoluteUrl + DemandListURL;
   console.log('URL:',siteURLFetch);
    $.ajax({
      url: siteURLFetch,
      type: "GET",
      headers: { Accept: "application/json;odata=verbose" },
      async: true,
      beforeSend: function(){
        console.log('calling demand');
        $(".loading").show();
       },
      success: function (data) {
        console.log("data.d ", data.d);
        var results = data.d;
        console.log("data ", results);
        cleanseData(results);
      },
      error: function (data) {
        console.log("Error:", data);
        //$("#dashboardHeader").text("Add Demand Details");
        console.log($("#txtSomethingWentWrong").val());
      },
      complete: function(){
        console.log('Demand Completed');
        $(".loading").hide();
       }
    });
}
//#endregion
//#region helpermethods
function DemandPeriodValidation(demandPeriod){
  console.log("Original FY: FY",originalFY)
  console.log("Original Period: P",originalPeriod)
  var patt = new RegExp("(^FY[0-9][0-9] - P[0-1][0-9])");
  if(!patt.test(demandPeriod)){swal("Invalid Demand Period","Demand period format should be same as FY21 - P11","error");return false}
  // if(!(demandPeriod.replace(/\s+/g, '').trim().indexOf('F')<demandPeriod.replace(/\s+/g, '').trim().indexOf('P')&&demandPeriod.replace(/\s+/g, '').trim().indexOf('Y')<demandPeriod.replace(/\s+/g, '').trim().indexOf('P'))){;swal("Invalid Demand Period", "FY should be followed by P eg: FY21 - P11 ", "error");return false}
  demandPeriod = demandPeriod.replace(/\s+/g, '').trim().split("-");
  // if(!demandPeriod[0].includes("FY")){ swal("Invalid Demand Period", "FY should be included", "error");return false}
  // if(!demandPeriod[1].includes("P")){swal("Invalid Demand Period", "P should be included", "error");return false}
  newFY = parseInt(demandPeriod[0].substring(2,4))
  newPeriod = parseInt(demandPeriod[1].substring(1,3));
  console.log("New FY: FY",newFY)
  console.log("New Period: P",newPeriod)
  if(originalFY<parseInt(currentFY.substring(2,4))){swal("Invalid Demand Period", "Previous FY data cannot be changed", "error");return false}
  if(originalPeriod<parseInt(currentPeriod.substring(1,3))){swal("Invalid Demand Period", "Previous period data cannot be changed", "error");return false}
  if(newFY<originalFY ){swal("Invalid Demand Period", "FY cannot be changed to previous FY", "error");return false}
  if(!(originalPeriod-2<newPeriod)){swal("Invalid Demand Period", "Period cannot be reduced more than 1", "error");return false}
  if(originalFY<newFY){  return true}
  return true;
  }
function setCurrentPeriodYear() {
  var periodJson = {
    M0: [
      { Begin: "1", End: "8", Period: "P08" },
      { Being: "9", End: "31", Period: "P09" },
    ],
    M1: [
      { Begin: "1", End: "5", Period: "P09" },
      { Being: "6", End: "29", Period: "P10" },
    ],
    M2: [
      { Begin: "1", End: "5", Period: "P10" },
      { Being: "6", End: "31", Period: "P11" },
    ],
    M3: [
      { Begin: "1", End: "2", Period: "P11" },
      { Being: "3", End: "30", Period: "P12" },
    ],
    M4: [
      { Begin: "1", End: "29", Period: "P13" },
      { Being: "30", End: "31", Period: "P01" },
    ],
    M5: [
      { Begin: "1", End: "26", Period: "P01" },
      { Being: "27", End: "30", Period: "P02" },
    ],
    M6: [
      { Begin: "1", End: "24", Period: "P02" },
      { Being: "25", End: "31", Period: "P03" },
    ],
    M7: [
      { Begin: "1", End: "21", Period: "P03" },
      { Being: "22", End: "31", Period: "P04" },
    ],
    M8: [
      { Begin: "1", End: "18", Period: "P04" },
      { Being: "19", End: "30", Period: "P05" },
    ],
    M9: [
      { Begin: "1", End: "16", Period: "P05" },
      { Being: "17", End: "31", Period: "P06" },
    ],
    M10: [
      { Begin: "1", End: "13", Period: "P06" },
      { Being: "14", End: "30", Period: "P07" },
    ],
    M11: [
      { Begin: "1", End: "11", Period: "P07" },
      { Being: "12", End: "31", Period: "P08" },
    ],
  };
  var today = new Date();
  var month = today.getMonth();
  var date = today.getDate();
  var financial_year = "";
  var jsonObj = periodJson["M" + month];
  jsonObj.forEach((x) => {
    if (date >= x.Begin && date <= x.End) {
      currentPeriod = x.Period;
    }
  });
  if (month < 6 && date < 30) {
    financial_year = today.getFullYear();
  } else {
    financial_year = today.getFullYear() + 1;
  }
  currentFY = "FY" + financial_year.toString().substr(-2);
}
function removeCharReferences(string){
  if(string.includes('&gt') || string.includes('&lt') || string.includes('&amp')){
    string = string.replace(/&gt;/g,">")
    string = string.replace(/&lt;/g,"<")
    string = string.replace(/&amp;/g,"&")
  }
  return string;
}
function cleanseData(item){
  console.log('cleanseData item:',item);
  // demandResults.forEach(async (item)=>{
    var project = item.Demand_Project_Name
    var justification = item.Justification
    var tag1 = item.Tag_1;
    var tag2 = item.Tag_2;
    var tag3 = item.Tag_3;
    var tag4 = item.Tag_4;
    var tag5 = item.Tag_5;
    
    if (project !=null && project !=undefined && project.length >0){
      project = removeCharReferences(project);
      let cleanData = project.replace('</div>','');
      cleanData= cleanData.replace(/<.*>/, '');
      item.Demand_Project_Name = cleanData;
    }
    if (justification !=null && justification !=undefined && justification.length >0){
      justification = removeCharReferences(justification);
      var cleanData = justification.replace('</div>','');
      cleanData= cleanData.replace(/<.*>/, '');
      item.Justification = cleanData;
    }
    if (tag1 !=null && tag1 !=undefined && tag1.length >0){
      tag1 = removeCharReferences(tag1);
      var cleanData = tag1.replace('</div>','');
      cleanData= cleanData.replace(/<.*>/, '');
      item.Tag_1 = cleanData;
    }
    if (tag2 !=null && tag2 !=undefined && tag2.length >0){
      tag2 = removeCharReferences(tag2);
      var cleanData = tag2.replace('</div>','');
      cleanData= cleanData.replace(/<.*>/, '');
      item.Tag_2 = cleanData;
    }
    if (tag3 !=null && tag3 !=undefined && tag3.length >0){
      tag3 = removeCharReferences(tag3);
      var cleanData = tag3.replace('</div>','');
      cleanData= cleanData.replace(/<.*>/, '');
      item.Tag_3 = cleanData;
    }
    if (tag4 !=null && tag4 !=undefined && tag4.length >0){
      tag4 = removeCharReferences(tag4);
      var cleanData = tag4.replace('</div>','');
      cleanData= cleanData.replace(/<.*>/, '');
      item.Tag_4 = cleanData;
    }
    if (tag5 !=null && tag5 !=undefined && tag5.length >0){
      tag5 = removeCharReferences(tag5);
      var cleanData = tag5.replace('</div>','');
      cleanData= cleanData.replace(/<.*>/, '');
      item.Tag_5 = cleanData;
    }
// });
  loadDetails(item);
}

 function setOriginalBase_Period(data){
  let Demand_Period = data.replace(/\s+/g, '').trim().split("-");
  originalFY = parseInt(Demand_Period[0].substring(2,4));
  originalPeriod = parseInt(Demand_Period[1].substring(1,3));
}

function loadDetails(data)
{
// data = demandResults[0];
setOriginalBase_Period(data.Demand_Period)
$('#Region').val(data.Region);
$('#OP').val(data.OP);
$('#Offering').val(data.Offering);
$('#OBID').val(data.ID);
$('#talentGroup').val(data.Talent_Group);
$('#Level').val(data.Level);
$('#Location').val(data.Location);
$('#skillRequired').val(data.Skill_required);
$('#H_Catalog_Code').val(data.H_Catalog_Code);
$('#H_Catalog_Description').val(data.H_Catalog_Description);
$('#Demand_Project_Name').val(data.Demand_Project_Name);
$('#BaseLine_Period').val(data.Baseline_Period);
$('#BaseLine_Join_Date').val(data.Baseline_Join_Date);
$('#Demand_Period').val(data.Demand_Period);
$('#Demand_Join_Date').val(data.Demand_Join_Date);
$('#No_of_hires_this_skill').val(data.No_of_hires_for_this_skill);
$('#Justification').val(data.Justification);
$('#Category').val(data.Category);
$('#Approval_Status').val(data.Approval_Status);
$('#Sourcing').val(data.Sourcing);
$('#Sub_TG').val(data.Sub_TG);
console.log("Original GPS",data.GPS,data.GPS=='Yes')
if(data.GPS=='Yes'){$('#GPS').prop('checked', true)}else{$('#GPS').prop('checked', false)};
$('#Tag_1').val(data.Tag_1);
$('#Tag_2').val(data.Tag_2);
$('#Tag_3').val(data.Tag_3);
$('#Tag_4').val(data.Tag_4);
$('#Tag_5').val(data.Tag_5);
}
//#endregion

//#region save grid data-
function SaveDetails() {
  // console.log("itemupdate called", itemUpdate);
    swal({
      title: "Are you sure?",
      text: "Press OK to save your updates else press Cancel!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        //noOfRows = itemUpdate.length;
        saveData();
      } else {
        swal("No record is Saved!");
      }
    }); 
}
async function  saveData () {
  console.log("Inside saveData");
  // itemUpdate.forEach(async (item) => {
    //console.log("ITem & ID", item.ID, item);
    let item = {
      Region:$('#Region').val(),
      OP: $('#OP').val(),
      Offering:$('#Offering').val(),
      ID:$('#OBID').val(),
      talentGroup:$('#talentGroup').val(),
      Level:$('#Level').val(),
      Location: $('#Location').val(),
      skillRequired:$('#skillRequired').val(),
      H_Catalog_Code:$('#H_Catalog_Code').val(),
      H_Catalog_Description:$('#H_Catalog_Description').val(),
      Demand_Project_Name:$('#Demand_Project_Name').val(),
      BaseLine_Period:$('#BaseLine_Period').val(),
      Baseline_Join_Date:$('#BaseLine_Join_Date').val(),
      Demand_Period:$('#Demand_Period').val(),
      Demand_Join_Date:$('#Demand_Join_Date').val(),
      No_of_hires_for_this_skill:$('#No_of_hires_this_skill').val(),
      Justification:$('#Justification').val(),
      Category:$('#Category').val(),
      Approval_Status:$('#Approval_Status').val(),
      Comment:$('#Comments').val(),
      Sourcing:$('#Sourcing').val(),
      Sub_TG:$('#Sub_TG').val(),
      Tag_1:$('#Tag_1').val(),
      Tag_2:$('#Tag_2').val(),
      Tag_3:$('#Tag_3').val(),
      Tag_4:$('#Tag_4').val(),
      Tag_5:$('#Tag_5').val()
      }
      console.log('GPS checked',$('#GPS').is(":checked"))
      if($('#GPS').is(":checked")){
        item.GPS='Yes'
      }
      else{
        item.GPS = 'No'
      }
      console.log("GPS",item.GPS)
      if(!item.Comment){
        swal("Invalid entry","Comments Field is required","error")
        return;
      }
      if(!item.Sourcing){
        swal("Invalid entry","Sourcing Field is required","error")
        return;
      }
    let validation = await DemandPeriodValidation(item.Demand_Period);
    if(!validation){
      return;
    }
    updateOrderBoardDemandListItem(item.ID, item);
  // });
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
      Action: "AUDIT",
      GPS: excelRow['GPS'] != null ? excelRow['GPS'] : null,
      Sourcing: excelRow['Sourcing'] != null ? excelRow['Sourcing'] : null,
      Sub_TG: excelRow['Sub_TG'] != null ? excelRow['Sub_TG'] : null,
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
      swal("Good job!", "Update Complete!", "success");
      if (noOfRows == updateItems) {
        $(".loading").hide();
        noOfRows = 0;
        updateItems = 0;
        errorItems = 0;
        swal("Good job!", "Update Complete!", "success");
      }
      else
      {if (noOfRows == updateItems +errorItems) {
        $(".loading").hide();
        noOfRows = 0;
        updateItems = 0;
        errorItems = 0;
        swal("Oops!", "Update failed for few records, please contact your admin!", "error");
      }
    }
    },
    error: function (xhr, status, error) {
      errorItems++;
      console.log("updateOrderBoardDemandListItem error");
      swal("Unexpexted Error!", "Update failed, please contact your admin!", "error");
      if (noOfRows == errorItems) {
        $(".loading").hide();
        noOfRows = 0;
        updateItems = 0;
        errorItems = 0;
        swal("Unexpexted Error!", "Update failed, please contact your admin!", "error");
      }
      else
      {if (noOfRows == updateItems +errorItems) {
        $(".loading").hide();
        noOfRows = 0;
        updateItems = 0;
        errorItems = 0;
        swal("Oops!", "Update failed for few records, please contact your admin!", "error");
      }
    }
    },
  });
}
//#endregion
