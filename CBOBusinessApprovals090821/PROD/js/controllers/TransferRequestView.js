$('.loading').show();


var isInterOffering = false;
var isInterOffice = false;
var isInterPortfolio = false;
var isUSIToUSTransfer = false;
var requestID = urlParam("TRID");
var fromReports = urlParam("RPTS") ? true : false;
var fromAdminDashboard = urlParam("ADMIN") ? true : false;


var jsFilePaths = [
    "../SiteAssets/js/libs/bootbox.min.js",
    "../SiteAssets/js/libs/jqueryUI/jquery-ui.min.js"
];

function loadJSSet() {
    if (jsFilePaths.length > 0) {
        loadJs(jsFilePaths.splice(0, 1), loadJSSet);
    }
    else {
        $('hr').remove();
        var footerHtml = $('footer').html()
        $('.dol-footer').removeAttr('style').html("<div class='row'>" + footerHtml + "</div>")
        $('footer').remove();
        
        $('#requestTypeidentifier').focus();
        initializeDatepickers();
        getNSetUserId();
    }
}

function initializeDatepickers() {
    $('[data-field="currentProjectRollOffDate"').datepicker();
    $('[data-field="newProjectOnBoardingDate"').datepicker();
    $('[data-field="TransferEffectiveAsOnDate"').datepicker();
    $('[data-field="DateOfHire"').datepicker();


    $(document).on('change', '.hasDatepicker', function (e) {
        dateValidator(e.currentTarget);
    });

    function dateValidator(ele) {
        var isValid = false;
        var $ele = $(ele);
        if ($ele.val() && $ele.val().length == 10 && $ele.val().indexOf("/") != -1) {
            var eleDate = new Date($ele.val());
            if (!isNaN(eleDate.getMonth()) && eleDate.getFullYear() >= 1900 && eleDate.getFullYear() <= 2100) {
                isValid = true;
            }
        }
        if (!isValid) {
            $ele.val("");
        }
    }

}

function getRequestType() {
    var type = "Inter-Offering";
    if (isInterOffice) {
        type = "Inter-Office";
    }
    else if (isInterOffering) {
        type = "Inter-Offering";
    }
    else if (isInterPortfolio) {
        type = "Inter-Portfolio";
    }
    else if (isUSIToUSTransfer) {
        type = "Transfer to US";
    }
    return type;
}






var currentLoggedInUserEmail = "";
var currentLoggedInUserId = "";
var currentContext = SP.ClientContext.get_current();
var currentWeb = currentContext.get_web();
var currentUser = currentWeb.get_currentUser();
var siteUrl = _spPageContextInfo.webAbsoluteUrl;
var serviceLinePractioner = null;
var practitionerEmailIdPractioner = null;
var user1 = null;

var metadata = {
    locations: {
        hyderabad: "Hyderabad",
        mumbai: "Mumbai",
        gurgaon: "Gurgaon",
        bengaluru: "Bengaluru"
    },
    offerings: {
        applicationModernizationInnovation: "Application Modernization Innovation",
        cloudEngineering: "Cloud Engineering",
        operationsTransformation: "Operations Transformation",
        coreIndustrySolutions: "Core Industry Solutions",
        coreTechnologyOperations: "Core Technology Operations"
    }
}

window.onload = function () {
    loadJSSet();
}

function getNSetUserId() {
    currentContext.load(currentUser);
    currentContext.executeQueryAsync(Function.createDelegate(this, this.userContextLoaded), Function.createDelegate(this, this.userContextLoadFailed));
}

function userContextLoadFailed() {
    alert("Could not login user");
}


function backToDashboard() {
    if(fromReports){
        location.href = siteUrl + "/Pages/Reports.aspx";
    }
    else if(fromAdminDashboard){
        location.href = siteUrl + "/Pages/Dashboard.aspx?team=1";
    }
    else
    {
        location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
    }
    
}



function hideTalentGroup() {
    return 1;
    var $tglDiv = $('[data-field="TalentGroupLeadId"]').closest('div');
    $tglDiv.hide();
    var $seperatorDiv = $tglDiv.next('div');
    $seperatorDiv.insertAfter($seperatorDiv.next());
    var $pflDiv = $tglDiv.closest('.row').next().find('div:first');
    $pflDiv.insertAfter($seperatorDiv);
}

var isApprover = false;

