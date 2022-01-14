var leaveRequestListType = "";
var approvalLeaveRequestListType = "";
var additionalInfoRequestsLogType = "";
var approverAuditRequestType = "";

function togglePanel(ele) {
    var $ele = $(ele);
    $ele.closest('.panel').find('.panel-body').toggle();
    $ele.toggleClass('glyphicon-minus').toggleClass('glyphicon-plus');
}

var mandatoryFields = [
    "DateOfHire",				
    "talentLeadList",
    "RequestTypeDropDown",
    "talentGroupLeaderList",
    "offeringLeadId",
    "portfolioLeadId",
    "resourceManagerList",
    "talentEsList"
];
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
    },
    portfolio: {
        coreBusinessOperations: "Core Business Operations",
        strategyAnalytics: "Strategy & Analytics",
        mergersAcquisitions: "Mergers & Acquisitions",
        customerMarketing: "Customer & Marketing",
        humanCapital: "Human Capital",
        enterprisePerformance: "Enterprise Performance"
    },
    usTransfer: {
        USDC: "USDC",
        USCoreConsulting: "US Core Consulting",
        USGPS: "US GPS"
    }
}


function getLeavesRequestListType() {
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')",
        headers: { Accept: "application/json;odata=verbose" },
        success: function (data) {
            leaveRequestListType = data.d.ListItemEntityTypeFullName;
        }
    })
}

function getAdditionalInfoRequestLogListType() {
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('AdditionalInfoRequestsLog')",
        headers: { Accept: "application/json;odata=verbose" },
        success: function (data) {
            additionalInfoRequestsLogType = data.d.ListItemEntityTypeFullName;
        }
    })
}


$('.loading').show();
$('form').attr('autocomplete', "off");


var requestID = urlParam("TRID");

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
        $('.StartDate').hide();
        $('.EndDate').hide();
        $('.Reason').hide();
        $('.CurrentLWD').hide();
        $('.ProposedLWD').hide();
        $('.uploadpanel').hide();
        $('.RevokeResignationDate').hide();
        $('.AccumulatedLeaves').hide();
        $('#endDateDiv').removeClass().addClass("col-md-3 EndDate");
        initializeDatepickers();
        getNSetUserId();
    }
}


var currentLoggedInUserEmail = "";
var currentLoggedInUserId = "";
var currentLoggedInUserFullName = "";
var currentContext = SP.ClientContext.get_current();
var currentWeb = currentContext.get_web();
var currentUser = currentWeb.get_currentUser();
var siteUrl = _spPageContextInfo.webAbsoluteUrl;
var serviceLinePractioner = null;
var practitionerEmailIdPractioner = null;
var user1 = null;
var isTLAUser = false;
var requestTypeCode = "";
var businessRequestsConfiguration={};
var leaveTypes ={
    "LOP" : "Loss of Pay",
    "MTL" : "Maternity Leaves",
    // "MLE" : "ML Extensions",
    "MCL" : "Miscarriage / Abortion Leaves",
    "POB" : "PTO on bench",
    // "ELB" : "Early Release from Firm with Buy out of notice period", 
    "BER" : "Bereavement Leaves",
    "PTL" : "Paternity Leave",
    "APA" : "Advance PTO Approvals",
    // "RRD" : "Revoke Resignation"
}
var isTBAApprovalRequired = "";
var isTGLApprovalRequired = "";
var isOLApprovalRequired = "";
var isOPLApprovalRequired = "";

window.onload = function () {
    loadJSSet();
}

