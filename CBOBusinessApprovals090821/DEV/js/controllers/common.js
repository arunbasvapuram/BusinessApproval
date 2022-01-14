$('body').append('<div class="ms-cui-ribbonTopBars"><div></div><div></div></div>'); //To prevent the unhandled exception from sharepoint layout page
$('body').append('<div class="ms-rte-layoutszone-inner"><div></div></div>');

var isDevMode = true;
var orderBoardLinkAdded = false;
var reportsLinkAdded = false;
if (isDevMode) {
    $('[href^="/sites/USICBOPortal/BusinessApproval/Pages/"]').each(function (idx, val) {
        var href = $(val).attr('href');
        href = href.replace("BusinessApproval", "UsiCboBusinessApprovals")
        $(val).attr('href', href);
    });
}

function loadJs(url, callback, forceReload) {
    if (forceReload) {
        $.getScript(url, callback ? callback : function () { });
    }
    else {
        cachedScript(url).done(callback ? callback : function () { })
    }
}

var cachedScript = function (url, options) {
    options = $.extend(options || {}, {
        dataType: "script",
        cache: true,
        url: url
    });

    return jQuery.ajax(options);
};

function urlParam(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    else {
        return decodeURI(results[1]) || 0;
    }
}

function loadListItems(options) {
    var url = options.url + "&$top=5000";
    var response = response || [];
    (function GetListItems() {
        return $.ajax({
            url: url,
            method: "GET",
            headers: {
                "Accept": "application/json; odata=verbose"
            },
            success: function (data) {
                response = response.concat(data.d.results);
                if (data.d.__next) {
                    url = data.d.__next;
                    GetListItems();
                }
                else {
                    if (options.success) {
                        options.success(response);
                    }
                }
            },
            error: function (error) {
                if (options.error) {
                    options.error(error);
                }
            },
            complete: function () {
                if (options.complete) {
                    options.complete();
                }
            }
        });
    })()
}