function checkIfUserIsApprover() {
    var queryDataUrl = siteUrl + "/_api/web/lists/getbytitle('Approvers')/items?$select=*,Approvers/Title,Approvers/EMail&$expand=Approvers/Id&$filter=Approvers/EMail eq '" + currentLoggedInUserEmail + "'";
    loadListItems({
        url: queryDataUrl,
        success: function (data) {
            if (data.length == 0) {
                $('.dropdown-menu [href$="?team=1"]').remove();
            }
            else {
                isApprover = true;
                //$('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
            }

            bootstrapper();
        }
    });
}

function showAdditionalInfoText() {
    if (isApprover && approverData.IsAdditionalDataRequired == 'Y') {
        $('<div style="margin-top: 40px;border: 1px #86BC25;border-style: solid;padding: 10px;"><b style="color:red">Additional Information Requested By: </b><b style="color:black">'+getUserNameById(getAdditionalInfoReqBy(approverData.Id))+' </b><p>' + approverData.AdditionalDataComments + '</p></div>').insertAfter('.txt-new-Request');
    }
}

function showRejectedByName() {
    if (null != approverData.Status && approverData.Status == 'Rejected') {
         $('#actionBy').text("Rejected By: "+getUserNameById(getRejectedBy(approverData.Id)));
    }
}



function bootstrapper() {
    var url = siteUrl + "/_api/web/lists/getbytitle('Transfer Requests')/items?$select=*,practitionerDetails/EMail,currentProjectSnrManagerDetails/EMail,newProjectSnrMangerDetails/EMail&$expand=AttachmentFiles,currentProjectSnrManagerDetails/Id,practitionerDetails/Id,newProjectSnrMangerDetails/Id&$filter=ID eq '" + requestID + "'";
    loadListItems({
        url: url,
        success: function (data) {
            if (data.length > 0) {
                var item = data[0];
                if (!isApprover && item.practitionerDetailsId != currentLoggedInUserId) {
                    $('.divTransferTable').html('<div class="container" style="height: 100%;display: flex;justify-content: center;align-items: center;width: 70%;"><div class="mesaggeWrapper"><h3>You do not have access to this page</h3></div></div>').show()
                    return false;
                }

                $('.divTransferTable').show();

                window.approverData = item;
                if (!approverData.Pending_x0020_With) {
                    approverData.Pending_x0020_With = { results: [] };
                }
                switch (approverData.transferType) {
                    case "Inter Office":
                        isInterOffice = true;
                        break;
                    case "Inter Offering":
                        isInterOffering = true;
                        break;
                    case "Inter Portfolio":
                        isInterPortfolio = true;
                        break;
                    case "Transfer to US":
                        isUSIToUSTransfer = true;
                        break;
                }

                if (isUSIToUSTransfer) {
                    $('.notUsiTransferElements').remove();
                    $('.usiTransferElements').show();
                    $('.sponsorDiv').css("display", "inline-block");
                    $(".portfolioText").val("Core Business Operations");
                }
                else {
                    $('.usiTransferElements').remove();
                }

                if(isInterOffering){
                    $('.newOfferingFields').show();
                }
                else{
                    $('.newOfferingFields').remove();
                }

                $('#requestTypeidentifier').text("Approval Request: " + getRequestType());
                if (!(isInterOffice && approverData.Offering == "Systems Engineering")) {
                    hideTalentGroup();
                }



                var userIds = [];
                var practitionerId = item.practitionerDetailsId;
                for (var prop in item) {
                    if (item.hasOwnProperty(prop)) {
                        var $field = $('[data-field="' + prop + '"]');
                        if ($field.length > 0) {
                            if ($field.is('[data-expand]')) {
                                userIds.push("(Id eq '" + item[prop] + "')");
                                $field.attr('data-userid', item[prop]);
                            }
                            else if ($field.is('textarea')) {
                                var value = $(item[prop]).text();
                                $field.val(value);
                            }
                            else if ($field.is('.hasDatepicker')) {
                                if (item[prop]) {
                                    $field.datepicker('setDate', new Date(item[prop]));
                                }
                            }
                            else if ($field.is("span")) {
                                $field.text(item[prop])
                            }
                            else {
                                $field.val(item[prop]);
                            }
                        }
                    }
                }

                if (item.Attachments) {
                    var $list = $('<ul></ul>');
                    $.each(item.AttachmentFiles.results, function (idx, val) {
                        var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + val.FileName + "</a>";
                        $list.append("<li>" + link + "</li>");
                    });
                    $('.attachments').append($list);
                }

                var userInfoUrl = siteUrl + "/_api/Web/SiteUserInfoList/items/?$filter=(" + userIds.join(" or ") + ")";

                loadListItems(
                    {
                        url: userInfoUrl,
                        success: function (data) {
                            $.each(data, function (idx, val) {
                                var name = val.LastName + ", " + val.FirstName;
                                if (practitionerId === val.Id) {
                                    $('[data-field="PractitionerEmail"]').val(val.EMail);
                                    $('[data-field="PractitionerName"]').val(name);
                                    $('[data-field="PractitionerLevel"]').val(val.JobTitle);
                                    $('[data-userid="' + val.Id + '"]').each(function (id, va) {
                                        $(va).attr('data-email', val.EMail).val(name);
                                    })
                                }
                                else {
                                    $('[data-userid="' + val.Id + '"]').each(function (id, va) {
                                        $(va).attr('data-email', val.EMail).val(name);
                                    })
                                }
                            })
                        }
                    })



                if (approverData.Status != "Pending") {
                    $('.actionButtons').attr('disabled', true);
                    $('#comments').val($(approverData.FinalComments).text()).attr('disabled', true);
                }
                $('.loading').hide();
                switch (approverData.transferType) {
                    case "Inter Office":
                        isInterOffice = true;
                        break;
                    case "Inter Offering":
                        isInterOffering = true;
                        break;
                    case "Inter Portfolio":
                        isInterPortfolio = true;
                        break;
                }
                $('#requestTypeidentifier').text("Transfer Request - " + getRequestType());
                showAdditionalInfoText();
                showRejectedByName();

            }
            else {
                $('.divTransferTable').html('<div class="container" style="height: 100%;display: flex;justify-content: center;align-items: center;width: 70%;"><div class="mesaggeWrapper"><h3>You do not have access to this page</h3></div></div>').show();
            }

        }
    })

    if(fromReports){
        $('.backButton').each(function(idx,val){
            $(val).text("Back to Reports");
        })
    }
}