function initializeDatepickers() {
    $('[data-field="DateOfHire"').datepicker();
    $('[data-field="StartDate"').datepicker();
    $('[data-field="EndDate"').datepicker();
    $('[data-field="CurrentLWD"').datepicker();
    $('[data-field="ProposedLWD"').datepicker();
    $('[data-field="RevokeResignationDate"').datepicker();
    

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

function getNSetUserId() {
    currentContext.load(currentUser);
    currentContext.executeQueryAsync(Function.createDelegate(this, this.userContextLoaded), Function.createDelegate(this, this.userContextLoadFailed));
}

function userContextLoadFailed() {
    alert("Could not login user");
}

function checkIfUserIsApprover() {
    var queryDataUrl = siteUrl + "/_api/web/lists/getbytitle('Approvers')/items?$select=*,Approvers/Title,Approvers/EMail&$expand=Approvers/Id&$filter=Approvers/EMail eq '" + currentLoggedInUserEmail + "'";
    loadListItems({
        url: queryDataUrl,
        success: function (data) {
            if (data.length == 0) {
                $('.dropDownMenu [href$="?team=1"]').remove();
            }
            // else {
            //     $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
            // }

            if (data.length == 0 || !requestID) {
                $('.loading').hide();
                bootbox.alert("You are not authorized to view this form", function () {
                    window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
                });
            }
            else {
                data.filter(function (val, id) {
                    if (val.ImmigrationRoles == "TLA") {
                        isTLAUser = true;
                    }
                });
                getLeavesRequestListType();
                getAdditionalInfoRequestLogListType();
                getApproverAuditDataRequestListType();
                bootstrapper();
            }
        }
    });
}
function backToDashboard() {
    location.href = siteUrl + "/Pages/Dashboard.aspx?team=1";
}

function sendEmail(options, callback) {
    var currentDate = new Date();
    var currentDateForYear = currentDate.toDateString().split(' ');
    var month = currentDate.toLocaleString('en-US', { month: 'long' });;
    var year = currentDateForYear[3];
    var getEmailTemplates = siteUrl + "/_api/web/lists/getbytitle('EmailTemplates')/items?$select=EmailTemplateHtml&$filter= EmailType eq '" + options.templateType + "'";
    var Url = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx";
    loadListItems({
        url: getEmailTemplates,
        success: function (data) {
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            body = body.replace("{{CurrentMonth}}", month).replace("{{CurrentYear}}", year).replace("{{RequestCategory}}", options.requestCategory).
                replace("{{RequestType}}", options.requestType).replace("/sites/USICBOPortal/BusinessApproval/Lists/EmailTemplates", Url).
                replace("{{Employee}}", options.employee).
                replace("{{AdditionalInfo}}", options.additionalInfo).replace("{{Addressee}}", options.addressee).
                replace("{{RequestHyperLink}}", '<a href="' + options.requestUrl + '">here</a>').
                replace("{{FinalApproverName}}", options.FinalApproverName).replace("{{StartDate}}", options.StartDate).
                replace("{{EndDate}}", options.EndDate).replace("{{NextSteps}}", options.NextSteps);

            var deloitteImage = "<img src='" + siteUrl + "/PublishingImages/deloitte.png' class='img-responsive' alt=''/>";
            var twitter = "<img src='" + siteUrl + "/PublishingImages/twitter.png' style='width:30px;height:30px'>";
            var linkedin = "<img src='" + siteUrl + "/PublishingImages/linkedin.png' style='width:30px;height:30px'>";
            var instagram = "<img src='" + siteUrl + "/PublishingImages/intsgram.png' style='width:30px;height:30px'>";
            var yammer = "<img src='" + siteUrl + "/PublishingImages/yammer.png' style='width:30px;height:30px'>";
            var contactus = "<img src='" + siteUrl + "/PublishingImages/email.png' style='width:30px;height:30px'> ";
            var googlePlus = "<img src='" + siteUrl + "/PublishingImages/googleplus.png' style='width:30px;height:30px'> ";
            var URL = siteUrl + "/Pages/Dashboard.aspx";
            body = body.replace("{{linkedinimage}}", linkedin).replace("{{instgramimage}}", instagram).replace("{{yammerimage}}", yammer).replace("{{twitterimage}}", twitter);
            body = body.replace("/sites/USICBOPortal/BusinessApproval/Pages/Dashboard.aspx", URL).replace("{{googleplusimage}}", googlePlus).replace("{{emailimage}}", contactus).replace("{{deloitteimage}}", deloitteImage);
            sendEmailHtml(options.to, options.subject, body, options.cc, callback, callback);
        }
    });
}

function takeAction(approve) {
    //btn btn-primary bootbox-accept
    bootbox.confirm({
        message: (!approve) ? "Are you sure you want to Reject the request?" : "Are you sure you want to Approve the request?",
        buttons: {
            cancel: {
                className: "btn btn-primary"
            },
            confirm: {
                className: "btn btn-primary bootbox-accept"
            }
        },
        callback: function (result) {
            if (result) {
                initiateAction(approve);
            }
        }
    });

}

function requestMoreInfo() {
    var cBox = bootbox.confirm({
        title: "Request More Information",
        message: "<div class='requestMoreInfoDiv'></div>",
        buttons: {
            cancel: {
                label: 'Cancel',
                className: 'btn-primary'
            },
            confirm: {
                label: 'Confirm',
                className: 'btn-primary confirmRequestInfo'
            }
        },
        callback: function (result) {
            if (result) {
                initiateMoreInfoRequest();
            }
        }
    });

    cBox.init(function () {
        var $content = $('<div></div>');
        var $row = $('<div class="row"></div>');
        //var isPendingWithRM = approverData.PendingWith.results[0] == "RM";
        //if (!isPendingWithRM) {
        //    $row.append('<div class="col-md-4"><label>Request Information from:</label></div>')
        //        .append('<div class="col-md-5"><label><input onchange="requestMoreInfoValueChanged()" type="radio" name="RequestTo" value="Practitioner" checked/>Practitioner</label></div>');
        //    $content.append($row);
        //}
        //else {
            $row.append('<div class="col-md-4"><label>Request Information from:</label></div>')
                .append('<div class="col-md-5"><label>Practitioner</label></div>');
            $content.append($row);
        //}
        $row = $('<div class="row" style="padding-top:10px"></div>');
        $row.append('<div class="col-md-5"><label>Comments:</label></div>')
            .append('<div class="col-md-10"><textarea onchange="requestMoreInfoValueChanged()" style="width:100%" id="moreInfoText"></textarea></div>');
        $content.append($row);

        $('.requestMoreInfoDiv').html($content);
        requestMoreInfoValueChanged();
    })
}

function requestMoreInfoValueChanged() {
    var commentsText = $('#moreInfoText').val().trim();
    //var isPendingWithRM = approverData.PendingWith.results[0] == "RM";

    if (commentsText) {
        $('.confirmRequestInfo').removeAttr('disabled');
    }
    else {
        $('.confirmRequestInfo').attr('disabled', true);
    }
}

function initiateMoreInfoRequest() {
    $('.loading').show();
    var requestTo = '';
    //var isPendingWithRM = approverData.PendingWith.results[0] == "RM";
    //if (isPendingWithRM) {
        requestTo = "Practitioner";
    //}
    //else {
    //    requestTo = $('[name="RequestTo"]:checked').val();
    //}

    var comments = $('#moreInfoText').val().trim();

    var requestToEmail = $('[data-field="resourceManagerDetailsId"]').data("email");
    var requestToName = $('[data-field="resourceManagerDetailsId"]').val();
    var requestToId = $('[data-field="resourceManagerDetailsId"]').data('userid');

    var requestCCEmail = currentLoggedInUserEmail;
    var fieldsToUpdate = {
        PendingWith: { results: ["RM"] },
        IsAdditionalDataRequired: 'Y',
        AdditionalDataComments: comments,
        "__metadata": {
            "type": approvalLeaveRequestListType
        }
    }

    var toPractitioner = false;
    if (requestTo == "Practitioner") {
        toPractitioner = true;
        fieldsToUpdate.PendingWith.results = [];
        fieldsToUpdate.Title = 'Draft';
        requestToEmail = $('[data-field="PractitionerEmail"]').val();
        requestToName = $('[data-field="PractitionerName"]').val();
        requestToId = approverData.PractitionerId;
    }

    var list1Updated = false;
    var list2Updated = false;
    var list3Updated = false;

    var updateUrl = siteUrl + "/_api/web/lists/getbytitle('ApprovalEmployeeRequests')/items(" + approverData.ID + ")";
    $.ajax({
        url: updateUrl,
        type: "PATCH",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(fieldsToUpdate),
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "If-Match": "*"
        },
        success: function (data) {
            list1Updated = true;
        }
    });

    fieldsToUpdate.__metadata.type = leaveRequestListType;
        
    updateUrl = siteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')/items(" + approverData.OriginalRequestId + ")";
    $.ajax({
        url: updateUrl,
        type: "PATCH",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(fieldsToUpdate),
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "If-Match": "*"
        },
        success: function (data) {
            list2Updated = true;
        }
    });

    function getLoggedinuserRole() {
        var result = approverData.PendingWith.results[0];
        switch (result) {
            case "OL":
                result = "Offering Lead";
                break;
            case "OPL":
                result = "Portfolio Lead";
                break;
            case "TGL":
                result = "Talent Group Leader";
                break;
            case "TL":
                result = "Talent BA";
                break;
        }
        return result;
    }

    fieldsToUpdate = {
        "__metadata": {
            "type": additionalInfoRequestsLogType
        },
        OriginalRequestID: approverData.OriginalRequestId,
        RequestedById: currentLoggedInUserId,
        RequestedToId: requestToId,
        RequesterType: getLoggedinuserRole(),
        RequesteeType: toPractitioner ? "Practitioner" : "ResourceManager",
        RequestedInformation: comments
    }

    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('AdditionalInfoRequestsLog')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(fieldsToUpdate),
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()

        },
        success: function (data) {
            list3Updated = true;
        }
    })

    //audit on Request additional info
    //Approver Audit - log in case of AdditionalData
    var approvalAuditInfo = {
        "__metadata": {
            "type": approverAuditRequestType
        },
        "Title": "TalentApproval",
        "Category": "Talent",
        "OriginalRequestId": parseInt(approverData.OriginalRequestId),
        "RequestId": parseInt(approverData.ID),
        "Action": "AdditionalData",
        "ApproverRole": approverData.PendingWith.results[0],
        "ApproverNameId": currentLoggedInUserId,
        "ActionDate": new Date(),
        "AddittionalDataTo": requestTo
    };

    $.ajax({
        async: true,
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('ApproverAudit')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(approvalAuditInfo),
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            console.log("AdditionalData Audit complete.");
        },
        complete: function (data) {
        }
    });

    //////

    var requestUrl = siteUrl + "/Pages/TalentRequest.aspx?TRID=" + approverData.OriginalRequestId;

    var emailOptions = {
        to: requestToEmail,
        subject: "Leave Approval Request for " + $('[data-field="PractitionerName"]').val() + '- Additional information required',
        templateType: "clarification",
        addressee: requestToName,
        requester: currentLoggedInUserFullName,
        additionalInfo: comments,
        requestType: 'Leave',
        requestTo: requestToName,
        Id: approverData.OriginalRequestId,
        message: comments,
        requestUrl: requestUrl
    }
    emailOptions.emailHeader = "Leave Request - Additional Information Required";

    var emailInitator = setInterval(function () {
        if (list1Updated && list2Updated && list3Updated) {
            clearInterval(emailInitator);
            sendEmail(emailOptions, function () {
                bootbox.alert("Request has been sent back to " + (toPractitioner ? "Practitioner" : "Resource Manager") + " for additional information.", function () {
                    window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=1";
                });
            });
        }
    }, 1000)

}

var finalStageReached = false;
function checkIfFinalStageReached() {
    var currentPendingWith = approverData.PendingWith.results[0];
  
    if (currentPendingWith == "TL" && isTGLApprovalRequired == "N" && isOLApprovalRequired == "N" && isOPLApprovalRequired == "N") {
        finalStageReached = true;
    }
    else if (currentPendingWith == "TGL" && isOLApprovalRequired == "N" && isOPLApprovalRequired == "N") {
        finalStageReached = true;
    }
    else if (currentPendingWith == "OL" && isOPLApprovalRequired == "N") {
        finalStageReached = true;
    }
    else if (currentPendingWith == "OPL") {
        finalStageReached = true;
    }
}

