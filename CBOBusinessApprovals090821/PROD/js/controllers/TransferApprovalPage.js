var transferRequestListType = "";
var approvalTransferRequestListType = "";
var additionalInfoRequestsLogType = "";
var approverAuditRequestType = "";

function togglePanel(ele) {
    var $ele = $(ele);
    $ele.closest('.panel').find('.panel-body').toggle();
    $ele.toggleClass('glyphicon-minus').toggleClass('glyphicon-plus');
}

function getTransferRequestListType() {
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('Transfer Requests')",
        headers: { Accept: "application/json;odata=verbose" },
        success: function (data) {
            transferRequestListType = data.d.ListItemEntityTypeFullName;
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


var isInterOffering = false;
var isInterOffice = false;
var isInterPortfolio = false;
var isUSIToUSTransfer = false;
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
        initializeDatepickers();
        getNSetUserId();
    }
}



function getRequestType() {
    var type = "Inter Offering";
    if (isInterOffice) {
        type = "Inter Office";
    }
    else if (isInterOffering) {
        type = "Inter Offering";
    }
    else if (isInterPortfolio) {
        type = "Inter Portfolio";
    }
    else if (isUSIToUSTransfer) {
        type = "Transfer to US";
    }
    return type;
}

function getRequestTypeFrom() {
    var requestTypeFrom = "";
    if (isInterOffering) {
        requestTypeFrom = "Offering";
    }
    else if (isInterOffice) {
        requestTypeFrom = "Office";
    }
    else if (isInterPortfolio) {
        requestTypeFrom = "Portfolio";
    }
    return requestTypeFrom;
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

window.onload = function () {
    loadJSSet();
}

function initializeDatepickers() {
    $('[data-field="currentProjectRollOffDate"').datepicker();
    $('[data-field="newProjectOnBoardingDate"').datepicker();
    $('[data-field="TransferEffectiveAsOnDate"').datepicker();
    $('[data-field="DateOfHire"').datepicker({ maxDate: new Date() });


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
            //else {
            //    $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
            //}

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
                getTransferRequestListType();
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
    var Url = _spPageContextInfo.webAbsoluteUrl + "/Pages/TransferApprovalPage.aspx?TRID=" + options.Id;
    loadListItems({
        url: getEmailTemplates,
        success: function (data) {
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            body = body.replace("{{CurrentMonth}}", month).replace("{{CurrentYear}}", year).
                replace("{{RequestTypeFrom}}", options.requestTypeFrom).replace("{{RequestTypeFrom}}", options.requestTypeFrom).
                replace("{{RequestType}}", options.requestType).replace("{{RequestType}}", options.requestType).replace("{{RequestTo}}", options.requestTo).
                replace("{{Employee}}", options.employee).replace("{{TransferTo}}", options.transferTo).
                replace("{{Employee}}", options.employee).replace("{{TransferTo}}", options.transferTo).
                replace("{{TBA}}", options.TBA).replace("{{TransferedDate}}", options.transferedDate).
                replace("{{CurrentProject}}", options.currentProject).replace("{{NewProject}}", options.newProject).
                replace("/sites/USICBOPortal/BusinessApproval/Lists/EmailTemplates", Url).
                replace("{{TransferFrom}}", options.transferFrom).replace("{{Specifics}}", options.specifics).
                replace("{{EmailHeader}}", options.emailHeader).
                replace("{{AdditionalInfo}}", options.additionalInfo).
                replace("{{Addressee}}", options.addressee).
                replace("{{RequestHyperLink}}", '<a href="' + options.requestUrl + '">here</a>')

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
        var isPendingWithTalent = approverData.Pending_x0020_With.results[0] == "TL";
        if (!isPendingWithTalent) {
            $row.append('<div class="col-md-4"><label>Request Information from:</label></div>')
                .append('<div class="col-md-5"><label><input onchange="requestMoreInfoValueChanged()" type="radio" name="RequestTo" value="Practitioner"/>Practitioner</label><label><input onchange="requestMoreInfoValueChanged()" type="radio" name="RequestTo" value="Talent"/>Talent</label></div>');
            $content.append($row);
        }
        else {
            $row.append('<div class="col-md-4"><label>Request Information from:</label></div>')
                .append('<div class="col-md-5"><label>Practitioner</label></div>');
            $content.append($row);
        }
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
    var isPendingWithTalent = approverData.Pending_x0020_With.results[0] == "TL";

    if (commentsText && (isPendingWithTalent || $('[name="RequestTo"]:checked').length > 0)) {
        $('.confirmRequestInfo').removeAttr('disabled');
    }
    else {
        $('.confirmRequestInfo').attr('disabled', true);
    }
}

function initiateMoreInfoRequest() {
    $('.loading').show();
    var requestTo = '';
    var isPendingWithTalent = approverData.Pending_x0020_With.results[0] == "TL";
    if (isPendingWithTalent) {
        requestTo = "Practitioner";
    }
    else {
        requestTo = $('[name="RequestTo"]:checked').val();
    }

    var comments = $('#moreInfoText').val().trim();

    //var requestToEmail = $('[data-field="talentTeamPersonDetailsId"]').data("email");
    var requestToEmail = GetUserbyId($('#talentLeadList option:selected').val());
    
    // var requestToName = $('[data-field="talentTeamPersonDetailsId"]').val();
    var requestToName = $('#talentLeadList option:selected').text().split(',')[1].trim() + " " + $('#talentLeadList option:selected').text().split(',')[0];
    //var requestToId = $('[data-field="talentTeamPersonDetailsId"]').data('userid');
    var requestToId = $('#talentLeadList option:selected').val();

    var requestCCEmail = currentLoggedInUserEmail;
    var fieldsToUpdate = {
        Pending_x0020_With: { results: ["TL"] },
        IsAdditionalDataRequired: 'Y',
        AdditionalDataComments: comments,
        "__metadata": {
            "type": approvalTransferRequestListType
        }
    }

    var toPractitioner = false;
    if (requestTo == "Practitioner") {
        toPractitioner = true;
        fieldsToUpdate.Pending_x0020_With.results = [];
        fieldsToUpdate.Title = 'Draft';
        requestToEmail = $('[data-field="PractitionerEmail"]').val();
        requestToName = $('[data-field="PractitionerName"]').val();
        requestToId = approverData.practitionerDetailsId;
    }

    var list1Updated = false;
    var list2Updated = false;
    var list3Updated = false;

    var updateUrl = siteUrl + "/_api/web/lists/getbytitle('" + (isDevMode ? "ApprovalTransferRequests1" : "ApprovalTransferRequests") + "')/items(" + approverData.ID + ")";
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

    fieldsToUpdate.__metadata.type = transferRequestListType;

    updateUrl = siteUrl + "/_api/web/lists/getbytitle('Transfer Requests')/items(" + (isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId) + ")";
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
        var result = approverData.Pending_x0020_With.results[0];
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
            case "NTGL":
                result = "New Talent Group Leader";
                break;
            case "NOL":
                result = "New Offering Lead";
                break;
        }
        return result;
    }

    fieldsToUpdate = {
        "__metadata": {
            "type": additionalInfoRequestsLogType
        },
        OriginalRequestID: ""+ isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId,
        RequestedById: currentLoggedInUserId,
        RequestedToId: requestToId,
        RequesterType: getLoggedinuserRole(),
        RequesteeType: toPractitioner ? "Practitioner" : "Talent",
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
        "Title": "TransferApproval",
        "Category": "Transfer",
        "OriginalRequestId": parseInt(approverData.OriginalRequestId),
        "RequestId": parseInt(approverData.ID),
        "Action": "AdditionalData",
        "ApproverRole": approverData.Pending_x0020_With.results[0],
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
        },
        complete: function (data) {
        }
    });

    //////

    var requestUrl = "";
    if (toPractitioner) {
        var transferType = ""
        switch (approverData.transferType) {
            case "Inter Office":
                transferType = "&Type=L"
                break;
            case "Inter Offering":
                transferType = "&Type=O"
                break;
            case "Inter Portfolio":
                transferType = "&Type=P"
                break;
            case "Transfer to US":
                transferType = "&Type=U"
                break;
        }
        requestUrl = siteUrl + "/Pages/immigrationrequest.aspx?TRID=" + (isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId) + transferType;
    }
    else {
        requestUrl = siteUrl + "/Pages/TransferApprovalPage.aspx?TRID=" + (isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId);
    }

//till here
    var emailOptions = {
        to: requestToEmail,
        subject: "Transfer Approval Request for " + $('[data-field="PractitionerName"]').val() + '- Additional information required',
        templateType: "clarification",
        addressee: requestToName,
        requester: currentLoggedInUserFullName,
        additionalInfo: comments,
        specifics: $('[data-field="TransferTenure"]').val(),
        requestTypeFrom: getRequestTypeFrom(),
        requestType: getRequestType(),
        requestTo: requestToName,
        employee: $('[data-field="PractitionerName"]').val(),
        transferTo: $('[data-field="TransferTo"]').val(),
        currentProject: $('[data-field="currentProjectName"]').val(),
        newProject: $('[data-field="newProjectName"]').val(),
        transferFrom: $('[data-field="transferFromAndTo"]').val(),
        Id: isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId,
        //TBA: $('[data-field="talentTeamPersonDetailsId"]').val(),
        TBA: $('#talentLeadList option:selected').text().split(',')[1].trim() + " " + $('#talentLeadList option:selected').text().split(',')[0],
        transferedDate: $('[data-field="TransferEffectiveAsOnDate"]').val(),
        message: comments,
        requestUrl: requestUrl
    }

    if (!isUSIToUSTransfer) {
        emailOptions.emailHeader = getRequestType() + " Transfer Request - Additional Information Required";
    }
    else {
        emailOptions.emailHeader = "Transfer Request to US Firm - Additional Information Required";
    }

    var emailInitator = setInterval(function () {
        if (list1Updated && list2Updated && list3Updated) {
            clearInterval(emailInitator);
            sendEmail(emailOptions, function () {
                bootbox.alert("Request has been sent back to " + (toPractitioner ? "Practitioner" : "Talent") + " for additional information.", function () {
                    window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=1";
                });
            });
        }
    }, 1000)



}