function userContextLoaded() {
    currentLoggedInUserEmail = currentUser.get_email();
    currentLoggedInUserId = currentContext.get_web().get_currentUser().get_id()
    if (urlParam("Type") == "L") {
        isInterOffice = true;
    }
    else if (urlParam("Type") == "O") {
        isInterOffering = true;
    }
    else if (urlParam("Type") == "O") {
        isInterPortfolio = true;
    }
    else if (urlParam("Type") == "U") {
        isUSIToUSTransfer = true;
    }

    checkIfUserIsApprover();    
}

///
//to get the user Full name by id
function getUserNameById(GivenId) {
    var Id = GivenId;
    var fullName = "";

    $.ajax({
        url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/getuserbyid(" + Id + ")",
        type: "POST",
        async: false,
        contentType: "application/json;odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            debugger;
            userIdDetails = data;

            tempFullName = userIdDetails.d.Title;
            if(null != tempFullName &&  tempFullName.split(',').length > 1){
                fullName =  tempFullName.split(',')[1].trim() + " " + tempFullName.split(',')[0];

            }else{
                fullName = tempFullName;
            }
            
          
        },
        error: function (data) {
            failure(data);
        }
    });
    return fullName;
}

function getAdditionalInfoReqBy(requestIdForAPI){
    //pendingWithInfo = data from API ---(isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId)
    //requestIdForAPI = requestId;
    var requestedById = "";
     $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('AdditionalInfoRequestsLog')/items?$select=RequestedById&$filter=OriginalRequestID eq  "+requestIdForAPI+" &$top=1&$orderby=Id desc",
        type: "GET",
        async: false,
        contentType: "application/json;odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            console.log(data.d.results[0].RequestedById);
            requestedById = data.d.results[0].RequestedById;
        },
        error: function (data) {
            console.log(data);
        }
    });

    console.log("requestedById: "+requestedById);
    return requestedById;
}

function getRejectedBy(requestIdForAPI){
    
    var rejectedById = "";
     $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('ApproverAudit')/items?$select=ApproverNameId&$filter=OriginalRequestId eq "+requestIdForAPI+" &$Action='Rejected' &$top=1&$orderby=Id desc",
        type: "GET",
        async: false,
        contentType: "application/json;odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            console.log(data.d.results[0].ApproverNameId);
            rejectedById = data.d.results[0].ApproverNameId;
        },
        error: function (data) {
            console.log(data);
        }
    });

    console.log("rejectedById: "+rejectedById);
    return rejectedById;
}


////