function initiateAction(approve) {

    $('.error').removeClass('error');
    if(validate()){

        var isRejected = !approve;
        if (!checkIfCurrentUserIsTheRightApprover()) {
            bootbox.alert("You are not authorized to approve/reject this form.");
        }
        else if (isRejected && !$('#comments').val()) {
            bootbox.alert("Please provide Approval/Rejection reason");
        }
        // else if (!$('[data-field="Businesscase"]').val()) {
        //     bootbox.alert("Please provide Business Case");
        // }
        else {
            var nextPendingWith = "";
            var currentComments = {};
            $('.panel-greydefault').find('*').attr('disabled', false);
            switch (approverData.PendingWith.results[0]) {
                case "TL":
                    if (isTGLApprovalRequired == "Y") {
                        nextPendingWith = "TGL";
                    }                
                    else if(isOLApprovalRequired == "Y") {
                        nextPendingWith = "OL";
                    }
                    else if(isOPLApprovalRequired == "Y") {
                        nextPendingWith = "OPL";
                    }
                    currentComments = { "TBAComments": $('#comments').val() }
                    break;
                case "TGL":
                    if(isOLApprovalRequired == "Y") {
                        nextPendingWith = "OL";
                    }
                    else if(isOPLApprovalRequired == "Y") {
                        nextPendingWith = "OPL";
                    }
                    currentComments = { "TGLComments": $('#comments').val() };
                    break;
                case "OL":
                    if(isOPLApprovalRequired == "Y") {
                        nextPendingWith = "OPL";
                    }
    
                    break;
                case "OPL":
                    currentComments = { "OPLComments": $('#comments').val() }
                    break;
            }
    
    
    
            var fieldsToUpdate = {
                "__metadata": {
                    "type": approvalLeaveRequestListType
                },
                IsAdditionalDataRequired: ''
            }            

            if (!finalStageReached && !isRejected) {
                fieldsToUpdate = {
                    PendingWith: { results: [nextPendingWith] },
                    "__metadata": {
                        "type": approvalLeaveRequestListType
                    },
                    IsAdditionalDataRequired: ''
                }
                // if (approverData.PendingWith.results[0] == "TL") {
                //     if (isTLAUser) {
                //         fieldsToUpdate["IsApprovedByRMSP"] = "Y";
                //         fieldsToUpdate["ApprovingRMSP"] = currentLoggedInUserEmail;
                //     }
                //     else{
                //         fieldsToUpdate["IsApprovedByRMSP"] = "";
                //         fieldsToUpdate["ApprovingRMSP"] = "";
                //     }
                // }
            }
            else {
                fieldsToUpdate["Status"] = isRejected ? "Rejected" : "Approved";
                fieldsToUpdate["PendingWith"] = { results: [] };
    
                if (currentComments.OPLComments) {
                    fieldsToUpdate.FinalComments = currentComments.OPLComments;
                } else if (currentComments.OLComments) {
                    fieldsToUpdate.FinalComments = currentComments.OLComments;
                } else if (currentComments.TGLComments) {
                    fieldsToUpdate.FinalComments = currentComments.TGLComments;
                } else if (currentComments.TLComments) {
                    fieldsToUpdate.FinalComments = currentComments.TLComments;
                }
            }
            // var businessCase = $('[data-field="Businesscase"]').val();
            // if (businessCase) {
            //     fieldsToUpdate["Businesscase"] = businessCase;
            // }
    
            // if ($('[data-field="ExceptionFlag"]').is(":checked")) {
            //     fieldsToUpdate["ExceptionFlag"] = "Y";
            //     fieldsToUpdate["ExceptionComments"] = $('#exceptionComments').val();
            // }
            // else {
            //     fieldsToUpdate["ExceptionFlag"] = "N";
            // }
            // var eligibilityCriteriaItems = [];
            // $('[data-field="EligibilityCriteriaItems"]:checked').each(function (idx, val) {
            //     eligibilityCriteriaItems.push($(val).val());
            // })
            // if (eligibilityCriteriaItems.length > 0) {
            //     fieldsToUpdate["EligibilityCriteriaItems"] = eligibilityCriteriaItems.join(",");
            // }

            //by me 
            fieldsToUpdate["DateOfHire"] = $("#DateOfHire").val();
            fieldsToUpdate["TalentTeamPersonId"]  = $("#talentLeadList").val();
            fieldsToUpdate["ResourceManagerId"]  = $("#resourceManagerList").val();
            fieldsToUpdate["TalentESId"]  = $("#talentEsList").val();
            fieldsToUpdate["StartDate"]  = $("#StartDate").val();
            fieldsToUpdate["EndDate"]  = $("#EndDate").val();
            fieldsToUpdate["Reason"]  = $("#Reason").val();
            fieldsToUpdate["CurrentLWD"]  = $("#CurrentLWD").val();
            fieldsToUpdate["ProposedLWD"]  = $("#ProposedLWD").val();
            fieldsToUpdate["TalentGroupLeadId"] = $("#talentGroupLeaderList").val();
            fieldsToUpdate["RevokeResignationDate"]  = $("#RevokeResignationDate").val();
            fieldsToUpdate["AccumulatedLeaves"]  = parseInt($("#AccumulatedLeaves").val()) * 8;
            ////
    
            $.extend(fieldsToUpdate, currentComments);
            $('.loading').show();
            var urlTemplateEditMode = siteUrl + "/_api/web/lists/getbytitle('ApprovalEmployeeRequests')/items(" + approverData.ID + ")";
            $.ajax({
                url: urlTemplateEditMode,
                type: "PATCH",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(fieldsToUpdate),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "If-Match": "*"
                },
                success: function (data) {

                    //upload files on approva screen
                    uploadFiles(approverData.OriginalRequestId, function () {
                        // bootbox.alert("Request submitted successfully.", function () {
                        //     window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/dashboard.aspx?team=0";
                        // });
                    });



                    var to = "";
                    var toName = ""
                    var cc = "";
                    var emailTemplate = "";
                    if (isRejected) {
                        to = $('[data-field="PractitionerEmail"]').val();
                        toName = $('[data-field="PractitionerName"]').val();
                        if (finalStageReached)
                        {
                            // cc = $('[data-field="resourceManagerDetailsId"]').data("email"); 
                            cc = GetUserbyId($("#resourceManagerList").val()); 
                            
                            // cc += "," + $('[data-field="TalentTeamPersonId"]').data("email");
                            // cc += "," + $('[data-field="TalentGroupLeadId"]').data("email");
                            // cc += "," + $('[data-field="TalentEsId"]').data("email");

                            cc += "," + GetUserbyId($("#talentLeadList").val()); 
                            cc += "," + GetUserbyId($("#talentGroupLeaderList").val()); 
                            cc += "," + GetUserbyId($("#talentEsList").val()); 

                            if(approverData.PendingWith.results[0] == "OPL")
                            {
                                cc += "," + $('[data-field="OfferingLeadId"]').data("email");
                            }
                        }
                        emailTemplate = "EmployeeRequestReject";
                    }
                    // else if (!finalStageReached) {
                    //     switch (approverData.PendingWith.results[0]) {
                    //         case "TL":
                    //             if (approverData.Offering == "Systems Engineering" && (approverData.MarketOffering == "SDO" || approverData.MarketOffering == "SDE")) {
                    //             	to = $('[data-field="TalentGroupLeadId"]').data("email");
                    //             	toName = $('[data-field="TalentGroupLeadId"]').val();
                    //             	cc = $('[data-field="resourceManagerDetailsId"]').data("email");
                    //             }
                    //              else {
                    //                  to = $('[data-field="offeringLeadDetailsId"]').data("email");
                    //                  toName = $('[data-field="offeringLeadDetailsId"]').val();
                    //                  cc = $('[data-field="resourceManagerDetailsId"]').data("email");
                    //              }
                    //             break;
                    //         case "OL":
                    //             to = $('[data-field="PortfolioLeadId"]').data("email");
                    //             toName = $('[data-field="PortfolioLeadId"]').val();
                    //             cc = $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="offeringLeadDetailsId"]').data("email");
                    //             if (approverData.Offering == "Systems Engineering" && (approverData.MarketOffering == "SDO" || approverData.MarketOffering == "SDE")) {
                    //             	cc += "," + $('[data-field="TalentGroupLeadId"]').data("email");
                    //             }
                    //             break;
                    //         case "TGL":
                    //             to = $('[data-field="offeringLeadDetailsId"]').data("email");
                    //             toName = $('[data-field="offeringLeadDetailsId"]').val();
                    //             cc = $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="TalentGroupLeadId"]').data("email");
    
                    //             break;
                    //     }
                    //     emailTemplate = "LeaveRequestForApproval";
                    // }
                    else {
                        to = $('[data-field="PractitionerEmail"]').val();
                        toName = $('[data-field="PractitionerName"]').val();
                        if (finalStageReached)
                        {
                            // cc = $('[data-field="resourceManagerDetailsId"]').data("email");
                            cc = GetUserbyId($("#resourceManagerList").val()); 
                            
                            // cc += "," + $('[data-field="TalentTeamPersonId"]').data("email");
                            // cc += "," + $('[data-field="TalentGroupLeadId"]').data("email");
                            // cc += "," + $('[data-field="TalentEsId"]').data("email");

                            cc += "," + GetUserbyId($("#talentLeadList").val()); 
                            cc += "," + GetUserbyId($("#talentGroupLeaderList").val()); 
                            cc += "," + GetUserbyId($("#talentEsList").val()); 

                            if(approverData.PendingWith.results[0] == "OPL")
                            {
                                cc += "," + $('[data-field="OfferingLeadId"]').data("email");
                            }
                        }
                        emailTemplate = "EmployeeRequestApproval";
                    }
    
                    // if (!isRejected && isRMSPUser && approverData.PendingWith.results[0] == "RM") {
                    //     cc = cc + "," + currentLoggedInUserEmail;
                    // }
					if(finalStageReached || isRejected){
                        var finalApproverName = "";
                        var nextSteps = "";
                        if(finalStageReached){
                            if(approverData.PendingWith.results[0] == "OPL")
                            {
                                finalApproverName = getUserNameById($('#portfolioLeadId').val());
                            }
                            else if(approverData.PendingWith.results[0] == "OL"){
                                finalApproverName = getUserNameById($('#offeringLeadId').val());
                            }
                            else if(approverData.PendingWith.results[0] == "TGL"){
                                finalApproverName = getUserNameById($('#talentGroupLeaderList').val());
                            }
                            else if(approverData.PendingWith.results[0] == "TL"){
                                finalApproverName = getUserNameById($('#talentLeadList').val());
                            }
                            if(requestTypeCode == "LOP" || requestTypeCode == "MTL" || requestTypeCode == "MCL" 
                            || requestTypeCode == "BER" || requestTypeCode == "PTL"){
                                nextSteps =  '<div>Next Steps:<ol><li>Apply <a href="https://deloittenet.deloitte.com/talentondemand/benefits/usi/leaves/pages/applyforaleaveusi.aspx" target="_blank" style="text-decoration: underline;">here</a> for raising the request</li>'
                                +'<li>Attach this email as Business approval</li>'
                                +'<li>Do attach relevant medical documents, if required</li>'
                                +'<li>Keep your coach and RM informed</li>'
                                +'</ol></div>';
                            }
                            else if(requestTypeCode == "POB" || requestTypeCode == "APA"){
                                nextSteps =  "<div>Next Steps:<ol><li>Please update DTE manually </li><li>Keep your coach and RM informed</li></ol></div>";
                            }
                        }
                        
						options = {
							to: to,
							cc: cc,
							subject: "Leave Approval Request for " + $('[data-field="PractitionerName"]').val(),
							templateType: emailTemplate,
							requestType: leaveTypes[requestTypeCode],
							requestCategory: 'Talent ELE',
							employee: $('[data-field="PractitionerName"]').val(),
                            Id: approverData.OriginalRequestId,
                            FinalApproverName: finalApproverName,
                            StartDate: $("#StartDate").val(),
                            EndDate: $("#EndDate").val(),
                            NextSteps: nextSteps
						}
		
		
						// if (emailTemplate == "EmployeeRequestApproval") {
						//     options.requestTo = options.RM;
						// }
		
						//options.emailHeader = "Leave Request";
		
		
						sendEmail(options, function () {
							var message = "The request has been approved.";
							if (isRejected) {
								message = "The request has been rejected.";
							}
							bootbox.alert(message, function () {
								window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=1";
							});
						});
					}
					else{
						var message = "The request has been approved.";
						if (isRejected) {
							message = "The request has been rejected.";
						}
						bootbox.alert(message, function () {
							window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=1";
						});
					}
                },
                complete: function () {
    
                }
            })
    
            var openListUrl = siteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')/items(" + approverData.OriginalRequestId + ")";
            fieldsToUpdate = {
                "__metadata": {
                    "type": leaveRequestListType
                },
                IsAdditionalDataRequired: ''
            }
    
            // fieldsToUpdate["ExceptionFlag"] = $('[data-field="ExceptionFlag"]').is(":checked") ? "Y" : "N";
            
            //by me 
            fieldsToUpdate["DateOfHire"] = $("#DateOfHire").val();
            fieldsToUpdate["TalentTeamPersonId"]  = $("#talentLeadList").val();
            fieldsToUpdate["ResourceManagerId"]  = $("#resourceManagerList").val();
            fieldsToUpdate["TalentESId"]  = $("#talentEsList").val();
            fieldsToUpdate["StartDate"]  = $("#StartDate").val();
            fieldsToUpdate["EndDate"]  = $("#EndDate").val();
            fieldsToUpdate["Reason"]  = $("#Reason").val();
            fieldsToUpdate["CurrentLWD"]  = $("#CurrentLWD").val();
            fieldsToUpdate["ProposedLWD"]  = $("#ProposedLWD").val();
            fieldsToUpdate["TalentGroupLeadId"] = $("#talentGroupLeaderList").val();
            fieldsToUpdate["RevokeResignationDate"]  = $("#RevokeResignationDate").val();
            fieldsToUpdate["AccumulatedLeaves"]  = parseInt($("#AccumulatedLeaves").val()) * 8;
            ////

            if (finalStageReached || isRejected) {
                if (currentComments.PLComments) {
                    fieldsToUpdate.FinalComments = currentComments.PLComments;
                } else if (currentComments.OLComments) {
                    fieldsToUpdate.FinalComments = currentComments.OLComments;
                } else if (currentComments.TGLComments) {
                    fieldsToUpdate.FinalComments = currentComments.TGLComments;
                } else if (currentComments.RMComments) {
                    fieldsToUpdate.FinalComments = currentComments.RMComments;
                }
                fieldsToUpdate.Status = isRejected ? "Rejected" : "Approved";
                fieldsToUpdate["PendingWith"] = { results: [] };
            }
            else {
                fieldsToUpdate["PendingWith"] = { results: [nextPendingWith] };
            }
    
            $.ajax({
                url: openListUrl,
                type: "PATCH",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(fieldsToUpdate),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "If-Match": "*"
                },
                success: function (data) {
    
                },
                complete: function () {
    
                }
            })

             //Approver Audit - Approval Audit entry for approved
            var approverAction = "";
            if (isRejected) {
                approverAction = "Rejected";
            }
            else {
                approverAction = "Approved";
            }
            var approvalAuditData = {
                "__metadata": {
                    "type": approverAuditRequestType
                },
                "Title": "TalentApproval",
                "Category": "Talent",
                "OriginalRequestId": parseInt(approverData.OriginalRequestId),
                "RequestId": parseInt(approverData.ID),
                "Action": approverAction,
                "ApproverRole": approverData.PendingWith.results[0],
                "ApproverNameId": currentLoggedInUserId,
                "ActionDate": new Date(),
                "AddittionalDataTo": ""
            };

            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('ApproverAudit')/items",
                type: "POST",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(approvalAuditData),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    console.log("Approve/Reject Audit complete");
                },
                complete: function (data) {
                }
            });

           
            //////
    
        }
    }

   
}