var finalStageReached = false;
function checkIfFinalStageReached() {
    var currentPendingWith = approverData.Pending_x0020_With.results[0];
    if (isInterOffice && currentPendingWith == "TGL") {
        finalStageReached = true;
    }   
    else if ((isInterPortfolio || isUSIToUSTransfer || isInterOffering) && currentPendingWith == "OPL") {
        finalStageReached = true;
    }
 	//else if (isInterOffice && approverData.Offering == "Systems Engineering" && currentPendingWith == "TGL") {
    //  finalStageReached = true;
    //}

    // if ((isInterOffice || isInterOffering) && ((isInterOffice && approverData.Offering == "Systems Engineering" && currentPendingWith == "TGL") || currentPendingWith == "OL")) {
    //     finalStageReached = true;
    // }
    // else if ((isInterPortfolio || isUSIToUSTransfer) && currentPendingWith == "OPL") {
    //     finalStageReached = true;
    // }
}

//need to put the validation here
function initiateAction(approve) {

    //put isValid method here in If condition then then put inside it
    //need to add new editable elements to fieldsToUpdate for ApproveTransferRequests1 - done
    //need to add new editable elements to fieldsToUpdate for 'Transfer Requests' List- done
    //initiate more info
    $('.error').removeClass('error');
    if(validate()){
        //$('.error').removeClass('error');

        //put here

    

    var isRejected = !approve;
    if (!checkIfCurrentUserIsTheRightApprover()) {
        bootbox.alert("You are not authorized to approve/reject this form.");
    }
    else if (isRejected && !$('#comments').val()) {
        bootbox.alert("Please provide Approval/Rejection reason");
    }
    else {
        var nextPendingWith = "";
        var nextPendingWithEmail = "";
        var nextPendingWithName = "";
        var currentComments = {};

        //////Use this example from  Visa Approval
        //RM details
        // var requestRMId = $('#resourceManagerList option:selected').val();
        // var RMEmail = GetUserbyId(requestRMId); 
        // var RMName = $('#resourceManagerList option:selected').text().split(',')[1] + " " + $('#resourceManagerList option:selected').text().split(',')[0];
        ///////


        switch (approverData.Pending_x0020_With.results[0]) {
            case "TL":
                nextPendingWith = "TGL";
                //nextPendingWithEmail = $('[data-field="TalentGroupLeadId"]').data("email");
                //nextPendingWithName = $('[data-field="TalentGroupLeadId"]').val();
                var nextPendingWithId = $('#talentGroupLeaderList option:selected').val();
                nextPendingWithEmail = GetUserbyId(nextPendingWithId);
                nextPendingWithName = $('#talentGroupLeaderList option:selected').text().split(',')[1].trim() + " " + $('#talentGroupLeaderList option:selected').text().split(',')[0];
                currentComments = { "TBAComments": $('#comments').val() }

                
                break;
            case "TGL":
                if (!(isInterOffice)) {
                    nextPendingWith = "OL";
                    nextPendingWithEmail = $('[data-field="offeringLeadDetailsId"]').data("email");
                    nextPendingWithName = $('[data-field="offeringLeadDetailsId"]').val();
                    
                }
                if(isInterOffering){
                    nextPendingWith = "NTGL";

                    // nextPendingWithEmail = $('[data-field="NewTalentGroupLeaderId"]').data("email");
                    // nextPendingWithName = $('[data-field="NewTalentGroupLeaderId"]').val();

                    var nextPendingWithId = $('#newTalentGroupLeaderList option:selected').val();
                    nextPendingWithEmail = GetUserbyId(nextPendingWithId);
                    nextPendingWithName = $('#newTalentGroupLeaderList option:selected').text().split(',')[1].trim() + " " + $('#talentGroupLeaderList option:selected').text().split(',')[0];
               


                }
                currentComments = { "TGLComments": $('#comments').val() }
                break;
                
            case "NTGL":
                if (isInterOffering) {
                    nextPendingWith = "OL";
                    nextPendingWithEmail = $('[data-field="offeringLeadDetailsId"]').data("email");
                    nextPendingWithName = $('[data-field="offeringLeadDetailsId"]').val();
                    currentComments = { "NTGLComments": $('#comments').val() }
                }                
                break;
            case "OL":
                if(isInterOffering){
                    nextPendingWith = "NOL";
                    nextPendingWithEmail = $('[data-field="New_x0020_Offering_x0020_LeadId"]').data("email");
                    nextPendingWithName = $('[data-field="New_x0020_Offering_x0020_LeadId"]').val();
                }
                else{                
                    nextPendingWith = "OPL";
                    nextPendingWithEmail = $('[data-field="PortfolioLeadId"]').data("email");
                    nextPendingWithName = $('[data-field="PortfolioLeadId"]').val();
                }
                currentComments = { "OLComments": $('#comments').val() }
                break;
            case "NOL":
                if (isInterOffering) {                
                    nextPendingWith = "OPL";
                    nextPendingWithEmail = $('[data-field="PortfolioLeadId"]').data("email");
                    nextPendingWithName = $('[data-field="PortfolioLeadId"]').val();
                    currentComments = { "NOLComments": $('#comments').val() }
                }
                break;
            case "OPL":
                currentComments = { "PLComments": $('#comments').val() }
                break;                        
        }




        //this is to jump to teh approver who requested for additional info
        var pendingWithInfo = "";
        var RequesterType = "";
        var requestIdForAPI = "";

        if(null != approverData.IsAdditionalDataRequired && approverData.IsAdditionalDataRequired == "Y"){
            //pendingWithInfo = data from API ---(isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId)
            requestIdForAPI = (isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId);
             $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('AdditionalInfoRequestsLog')/items?$select=RequesterType&$filter=OriginalRequestID eq  "+requestIdForAPI+" &$top=1&$orderby=Id desc",
                type: "GET",
                async: false,
                contentType: "application/json;odata=verbose",
                headers: {
                    "Accept": "application/json;odata=verbose"
                },
                success: function (data) {
                    console.log(data.d.results[0].RequesterType);
                    RequesterType = data.d.results[0].RequesterType;
                },
                error: function (data) {
                    console.log(data);
                }
            });

            console.log("RequesterType: "+RequesterType);
            pendingWithInfo = getSortPendingWith(RequesterType);

            /////find out which comment 
         
            if(approverData.Pending_x0020_With.results[0] == "TL"){
                currentComments = { "TBAComments": $('#comments').val() }
            }else if(approverData.Pending_x0020_With.results[0] == "TGL"){
                currentComments = { "TGLComments": $('#comments').val() }
            }else if(approverData.Pending_x0020_With.results[0] == "NTGL"){
                currentComments = { "NTGLComments": $('#comments').val() }
            }else if(approverData.Pending_x0020_With.results[0] == "OL"){
                currentComments = { "OLComments": $('#comments').val() }
            }else if(approverData.Pending_x0020_With.results[0] == "NOL"){
                currentComments = { "NOLComments": $('#comments').val() }
            }else if(approverData.Pending_x0020_With.results[0] == "OPL"){
                currentComments = { "PLComments": $('#comments').val() }
            }

            switch (pendingWithInfo) {
                case "TGL":
                    nextPendingWith = "TGL";
                    var nextPendingWithId = $('#talentGroupLeaderList option:selected').val();
                    nextPendingWithEmail = GetUserbyId(nextPendingWithId);
                    nextPendingWithName = $('#talentGroupLeaderList option:selected').text().split(',')[1].trim() + " " + $('#talentGroupLeaderList option:selected').text().split(',')[0];
                    
                      
                    break;
                case "OL":
                   
                    nextPendingWith = "OL";
                    nextPendingWithEmail = $('[data-field="offeringLeadDetailsId"]').data("email");
                    nextPendingWithName = $('[data-field="offeringLeadDetailsId"]').val();
                    break;
                   
                case "NTGL":
                    nextPendingWith = "NTGL";
                    var nextPendingWithId = $('#newTalentGroupLeaderList option:selected').val();
                    nextPendingWithEmail = GetUserbyId(nextPendingWithId);
                    nextPendingWithName = $('#newTalentGroupLeaderList option:selected').text().split(',')[1].trim() + " " + $('#talentGroupLeaderList option:selected').text().split(',')[0];
                    break;
                    
              
                case "NOL":
                   
                        nextPendingWith = "NOL";
                        nextPendingWithEmail = $('[data-field="New_x0020_Offering_x0020_LeadId"]').data("email");
                        nextPendingWithName = $('[data-field="New_x0020_Offering_x0020_LeadId"]').val();
                  
                    
                    break;
                case "OPL":
                        nextPendingWith = "OPL";
                        nextPendingWithEmail = $('[data-field="PortfolioLeadId"]').data("email");
                        nextPendingWithName = $('[data-field="PortfolioLeadId"]').val();

                    break;
              
                                       
            }
        }





        // if (isInterOffice) {
        //     switch (approverData.Pending_x0020_With.results[0]) {
        //         case "TL":
        //             nextPendingWith = "TGL";
        //             nextPendingWithEmail = $('[data-field="TalentGroupLeadId"]').data("email");
        //             nextPendingWithName = $('[data-field="TalentGroupLeadId"]').val();

        //             currentComments = { "TBAComments": $('#comments').val() }
        //             break;
        //         case "TGL":
        //             if (approverData.Offering !== "Systems Engineering") {
        //                 nextPendingWith = "OL";
        //                 nextPendingWithEmail = $('[data-field="offeringLeadDetailsId"]').data("email");
        //                 nextPendingWithName = $('[data-field="offeringLeadDetailsId"]').val();
        //             }

        //             currentComments = { "TGLComments": $('#comments').val() }
        //             break;
        //         case "OL":
        //             currentComments = { "OLComments": $('#comments').val() }
        //             break;
        //     }
        // }
        // else if (isInterOffering) {
        //     switch (approverData.Pending_x0020_With.results[0]) {
        //         case "TL":
        //             nextPendingWith = "TGL";
        //             nextPendingWithEmail = $('[data-field="TalentGroupLeadId"]').data("email");
        //             nextPendingWithName = $('[data-field="TalentGroupLeadId"]').val();

        //             currentComments = { "TBAComments": $('#comments').val() }
        //             break;
        //         case "TGL":
        //             nextPendingWith = "OL";
        //             nextPendingWithEmail = $('[data-field="offeringLeadDetailsId"]').data("email");
        //             nextPendingWithName = $('[data-field="offeringLeadDetailsId"]').val();

        //             currentComments = { "TGLComments": $('#comments').val() }
        //             break;
        //         case "OL":
        //             currentComments = { "OLComments": $('#comments').val() }
        //             break;
        //     }
        // }
        // else if (isInterPortfolio || isUSIToUSTransfer) {
        //     switch (approverData.Pending_x0020_With.results[0]) {
        //         case "TL":
        //             nextPendingWith = "TGL";
        //             nextPendingWithEmail = $('[data-field="TalentGroupLeadId"]').data("email");
        //             nextPendingWithName = $('[data-field="TalentGroupLeadId"]').val();

        //             currentComments = { "TBAComments": $('#comments').val() }
        //             break;
        //         case "TGL":
        //             if (approverData.Offering !== "Systems Engineering") {
        //                 nextPendingWith = "OL";
        //                 nextPendingWithEmail = $('[data-field="offeringLeadDetailsId"]').data("email");
        //                 nextPendingWithName = $('[data-field="offeringLeadDetailsId"]').val();
        //             }

        //             currentComments = { "TGLComments": $('#comments').val() }
        //             break;
        //         case "OL":
        //             nextPendingWith = "OPL";
        //             nextPendingWithEmail = $('[data-field="PortfolioLeadId"]').data("email");
        //             nextPendingWithName = $('[data-field="PortfolioLeadId"]').val();
        //             currentComments = { "OLComments": $('#comments').val() }
        //             break;
        //         case "OPL":
        //             currentComments = { "PLComments": $('#comments').val() }
        //             break;
        //     }
        // }

        var fieldsToUpdate = {
            "__metadata": {
                "type": approvalTransferRequestListType
            },
            IsAdditionalDataRequired: ''
        }
        
        var effectiveDate = $('[data-field="TransferEffectiveAsOnDate"]').val();

        if ((finalStageReached) && !effectiveDate && !isRejected) {
            bootbox.alert("Please provide Transfer Effective date.");
            return false;
        }
        else {
            var currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            var parsedeffectiveDate = new Date(effectiveDate);
            parsedeffectiveDate.setHours(0, 0, 0, 0);
            if (parsedeffectiveDate < currentDate) {
                bootbox.alert("Effective date cannot be a past date.");
                return false;
            }
        }


        if (!finalStageReached && !isRejected) {
            fieldsToUpdate = {
                Pending_x0020_With: { results: [nextPendingWith] },
                "__metadata": {
                    "type": approvalTransferRequestListType
                },
                IsAdditionalDataRequired: ''
            }
         
            if (approverData.Pending_x0020_With.results[0] == "TL") {
                if (isTLAUser) {
                    fieldsToUpdate["IsApprovedByTLA"] = "Y";
                    fieldsToUpdate["ApprovingTLA"] = currentLoggedInUserEmail;
                }
                else{
                    fieldsToUpdate["IsApprovedByTLA"] = "";
                    fieldsToUpdate["ApprovingTLA"] = "";
                }
            }
        }
        else {
            fieldsToUpdate["Status"] = isRejected ? "Rejected" : "Approved";
            fieldsToUpdate["Pending_x0020_With"] = { results: [] };
            //var effectiveDate = $('[data-field="TransferEffectiveAsOnDate"]').val();



            if (currentComments.PLComments) {
                fieldsToUpdate.FinalComments = currentComments.PLComments;
            } else if (currentComments.OLComments) {
                fieldsToUpdate.FinalComments = currentComments.OLComments;
            } else if (currentComments.TGLComments) {
                fieldsToUpdate.FinalComments = currentComments.TGLComments;
            } else if (currentComments.TBAComments) {
                fieldsToUpdate.FinalComments = currentComments.TBAComments;
            } else if (currentComments.NTGLComments) {
                fieldsToUpdate.FinalComments = currentComments.NTGLComments;
            } else if (currentComments.NOLComments) {
                fieldsToUpdate.FinalComments = currentComments.NOLComments;
            }
        }

        if (effectiveDate) {
            fieldsToUpdate["TransferEffectiveAsOnDate"] = effectiveDate;
        }
      
        //added by me 
        fieldsToUpdate.DateOfHire = $("#dateOfHire").val();
        fieldsToUpdate.talentTeamPersonDetailsId = $('#talentLeadList option:selected').val();
        fieldsToUpdate.resourceManagerDetailsId = $('#resourceManagerList option:selected').val();
        fieldsToUpdate.ReasonForTransfer = $('[data-field="ReasonForTransfer"]').val();
        
        
        fieldsToUpdate.currentProjectName = $('#currentProjectNameTransfer').val();
        fieldsToUpdate.currentProjectSnrManagerDetailsId = getUserInfo('peoplepicker');
        fieldsToUpdate.relocationCatergory = $('[data-field="relocationCatergory"]').val();
        
        
        
        
        // fieldsToUpdate.TransferEffectiveAsOnDate = $('[data-field="TransferEffectiveAsOnDate"]').val();
        
        if (isUSIToUSTransfer) {
            fieldsToUpdate.USPPMDId = getUserInfo('usPPMD');
            fieldsToUpdate.USIPPMDId = getUserInfo('usiPPMD');
            fieldsToUpdate.TransferTenure = $('[data-field="TransferTenure"]').val();
        }else{
            fieldsToUpdate.CurrentAssignment = $('#currentAssignment').val();
            fieldsToUpdate.currentProjectRollOffDate = $('[data-field="currentProjectRollOffDate"]').val();
            fieldsToUpdate.newProjectName = $('[data-field="newProjectName"]').val();
            fieldsToUpdate.newProjectOnBoardingDate = $('[data-field="newProjectOnBoardingDate"]').val();
            fieldsToUpdate.newProjectSnrMangerDetailsId = getUserInfo('peoplepicker1');
        }
        fieldsToUpdate.TalentGroupLeadId = $('#talentGroupLeaderList option:selected').val();
        //fieldsToUpdate.New_x0020_Talent_x0020_Group_x00Id  = $('#newTalentGroupLeaderList option:selected').val();
        //found issue here 14-July Morning
        fieldsToUpdate.NewTalentGroupLeaderId  = $('#newTalentGroupLeaderList option:selected').val();
        /////////////



        $.extend(fieldsToUpdate, currentComments);
        $('.loading').show();
        var urlTemplateEditMode = siteUrl + "/_api/web/lists/getbytitle('" + (isDevMode ? "ApprovalTransferRequests1" : "ApprovalTransferRequests") + "')/items(" + approverData.ID + ")";
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
                var to = "";
                var toName = ""
                var cc = "";
                var emailTemplate = "";
                if (isRejected) {
                    switch (approverData.Pending_x0020_With.results[0]) {
                        case "TL":
                            to = $('[data-field="PractitionerEmail"]').val();
                            toName = $('[data-field="PractitionerName"]').val();

                            //cc = $('[data-field="resourceManagerDetailsId"]').data("email");

                            var nextPendingWithId = $('#resourceManagerList option:selected').val();
                            cc = GetUserbyId(nextPendingWithId);

                            break;
                        case "OL":
                            to = $('[data-field="PractitionerEmail"]').val();
                            toName = $('[data-field="PractitionerName"]').val();

                            if (isUSIToUSTransfer) {
                                
                                //cc = $('[data-field="offeringLeadDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="talentTeamPersonDetailsId"]').data("email");
                                cc = $('[data-field="offeringLeadDetailsId"]').data("email") + "," + GetUserbyId($('#resourceManagerList option:selected').val()) + "," + GetUserbyId($('#talentLeadList option:selected').val());
                            }
                            else {
                                //cc = $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="talentTeamPersonDetailsId"]').data("email");
                                cc = GetUserbyId($('#resourceManagerList option:selected').val()) + "," + GetUserbyId($('#talentLeadList option:selected').val());
                            }
                            break;
                        case "OPL":
                            to = $('[data-field="PractitionerEmail"]').val();
                            toName = $('[data-field="PractitionerName"]').val();


                            if (isUSIToUSTransfer) {
                                //cc = $('[data-field="offeringLeadDetailsId"]').data("email") + "," + $('[data-field="USIPPMDId"]').data("email") + "," + $('[data-field="PortfolioLeadId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="talentTeamPersonDetailsId"]').data("email");
                                cc = $('[data-field="offeringLeadDetailsId"]').data("email") + "," + GetUserbyId(getUserInfo('usiPPMD')) + "," + $('[data-field="PortfolioLeadId"]').data("email") + "," + GetUserbyId($('#resourceManagerList option:selected').val()) + "," + GetUserbyId($('#talentLeadList option:selected').val());
                            }
                            else {
                                //cc = $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="talentTeamPersonDetailsId"]').data("email");
                                cc = GetUserbyId($('#resourceManagerList option:selected').val()) + "," + GetUserbyId($('#talentLeadList option:selected').val());
                            }
                            break;
                             
                        case "TGL":
                            to = $('[data-field="PractitionerEmail"]').val();
                            toName = $('[data-field="PractitionerName"]').val();
                            //cc = $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="talentTeamPersonDetailsId"]').data("email");
                            cc = GetUserbyId($('#resourceManagerList option:selected').val()) + "," + GetUserbyId($('#talentLeadList option:selected').val());
                            break;
                           
                        case "NOL":
                            if(isInterOffering){
                                to = $('[data-field="PractitionerEmail"]').val();
                                toName = $('[data-field="PractitionerName"]').val();
                                //cc = $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="talentTeamPersonDetailsId"]').data("email");
                                cc = GetUserbyId($('#resourceManagerList option:selected').val()) + "," + GetUserbyId($('#talentLeadList option:selected').val());
                            }
                            break;
                             
                        case "NTGL":
                            if(isInterOffering){
                                to = $('[data-field="PractitionerEmail"]').val();
                                toName = $('[data-field="PractitionerName"]').val();
                               // cc = $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="talentTeamPersonDetailsId"]').data("email");
                                cc = GetUserbyId($('#resourceManagerList option:selected').val()) + "," + GetUserbyId($('#talentLeadList option:selected').val());
                            }
                            break;
                    }
                    emailTemplate = "Reject";
                }
                else if (!finalStageReached) {
                    switch (approverData.Pending_x0020_With.results[0]) {
                        case "TL":
                            
                            // to = $('[data-field="TalentGroupLeadId"]').data("email");
                            // toName = $('[data-field="TalentGroupLeadId"]').val();
                            // cc = $('[data-field="talentTeamPersonDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email");

                            to = GetUserbyId($('#talentGroupLeaderList option:selected').val());
                            toName = $('#talentGroupLeaderList option:selected').text().split(',')[1].trim() + " " + $('#talentGroupLeaderList option:selected').text().split(',')[0];
                            cc = GetUserbyId($('#talentLeadList option:selected').val()) + "," + GetUserbyId($('#resourceManagerList option:selected').val());
                            break;
                           
                        case "OL":
                            if (isInterPortfolio || isUSIToUSTransfer) {
                                to = $('[data-field="PortfolioLeadId"]').data("email");
                                toName = $('[data-field="PortfolioLeadId"]').val();
                                if (isUSIToUSTransfer) {
                                    //cc = $('[data-field="offeringLeadDetailsId"]').data("email") + "," + $('[data-field="USIPPMDId"]').data("email") + "," + $('[data-field="talentTeamPersonDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email");
                                    cc = $('[data-field="offeringLeadDetailsId"]').data("email") + "," + GetUserbyId(getUserInfo('usiPPMD')) + "," + GetUserbyId($('#talentLeadList option:selected').val()) + "," + GetUserbyId($('#resourceManagerList option:selected').val());
                                }
                                else {
                                    //cc = $('[data-field="talentTeamPersonDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email");
                                    cc = GetUserbyId($('#talentLeadList option:selected').val()) + "," + GetUserbyId($('#resourceManagerList option:selected').val());
                                }
                            }
                            if(isInterOffering){
                                 
                                to = $('[data-field="New_x0020_Offering_x0020_LeadId"]').data("email");
                                toName = $('[data-field="New_x0020_Offering_x0020_LeadId"]').val();
                                //cc = $('[data-field="talentTeamPersonDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email");
                                cc = GetUserbyId($('#talentLeadList option:selected').val()) + "," +  GetUserbyId($('#resourceManagerList option:selected').val());
                            }
                            break;
                            
                        case "TGL":
                            if (isInterOffering) {
                                // to = $('[data-field="NewTalentGroupLeaderId"]').data("email");
                                // toName = $('[data-field="NewTalentGroupLeaderId"]').val();

                                to = GetUserbyId($('#newTalentGroupLeaderList option:selected').val());
                                toName = $('#newTalentGroupLeaderList option:selected').text().split(',')[1].trim() + " " + $('#newTalentGroupLeaderList option:selected').text().split(',')[0];
                               
                            }
                            else{
                                to = $('[data-field="offeringLeadDetailsId"]').data("email");
                                toName = $('[data-field="offeringLeadDetailsId"]').val();
                            }
                            if (isUSIToUSTransfer) {
                                
                                //cc = $('[data-field="talentTeamPersonDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="USIPPMDId"]').data("email");
                                cc = GetUserbyId($('#talentLeadList option:selected').val()) + "," + GetUserbyId($('#resourceManagerList option:selected').val()) + "," + GetUserbyId(getUserInfo('usiPPMD'));
                            }
                            else {
                                
                                //cc = $('[data-field="talentTeamPersonDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email");
                                cc = GetUserbyId($('#talentLeadList option:selected').val()) + "," + GetUserbyId($('#resourceManagerList option:selected').val());
                            }
                            break;
                            
                        case "NOL":
                            if (isInterOffering) {
                                to = $('[data-field="PortfolioLeadId"]').data("email");
                                toName = $('[data-field="PortfolioLeadId"]').val();
                                //cc = $('[data-field="talentTeamPersonDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email");
                                cc = GetUserbyId($('#talentLeadList option:selected').val()) + "," + GetUserbyId($('#resourceManagerList option:selected').val());
                            }
                            break;
                            
                        case "NTGL":
                            if (isInterOffering) {
                                to = $('[data-field="offeringLeadDetailsId"]').data("email");
                                toName = $('[data-field="offeringLeadDetailsId"]').val();
                               // cc = $('[data-field="talentTeamPersonDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email");
                                cc = GetUserbyId($('#talentLeadList option:selected').val()) + "," + GetUserbyId($('#resourceManagerList option:selected').val());
                            }
                            break;
                    }
                    if (isUSIToUSTransfer) {
                        emailTemplate = "RequestForApprovalUs";
                    }
                    else {
                        emailTemplate = "RequestForApproval";
                    }

                }
                else {
                    to = $('[data-field="PractitionerEmail"]').val();
                    toName = $('[data-field="PractitionerName"]').val();
                   
                    if (isUSIToUSTransfer) {
                        //cc = $('[data-field="talentTeamPersonDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email") + "," + $('[data-field="offeringLeadDetailsId"]').data("email") + "," + $('[data-field="PortfolioLeadId"]').data("email") + "," + $('[data-field="USIPPMDId"]').data("email");
                        cc = GetUserbyId($('#talentLeadList option:selected').val()) + "," + GetUserbyId($('#resourceManagerList option:selected').val()) + "," + $('[data-field="offeringLeadDetailsId"]').data("email") + "," + $('[data-field="PortfolioLeadId"]').data("email") + "," + GetUserbyId(getUserInfo('usiPPMD'));
                  
                    }
                    else {
                        //cc = $('[data-field="talentTeamPersonDetailsId"]').data("email") + "," + $('[data-field="resourceManagerDetailsId"]').data("email");
                        cc = GetUserbyId($('#talentLeadList option:selected').val()) + "," + GetUserbyId($('#resourceManagerList option:selected').val());
                    }

                    emailTemplate = "Approved";
                }

                if (!isRejected && isTLAUser && approverData.Pending_x0020_With.results[0] == "TL") {
                    cc = cc + "," + currentLoggedInUserEmail;
                }
                

                //upload new files on approval screen

                uploadFiles((isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId), function () {
                    // bootbox.alert("Request submitted successfully.", function () {
                    //     window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/dashboard.aspx?team=0";
                    // });
                });

                ///////////////////

                options = {
                    to: to,
                    cc: cc,
                    subject: "Transfer Approval Request for " + $('[data-field="PractitionerName"]').val(),
                    templateType: emailTemplate,
                    specifics: $('[data-field="TransferTenure"]').val(),
                    requestTypeFrom: getRequestTypeFrom(),
                    requestType: getRequestType(),
                    requestTo: nextPendingWithName,
                    employee: $('[data-field="PractitionerName"]').val(),
                    transferTo: $('[data-field="TransferTo"]').val(),
                    currentProject: $('[data-field="currentProjectName"]').val(),
                    newProject: $('[data-field="newProjectName"]').val(),
                    transferFrom: $('[data-field="transferFromAndTo"]').val(),
                    Id: isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId,
                    //TBA: $('[data-field="talentTeamPersonDetailsId"]').val(),
                    TBA: $('#talentLeadList option:selected').text().split(',')[1].trim() + " " + $('#talentLeadList option:selected').text().split(',')[0],
                        
                    transferedDate: $('[data-field="TransferEffectiveAsOnDate"]').val()
                }

                if (!isUSIToUSTransfer) {
                    options.emailHeader = getRequestType() + " Transfer Request";
                }
                else {
                    options.emailHeader = "Transfer Request to US Firm";
                }

                sendEmail(options, function () {
                    var message = "The Request has been successfully approved.";
                    if (isRejected) {
                        message = "The Request has been successfully rejected.";
                    }
                    bootbox.alert(message, function () {
                        window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=1";
                    });
                });
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
            "Title": "TransferApproval",
            "Category": "Transfer",
            "OriginalRequestId": parseInt(approverData.OriginalRequestId),
            "RequestId": parseInt(approverData.ID),
            "Action": approverAction,
            "ApproverRole": approverData.Pending_x0020_With.results[0],
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
            },
            complete: function (data) {
            }
        });

        //////

        var openListUrl = siteUrl + "/_api/web/lists/getbytitle('Transfer Requests')/items(" + (isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId) + ")";
        fieldsToUpdate = {
            "__metadata": {
                "type": transferRequestListType
            },
            IsAdditionalDataRequired: ''
        }

        

        if (finalStageReached || isRejected) {

            if (!isRejected) {
                var effectiveDate = $('[data-field="TransferEffectiveAsOnDate"]').val();
                if (effectiveDate) {
                    fieldsToUpdate["TransferEffectiveAsOnDate"] = effectiveDate;
                }
            }

            if (currentComments.PLComments) {
                fieldsToUpdate.FinalComments = currentComments.PLComments;
            } else if (currentComments.OLComments) {
                fieldsToUpdate.FinalComments = currentComments.OLComments;
            } else if (currentComments.TGLComments) {
                fieldsToUpdate.FinalComments = currentComments.TGLComments;
            } else if (currentComments.TBAComments) {
                fieldsToUpdate.FinalComments = currentComments.TBAComments;
            } else if (currentComments.NTGLComments) {
                fieldsToUpdate.FinalComments = currentComments.NTGLComments;
            } else if (currentComments.NOLComments) {
                fieldsToUpdate.FinalComments = currentComments.NOLComments;
            }
            fieldsToUpdate.Status = isRejected ? "Rejected" : "Approved";
            fieldsToUpdate["Pending_x0020_With"] = { results: [] };
        }
        else {
            fieldsToUpdate["Pending_x0020_With"] = { results: [nextPendingWith] };

            
            
        }

        //added by me 
            // fieldsToUpdate.DateOfHire = $("#dateOfHire").val();
            // fieldsToUpdate.talentTeamPersonDetailsId = $('#talentLeadList option:selected').val();
            // fieldsToUpdate.resourceManagerDetailsId = $('#resourceManagerList option:selected').val();
            // fieldsToUpdate.ReasonForTransfer = $('[data-field="ReasonForTransfer"]').val();
            // fieldsToUpdate.TransferTenure = $('[data-field="TransferTenure"]').val();
            // fieldsToUpdate.CurrentAssignment = $('#currentAssignment').val();
            // fieldsToUpdate.currentProjectName = $('#currentProjectNameTransfer').val();
            // fieldsToUpdate.currentProjectSnrManagerDetailsId = getUserInfo('peoplepicker');
            // fieldsToUpdate.relocationCatergory =  $('[data-field="relocationCatergory"]').val();
            // fieldsToUpdate.newProjectName = $('[data-field="newProjectName"]').val();
            // fieldsToUpdate.newProjectSnrMangerDetailsId = getUserInfo('peoplepicker1');
            // fieldsToUpdate.currentProjectRollOffDate = $('[data-field="currentProjectRollOffDate"]').val();
            // fieldsToUpdate.newProjectOnBoardingDate = $('[data-field="newProjectOnBoardingDate"]').val();
            // // fieldsToUpdate.TransferEffectiveAsOnDate = $('[data-field="TransferEffectiveAsOnDate"]').val();
            // fieldsToUpdate.USPPMDId = getUserInfo('usPPMD');
            // fieldsToUpdate.USIPPMDId = getUserInfo('usiPPMD');
            // fieldsToUpdate.TalentGroupLeadId = $('#talentGroupLeaderList option:selected').val();
            // fieldsToUpdate.New_x0020_Talent_x0020_Group_x00Id  = $('#newTalentGroupLeaderList option:selected').val();
            /////////////

             //added by me 
             fieldsToUpdate.DateOfHire = $("#dateOfHire").val();
             fieldsToUpdate.talentTeamPersonDetailsId = $('#talentLeadList option:selected').val();
             fieldsToUpdate.resourceManagerDetailsId = $('#resourceManagerList option:selected').val();
             fieldsToUpdate.ReasonForTransfer = $('[data-field="ReasonForTransfer"]').val();
             
             
             fieldsToUpdate.currentProjectName = $('#currentProjectNameTransfer').val();
             fieldsToUpdate.currentProjectSnrManagerDetailsId = getUserInfo('peoplepicker');
             fieldsToUpdate.relocationCatergory = $('[data-field="relocationCatergory"]').val();
             
             
             
             
             // fieldsToUpdate.TransferEffectiveAsOnDate = $('[data-field="TransferEffectiveAsOnDate"]').val();
             
             if (isUSIToUSTransfer) {
                 fieldsToUpdate.USPPMDId = getUserInfo('usPPMD');
                 fieldsToUpdate.USIPPMDId = getUserInfo('usiPPMD');
                 fieldsToUpdate.TransferTenure = $('[data-field="TransferTenure"]').val();
             }else{
                 fieldsToUpdate.CurrentAssignment = $('#currentAssignment').val();
                 fieldsToUpdate.currentProjectRollOffDate = $('[data-field="currentProjectRollOffDate"]').val();
                 fieldsToUpdate.newProjectName = $('[data-field="newProjectName"]').val();
                 fieldsToUpdate.newProjectOnBoardingDate = $('[data-field="newProjectOnBoardingDate"]').val();
                 fieldsToUpdate.newProjectSnrMangerDetailsId = getUserInfo('peoplepicker1');
             }
             fieldsToUpdate.TalentGroupLeadId = $('#talentGroupLeaderList option:selected').val();
             fieldsToUpdate.New_x0020_Talent_x0020_Group_x00Id  = $('#newTalentGroupLeaderList option:selected').val();
             /////////////

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

    }
}else {
    // $('.loading').hide();
    // $([document.documentElement, document.body]).animate({
    //     scrollTop: $(".error").offset().top
    // }, 1000);
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

function showAdditionalInfoText() {
    if (approverData.IsAdditionalDataRequired == 'Y') {
        $('<div style="margin-top: 40px;border: 1px #86BC25;border-style: solid;padding: 10px;"><b style="color:red">Additional Information Requested By: </b> <b style="color:black">'+getUserNameById(getAdditionalInfoReqBy((isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId)))+' </b><p>' + approverData.AdditionalDataComments + '</p></div>').insertAfter('.txt-new-Request');
    }
}

function checkIfCurrentUserIsTheRightApprover() {
    var hasAccess = false;
    switch (approverData.Pending_x0020_With.results[0]) {
        case "TL":
            hasAccess = approverData.talentTeamPersonDetailsId === currentLoggedInUserId;
            if (!hasAccess && isTLAUser) {
                hasAccess = true;
            }
            break;
        case "TGL":
            hasAccess = approverData.TalentGroupLeadId === currentLoggedInUserId;
            break;
        case "OL":
            hasAccess = approverData.offeringLeadDetailsId === currentLoggedInUserId;
            break;
        case "NTGL":
            hasAccess = approverData.NewTalentGroupLeaderId === currentLoggedInUserId;
            break;
        case "NOL":
            hasAccess = approverData.New_x0020_Offering_x0020_LeadId === currentLoggedInUserId;
            break;
        case "OPL":
            hasAccess = approverData.PortfolioLeadId === currentLoggedInUserId;
            break;
    }

    if (!hasAccess) {
        $('.actionButtons').attr('disabled', true);
        $('textarea,.hasDatepicker').attr('disabled', true);
    }
    return hasAccess;
}

function loadExteriorAttachments() {
    var url = siteUrl + "/_api/web/lists/getbytitle('Transfer Requests')/items?$select=*&$expand=AttachmentFiles&$filter=ID eq '" + requestID + "'";
    loadListItems({
        url: url,
        success: function (data) {
            if (data.length > 0) {
                var item = data[0];
                if (item.Attachments) {
                    var $list = $('<ul></ul>');
                    $.each(item.AttachmentFiles.results, function (idx, val) {
                        var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + val.FileName + "</a>";
                        $list.append("<li>" + link + "</li>");
                    });
                    $('.attachments').append($list);
                }
            }
        }
    });
}

function bootstrapper() {
    var url = siteUrl + "/_api/web/lists/getbytitle('" + (isDevMode ? "ApprovalTransferRequests1" : "ApprovalTransferRequests") + "')/items?$select=*,practitionerDetails/EMail,currentProjectSnrManagerDetails/EMail,newProjectSnrMangerDetails/EMail&$expand=AttachmentFiles,currentProjectSnrManagerDetails/Id,practitionerDetails/Id,newProjectSnrMangerDetails/Id&$filter=" + (isDevMode ? "OriginalRequestId" : "OriginalTransferRequestID") + " eq '" + requestID + "'";
    loadListItems({
        url: url,
        success: function (data) {
            if (data.length > 0) {
                $('.divTransferTable').show();
                var item = data[0];
                window.approverData = item;
                approvalTransferRequestListType = item.__metadata.type;
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
                checkIfCurrentUserIsTheRightApprover();
                showAdditionalInfoText();

                if (!(isInterOffice && approverData.Offering == "Systems Engineering")) {
                    hideTalentGroup();
                }

                //added by me

                LoadApproversPopulatedData().done(function (data, textStatus, jqXHR) {
                    var allData = data.d.results;
                    if (allData.length > 0) {
                        $.each(allData, function (index, item) {
                            //$(allData).each(function (index, item) {
                            var title = item.Title.split(' ');
                            if (getOfferingCode(approverData.Offering) === title[0]) {
                                if (item.ImmigrationRoles === "TGL" || item.ImmigrationRoles === "TL" || item.ImmigrationRoles === "RM") {
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
                                    }

                                    $.each(item.Approvers.results, function (k, v) {
                                        $("#" + elementSelector).append('<option value="' + item.Approvers.results[k].ID + '">' + item.Approvers.results[k].Title + '</option>');
                                    });
                                }
                                else if (item.ImmigrationRoles === "OPL") {
                                    $("#portfolioLeadId").val(item.Approvers.results[0].ID);
                                    $("#portfolioLead").val(item.Approvers.results[0].Title);
                                }
                                else if (item.ImmigrationRoles === "OL") {
                                    $('#offeringLead').val(item.Approvers.results[0].Title);
                                    $('#offeringLeadId').val(item.Approvers.results[0].ID);
                                }
                            }
                        });
                    }
                });
                
                $('#resourceManagerList').val(!approverData.resourceManagerDetailsId ? "0" : approverData.resourceManagerDetailsId);
                
                $('#talentLeadList').val(!approverData.talentTeamPersonDetailsId ? "0" : approverData.talentTeamPersonDetailsId);
                console.log("Talent Group Leader*: "+approverData.TalentGroupLeadId);
                $('#talentGroupLeaderList').val(!approverData.TalentGroupLeadId ? "0" : approverData.TalentGroupLeadId);
                   
                 //data for "To"

                 $('#transferTo').append('<option value="0">Select an option</option>');
                 //$("#TransferType").val(getRequestType());
                 if (isInterOffering) {
 
                     //$('#transferFrom').append('<option selected="true" value="' + offering + '">' + offering + '</option>');
                     for (var prop in metadata.offerings) {
                         $('#transferTo').append('<option value="' + metadata.offerings[prop] + '">' + metadata.offerings[prop] + '</option>');
                     }
                     //Hiding the TGL for Interoffering
                     //hideTalentGroup();
 
                 }
                 else if (isInterOffice) {
                     //$('#transferFrom').append('<option selected="true" value="' + currentlocation + '">' + currentlocation + '</option>');
                     for (var prop in metadata.locations) {
                         $('#transferTo').append('<option value="' + metadata.locations[prop] + '">' + metadata.locations[prop] + '</option>');
                     }
 
                    //  if (offering !== metadata.offerings.systemsEngineering) {
 
                    //      hideTalentGroup();
 
                    //  }
                 }
                 else if (isInterPortfolio) {
                     //Hiding the TGL for InterPortfolio
                     //hideTalentGroup();
                    // $('#transferFrom').append('<option selected="true" value="Core Business Operations"> Core Business Operations </option>');
                     for (var prop in metadata.portfolio) {
                         $('#transferTo').append('<option value="' + metadata.portfolio[prop] + '">' + metadata.portfolio[prop] + '</option>');
                     }
                     //$('#transferTo').find('option[value="Core Business Operations"]').attr('disabled', true);
                 }
                 else if (isUSIToUSTransfer) {
                     //hideTalentGroup();
                     for (var prop in metadata.usTransfer) {
                         $('#transferTo').append('<option value="' + metadata.usTransfer[prop] + '">' + metadata.usTransfer[prop] + '</option>');
                     }
                     //$('#transferFrom').append('<option selected="true" value="' + currentlocation + '">' + currentlocation + '</option>');
                 }
 
 
                 //end data for "To"
                
                 //to initialise typeAhead for US PPMD * and USI PPMD* on US transfer Approval 
                 if (isUSIToUSTransfer) {
                    initializePeoplePicker('usPPMD', false, 'People Only', 0);
                    initializePeoplePicker('usiPPMD', false, 'People Only', 0);

                    initializePeoplePicker('peoplepicker', false, 'People Only', 0);
                 }
                 //////
                /////////////

                var userIds = [];
                var practitionerId = item.practitionerDetailsId;
                var transferFromVal = 0;
                var transferToVal = 0;
                var currentProjectSnrManagerDetailsIdNewVal = 0;
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

                            //to get fromValue for selected value in dropdown
                            if(prop == "transferFromAndTo"){
                                transferFromVal = item["transferFromAndTo"];
                            }
                            //to get the toValue
                            if(prop == "TransferTo"){
                                transferToVal = item["TransferTo"];
                            }
                            if(prop == "currentProjectSnrManagerDetailsId"){
                                currentProjectSnrManagerDetailsIdNewVal = item["currentProjectSnrManagerDetailsId"];
                            }
                            ///
                        
                        }
                    }
                }
                 console.log("currentProjectSnrManagerDetailsIdNewVal: "+currentProjectSnrManagerDetailsIdNewVal);
                //to disable val in dropdown
               //  $('#transferFrom').append('<option selected="true" value="' + transferFromVal + '">' + transferFromVal + '</option>');
                console.log("transferFromVal: "+transferFromVal);
                 $("#transferTo option[value = '"+transferFromVal+"']").attr("disabled", true);
                //

               
                 //is request tyep is Inter Offering,
                // load New Talent Group Leader* based on currently selected To* only on Page load
                 
                console.log("transferToVal: "+transferToVal);
                console.log("isInterOffering1: "+isInterOffering);
                //function loadNewTGLAndOLData(transferToVal);
                                
                if(isInterOffering){
                    LoadApproversPopulatedData().done(function (data, textStatus, jqXHR) {
                        var allData = data.d.results;
                        if (allData.length > 0) {
                            // $(allData).each(function (index, item) {
                            $.each(allData, function (index, item) {
                                var title = item.Title.split(' ');
                                if (getOfferingCode(transferToVal) === title[0]) {
                                    if (item.ImmigrationRoles === "TGL") {                                
                                        $.each(item.Approvers.results, function (k, v) {                                    
                                            $("#newTalentGroupLeaderList").append('<option value="' + item.Approvers.results[k].ID + '">' + item.Approvers.results[k].Title + '</option>');
                                        });
                                    } else if (item.ImmigrationRoles === "OL") {
                                        $('#newOfferingLead').val(item.Approvers.results[0].Title);
                                        $('#newOfferingLeadId').val(item.Approvers.results[0].ID);
                                    }
                                }
                            });                    
                        }
                    });
                }

                console.log("isInterOffering2: "+isInterOffering);

                console.log("Talent Group Leader*: "+approverData.NewTalentGroupLeaderId);
                $('#newTalentGroupLeaderList').val(!approverData.NewTalentGroupLeaderId ? "0" : approverData.NewTalentGroupLeaderId);
              
                ///////////

                
                /////////////////


                loadExteriorAttachments();

                if (item.Attachments) {
                    var $list = $('<ul></ul>');
                    $.each(item.AttachmentFiles.results, function (idx, val) {
                        var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + val.FileName + "</a>";
                        $list.append("<li>" + link + "</li>");
                    });
                    $('.attachments').append($list);
                }

                var userInfoUrl = siteUrl + "/_api/Web/SiteUserInfoList/items/?$filter=(" + userIds.join(" or ") + ")";

                var typeAheadEmail;
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
                                        //to get the typehead selected value
                                        console.log("vallll "+$(va.outerHTML).attr("data-field"));
                                        if($(va.outerHTML).attr("data-field") == "currentProjectSnrManagerDetailsId"){
                                            console.log(val.EMail);
                                            typeAheadEmail = val.EMail;

                                            if (typeAheadEmail) {
                                                setPeoplePicker("peoplepicker", typeAheadEmail);
                                            }
                
                                            ////
                                            // if (approverData.USPPMD.EMail) {
                                            //     setPeoplePicker("peoplepicker", approverData.USPPMD.EMail);
                                            // }
                                            //////
                
                                            //initializePeoplePicker('peoplepicker', false, 'People Only', 0);
                                            //ends - first type ahead////
                                        }
                                        if($(va.outerHTML).attr("data-field") == "newProjectSnrMangerDetailsId"){
                                            console.log(val.EMail);
                                            typeAheadEmail = val.EMail;

                                            if (typeAheadEmail) {
                                                setPeoplePicker("peoplepicker1", typeAheadEmail);
                                            }
                
                                            ////
                                            // if (approverData.USPPMD.EMail) {
                                            //     setPeoplePicker("peoplepicker", approverData.USPPMD.EMail);
                                            // }
                                            //////
                
                                            //initializePeoplePicker('peoplepicker', false, 'People Only', 0);
                                            //ends - first type ahead////
                                        }
                                        if($(va.outerHTML).attr("data-field") == "USPPMDId"){
                                            console.log(val.EMail);
                                            typeAheadEmail = val.EMail;

                                            if (typeAheadEmail) {
                                                setPeoplePicker("usPPMD", typeAheadEmail);
                                            }             
                                           
                                        }
                                        if($(va.outerHTML).attr("data-field") == "USIPPMDId"){
                                            console.log(val.EMail);
                                            typeAheadEmail = val.EMail;

                                            if (typeAheadEmail) {
                                                setPeoplePicker("usiPPMD", typeAheadEmail);
                                            }             
                                           
                                        }
                                        
                                   })
                                    
                                }
                                else {
                                    $('[data-userid="' + val.Id + '"]').each(function (id, va) {
                                        $(va).attr('data-email', val.EMail).val(name);
                                        //to get the typehead selected value
                                        console.log("vallll "+$(va.outerHTML).attr("data-field"));
                                        if($(va.outerHTML).attr("data-field") == "currentProjectSnrManagerDetailsId"){
                                            console.log(val.EMail);
                                            typeAheadEmail = val.EMail;

                                            if (typeAheadEmail) {
                                                setPeoplePicker("peoplepicker", typeAheadEmail);
                                            }
                
                                            ////
                                            // if (approverData.USPPMD.EMail) {
                                            //     setPeoplePicker("peoplepicker", approverData.USPPMD.EMail);
                                            // }
                                            //////
                
                                            //initializePeoplePicker('peoplepicker', false, 'People Only', 0);
                                            //ends - first type ahead////
                                        }
                                        if($(va.outerHTML).attr("data-field") == "newProjectSnrMangerDetailsId"){
                                            console.log(val.EMail);
                                            typeAheadEmail = val.EMail;

                                            if (typeAheadEmail) {
                                                setPeoplePicker("peoplepicker1", typeAheadEmail);
                                            }
                
                                            ////
                                            // if (approverData.USPPMD.EMail) {
                                            //     setPeoplePicker("peoplepicker", approverData.USPPMD.EMail);
                                            // }
                                            //////
                
                                            //initializePeoplePicker('peoplepicker', false, 'People Only', 0);
                                            //ends - first type ahead////
                                        }
                                        if($(va.outerHTML).attr("data-field") == "USPPMDId"){
                                            console.log(val.EMail);
                                            typeAheadEmail = val.EMail;

                                            if (typeAheadEmail) {
                                                setPeoplePicker("usPPMD", typeAheadEmail);
                                            }             
                                           
                                        }
                                        if($(va.outerHTML).attr("data-field") == "USIPPMDId"){
                                            console.log(val.EMail);
                                            typeAheadEmail = val.EMail;

                                            if (typeAheadEmail) {
                                                setPeoplePicker("usiPPMD", typeAheadEmail);
                                            }             
                                           
                                        }
                                    })
                                }
                            });

                            var $previousComments = $('#previousComments');
                            if ($(item.TBAComments).text()) {
                                $previousComments.append('<div class="col-md-10"><label>' + $('#talentLeadList option:selected').text().split(',')[1].trim() + " " + $('#talentLeadList option:selected').text().split(',')[0] + ':</label><p>' + $(item.TBAComments).text() + '</p></div>');
                            }
                            if ($(item.TGLComments).text()) {
                                $previousComments.append('<div class="col-md-10"><label>' + $('#talentGroupLeaderList option:selected').text().split(',')[1].trim() + " " + $('#talentGroupLeaderList option:selected').text().split(',')[0] + ':</label><p>' + $(item.TGLComments).text() + '</p></div>');
                            }
                            if ($(item.OLComments).text()) {
                                $previousComments.append('<div class="col-md-10"><label>' + $('[data-field="offeringLeadDetailsId"]').val() + ':</label><p>' + $(item.OLComments).text() + '</p></div>');
                            }
                            if ($(item.NTGLComments).text()) {
                                $previousComments.append('<div class="col-md-10"><label>' + $('#newTalentGroupLeaderList option:selected').text().split(',')[1].trim() + " " + $('#newTalentGroupLeaderList option:selected').text().split(',')[0] + ':</label><p>' + $(item.NTGLComments).text() + '</p></div>');
                            }
                            if ($(item.NOLComments).text()) {
                                $previousComments.append('<div class="col-md-10"><label>' + $('[data-field="New_x0020_Offering_x0020_LeadId"]').val() + ':</label><p>' + $(item.NOLComments).text() + '</p></div>');
                            }                        

                            checkIfFinalStageReached();
                            // if (!finalStageReached && !(approverData.IsAdditionalDataRequired == 'Y' && approverData.Pending_x0020_With.results[0] == "TL")) {
                            //     $('.moreinfo').remove();
                            // }


                            //first type ahead
                            //console.log("approverData.currentProjectSnrManagerDetailsId: "+approverData.currentProjectSnrManagerDetailsId);
                        
                            //console.log("Email: "+ $('#currentProjectSnrManagerDetailsId').attr('data-email'));
                            
                            
                        }
                    })
                    
                    //to disable newProjectNameTransfer and peoplepicker1 on page laod when newAssignment is Same Project
   
                    //$('#newAssignment').blur(function (e) {
                        console.log("Selected value: " + $("#newAssignment").val());
                        if ($("#newAssignment").val() == "Same Project") {
                            $('#newProjectNameTransfer').addClass('disabledfield').attr('disabled', true);
                            $('#peoplepicker1 input:visible').attr('disabled', true);
                            $('#peoplepicker1').addClass('disabledfield');
                            //setCurrentAsNewManager();
                            //$('#newProjectNameTransfer').val($('#currentProjectNameTransfer').val());
                            $("#newAssignment").data('sameproject', true);
                        }
                        else {
                            $('#newProjectNameTransfer').removeClass('disabledfield').removeAttr('disabled');
                            $('#peoplepicker1 input:visible').removeAttr('disabled');
                            $('#peoplepicker1').removeClass('disabledfield');
                            $("#newAssignment").data('sameproject', false);
                        }

                    // });
                    

                if (approverData.Status != "Pending") {
                    $('.actionButtons').attr('disabled', true);
                    $('#comments').val($(approverData.FinalComments).text()).attr('disabled', true);
                }
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