$(document).ready(function(){
    $('form').submit(function (e) {
        e.preventDefault();
        return false;
    });
    var siteUrl = _spPageContextInfo.webAbsoluteUrl;
    $.getScript(siteUrl+"/SiteAssets/js/controllers/helper.js");

    var userid= _spPageContextInfo.userId;
    var requestUri = siteUrl + "/_api/web/getuserbyid(" + userid + ")";
    var requestHeaders = { "accept" : "application/json;odata=verbose" };
    $.ajax({
        url : requestUri,
        contentType : "application/json;odata=verbose",
        headers : requestHeaders,
        success : onSuccess,
        error : onError
    });

    function onSuccess(data, request){
        var loginEmail = data.d.Email;
        var trckQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('Approvers')/items?$select=*,Approvers/Title,Approvers/EMail&$expand=Approvers/Id&$filter= Approvers/EMail eq '" + loginEmail + "'";
        loadListItems({
            url: trckQueryDataUrl,
            success: function (data) {
                if (data.length === 0) {                
                    $('.dropdown-menu [href$="?team=1"]').remove();                
                }
                else {                    
					//Reports Link && Approval DashBoard Link
					reportsLinkAdded = false;
                    $(data).each(function (idx, val) {
                        if(val.ImmigrationRoles != "TAL" && val.ImmigrationRoles != "OBUSER"){
                            $(val.Approvers.results).each(function (di, va) {
                                if (va.EMail == loginEmail && !reportsLinkAdded) {
                                    $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
                                    reportsLinkAdded = true;
                                    return true;
                                }
                            })
                            return true;
                        }                        
                    });
					//Order Board Link
                    orderBoardLinkAdded = false;
                    $(data).each(function (idx, val) {
                        if(val.ImmigrationRoles == "TAL" || val.ImmigrationRoles == "TGL" || val.ImmigrationRoles == "RM" || val.ImmigrationRoles == "OL"
                        || val.ImmigrationRoles == "OPL" || val.ImmigrationRoles == "OBUSER"){
                            $(val.Approvers.results).each(function (di, va) {
                                if (va.EMail == loginEmail && !orderBoardLinkAdded) {
                                    //$('.nav.navbar-nav').append('<li><a href="#" class="dropdown-toggle" data-toggle="dropdown">Order Board<b class="caret"></b></a><ul class="dropdown-menu" style="font-size: 11px;"><li><a href="OrderBoardData.aspx">Order Board Data</a></li><li><a href="OrderBoardDashboard.aspx">Order Board Dashboard</a></li><li><a href="OrderBoardReport.aspx">Order Board Report</a></li></ul></li>');
                                    //$('.nav.navbar-nav').append('<li><a href="#" class="dropdown-toggle" data-toggle="dropdown">Order Board<b class="caret"></b></a><ul class="dropdown-menu" style="font-size: 11px;"><li><a href="OrderBoardData.aspx">Order Board Data</a></li><li><a href="OrderBoardDashboard.aspx">Order Board Dashboard</a></li><li><a href="OrderBoardReport.aspx">Order Board Report</a></li><li class="dropdown-submenu"><a href="#" class="dropdown-toggle" data-toggle="dropdown">Demand<ul class="dropdown-menu" style="font-size: 11px;"><li><a href="OrderBoardDemandReport.aspx">OB Demand Report</a></li><li><a href="OrderBoardDemandUpdate.aspx">OB Demand Update</a></li></ul></li></ul></li>');
                                    $('.nav.navbar-nav').append('<li><a href="#" class="dropdown-toggle" data-toggle="dropdown">Order Board<b class="caret"></b></a><ul class="dropdown-menu" style="font-size: 11px;"><li class="dropdown-submenu"><a href="#" class="dropdown-toggle" data-toggle="dropdown">Reporting<ul class="dropdown-menu" style="font-size: 11px;"><li><a href="OrderBoardDownload.aspx">Download Order Board</a></li><li><a href="OrderBoardDemandReport.aspx">OB Demand Report</a></li><li><a href="OrderBoardReport.aspx">Demand Supply Analysis</a></li></ul></li><li class="dropdown-submenu"><a href="#" class="dropdown-toggle" data-toggle="dropdown">Update Data<ul class="dropdown-menu" style="font-size: 11px;"><li><a href="OrderBoardData.aspx">Order Board Upload</a></li><li><a href="OrderBoardDemandUpdate.aspx">OB Demand Update</a></li></ul></li></ul></li>');
                                    orderBoardLinkAdded = true;
                                    return true;
                                }
                            })
                            return true;
                        }                        
                    });
                    //Rewards & Recognition Link
                    // rnrLinkAdded = false;
                    // $(data).each(function (idx, val) {
                    //     if(val.ImmigrationRoles != "TAL" && val.ImmigrationRoles != "OBUSER"){
                    //         $(val.Approvers.results).each(function (di, va) {
                    //             if (va.EMail == loginEmail && !rnrLinkAdded) {
                    //                 $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/RnRRequest.aspx">R & R Uploads</a></li>');
                    //                 rnrLinkAdded = true;
                    //                 return true;
                    //             }
                    //         })
                    //         return true;
                    //     }                        
                    // });
                    // rnrUploadLinkAdded = false;
                    // $(data).each(function (idx, val) {
                    //     if(val.ImmigrationRoles != "TAL" && val.ImmigrationRoles != "OBUSER"){
                    //         $(val.Approvers.results).each(function (di, va) {
                    //             if (va.EMail == loginEmail && !rnrUploadLinkAdded) {
                    //                 $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/RnRDownloads.aspx">R & R Downloads</a></li>');
                    //                 rnrUploadLinkAdded = true;
                    //                 return true;
                    //             }
                    //         })
                    //         return true;
                    //     }                        
                    // });
                }
            }
        });
    }
  function onError(error) {
    alert("error");
  }
})