function hideTalentGroup() {
    return 1;
    var $tglDiv = $('[data-field="TalentGroupLeadId"]').closest('div');
    $tglDiv.remove();
}

function showAdditionalInfoText() {
    if (approverData.IsAdditionalDataRequired == 'Y') {
        $('<div style="margin-top: 40px;border: 1px #86BC25;border-style: solid;padding: 10px;"><b style="color:red">Additional Information Requested By: </b><b style="color:black">'+getUserNameById(getAdditionalInfoReqBy(approverData.OriginalRequestId))+' </b><p>' + approverData.AdditionalDataComments + '</p></div>').insertAfter('.txt-new-Request');
        //$('<div style="margin-top: 40px;border: 1px #86BC25;border-style: solid;padding: 10px;"><b style="color:red">Additional Information Requested By: </b> <b style="color:black">'+getUserNameById(getAdditionalInfoReqBy((isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId)))+' </b><p>' + approverData.AdditionalDataComments + '</p></div>').insertAfter('.txt-new-Request');
    }
}

function checkIfCurrentUserIsTheRightApprover() {
    var hasAccess = false;
    switch (approverData.PendingWith.results[0]) {
        case "TL":
            hasAccess = approverData.TalentTeamPersonId === currentLoggedInUserId;
            // if (!hasAccess && isTLAUser) {
            //     hasAccess = true;
            // }
            break;
        case "TGL":
            hasAccess = approverData.TalentGroupLeadId === currentLoggedInUserId;
            break;
        case "OL":
            hasAccess = approverData.OfferingLeadId === currentLoggedInUserId;
            break;
        case "OPL":
            hasAccess = approverData.PortfolioLeadId === currentLoggedInUserId;
            break;
    }

    if (!hasAccess) {
        $('.actionButtons').attr('disabled', true);
        $('textarea,.hasDatepicker').attr('disabled', true);
        $('input[type="checkbox"]').attr('disabled', true);
    }
    return hasAccess;
}