//added by me
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

$(document).ready(function () {

    //to show the approval History
    $('#approvalHistory, #approvalHistoryMobile').click(function (e){
        $('.loading').show();
        showApprovalHistory();
    
    });

    initializePeoplePicker('peoplepicker', false, 'People Only', 0);
    initializePeoplePicker('peoplepicker1', false, 'People Only', 0);
    
    
    

    $("[data-toggle='tooltip']").tooltip();
    $('[data-helpinfo]').click(function (e) {
        var currentOffering = $('#Offering').val();
        var $ele = $(e.target);
        var messages = [];
        var code = $ele.data('helpinfo');
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
               
            });
        });

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

    //this is added for Project Deatisl and Business Approvalrs
    if (true) {

        var $fileUploadControls = $("input[type='file']");
        $fileUploadControls.change(function (e) {
            var $fileUpload = $(e.target);
            var files = $fileUpload.get(0).files;
            if (files.length > 0) {
                $fileUpload.next().show();
            }
            else {
                $fileUpload.next().hide();
            }
            if (parseInt(files.length) > 5) {
                $fileUpload.get(0).value = '';
                bootbox.alert('You are only allowed to upload a maximum of 5 files');
            }
            else {
                var hasBiggerFile = false;
                var hasInvalidExtension = false;
                for (var x in files) {
                    if (!files.hasOwnProperty(x)) {
                        continue;
                    }
                    if (files[x].type !== "application/pdf") {
                        hasInvalidExtension = true;
                        break;
                    }
                    var filesize = ((files[x].size / 1024) / 1024).toFixed(4); // MB
                    if (files[x].name != "item" && typeof files[x].name != "undefined" && filesize > 3) {
                        hasBiggerFile = true;
                        break;
                    }
                }

                if (hasInvalidExtension) {
                    $fileUpload.get(0).value = '';
                    $fileUpload.next().hide();
                    bootbox.alert('Only PDF files are allowed.');
                }

                if (hasBiggerFile) {
                    $fileUpload.get(0).value = '';
                    $fileUpload.next().hide();
                    bootbox.alert('The maximum size allowed for a file is 3 MB.');
                }
            }
        })

        $('.uploadpanel .glyphicon-remove-circle').click(function (e) {
            var $ele = $(e.target);
            $ele.prev().val("");
            $ele.hide();
        });




        // if (isUSIToUSTransfer) {
        //     $('.notUsiTransferElements').remove();
        //     $('.usiTransferElements').show();
        //     $('.sponsorDiv').css("display", "inline-block");
        // }
        // else {
        //     $('.usiTransferElements').remove();
        // }

        // if(isInterOffering){
        //     $('.newOfferingFields').show();
        // }
        // else{
        //     $('.newOfferingFields').remove();
        // }

        //initializePeoplePicker('peoplepicker', false, 'People Only', 0);
        //initializePeoplePicker('peoplepicker1', false, 'People Only', 0);
        //initializePeoplePicker('peoplepicker2', false, 'People Only', 0);
        //initializePeoplePicker('peoplepicker3', false, 'People Only', 0);

        

        $("#btnSubmit").click(function () {
            $('.loading').show();
            postCreateRequestAjax();
        });

        $("#btnSaveForLater").click(function () {
            $('.loading').show();
            postCreateSaveForLaterAjax();
        });

        $('#newAssignment').change(function (e) {
            var $ele = $(e.target);
            if ($ele.val() == "Same Project") {
                $('#newProjectNameTransfer').addClass('disabledfield').attr('disabled', true);
                $('#peoplepicker1 input:visible').attr('disabled', true);
                $('#peoplepicker1').addClass('disabledfield');
                setCurrentAsNewManager();
                $('#newProjectNameTransfer').val($('#currentProjectNameTransfer').val());
                $ele.data('sameproject', true);
            }
            else {
                $('#newProjectNameTransfer').removeClass('disabledfield').removeAttr('disabled');
                $('#peoplepicker1 input:visible').removeAttr('disabled');
                $('#peoplepicker1').removeClass('disabledfield');
                $ele.data('sameproject', false);
            }

        });

        function clearPeoplePicker(pickerId) {
            var ppobject = SPClientPeoplePicker.SPClientPeoplePickerDict[pickerId + "_TopSpan"]
            var usersobject = ppobject.GetAllUserInfo();
            usersobject.forEach(function (index) {
                ppobject.DeleteProcessedUser(usersobject[index]);
            });
        }

        $('#currentProjectNameTransfer').change(function (e) {
            var $ele = $(e.target);
            if ($('#newAssignment').data('sameproject')) {
                $('#newProjectNameTransfer').val($ele.val());
            }
        });

        $('#currentProjectNameTransfer').change(function (e) {
            var $ele = $(e.target);
            if ($('#newAssignment').data('sameproject')) {
                $('#newProjectNameTransfer').val($ele.val());
            }
        });

        function setCurrentAsNewManager() {
            clearPeoplePicker("peoplepicker1");
            var selectedValue = getUserInfo('peoplepicker', true);
            if (selectedValue) {
                setPeoplePicker("peoplepicker1", selectedValue);
            }
        }

        SPClientPeoplePicker.SPClientPeoplePickerDict.peoplepicker_TopSpan.OnValueChangedClientScript = function (peoplepickerID, selectedValues) {
            if ($('#newAssignment').data('sameproject')) {
                setCurrentAsNewManager();
            }
        }

        $('#transferTo').change(function (e) {
            var $ele = $(e.target);
            loadNewTGLAndOLData($ele.val());
        });
    }
    ///////
});

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

