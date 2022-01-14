$(".loading").show();
$(document).ready(function () {
  $(".loading").hide();
  $("hr").remove();
  var footerHtml = $("footer").html();
  $(".dol-footer")
    .removeAttr("style")
    .html("<div class='row'>" + footerHtml + "</div>");
  $("footer").remove();
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