function loadBusinessRequestConfigurations(item){
    var url = siteUrl + "/_api/web/lists/getbytitle('BusinessRequestsConfiguration')/items?$select=*&$filter=RequestCategory eq 'Talent'";
    loadListItems({
        url: url,
        success: function (data) {
            if (data.length > 0) {
                businessRequestsConfiguration = data;
                requestTypeCode = item.RequestType;
                var requestTypeText = leaveTypes[item.RequestType];
                var filterColumns = "";
                businessRequestsConfiguration.filter(function (val, id) {
                    if (val.RequestType == requestTypeText) {
                        filterColumns = $(val.FieldsToCapture).text();
                        isTBAApprovalRequired = val.IsTBAApprovalRequired;
                        isTGLApprovalRequired = val.IsTGLApprovalRequired;
                        isOLApprovalRequired = val.IsOLApprovalRequired;
                        isOPLApprovalRequired = val.IsOPLApprovalRequried;
                        if(filterColumns.includes('StartDate') && filterColumns.includes('EndDate') && !(val.IsOPLApprovalRequried == "N" && val.IsOLApprovalRequired == "N")){
                            if(((new Date(item.EndDate).getTime() - new Date(item.StartDate).getTime()) / (1000 * 3600 * 24)) > 90){
                                if(val.IsOPLApprovalRequried == "YC"){
                                    isOPLApprovalRequired = "Y";
                                    //New configuration changes
                                    //isOLApprovalRequired = "N";
                                }
                            }
                            else{
                                if(val.IsOPLApprovalRequried == "YC"){
                                    isOPLApprovalRequired = "N";
                                    //New configuration changes
                                    //isOLApprovalRequired = "Y";
                                }
                            }
                        }
                        if(val.IsLeadershipApprovalRequired == "Y"){
                            $('.uploadpanel').show();
                        }
                        checkIfFinalStageReached();
                        //TO-DO YC logic
                    }
                    // if(item.RequestType == "ELB"){
                    //     $('.RequestType').removeClass('col-sm-3').addClass('col-sm-7');
                    // }
                })
                var individualColumns = filterColumns.split(',');
                individualColumns.forEach(element => {
                    if(element.trim() == "StartDate"){
                        $('.StartDate').show();
                        mandatoryFields.push("StartDate");
                        
                    }
                    else if(element.trim() == "EndDate"){
                        $('.EndDate').show();
                        mandatoryFields.push("EndDate");
                    }
                    else if(element.trim() == "Reason"){
                        $('.Reason').show();
                        mandatoryFields.push("Reason");
                    }
                    else if(element.trim() == "CurrentLWD"){
                        $('.CurrentLWD').show();
                        mandatoryFields.push("CurrentLWD");
                    }
                    else if(element.trim() == "ProposedLWD"){
                        $('.ProposedLWD').show();
                        mandatoryFields.push("ProposedLWD");
                    }
                    else if(element.trim() == "RevokeResignationDate"){
                        $('.RevokeResignationDate').show();
                        mandatoryFields.push("RevokeResignationDate");
                    }
                    else if(element.trim() == "AccumulatedLeaves"){
                        $('.AccumulatedLeaves').show();
                        $('#endDateDiv').removeClass().addClass("col-md-2 EndDate");
                        mandatoryFields.push("AccumulatedLeaves");
                    }
                    // switch (element) {
                    //     case "Start Date":
                    //         $('.StartDate').show();
                    //         break;
                    //     case "End Date":
                    //         $('.EndDate').show();
                    //         break;
                    //     case "Reason":
                    //         $('.Reason').show();
                    //         break;
                    //     case "Current LWD":
                    //         $('.CurrentLWD').show();
                    //         break;
                    //     case "Proposed LWD":
                    //         $('.ProposedLWD').show();
                    //         break;
                    // }
                });
            }
        }
    });
}

function loadExteriorAttachments() {
    var url = siteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')/items?$select=*&$expand=AttachmentFiles&$filter=ID eq '" + requestID + "'";
    function getCheckListName(type) {
        return type;

    }
    loadListItems({
        url: url,
        success: function (data) {
            if (data.length > 0) {
                var item = data[0];
                if (item.Attachments) {
                    var $list = $('<ul></ul>');
                    $.each(item.AttachmentFiles.results, function (idx, val) {
                        var fileName = val.FileName;
                        var checkListType = "";
                        if (fileName.indexOf("^$SEP$^") !== -1) {
                            checkListType = fileName.split('^$SEP$^')[0];
                            fileName = fileName.split('^$SEP$^')[1];
                        }
                        var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + fileName + "</a>";
                        // if (checkListType) {
                        //     link += ("<span style='paddding-left:10px'>(" + getCheckListName(checkListType) + ")</span>");
                        // }
                        $list.append("<li>" + link + "</li>");
                    });
                    $('.attachments').append($list);
                }
            }
        }
    });
}