function initializePeoplePicker(peoplePickerElementId, AllowMultipleValues, PeopleorGroup, GroupID) {
    // Create a schema to store picker properties, and set the properties.  
    var schema = {};
    schema['SearchPrincipalSource'] = 15;
    schema['ResolvePrincipalSource'] = 15;
    schema['MaximumEntitySuggestions'] = 50;
    schema['Width'] = '280px';
    schema['AllowMultipleValues'] = AllowMultipleValues;
    if (PeopleorGroup == 'PeopleOnly') schema['PrincipalAccountType'] = 'User';
    else schema['PrincipalAccountType'] = 'User,DL,SecGroup,SPGroup';
    if (GroupID > 0) {
        schema['SharePointGroupID'] = GroupID
    }
    // Render and initialize the picker.  
    // Pass the ID of the DOM element that contains the picker, an array of initial  
    // PickerEntity objects to set the picker value, and a schema that defines  
    // picker properties.  
    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, null, schema);
}

function setPeoplePicker(elementId, username) {
    var travelPeoplePicker = null;
    for (var prop in SPClientPeoplePicker.SPClientPeoplePickerDict) {
        if (prop.indexOf(elementId) >= 0) {
            travelPeoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[prop];
            break;
        }
    }
    if (travelPeoplePicker != null) {

        var usrObj = { 'Key': username };
        travelPeoplePicker.AddUnresolvedUser(usrObj, true);
    }
}