function bootstrapper() {
    var url = siteUrl + "/_api/web/lists/getbytitle('ApprovalEmployeeRequests')/items?$select=*,Practitioner/EMail&$expand=AttachmentFiles,Practitioner/Id&$filter=OriginalRequestId eq '" + requestID + "'";
    loadListItems({
        url: url,
        success: function (data) {
            if (data.length > 0) {
                $('.divTransferTable').show();
                var item = data[0];
                window.approverData = item;
                approvalLeaveRequestListType = item.__metadata.type;
                if (!approverData.PendingWith) {
                    approverData.PendingWith = { results: [] };
                }

                $('#requestTypeidentifier').text("Approval Request: Leave");
                checkIfCurrentUserIsTheRightApprover();
                showAdditionalInfoText();
                loadBusinessRequestConfigurations(item);

                //by me
                LoadApproversPopulatedData().done(function (data, textStatus, jqXHR) {
                    var allData = data.d.results;
                    if (allData.length > 0) {
                        $(allData).each(function (index, item) {
                            var title = item.Title.split(' ');
                            if (getOfferingCode(approverData.Offering) === title[0]) {
                                if (item.ImmigrationRoles === "TGL" || item.ImmigrationRoles === "TL" || item.ImmigrationRoles === "RM" || item.ImmigrationRoles === "ES") {
                                    var elementSelector = "";
                                    switch (item.ImmigrationRoles) {
                                        case "TGL":
                                            elementSelector = "talentGroupLeaderList";
                                            break;
                                        case "TL":
                                            elementSelector = "talentLeadList";
                                            break;
                                        case "RM":
                                            elementSelector = "resourceManagerList";
                                            break;
                                        
                                            //TalentEs
                                        case "ES":
                                            elementSelector = "talentEsList";
                                            break;

                                    }

                                    $.each(item.Approvers.results, function (k, v) {
                                        $("#" + elementSelector).append('<option value="' + item.Approvers.results[k].ID + '">' + item.Approvers.results[k].Title + '</option>');
                                    });
                                } else if (item.ImmigrationRoles === "OPL") {
                                    $("#portfolioLeadId").val(item.Approvers.results[0].ID);
                                    $("#portfolioLead").val(item.Approvers.results[0].Title);
                                } else if (item.ImmigrationRoles === "OL") {
                                    $('#offeringLead').val(item.Approvers.results[0].Title);
                                    $('#offeringLeadId').val(item.Approvers.results[0].ID);
                                }
                            }
                        });

                        // if (editMode) {
                        //     setEditModeData();
                        // }
                        // else {
                        //     getTransferRequestListType();
                        //     $('#practitionerPersonnelID').val(currentLoggedInUserEmail);
                        //     $('.loading').hide();
                        // }

                    }
                });
                /////////////////

                /////////////// see here for any data-field  
                var userIds = [];
                var practitionerId = item.PractitionerId;
                for (var prop in item) {
                    if (item.hasOwnProperty(prop)) {
                        var $field = $('[data-field="' + prop + '"]');
                        if ($field.length > 0) {
                            if($field.selector.includes("AccumulatedLeaves")){
                                $field.val(parseInt(item[prop])/8);
                            }
                            else{
                                if($field.selector.includes("RequestType")){
                                    $field.val(leaveTypes[item[prop]]);
                                }
                                else if ($field.is('[data-expand]')) {///this option for Talent Group Leader
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
                                // else if ((prop == "ChecklistItems" || prop == "EligibilityCriteriaItems")) {
                                //     if (item[prop]) {
                                //         var checkLists = item[prop].split(',');
                                //         $(checkLists).each(function (idx, val) {
                                //             $('[type="checkbox"][value="' + val + '"]').prop('checked', true);
                                //         });
                                //     }
                                // }
                                else if ($field.is("[type='checkbox']")) {
                                    if (item[prop] == "Y") {
                                        $field.trigger('click');
                                    }
                                }
                                else if ($field.is(":radio")) {
                                    $field.filter('[value="' + item[prop] + '"]').prop('checked', true);
                                }
                                else {
                                    $field.val(item[prop]);
                                }
                            }
                        }
                    }
                }



                loadExteriorAttachments();

                var userInfoUrl = siteUrl + "/_api/Web/SiteUserInfoList/items/?$filter=(" + userIds.join(" or ") + ")";


                loadListItems(
                    {
                        url: userInfoUrl,
                        success: function (data) {
                            $.each(data, function (idx, val) {
                                var name = val.FirstName + " " + val.LastName;
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
                            });

                            var $previousComments = $('#previousComments');
                            if ($(item.TBAComments).text()) {
                               // $previousComments.append('<div class="col-md-10"><label>' + $('[data-field="TalentTeamPersonId"]').val() + ':</label><p>' + $(item.TBAComments).text() + '</p></div>');
                                $previousComments.append('<div class="col-md-10"><label>' + $('#talentLeadList option:selected').text().split(',')[1].trim() + " " + $('#talentLeadList option:selected').text().split(',')[0] + ':</label><p>' + $(item.TBAComments).text() + '</p></div>');
                            }    
                            if ($(item.TGLComments).text()) {
                                //$previousComments.append('<div class="col-md-10"><label>' + $('[data-field="TalentGroupLeadId"]').val() + ':</label><p>' + $(item.TGLComments).text() + '</p></div>');
                                $previousComments.append('<div class="col-md-10"><label>' + $('#talentGroupLeaderList option:selected').text().split(',')[1].trim() + " " + $('#talentGroupLeaderList option:selected').text().split(',')[0] + ':</label><p>' + $(item.TGLComments).text() + '</p></div>');
                            }
                            if ($(item.OLComments).text()) {
                                $previousComments.append('<div class="col-md-10"><label>' + $('[data-field="OfferingLeadId"]').val() + ':</label><p>' + $(item.OLComments).text() + '</p></div>');
                            }                            
                            // if (!finalStageReached && !(approverData.IsAdditionalDataRequired == 'Y' && approverData.PendingWith.results[0] == "TL")) {
                            //     $('.moreinfo').remove();
                            // }
                        }
                    })



                if (approverData.Status != "Pending") {
                    $('.actionButtons').attr('disabled', true);
                    $('#comments').val($(approverData.FinalComments).text()).attr('disabled', true);
                }

                 //approval history tab
                
                 var approvalHistoryData = "";

                 $.ajax({
                 url: _spPageContextInfo.webAbsoluteUrl+"/_api/web/lists/getbytitle('ApproverAudit')/items?$select=ApproverNameId,Created&$filter=((OriginalRequestId eq " + approverData.OriginalRequestId + ") and  (RequestId eq " + approverData.ID	+ " ) and (Action eq 'Approved')) &$orderby=Id desc",
                 type: "GET",
                 async: false,
                 contentType: "application/json;odata=verbose",
                 headers: {
                     "Accept": "application/json;odata=verbose"
                 },
                 success: function (data) {
                     approvalHistoryData = data.d.results;                    
                 },
                 error: function (data) {
                     console.log(data);
                 }
                 });
 
 
                 /////
                 
                 if(null != approvalHistoryData && approvalHistoryData.length > 0){
 
                     //var result = '<style>#approvalHist td, #approvalHist th {text-align: center; vertical-align: middle;}</style><div><table id = "approvalHist" border="1" width="100%"><tr><th>Approver Name</th><th>Approved On</th></tr>';
                     
                     var result = '<style> #approvalHistTab {border-color: #ddd;}#approvalHistTab th {text-align: center; vertical-align: middle; background-color: #d3d3d3; border-color: #ddd;} #approvalHistTab td {text-align: center; vertical-align: middle; border-color: #ddd;} </style><div><table id = \'approvalHistTab\' border=\'1\' width=\'100%\'><tr><th>Approver Name</th><th>Approval Date</th></tr>';
 
                     $.each(approvalHistoryData, function (idx, val) {
                         
                         result = result + "<tr><td>" + getUserNameById(val.ApproverNameId) + "</td><td>" + formatDate(val.Created) +"</td></tr>";
                     })
                     
                     result = result + "</table></div>";
 
                     console.log(result);
                 }else{
                     result = "<p>No Records Found.</p>";
                 }       
                 
                
                 $(result).insertAfter('#approvalHistoryTab');
 
                 //end 
                $('.panel-greydefault').find('*').attr('disabled', true);
                $('.loading').hide();

            }
        }
    })
}

function sendEmailHtml(to, subject, body, cc, successCallBack, failureCallback) {
    var from = "deloitteonlineserver@deloitte.com";
    // Prepare the to list
    var toList = [];
    if (to.indexOf(",") == -1) {
        toList.push(to);
    }
    else {
        toList = to.split(",");
    }

    // Prepare the cc list
    var ccList = [];
    if (cc != undefined && cc != null) {
        if (cc.indexOf(",") == -1) {
            ccList.push(cc);
        }
        else {
            ccList = cc.split(",");
        }
    }

    try {
        var urlTemplate = siteUrl + "/_api/SP.Utilities.Utility.SendEmail";

        $.ajax({
            contentType: 'application/json',
            url: urlTemplate,
            type: "POST",
            data: JSON.stringify({
                'properties': {
                    '__metadata': { 'type': 'SP.Utilities.EmailProperties' },
                    'From': from,
                    'To': { 'results': toList },
                    'CC': { 'results': ccList },
                    'Body': body,
                    'Subject': subject,
                    'AdditionalHeaders':
                    {
                        "__metadata":
                            { "type": "Collection(SP.KeyValue)" },
                        "results":
                            [
                                {
                                    "__metadata": {
                                        "type": 'SP.KeyValue'
                                    },
                                    "Key": "content-type",
                                    "Value": 'text/html',
                                    "ValueType": "Edm.String"
                                }
                            ]
                    },
                }
            }),
            headers: {
                "Accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                if (successCallBack != undefined && successCallBack != null) {
                    successCallBack();
                }
            },
            error: function (err) {
                if (failureCallback != undefined && failureCallback != null) {
                    failureCallback();
                }
            }
        });
    }
    catch (err) {
        error("An unexpected error occurred while sending email");
    }
}

function userContextLoaded() {
    currentLoggedInUserEmail = currentUser.get_email();
    currentLoggedInUserId = currentContext.get_web().get_currentUser().get_id();
    var userFullName = currentUser.get_title();
    if (userFullName) {
        userFullName = userFullName.split(',');
        if (userFullName.length == 2) {
            currentLoggedInUserFullName = userFullName[1].trim() + " " + userFullName[0].trim();
        }
    }
    // if (urlParam("Type") == "VNL1") {
    //     isNL1 = true;
    // }
    // else if (urlParam("Type") == "VEL1") {
    //     isEL1 = true;
    // }
    // else if (urlParam("Type") == "VEH1") {
    //     isEH1 = true;
    // }

    checkIfUserIsApprover();
}

function togglePanel(ele) {
    var $ele = $(ele);
    $ele.closest('.panel').find('.panel-body').toggle();
    $ele.toggleClass('glyphicon-plus').toggleClass('glyphicon-minus');
}