function getUserInfo(PeoplepickerId, getEmail) {
    var UsersID = "";
    // Get the people picker object from the page. 
    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[PeoplepickerId + "_TopSpan"];
    if (!peoplePicker.IsEmpty()) {
        if (peoplePicker.HasInputError) return false; // if any error 
        else if (!peoplePicker.HasResolvedUsers()) return false; // if any invalid users 
        else if (peoplePicker.TotalUserCount > 0) {
            // Get information about all users. 
            var users = peoplePicker.GetAllUserInfo();
            if (getEmail) {
                return users[0].EntityData.Email;
            }
            $('#txtLevel').text(users[0].AutoFillSubDisplayText);
            $('#txtEmail').text(users[0].EntityData.Email);
            var loginName = users[0].EntityData.AccountName;
            $.ajax({
                url: _spPageContextInfo.siteAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" + loginName + "'",
                type: "GET",
                async: false,
                contentType: "application/json;odata=verbose",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    $('#ddlLocation').text(data.d.UserProfileProperties.results.filter(x => x.Key === 'Office')[0].Value);
                    $('#txtDepartment').text(data.d.UserProfileProperties.results.filter(x => x.Key === 'Department')[0].Value);
                },
                error: function (data) {
                    alert('failure');
                }
            });
            var userInfo = '';
            var promise = '';
            UsersID = GetUserID(users[0].Key);
            return UsersID;
        }
    } else {
        return UsersID;
    }
}