$(document).ready(function () {

    //to show the approval History
    $('#approvalHistory, #approvalHistoryMobile').click(function (e){
        $('.loading').show();
        showApprovalHistory();
    
    });


    $('.uploadpanel .glyphicon-remove-circle').click(function (e) {
        var $ele = $(e.target);
        $ele.prev().val("");
        $ele.hide();
    });


    // $('[data-field="ExceptionFlag"]').click(function () {
    //     if (!$('[data-field="ExceptionFlag"]').is(':checked')) {
    //         $('#exceptionComments').val("").attr('disabled', 'disabled');
    //     }
    //     else {
    //         $('#exceptionComments').val("").removeAttr('disabled');
    //     }

    // })
    $('[data-helpinfo]').click(function (e) {
        var currentOffering = approverData.Offering;
        var $ele = $(e.target);
        var messages = [];
        var code = $ele.data('helpinfo');

        if(code == "AL"){
            messages.push("Accumulated Leaves");
            messages.push("To view your complete history for the year, please go to My Time Off on DeloitteNet");
            //messages.push("Convert accumulated overall PTO hours into number of days");
        }
        else{
            //Fetch Marker Offering Approvers Data 
            LoadOfferingApproversData().done(function (data, textStatus, jqXHR) {
                var allData = data.d.results;
                $(allData).each(function (index, item) {
                    if (code == "RM") {
                        if (item.Title == "AMI RM" && currentOffering == metadata.offerings.applicationModernizationInnovation) {
                            messages.push("Please select your Resource Managers as per your skillset within your Offering/Talent Group");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "OPSTRANS RM" && currentOffering == metadata.offerings.operationsTransformation) {
                            messages.push("Please select your Resource Managers as per your skillset within your Offering/Talent Group");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
    
                        else if (item.Title == "CLOUDENG RM" && currentOffering == metadata.offerings.cloudEngineering) {
                            messages.push("Please select your Resource Managers as per your skillset within your Offering/Talent Group");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
    
                        else if (item.Title == "CIS RM" && currentOffering == metadata.offerings.coreIndustrySolutions) {
                            messages.push("Please select your Resource Managers as per your skillset within your Offering/Talent Group");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
    
                        else if (item.Title == "CR RM" && currentOffering == metadata.offerings.coreTechnologyOperations) {
                            messages.push("Please select your Resource Managers as per your skillset within your Offering/Talent Group");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                    }
    
                    else if (code == "TGL") {
                        if (item.Title == "AMI TGL" && currentOffering == metadata.offerings.applicationModernizationInnovation) {
                            messages.push("Talent Group Leaders (TGL) for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "OPSTRANS TGL" && currentOffering == metadata.offerings.operationsTransformation) {
                            messages.push("Talent Group Leaders (TGL) for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "CLOUDENG TGL" && currentOffering == metadata.offerings.cloudEngineering) {
                            messages.push("Talent Group Leaders (TGL) for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "CIS TGL" && currentOffering == metadata.offerings.coreIndustrySolutions) {
                            messages.push("Talent Group Leaders (TGL) for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
    
                        else if (item.Title == "CR TGL" && currentOffering == metadata.offerings.coreTechnologyOperations) {
                            messages.push("Talent Group Leaders (TGL) for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
    
                    }
                    else if (code == "TBA") {
                        if (item.Title == "AMI TL" && currentOffering == metadata.offerings.applicationModernizationInnovation) {
                            messages.push("Talent Business Advisors for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "OPSTRANS TL" && currentOffering == metadata.offerings.operationsTransformation) {
                            messages.push("Talent Business Advisors for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "CLOUDENG TL" && currentOffering == metadata.offerings.cloudEngineering) {
                            messages.push("Talent Business Advisors for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "CIS TL" && currentOffering == metadata.offerings.coreIndustrySolutions) {
                            messages.push("Talent Business Advisors for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "CR TL" && currentOffering == metadata.offerings.coreTechnologyOperations) {
                            messages.push("Talent Business Advisors for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                    }
                    else if (code == "ES") {
                        if (item.Title == "AMI TALENTES" && currentOffering == metadata.offerings.applicationModernizationInnovation) {
                            messages.push("Talent Engagement Specialist(ES) for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "OPSTRANS TALENTES" && currentOffering == metadata.offerings.operationsTransformation) {
                            messages.push("Talent Engagement Specialist(ES) for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "CLOUDENG TALENTES" && currentOffering == metadata.offerings.cloudEngineering) {
                            messages.push("Talent Engagement Specialist(ES) for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "CIS TALENTES" && currentOffering == metadata.offerings.coreIndustrySolutions) {
                            messages.push("Talent Engagement Specialist(ES) respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                        else if (item.Title == "CR TALENTES" && currentOffering == metadata.offerings.coreTechnologyOperations) {
                            messages.push("Talent Business Advisors for your respective Offering");
                            var itm = $(item.MarketOfferingApprover).text();
                            $(itm.split(";")).each(function (index, item) {
                                messages.push(item);
                            });
                        }
                    }
                });
            });
        }
        var $result = $('<div><ul></ul></div>');
        var header = messages.splice(0, 1);
        //$result.find('ul').append("<b>"+messages.slice(0,1)+"</b>");
        $.each(messages, function (idx, val) {
            var data = val.split('-');
            var formattedValue = "<b>" + data[0] + "</b>";
            data.splice(0, 1);
            formattedValue += data.join();
            $result.find('ul').append("<li>" + val + "</li>");
        })

        bootbox.dialog({
            title: header,
            message: $result.html(),
            'margin-top': function () {
                var w = $(window).height();
                var b = $(".modal-dialog").height();
                // should not be (w-h)/2
                var h = (w - b) / 2;
                return h + "px";
            }
        });
    });
})

///by me 

function showApprovalHistory(){
    
    //$('.loading').show();
    var approvalHistoryData = "";

    $.ajax({
    url: _spPageContextInfo.webAbsoluteUrl+"/_api/web/lists/getbytitle('ApproverAudit')/items?$select=ApproverNameId,Created&$filter=((OriginalRequestId eq " + approverData.OriginalRequestId + ") and  (RequestId eq " + approverData.ID	+ " ) and (Action eq 'Approved')) &$orderby=Id desc",
    type: "GET",
    async: false,
    contentType: "application/json;odata=verbose",
    headers: {
        "Accept": "application/json;odata=verbose"
    },
    success: function (data) {
        console.log(data.d.results);
        console.log(data.d.results);
        approvalHistoryData = data.d.results;
        
        
    },
    error: function (data) {
        console.log(data);
    }
    });


    /////
    var header = "Approval History";
    if(null != approvalHistoryData && approvalHistoryData.length > 0){

        //var result = '<style>#approvalHist td, #approvalHist th {text-align: center; vertical-align: middle;}</style><div><table id = "approvalHist" border="1" width="100%"><tr><th>Approver Name</th><th>Approved On</th></tr>';
        var result = '<style> #approvalHist {border-color: #ddd;}#approvalHist th {text-align: center; vertical-align: middle; background-color: #86BC25; color: white;border-color: #ddd;} #approvalHist td {text-align: center; vertical-align: middle; border-color: #ddd;} </style><div><table id = "approvalHist" border="1" width="100%"><tr><th>Approver Name</th><th>Approval Date</th></tr>';

        $.each(approvalHistoryData, function (idx, val) {
            
            result = result + "<tr><td>" + getUserNameById(val.ApproverNameId) + "</td><td>" + formatDate(val.Created) +"</td></tr>";
        })
        
        result = result + "</table></div>";

        console.log(result);
    }else{
        result = "No Records Found.";
    } 
    
    $('.loading').hide();

    bootbox.dialog({
        title: header,
        message: result,
        'margin-top': function () {
            var w = $(window).height();
            var b = $(".modal-dialog").height();
            // should not be (w-h)/2
            var h = (w - b) / 2;
            return h + "px";
        }
    });
}

function formatDate(date){
	var date1 = new Date(date);
	var dd = String(date1.getDate()).padStart(2, '0');
	var mm = String(date1.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = date1.getFullYear();
	
    var hour = date1.getHours();
	var ampm = hour >= 12 ? 'PM' : 'AM';
	hour = hour % 12;
	hour = hour ? hour : 12; // the hour '0' is '12'
	
	var ampmHour = String(hour).padStart(2, '0'); 
	
    var minute = String(date1.getMinutes()).padStart(2, '0'); 

	return mm + '/' + dd + '/' + yyyy + ' ' + ampmHour + ':' + minute + ' ' + ampm;
}

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

function getApproverAuditDataRequestListType() {
    $.ajax({

        url: siteUrl + "/_api/web/lists/getbytitle('ApproverAudit')",
        headers: { Accept: "application/json;odata=verbose" },
        success: function (data) {
            approverAuditRequestType = data.d.ListItemEntityTypeFullName;
        }
    })
}

function GetUserbyId(GivenId) {
    var Id = GivenId;
    var userid = "";
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
            userIdDetails = data;
            userid = userIdDetails.d.Email;
        },
        error: function (data) {
            failure(data);
        }
    });
    return userid;
}

function uploadFiles(recordID, callback) {
    $('.loading').show();
    try {
        var $fileUpload = $("input[type='file']");
        var ctr = 0;
        if (recordID && $fileUpload.length > 0) {
            var filesToUpload = [];
            $.each($fileUpload, function (idx, val) {
                var uploadFile = [];
                var tempObj = { files: $(val).get(0).files }; //id: $(val).closest('.row').find('input[type="checkbox"]').data('cbcode'), 
                uploadFile.push(tempObj);
                if (uploadFile && uploadFile.length > 0 && tempObj.files.length > 0) {
                    uploadFile = uploadFile[0];
                    filesToUpload.push(uploadFile);
                }
            });

            if (filesToUpload.length > 0) {
                (function initiateUpload() {
                    uploadFileSP('EmployeeRequests', recordID, filesToUpload.splice(0, 1)[0], function () {
                        if (filesToUpload.length == 0) {
                            if (callback && typeof callback == "function") {
                                callback();
                            }
                        }
                        else {
                            initiateUpload();
                        }
                    });
                })();

            }
            else {
                if (callback && typeof callback == "function") {
                    callback();
                }
            }
        }
        else {
            //No files selected
            //write the logic to navigate to dashboard
            if (callback && typeof callback == "function") {
                callback();
            }
        }
    }
    catch (e) {
        if (callback && typeof callback == "function") {
            callback();
        }

    }

}

function getFileBuffer(file) {
    var deferred = $.Deferred();
    var reader = new FileReader();
    reader.onload = function (e) {
        deferred.resolve(e.target.result);
    }
    reader.onerror = function (e) {
        deferred.reject(e.target.error);
    }
    reader.readAsArrayBuffer(file);
    return deferred.promise();
}

function uploadFileSP(listName, id, file, callback) {
    var deferred = $.Deferred();
    getFileBuffer(file.files[0]).then(
        function (buffer) {
            var bytes = new Uint8Array(buffer);
            var content = new SP.Base64EncodedByteArray();
            //var queryUrl = siteUrl + "/_api/lists/GetByTitle('" + listName + "')/items(" + id + ")/AttachmentFiles/add(FileName='" + file.id + "^$SEP$^" + file.files[0].name + "')";
            var queryUrl = siteUrl + "/_api/lists/GetByTitle('" + listName + "')/items(" + id + ")/AttachmentFiles/add(FileName='" + file.files[0].name + "')";
            $.ajax({
                url: queryUrl,
                type: "POST",
                processData: false,
                contentType: "application/json;odata=verbose",
                data: buffer,
                headers: {
                    "accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "content-length": buffer.byteLength
                }, success: function () {
                    if (callback) {
                        callback();
                    }
                },
                error: function onAttachmentFailure(error) {
                    console.log("Failure:" + error.status + "," + error.statusText);
                    callback();
                }
            });
        },
        function (err) {
            deferred.reject(err);
        });
    return deferred.promise();
}

function isNotEmpty(field) {
    if (field.indexOf("uploadElement") != -1) {
        var result = true;
        var $uploadControls = $("." + field);
        var atleastOneFileUploaded = false;
        if ($('[type="file"]:hidden').length == 0) {//checking if already a file has been uploaded, provided the current mode is draft mode
            $.each($uploadControls, function (idx, val) {
                if (val.files.length != 0) {
                    atleastOneFileUploaded = true;
                    return false;
                }
            })
            if (!atleastOneFileUploaded) {
                $($uploadControls[0]).parent().addClass("error");
                result = false;
            }
        }

        return result;
    }
    else if (field.indexOf("ChecklistItems") != -1) {
        if ($('[data-field="ChecklistItems"]:checked').length == 0) {
            $('[data-field="ChecklistItems"]:first').parent().addClass("error");
            return false;
        }
        else {
            return true;
        }
    }
    else {
        var fieldData = $("#" + field).val();
        if(field == "AccumulatedLeaves"){
            if(fieldData == "0"){
                return true;
            }
            else{
                if (!fieldData || fieldData.length == 0) {
                    $("#" + field).prev().addClass("error");
                    return false;
                }
            }
        }
        else{
            if (!fieldData) {
                $("#" + field).prev().addClass("error");
                return false;
            }

            if (fieldData.length == 0 || fieldData == "" || fieldData == "0") {
                $("#" + field).prev().addClass("error");
                return false;
            }
        }
        return true;
    }
}

function LoadApproversPopulatedData() {
    var urlTemplate = siteUrl + "/_api/web/lists/GetByTitle('Approvers')/Items?$select=*,Approvers/ID,Approvers/Title,Approvers/EMail&$expand=Approvers/Id";
    return $.ajax({
        url: urlTemplate,
        type: "GET",
        async: false,
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
        }
    });
}

function LoadOfferingApproversData() {
    var urlTemplate = siteUrl + "/_api/web/lists/GetByTitle('Approvers')/Items?$select=Title,MarketOfferingApprover";
    return $.ajax({
        url: urlTemplate,
        type: "GET",
        async: false,
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
        }
    });
}

function getOfferingCode(offering) {
    var result = ""
    switch (offering) {
        case metadata.offerings.applicationModernizationInnovation:
            result = "AMI";
            break;
        case metadata.offerings.operationsTransformation:
            result = "OPSTRANS";
            break;
        case metadata.offerings.cloudEngineering:
            result = "CLOUDENG";
            break;
        case metadata.offerings.coreIndustrySolutions:
            result = "CIS";
            break;
        case metadata.offerings.coreTechnologyOperations:
            result = "CR";
            break;
    }
    return result;
}


function validate() {

    // if (isDraftMode) {
    //     return true;
    // }
    return true;
    var isValid = true;

    $.each(mandatoryFields, function (idx, val) {
        if (!isNotEmpty(val)) {
            isValid = false;
        }
    });
    
    if ($('#peoplepicker').find('input').val() === "[]" || $('#peoplepicker').find('input').val() === "") {
        $("#peoplepicker").prev().addClass("error");
        isValid = false;
    }
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    var strtDate = new Date($('#StartDate').val());
    var edDate = new Date($('#EndDate').val());
    strtDate.setHours(0, 0, 0, 0);
    edDate.setHours(0, 0, 0, 0);

    var currentLWD = new Date($('#CurrentLWD').val());
    var proposedLWD = new Date($('#ProposedLWD').val());
    currentLWD.setHours(0, 0, 0, 0);
    proposedLWD.setHours(0, 0, 0, 0);

    var alertedAlready = false;
    var DateOfHire = new Date($('#DateOfHire').val());
    DateOfHire.setHours(0, 0, 0, 0);
    
    if (DateOfHire > currentDate) {
        bootbox.alert('Date of hire cannot be a future date.');
        alertedAlready = true;
        isValid = false;
    }

    // if (edDate < currentDate) {
    //     bootbox.alert('End date cannot be less than current date.');
    //     isValid = false;
    //     alertedAlready = true;
    // }

    // if (strtDate < currentDate) {
    //     bootbox.alert('Start date cannot be less than current date.');
    //     isValid = false;
    //     alertedAlready = true;
    // }

    if (proposedLWD < currentDate) {
        bootbox.alert('Proposed Last Working Day cannot be less than current date.');
        isValid = false;
        alertedAlready = true;
    }

    if (currentLWD < currentDate) {
        bootbox.alert('Current Last Working Day cannot be less than current date.');
        isValid = false;
        alertedAlready = true;
    }

    if (proposedLWD > currentLWD) {
        bootbox.alert('Current Last Working Day cannot be less than Proposed Last Working Day.');
        isValid = false;
        alertedAlready = true;
    }

    if (isValid) {
        if (isNotEmpty("EndDate") && isNotEmpty("StartDate")) {
            var rollOffDate = new Date($('#StartDate').val());
            if (isNaN(rollOffDate.getMonth()) || rollOffDate.getFullYear() <= 1900 || rollOffDate.getFullYear() >= 2100) {
                bootbox.alert("Invalid Date: " + $('#StartDate').val());
                $('#StartDate').prev().addClass("error");
                return false;
            }

            var onBoardingDate = new Date($('#EndDate').val());
            if (isNaN(onBoardingDate.getMonth()) || onBoardingDate.getFullYear() <= 1900 || onBoardingDate.getFullYear() >= 2100) {
                bootbox.alert("Invalid Date: " + $('#EndDate').val());
                $('#EndDate').prev().addClass("error");
                return false;
            }
        
            rollOffDate.setHours(0, 0, 0, 0);
            onBoardingDate.setHours(0, 0, 0, 0);
         
            if (onBoardingDate < rollOffDate) {
               bootbox.alert("End Date must be greater than Start Date");
               return false;
           }

        }
        var regex = /^\d*[.]?\d*$/;
        if(!regex.test($("#AccumulatedLeaves").val())){
            bootbox.alert("Accumulated Leaves will accept only numbers");
            return false;
        }
        // if (isNotEmpty("ProposedLWD") && isNotEmpty("CurrentLWD")) {
        //     var rollOffDate = new Date($('#CurrentLWD').val());
        //     if (isNaN(rollOffDate.getMonth()) || rollOffDate.getFullYear() <= 1900 || rollOffDate.getFullYear() >= 2100) {
        //         bootbox.alert("Invalid Date: " + $('#CurrentLWD').val());
        //         $('#CurrentLWD').prev().addClass("error");
        //         return false;
        //     }

        //     var onBoardingDate = new Date($('#ProposedLWD').val());
        //     if (isNaN(onBoardingDate.getMonth()) || onBoardingDate.getFullYear() <= 1900 || onBoardingDate.getFullYear() >= 2100) {
        //         bootbox.alert("Invalid Date: " + $('#ProposedLWD').val());
        //         $('#ProposedLWD').prev().addClass("error");
        //         return false;
        //     }
        
        //     rollOffDate.setHours(0, 0, 0, 0);
        //     onBoardingDate.setHours(0, 0, 0, 0);
         
        //     if (onBoardingDate < rollOffDate) {
        //        bootbox.alert("Proposed Last Working Day must be greater than Current Last Working Day");
        //        return false;
        //    }

        // }
    }
    else if (!alertedAlready) {
        bootbox.alert('Please enter the mandatory fields.');
    }


    return isValid;
}




////////