function GetUserID(logonName) {
    var item = {
        'logonName': logonName
    };
    var UserId = $.ajax({
        url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/ensureuser",
        type: "POST",
        async: false,
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            userIdDetails = data;
            return data.Id + ';#' + data.Title + ';#';
        },
        error: function (data) {
            failure(data);
        }
    });
    return UserId.responseJSON.d.Id;
}

function loadNewTGLAndOLData(newOffering){
    if(isInterOffering){
        $("#newTalentGroupLeaderList").empty()
        $('#newTalentGroupLeaderList').append('<option value="0">Select an option</option>');
        LoadApproversPopulatedData().done(function (data, textStatus, jqXHR) {
            var allData = data.d.results;
            if (allData.length > 0) {
                $(allData).each(function (index, item) {
                    var title = item.Title.split(' ');
                    if (getOfferingCode(newOffering) === title[0]) {
                        if (item.ImmigrationRoles === "TGL") {                                
                            $.each(item.Approvers.results, function (k, v) {                                    
                                $("#newTalentGroupLeaderList").append('<option value="' + item.Approvers.results[k].ID + '">' + item.Approvers.results[k].Title + '</option>');
                            });
                        } else if (item.ImmigrationRoles === "OL") {
                            $('#newOfferingLead').val(item.Approvers.results[0].Title);
                            $('#newOfferingLeadId').val(item.Approvers.results[0].ID);
                        }
                    }
                });                    
            }
        });
    }
    $('[data-helpinfonew]').click(function (e) {
        var currentOffering = $('#transferTo').val();
        var messages = [];
        messages.push("Talent Group Leaders (TGL) for your respective Offering");
        if (currentOffering == metadata.offerings.applicationModernizationInnovation) {
            messages.push("Application Modernization & Migration - Karthik Banda");            
            messages.push("Product engineering - Kiran Hegde");
            messages.push("Quality Engineering	- Brunda Mahishi");
            messages.push("Service Delivery & Business Design - Nitish Jain");
        }
        else if (currentOffering == metadata.offerings.operationsTransformation) {
            messages.push("Op Model Transformation - Carmel D’Silva");
            messages.push("Tech Ops - Tushar Salgia");
            messages.push("Op Model Transformation Healthcare - Carmel D’Silva");
            messages.push("Center for Process Bionics - Soumya Raghavan");
        }
        else if (currentOffering == metadata.offerings.cloudEngineering) {            
            messages.push("Cloud Strategy & Transformation - Jayant Kumar Gadi");
            messages.push("CMS & IMS - Ponnu Kailasam");
            messages.push("Architecture - Kamlesh Totlani");
            messages.push("APIs and Integration - Subramanyam VSS Budama");
            messages.push("Platforms & Infrastructure - Kamlesh Totlani");
            messages.push("Cloud Native & Application Development - Sunil Bastiram Yadav");
        }
        else if (currentOffering == metadata.offerings.coreIndustrySolutions) {
            messages.push("Digital Care - Phani Rallabandi");
            messages.push("Digital Banking Solutions - Arun Bhandari");
            messages.push("Insurance CST - Sachin Dalal");
            messages.push("Converge Consulting - Lakuma Tumati");
            messages.push("Emerging Solutions - George Ignatius");
            messages.push("Converge Product - Abhishek Raizada");
        }    
        else if (currentOffering == metadata.offerings.coreTechnologyOperations) {
            messages.push("Core Technology Operations - Arnab Chaudhury");
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
}

//to get the email of user by id
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

function validate() {

    // if (isDraftMode) {
    //     return true;
    // }

    var isValid = true;

    var mandatoryFields = [
        "currentProjectNameTransfer",
        "practitionerPersonnelID",
        "TransferReason",
        "transferTo",
        "offeringLead",
        "talentLeadList",
        "resourceManagerList",
        "dateOfHire",
        "talentGroupLeaderList"
    ];

    // if (isInterOffice && $('#Offering').val() == metadata.offerings.systemsEngineering) {
    //     mandatoryFields.push("talentGroupLeaderList");
    // }
    if (isInterOffering) {
         mandatoryFields.push("newTalentGroupLeaderList");
         mandatoryFields.push("newOfferingLead");
    }
    if (isUSIToUSTransfer) {        
        mandatoryFields.push("transferTenure");
    }
    else {
        mandatoryFields.push("currentProjectRollOfDateTransfer");
        mandatoryFields.push("newProjectNameTransfer");
        mandatoryFields.push("newProjectOnBoardingDateTransfer");
        mandatoryFields.push("currentAssignment");
        mandatoryFields.push("newAssignment");
    }

    $.each(mandatoryFields, function (idx, val) {
        if (!isNotEmpty(val)) {
            isValid = false;
        }
    });

    if ($('#peoplepicker').find('input').val() === "[]" || $('#peoplepicker').find('input').val() === "") {
        $("#peoplepicker").prev().addClass("error");
        isValid = false;
    }
    if (!isUSIToUSTransfer) {
        if ($('#peoplepicker1').find('input').val() === "[]" || $('#peoplepicker1').find('input').val() === "") {
            $("#peoplepicker1").prev().addClass("error");
            isValid = false;
        }
    }
    else {
        if ($('#usiPPMD').find('input').val() === "[]" || $('#usiPPMD').find('input').val() === "") {
            $("#usiPPMD").prev().addClass("error");
            isValid = false;
        }

        if ($('#usPPMD').find('input').val() === "[]" || $('#usPPMD').find('input').val() === "") {
            $("#usPPMD").prev().addClass("error");
            isValid = false;
        }
    }

    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    var projectOnboardingDate = new Date($('#newProjectOnBoardingDateTransfer').val());
    projectOnboardingDate.setHours(0, 0, 0, 0);

    var projectRolloffDate = new Date($('#currentProjectRollOfDateTransfer').val());
    projectRolloffDate.setHours(0, 0, 0, 0);
    var alertedAlready = false;
    // if (isUSIToUSTransfer) {
        var dateOfHire = new Date($('#dateOfHire').val());
        dateOfHire.setHours(0, 0, 0, 0);
        if (dateOfHire > currentDate) {
            bootbox.alert('Date of hire cannot be a future date.');
            alertedAlready = true;
            isValid = false;
        }
    // }

    if (projectOnboardingDate < currentDate) {
        bootbox.alert('On-boarding date cannot be less than current date.');
        isValid = false;
        alertedAlready = true;
    }

    if (projectRolloffDate < currentDate) {
        bootbox.alert('Roll-off date cannot be less than current date.');
        isValid = false;
        alertedAlready = true;
    }

    if (isValid) {
        if (isNotEmpty("newProjectOnBoardingDateTransfer") && isNotEmpty("currentProjectRollOfDateTransfer")) {
            var rollOffDate = new Date($('#currentProjectRollOfDateTransfer').val());
            if (isNaN(rollOffDate.getMonth()) || rollOffDate.getFullYear() <= 1900 || rollOffDate.getFullYear() >= 2100) {
                bootbox.alert("Invalid Date: " + $('#currentProjectRollOfDateTransfer').val());
                $('#currentProjectRollOfDateTransfer').prev().addClass("error");
                return false;
            }

            var onBoardingDate = new Date($('#newProjectOnBoardingDateTransfer').val());
            if (isNaN(onBoardingDate.getMonth()) || onBoardingDate.getFullYear() <= 1900 || onBoardingDate.getFullYear() >= 2100) {
                bootbox.alert("Invalid Date: " + $('#newProjectOnBoardingDateTransfer').val());
                $('#newProjectOnBoardingDateTransfer').prev().addClass("error");
                return false;
            }
            rollOffDate.setHours(0, 0, 0, 0);
            onBoardingDate.setHours(0, 0, 0, 0);
            if (onBoardingDate < rollOffDate) {
                bootbox.alert("New Project On Boarding Date must be greater than Project Roll-Off Date");
                return false;
            }

        }
    }
    else if (!alertedAlready) {
        bootbox.alert('Please enter the mandatory fields.');
    }


    return isValid;
}
function isNotEmpty(field) {
    var fieldData = $("#" + field).val();
    if (!fieldData) {
        $("#" + field).prev().addClass("error");
        return false;
    }

    if (fieldData.length == 0 || fieldData == "" || fieldData == "0") {
        $("#" + field).prev().addClass("error");
        return false;
    }
    return true;
}

function uploadFiles(recordID, callback) {
    $('.loading').show();
    try {
        var $fileUpload = $("input[type='file']");
        var ctr = 0;
        if (recordID && $fileUpload.length > 0) {
            var filesToUpload = [];
            $.each($fileUpload, function (idx, val) {
                var uploadFile = $(val).get(0).files;
                if (uploadFile && uploadFile.length > 0) {
                    uploadFile = uploadFile[0];
                    filesToUpload.push(uploadFile);
                }
            });

            if (filesToUpload.length > 0) {
                (function initiateUpload() {
                    uploadFileSP('Transfer Requests', recordID, filesToUpload.splice(0, 1)[0], function () {
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
function uploadFileSP(listName, id, file, callback) {
    var deferred = $.Deferred();
    getFileBuffer(file).then(
        function (buffer) {
            var bytes = new Uint8Array(buffer);
            var content = new SP.Base64EncodedByteArray();
            var queryUrl = siteUrl + "/_api/lists/GetByTitle('" + listName + "')/items(" + id + ")/AttachmentFiles/add(FileName='" + file.name + "')";
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

//need to chck correct mapping
function getSortPendingWith(result) {
        switch (result) {
        case "Offering Lead":
            result = "OL";
            break;
        case "Portfolio Lead":
            result = "OPL";
            break;
        case "Talent Group Leader":
            result = "TGL";
            break;
        case "Talent BA":
            result = "TL";
            break;
        case "New Talent Group Leader":
            result = "NTGL";
            break;
        case "New Offering Lead":
            result = "NOL";
            break;
        case "Resource Manager":
            result = "RM";
            break;
    }
    return result;
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
////

