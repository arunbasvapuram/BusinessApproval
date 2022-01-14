var visaRequestListType = "";
var approvalVisaRequestListType = "";
var additionalInfoRequestsLogType = "";
var approverAuditRequestType = "";

function togglePanel(ele) {
    var $ele = $(ele);
    $ele.closest('.panel').find('.panel-body').toggle();
    $ele.toggleClass('glyphicon-minus').toggleClass('glyphicon-plus');
}

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

function getVisaRequestListType() {
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('VisaRequests')",
        headers: { Accept: "application/json;odata=verbose" },
        success: function (data) {
            visaRequestListType = data.d.ListItemEntityTypeFullName;
        }
    })
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

var isEH1 = false;
var isNL1 = false;
var isEL1 = false;



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

//Variables declare 
var editMode = false;
var isInterOffering = false;
var isInterOffice = false;
var isInterPortfolio = false;
var isUSIToUSTransfer = false;
var isH1 = false;
var isNL1 = false;
var isEL1 = false;

function getRequestType() {
    var type = "Visa Request";
    if (isEH1) {
        type = "H1 Extension";
    }
    else if (isNL1) {
        type = "L1 New";
    }
    else if (isEL1) {
        type = "L1 Extension";
    }

    return type;
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
var isRMSPUser = false;

window.onload = function () {
    loadJSSet();
}

function initializeDatepickers() {
    $('[data-field="DateOfHire"').datepicker();
    $('[data-field="StartDate"').datepicker();
    $('[data-field="EndDate"').datepicker();

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
            //     if (isDevMode) {
            //         $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
            //     }
            //     else {
            //         $('.dropDownMenu').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
            //     }
            // }

            if (data.length == 0 || !requestID) {
                $('.loading').hide();
                bootbox.alert("You are not authorized to view this form", function () {
                    window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
                });
            }
            else {
                data.filter(function (val, id) {
                    if (val.ImmigrationRoles == "RMSP") {
                        isRMSPUser = true;
                    }
                    if (val.ImmigrationRoles == "TGL" || val.ImmigrationRoles == "OL" || val.ImmigrationRoles == "OPL") {
                        var $personalIDDiv = $('.PersonalID');
                        $personalIDDiv.hide();
                        var $NextDiv = $personalIDDiv.next('div');
                        $personalIDDiv.insertAfter($NextDiv.next());
                    }
                });
                getVisaRequestListType();
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
    var Url = _spPageContextInfo.webAbsoluteUrl + "/Pages/VisaApprovalPage.aspx?TRID=" + options.Id;
    loadListItems({
        url: getEmailTemplates,
        success: function (data) {
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            body = body.replace("{{CurrentMonth}}", month).replace("{{CurrentYear}}", year).
                replace("{{RequestTypeFrom}}", options.requestTypeFrom).replace("{{RequestTypeFrom}}", options.requestTypeFrom).
                replace("{{RequestType}}", options.requestType).replace("{{RequestType}}", options.requestType).replace("{{RequestTo}}", options.requestTo).
                replace("{{Employee}}", options.employee).replace("{{Employee}}", options.employee).
                replace("{{TBA}}", options.TBA).replace("{{CurrentProject}}", options.currentProject).
                replace("{{NewProject}}", options.newProject).replace("/sites/USICBOPortal/BusinessApproval/Lists/EmailTemplates", Url).
                replace("{{Specifics}}", options.specifics).replace("{{EmailHeader}}", options.emailHeader).
                replace("{{AdditionalInfo}}", options.additionalInfo).replace("{{Addressee}}", options.addressee).
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
}

//Validate mandatory fields 
function validate() {
    var isValid = true;
    var mandatoryFields = [
        "currClientName",
        "RolesnResp",
        "currClientName",
        "currentProjectName",
        "currProjectLocation",
        "dateOfHire",
        "prmProcess",
        "StartDate",
        "EndDate",
        "resourceManagerList", //Uncomment
        //"uploadElement", //Uncomment
        "ChecklistItems",
        "practitionerPID",
        "deloitteUSOffice",
        "zipcode",
        "assignmentType",
        "talentGroupLeaderList", //Uncomment 
        "ClientAddress",
        "CurrentUSImmigrationStatus"
    ];

    // if ($('#Offering').val() == "Systems Engineering") {
    //     mandatoryFields.push("marketOfferingList");
    // }
    //Uncomment
    if (isEL1 || isNL1) {
        mandatoryFields.push("l1Type");
        mandatoryFields.push("l1Category");
    }

    if (isUSIToUSTransfer) {
        mandatoryFields.push("dateOfHire");
    }
    else {
        mandatoryFields.push("currClientName");
        mandatoryFields.push("RolesnResp");
        mandatoryFields.push("currClientName");
        mandatoryFields.push("currentProjectName");
        mandatoryFields.push("currProjectLocation");
    }

    $.each(mandatoryFields, function (idx, val) {
        if (!isNotEmpty(val)) {
            isValid = false;
        }
    });

    if ($('input[type=radio][name=HasEverTravelledToUS]:checked').length == 0) {
        $('input[type=radio][name=HasEverTravelledToUS]').closest('div').parent().addClass("error");
        isValid = false;
    }
    if ($('input[type=radio][name=ShouldAddNewWorkSite]:checked').length == 0) {
        $('input[type=radio][name=ShouldAddNewWorkSite]').closest('div').addClass("error");
        isValid = false;
    }
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

    //Uncomment the following
    //else {
    //    if ($('#usiPPMD').find('input').val() === "[]" || $('#usiPPMD').find('input').val() === "") {
    //        $("#usiPPMD").prev().addClass("error");
    //        isValid = false;
    //    }

    //    if ($('#usPPMD').find('input').val() === "[]" || $('#usPPMD').find('input').val() === "") {
    //        $("#usPPMD").prev().addClass("error");
    //        isValid = false;
    //    }
    //}

    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    var projectOnboardingDate = new Date($('#EndDate').val());
    projectOnboardingDate.setHours(0, 0, 0, 0);

    var projectRolloffDate = new Date($('#StartDate').val());
    projectRolloffDate.setHours(0, 0, 0, 0);
    var alertedAlready = false;
    var dateOfHire = new Date($('#dateOfHire').val());
    dateOfHire.setHours(0, 0, 0, 0);
    if (dateOfHire > currentDate) {
		$('.loading').hide();
        bootbox.alert('Date of hire cannot be a future date.');
        alertedAlready = true;
        isValid = false;
    }

    if (projectOnboardingDate < currentDate) {
		$('.loading').hide();
        bootbox.alert('End date cannot be less than current date.');
        isValid = false;
        alertedAlready = true;
    }

    if (projectRolloffDate < currentDate) {
		$('.loading').hide();
        bootbox.alert('Start date cannot be less than current date.');
        isValid = false;
        alertedAlready = true;
    }

    if (isValid) {
        if (isNotEmpty("EndDate") && isNotEmpty("StartDate")) {
            var rollOffDate = new Date($('#StartDate').val());
            if (isNaN(rollOffDate.getMonth()) || rollOffDate.getFullYear() <= 1900 || rollOffDate.getFullYear() >= 2100) {
				        $('.loading').hide();
                bootbox.alert("Invalid Date: " + $('#StartDate').val());
                $('#StartDate').prev().addClass("error");
                return false;
            }

            var onBoardingDate = new Date($('#EndDate').val());
            if (isNaN(onBoardingDate.getMonth()) || onBoardingDate.getFullYear() <= 1900 || onBoardingDate.getFullYear() >= 2100) {
				        $('.loading').hide();
                bootbox.alert("Invalid Date: " + $('#EndDate').val());
                $('#EndDate').prev().addClass("error");
                return false;
            }
            rollOffDate.setHours(0, 0, 0, 0);
            onBoardingDate.setHours(0, 0, 0, 0);
            if (onBoardingDate < rollOffDate) {
				        $('.loading').hide();
                bootbox.alert("Visa End Date must be greater than Start Date");
                return false;
            }

        }
    }
    else if (!alertedAlready) {
		    $('.loading').hide();
        bootbox.alert('Please enter the mandatory fields.');
    }

    return isValid;
}

function takeAction(approve) {
    //btn btn-primary bootbox-accept
	  var flag = false;
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
				      $('.loading').show();
				      flag = true;				                
            }
        }
    }).on("hidden.bs.modal", function() {
		      if(flag){
			      initiateAction(approve);
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
        var isPendingWithRM = approverData.Pending_x0020_With.results[0] == "RM";
        if (!isPendingWithRM) {
            $row.append('<div class="col-md-4"><label>Request Information from:</label></div>')
                .append('<div class="col-md-5"><label><input onchange="requestMoreInfoValueChanged()" type="radio" name="RequestTo" value="Practitioner"/>Practitioner</label><label><input onchange="requestMoreInfoValueChanged()" type="radio" name="RequestTo" value="Talent"/>Resource Manager</label></div>');
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
    var isPendingWithRM = approverData.Pending_x0020_With.results[0] == "RM";

    if (commentsText && (isPendingWithRM || $('[name="RequestTo"]:checked').length > 0)) {
        $('.confirmRequestInfo').removeAttr('disabled');
    }
    else {
        $('.confirmRequestInfo').attr('disabled', true);
    }
}

function initiateMoreInfoRequest() {
    $('.loading').show();
    var requestTo = '';
    var isPendingWithRM = approverData.Pending_x0020_With.results[0] == "RM";
    if (isPendingWithRM) {
        requestTo = "Practitioner";
    }
    else {
        requestTo = $('[name="RequestTo"]:checked').val();
    }

    var comments = $('#moreInfoText').val().trim();
  
    var requestToName = $('#resourceManagerList option:selected').text().split(',')[1] + " " + $('#resourceManagerList option:selected').text().split(',')[0];
    var requestToId = $('#resourceManagerList option:selected').val();
    var requestToEmail = GetUserbyId(requestToId); 

    var requestCCEmail = currentLoggedInUserEmail;
    var fieldsToUpdate = {
        Pending_x0020_With: { results: ["RM"] },
        IsAdditionalDataRequired: 'Y',
        AdditionalDataComments: comments,
        "__metadata": {
            "type": approvalVisaRequestListType
        }
    }

    var toPractitioner = false;
    if (requestTo == "Practitioner") {
        toPractitioner = true;
        fieldsToUpdate.Pending_x0020_With.results = [];
        fieldsToUpdate.Title = 'Draft';
        requestToEmail = $('[data-field="PractitionerEmail"]').val();
        requestToName = $('[data-field="PractitionerName"]').val();
        requestToId = approverData.practitionerDetails0Id;
    }
    else {
        fieldsToUpdate.AdditionalDataComments = approverData.Pending_x0020_With.results[0] + " : " + fieldsToUpdate.AdditionalDataComments;
    }

    //Approver Audit - Additional Data requested by
    if (approverData.Pending_x0020_With.results[0] != "RM") {
        fieldsToUpdate.AdditionalDataRequestedRole = approverData.Pending_x0020_With.results[0];
    }

    var list1Updated = false;
    var list2Updated = false;
    var list3Updated = false;

    var updateUrl = siteUrl + "/_api/web/lists/getbytitle('ApprovalVisaRequests')/items(" + approverData.ID + ")";
    $.ajax({
        url: updateUrl,
        type: "PATCH",
        async: true,
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

    fieldsToUpdate.__metadata.type = visaRequestListType;

    updateUrl = siteUrl + "/_api/web/lists/getbytitle('VisaRequests')/items(" + approverData.OriginalRequestId + ")";
    $.ajax({
        url: updateUrl,
        type: "PATCH",
        async: true,
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
            case "RM":
                result = "Resource Manager";
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
        async: true,
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
    });

    //Approver Audit - log in case of AdditionalData
    var approvalAuditInfo = {
        "__metadata": {
            "type": approverAuditRequestType
        },
        "Title": "VisaApproval",
        "Category": "Visa",
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





    var requestUrl = "";
    if (toPractitioner) {
        var visaType = ""
        switch (approverData.TypeOfRequest) {
            case "H1 Extension":
                visaType = "&Type=VEH1"
                break;
            case "L1 New":
                visaType = "&Type=VNL1"
                break;
            case "L1 Extension":
                visaType = "&Type=VEL1"
                break;
        }
        requestUrl = siteUrl + "/Pages/VISARequest.aspx?TRID=" + approverData.OriginalRequestId + visaType;
    }
    else {
        requestUrl = siteUrl + "/Pages/VisaApprovalPage.aspx?TRID=" + approverData.OriginalRequestId;
    }

    var emailOptions = {
        to: requestToEmail,
        subject: "Visa Approval Request for " + $('[data-field="PractitionerName"]').val() + '- Additional information required',
        templateType: "clarification",
        addressee: requestToName,
        requester: currentLoggedInUserFullName,
        additionalInfo: comments,
        requestType: getRequestType(),
        requestTo: requestToName,
        employee: $('[data-field="PractitionerName"]').val(),
        currentProject: $('[data-field="currentProjectName"]').val(),
        newProject: $('[data-field="newProjectName"]').val(),
        Id: approverData.OriginalRequestId,
        RM: $('#resourceManagerList option:selected').text().split(',')[1] + " " + $('#resourceManagerList option:selected').text().split(',')[0],
        message: comments,
        requestUrl: requestUrl
    }
    emailOptions.emailHeader = getRequestType() + " Visa Request - Additional Information Required";

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
    var currentPendingWith = approverData.Pending_x0020_With.results[0];

    if (currentPendingWith == "OL" && approverData.PremiumProcessing == "No") {
        finalStageReached = true;
    }
    else if (currentPendingWith == "OPL") {
        finalStageReached = true;
    }
}

//Approve button 
function initiateAction(approve) {		
    $('.error').removeClass('error');
    var isRejected = !approve;
    if (!checkIfCurrentUserIsTheRightApprover()) {
		    $('.loading').hide();
        bootbox.alert("You are not authorized to approve/reject this form.");
    }
    //Check Mandatory fields 

    else if (isRejected && !$('#comments').val()) {
		    $('.loading').hide();
        bootbox.alert("Please provide Approval/Rejection reason");
    }
    // else if (!$('[data-field="Businesscase"]').val()) {
    //     bootbox.alert("Please provide Business Case");
    // }
    else if (validate()) { //Uncomment 			
        var nextPendingWith = "";
        var nextPendingWithEmail = "";
        var nextPendingWithName = "";
        var currentComments = {};
		var requestTGLId = "";
        var TGLEmail = "";
        var TGLName = "";

        //RM details
        var requestRMId = $('#resourceManagerList option:selected').val();
        var RMEmail = GetUserbyId(requestRMId); 
        var RMName = $('#resourceManagerList option:selected').text().split(',')[1] + " " + $('#resourceManagerList option:selected').text().split(',')[0];

		//TGL details
        //if ($('#Offering').val() == "Systems Engineering" && ($('#marketOfferingList').val() == "SDO" || $('#marketOfferingList').val() == "SDE")) {
            var requestTGLId = $('#talentGroupLeaderList option:selected').val();
            var TGLEmail = GetUserbyId(requestTGLId);
            var TGLName = $('#talentGroupLeaderList option:selected').text().split(',')[1] + " " + $('#talentGroupLeaderList option:selected').text().split(',')[0];
        //}
        switch (approverData.Pending_x0020_With.results[0]) {
            case "RM":
                if (approverData.AdditionalDataRequestedRole != "" && approverData.AdditionalDataRequestedRole != null && approverData.AdditionalDataRequestedRole != 'undefined') {
                    nextPendingWith = approverData.AdditionalDataRequestedRole;
                    if (approverData.AdditionalDataRequestedRole == "TGL") {
                        nextPendingWithEmail = TGLEmail;
                        nextPendingWithName = TGLName;
                    }
                    if (approverData.AdditionalDataRequestedRole == "OL") {
                        nextPendingWithEmail = $('[data-field="offeringLeadDetailsId"]').data("email");
                        nextPendingWithName = $('[data-field="offeringLeadDetailsId"]').val();
                    }
                    if (approverData.AdditionalDataRequestedRole == "OPL")
                    {
                        nextPendingWith = "OPL";
                        nextPendingWithEmail = $('[data-field="portfolioLeadId"]').data("email");
                        nextPendingWithName = $('[data-field="portfolioLeadId"]').val();
                    }
                }
                else {
                    // if (approverData.Offering == "Systems Engineering") {
                        nextPendingWith = "TGL";
                        
                        nextPendingWithEmail = TGLEmail;
                        nextPendingWithName = TGLName;
                    // }
                    // else {
                    //     nextPendingWith = "OL";
                    //     nextPendingWithEmail = $('[data-field="offeringLeadDetailsId"]').data("email");
                    //     nextPendingWithName = $('[data-field="offeringLeadDetailsId"]').val();
                    // }
                }
                currentComments = { "RMComments": $('#comments').val() }
                break;
            case "TGL":
                nextPendingWith = "OL";
                nextPendingWithEmail = $('[data-field="offeringLeadDetailsId"]').data("email");
                nextPendingWithName = $('[data-field="offeringLeadDetailsId"]').val();
                currentComments = { "TGLComments": $('#comments').val() };
                break;
            case "OL":
                if (approverData.PremiumProcessing == "Yes") {
                    nextPendingWith = "OPL";
                    nextPendingWithEmail = $('[data-field="PortfolioLeadId"]').data("email");
                    nextPendingWithName = $('[data-field="PortfolioLeadId"]').val();
                    currentComments = { "OLComments": $('#comments').val() }
                }
                else {
                    currentComments = { "OLComments": $('#comments').val() };
                }

                break;
            case "OPL":
                currentComments = { "PLComments": $('#comments').val() }
                break;
        }


        var fieldsToUpdate = {
            "__metadata": {
                "type": approvalVisaRequestListType
            },
            IsAdditionalDataRequired: ''
        }

        if (!finalStageReached && !isRejected) {
            fieldsToUpdate = {
                Pending_x0020_With: { results: [nextPendingWith] },
                "__metadata": {
                    "type": approvalVisaRequestListType
                },
                IsAdditionalDataRequired: ''
            }

            if (approverData.Pending_x0020_With.results[0] == "RM") {
                if (isRMSPUser) {
                    fieldsToUpdate["IsApprovedByRMSP"] = "Y";
                    fieldsToUpdate["ApprovingRMSP"] = currentLoggedInUserEmail;
                }
                else {
                    fieldsToUpdate["IsApprovedByRMSP"] = "";
                    fieldsToUpdate["ApprovingRMSP"] = "";
                }
            }
        }
        else {
            fieldsToUpdate["Status"] = isRejected ? "Rejected" : "Approved";
            fieldsToUpdate["Pending_x0020_With"] = { results: [] };

            if (currentComments.PLComments) {
                fieldsToUpdate.FinalComments = currentComments.PLComments;
            } else if (currentComments.OLComments) {
                fieldsToUpdate.FinalComments = currentComments.OLComments;
            } else if (currentComments.TGLComments) {
                fieldsToUpdate.FinalComments = currentComments.TGLComments;
            } else if (currentComments.RMComments) {
                fieldsToUpdate.FinalComments = currentComments.RMComments;
            }

            //Approver Audit - Update FInal Action Role for Rejection
            if (isRejected) {
                fieldsToUpdate.FinalActionRole = approverData.Pending_x0020_With.results[0];
            }

            //Approver Audit - Update FInal Action Role
            if (!isRejected && finalStageReached) {
                fieldsToUpdate.FinalActionRole = approverData.Pending_x0020_With.results[0];
            }
        }

        var businessCase = $('[data-field="Businesscase"]').val();
        if (businessCase) {
            fieldsToUpdate["Businesscase"] = businessCase;
        }

        if ($('[data-field="ExceptionFlag"]').is(":checked")) {
            fieldsToUpdate["ExceptionFlag"] = "Y";
            fieldsToUpdate["ExceptionComments"] = $('#exceptionComments').val();
        }
        else {
            fieldsToUpdate["ExceptionFlag"] = "N";
        }
        var eligibilityCriteriaItems = [];
        $('[data-field="EligibilityCriteriaItems"]:checked').each(function (idx, val) {
            eligibilityCriteriaItems.push($(val).val());
        })
        if (eligibilityCriteriaItems.length > 0) {
            fieldsToUpdate["EligibilityCriteriaItems"] = eligibilityCriteriaItems.join(",");
        }
        //Update fields 
        fieldsToUpdate.PID = $("#practitionerPID").val();
        fieldsToUpdate.DateOfHire = $("#dateOfHire").val();
        //fieldsToUpdate.MarketOffering = $("#marketOfferingList option:selected").val();
        fieldsToUpdate.resourceManagerDetailsId = parseInt($("#resourceManagerList").val()); //Uncomment
        fieldsToUpdate.L1Category = $("#l1Category").val();
        fieldsToUpdate.L1VisaType = $("#l1Type").val();
        fieldsToUpdate.PremiumProcessing = $("#prmProcess").val();
        fieldsToUpdate.ClientName = $("#currClientName").val();
        fieldsToUpdate.newProjectName = $("#currentProjectName").val();
        fieldsToUpdate.CurrentProjectLocation = $("#currProjectLocation").val();
        fieldsToUpdate.DeloitteUSOffice = $("#deloitteUSOffice").val();
        fieldsToUpdate.USZipCode = $("#zipcode").val();
        fieldsToUpdate.ClientAddress = $("#ClientAddress").val();
        fieldsToUpdate.CurrentUSImmigrationStatus = $("#CurrentUSImmigrationStatus").val();
        fieldsToUpdate.AssignmentType = $("#assignmentType").val();
        fieldsToUpdate.USPPMDId = getUserInfo('peoplepicker');
        fieldsToUpdate.USIPPMDId = getUserInfo('peoplepicker1');
        fieldsToUpdate.HasEverTravelledToUS = $('input[name=HasEverTravelledToUS]:checked').val();
        fieldsToUpdate.ShouldAddNewWorkSite = $('input[name=ShouldAddNewWorkSite]:checked').val();
        fieldsToUpdate.OnsiteRolesandResponsibilities = $("#RolesnResp").val();
        fieldsToUpdate.TalentGroupLeaderId = parseInt($('#talentGroupLeaderList').val()); //Uncomment
        fieldsToUpdate.StartDate = $("#StartDate").val();
        fieldsToUpdate.EndDate = $("#EndDate").val();
        //Approver Audit - Clearing the AdditionalDataRequestedRole
        fieldsToUpdate.AdditionalDataRequestedRole = "";

        var checkedItems = [];
        $('[data-field="ChecklistItems"]').each(function (idx, val) {
            if ($(val).prop('checked')) {
                checkedItems.push($(val).val());
            }
        });

        fieldsToUpdate.ChecklistItems = checkedItems.join(",");
        $.extend(fieldsToUpdate, currentComments);
        var urlTemplateEditMode = siteUrl + "/_api/web/lists/getbytitle('ApprovalVisaRequests')/items(" + approverData.ID + ")";
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
                    to = $('[data-field="PractitionerEmail"]').val();
                    toName = $('[data-field="PractitionerName"]').val();
                    cc = RMEmail;

                    switch (approverData.Pending_x0020_With.results[0]) {
                    
                        case "TGL":
                            cc += "," + TGLEmail;
                            break;
                        case "OL":
                            cc += "," + $('[data-field="offeringLeadDetailsId"]').data("email");
                            cc += "," + TGLEmail;
                            break;
                        case "OPL":
                            cc += "," + $('[data-field="PortfolioLeadId"]').data("email");
                            cc += "," + $('[data-field="offeringLeadDetailsId"]').data("email");
                            cc += "," + TGLEmail;
                            break;
                    }

                    emailTemplate = "VisaRequestReject";
                }
                else if (!finalStageReached) {
                    switch (approverData.Pending_x0020_With.results[0]) {
                        case "RM":
                            // if (approverData.Offering == "Systems Engineering") {

                                to = TGLEmail;
                                toName = TGLName;
                                cc = RMEmail;
                            // }
                            // else {
                            //     to = $('[data-field="offeringLeadDetailsId"]').data("email");
                            //     toName = $('[data-field="offeringLeadDetailsId"]').val();
                            //     cc = RMEmail;
                            // }
                            break;
                        case "OL":
                            to = $('[data-field="PortfolioLeadId"]').data("email");
                            toName = $('[data-field="PortfolioLeadId"]').val();
                            cc = RMEmail + "," + $('[data-field="offeringLeadDetailsId"]').data("email");

                            // if (approverData.Offering == "Systems Engineering") {
                                cc += "," + TGLEmail;
                            // }
                            break;
                        case "TGL":
                            to = $('[data-field="offeringLeadDetailsId"]').data("email");
                            toName = $('[data-field="offeringLeadDetailsId"]').val();
                            cc = RMEmail + "," + TGLEmail;

                            break;
                    }
                    emailTemplate = "VisaRequestForApproval";
                }
                else {
                    to = $('[data-field="PractitionerEmail"]').val();
                    toName = $('[data-field="PractitionerName"]').val();
                    cc = RMEmail;
                    switch (approverData.Pending_x0020_With.results[0]) {
                        case "TGL":
                            cc += "," + TGLEmail;
                            break;
                        case "OL":
                            cc += "," + $('[data-field="offeringLeadDetailsId"]').data("email");
                            // if (approverData.Offering == "Systems Engineering") {
                                cc += "," + TGLEmail;
                            // }
                            break;
                        case "OPL":
                            cc += "," + $('[data-field="PortfolioLeadId"]').data("email");
                            cc += "," + $('[data-field="offeringLeadDetailsId"]').data("email");
                            // if (approverData.Offering == "Systems Engineering") {
                                cc += "," + TGLEmail;
                            // }
                            break;
                    }
                    emailTemplate = "VisaApproval";
                }


                if (!isRejected && isRMSPUser && approverData.Pending_x0020_With.results[0] == "RM") {
                    cc = cc + "," + currentLoggedInUserEmail;
                }

                options = {
                    to: to,
                    cc: cc,
                    subject: "Visa Approval Request for " + $('[data-field="PractitionerName"]').val(),
                    templateType: emailTemplate,
                    requestType: getRequestType(),
                    requestTo: nextPendingWithName,
                    employee: $('[data-field="PractitionerName"]').val(),
                    currentProject: $('[data-field="currentProjectName"]').val(),
                    newProject: $('[data-field="newProjectName"]').val(),
                    Id: approverData.OriginalRequestId,
                    RM: RMName

                }


                if (emailTemplate == "VisaApproval") {
                    options.requestTo = options.RM;
                }
                //Comment for email 
                options.emailHeader = getRequestType() + " Visa Request";
                uploadFiles(approverData.OriginalRequestId, function () {
                    //bootbox.alert("Draft request saved successfully.", function () {
                    //    window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/dashboard.aspx?team=0";
                    //});
                });
                sendEmail(options, function () {
                    var message = "The request has been successfully approved.";
                    if (isRejected) {
                        message = "The request has been successfully rejected.";
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
            "Title": "VisaApproval",
            "Category": "Visa",
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

        var openListUrl = siteUrl + "/_api/web/lists/getbytitle('VisaRequests')/items(" + approverData.OriginalRequestId + ")";
        fieldsToUpdate = {
            "__metadata": {
                "type": visaRequestListType
            },
            IsAdditionalDataRequired: ''
        }

        fieldsToUpdate["ExceptionFlag"] = $('[data-field="ExceptionFlag"]').is(":checked") ? "Y" : "N";

        //Update fields 
        fieldsToUpdate.PID = $("#practitionerPID").val();
        fieldsToUpdate.DateOfHire = $("#dateOfHire").val();
        //fieldsToUpdate.MarketOffering = $("#marketOfferingList option:selected").val();
        fieldsToUpdate.resourceManagerDetailsId = parseInt($("#resourceManagerList").val()); //Uncomment
        fieldsToUpdate.L1Category = $("#l1Category").val();
        fieldsToUpdate.L1VisaType = $("#l1Type").val();
        fieldsToUpdate.PremiumProcessing = $("#prmProcess").val();
        fieldsToUpdate.ClientName = $("#currClientName").val();
        fieldsToUpdate.newProjectName = $("#currentProjectName").val();
        fieldsToUpdate.CurrentProjectLocation = $("#currProjectLocation").val();
        fieldsToUpdate.DeloitteUSOffice = $("#deloitteUSOffice").val();
        fieldsToUpdate.USZipCode = $("#zipcode").val();
        fieldsToUpdate.ClientAddress = $("#ClientAddress").val();
        fieldsToUpdate.CurrentUSImmigrationStatus = $("#CurrentUSImmigrationStatus").val();
        fieldsToUpdate.AssignmentType = $("#assignmentType").val();
        fieldsToUpdate.USPPMDId = getUserInfo('peoplepicker');
        fieldsToUpdate.USIPPMDId = getUserInfo('peoplepicker1');
        fieldsToUpdate.HasEverTravelledToUS = $('input[name=HasEverTravelledToUS]:checked').val();
        fieldsToUpdate.ShouldAddNewWorkSite = $('input[name=ShouldAddNewWorkSite]:checked').val();
        fieldsToUpdate.OnsiteRolesandResponsibilities = $("#RolesnResp").val();
        fieldsToUpdate.TalentGroupLeaderId = parseInt($('#talentGroupLeaderList').val()); //Uncomment
        fieldsToUpdate.StartDate = $("#StartDate").val();
        fieldsToUpdate.EndDate = $("#EndDate").val();

        var checkedItems = [];
        $('[data-field="ChecklistItems"]').each(function (idx, val) {
            if ($(val).prop('checked')) {
                checkedItems.push($(val).val());
            }
        });

        fieldsToUpdate.ChecklistItems = checkedItems.join(",");

        //Approver Audit - Clearing the AdditionalDataRequestedRole
        fieldsToUpdate.AdditionalDataRequestedRole = "";

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
            fieldsToUpdate["Pending_x0020_With"] = { results: [] };

            //Approver Audit - Update FInal Action Role for Rejection
            if (isRejected) {
                fieldsToUpdate.FinalActionRole = approverData.Pending_x0020_With.results[0];
            }

            //Approver Audit - Update FInal Action Role
            if (!isRejected && finalStageReached) {
                fieldsToUpdate.FinalActionRole = approverData.Pending_x0020_With.results[0];
            }
        }
        else {
            fieldsToUpdate["Pending_x0020_With"] = { results: [nextPendingWith] };
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

    }
    //Uncomment 
    // else {
        // $('.loading').hide();
        // $([document.documentElement, document.body]).animate({
            // scrollTop: $(".error").offset().top
        // }, 1000);
    // }
}

function hideTalentGroup() {
    return 1;
    var $tglDiv = $('[data-field="TalentGroupLeaderId"]').closest('div');
    $tglDiv.remove();
}

function showAdditionalInfoText() {
    if (approverData.IsAdditionalDataRequired == 'Y') {
        $('<div style="margin-top: 40px;border: 1px #86BC25;border-style: solid;padding: 10px;"><b style="color:red">Additional Information Requested:</b><p>' + approverData.AdditionalDataComments + '</p></div>').insertAfter('.txt-new-Request');
    }
}

function checkIfCurrentUserIsTheRightApprover() {
    var hasAccess = false;
    switch (approverData.Pending_x0020_With.results[0]) {
        case "RM":
            hasAccess = approverData.resourceManagerDetailsId === currentLoggedInUserId;
            if (!hasAccess && isRMSPUser) {
                hasAccess = true;
            }
            break;
        case "TGL":
            hasAccess = approverData.TalentGroupLeaderId === currentLoggedInUserId;
            break;
        case "OL":
            hasAccess = approverData.offeringLeadDetailsId === currentLoggedInUserId;
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

function loadExteriorAttachments() {
    var url = siteUrl + "/_api/web/lists/getbytitle('VisaRequests')/items?$select=*&$expand=AttachmentFiles&$filter=ID eq '" + requestID + "'";
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
    var url = siteUrl + "/_api/web/lists/getbytitle('ApprovalVisaRequests')/items?$select=*,practitionerDetails0/EMail,USPPMD/EMail,USIPPMD/EMail&$expand=AttachmentFiles,practitionerDetails0/Id,USPPMD/Id,USIPPMD/Id&$filter=OriginalRequestId eq '" + requestID + "'";
    loadListItems({
        url: url,
        success: function (data) {
            if (data.length > 0) {
                $('.divTransferTable').show();
                var item = data[0];
                window.approverData = item;
                approvalVisaRequestListType = item.__metadata.type;
                if (!approverData.Pending_x0020_With) {
                    approverData.Pending_x0020_With = { results: [] };
                }
                switch (approverData.TypeOfRequest) {
                    case "H1 Extension":
                        isEH1 = true;
                        break;
                    case "L1 New":
                        isNL1 = true;
                        break;
                    case "L1 Extension":
                        isEL1 = true;
                        break;
                }


                $('#requestTypeidentifier').text("Approval Request: " + getRequestType());
                checkIfCurrentUserIsTheRightApprover();
                showAdditionalInfoText();


                if (approverData.DateOfHire) {
                    $("#dateOfHire").datepicker('setDate', new Date(approverData.DateOfHire));
                }
                // if (!(approverData.Offering == "Systems Engineering")) {
                //     hideTalentGroup();
                // }

                if (isEL1 || isNL1) {
                    $(".l1TypeDiv").css("display", "inline-block");
                    $('#l1Type').val(!approverData.L1VisaType ? "0" : approverData.L1VisaType);
                    $('#l1Category').val(!approverData.L1Category ? "0" : approverData.L1Category);
                }
                $("#prmProcess").val(approverData.PremiumProcessing);
                $('#assignmentType').val(!approverData.AssignmentType ? "0" : approverData.AssignmentType);

                $('input[name=HasEverTravelledToUS][value=' + approverData.HasEverTravelledToUS + ']').prop('checked', 'true');
                $('input[name=ShouldAddNewWorkSite][value=' + approverData.ShouldAddNewWorkSite + ']').prop('checked', 'true');

                if (!(isNL1 || isEL1)) {
                    $('.l1TypeDiv').remove();
                    $('.premiumProcess').insertAfter($('.TypeOfRequest').closest('div'));
                    $(".onlyH1").hide();
                }

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

                // if (approverData.Offering == "Systems Engineering") {
                //     $(".marketOffering").css("display", "inline-block");
                //     $('#marketOfferingList').val(!approverData.MarketOffering ? "0" : approverData.MarketOffering);

                    
                // }
                //Show TGL offering
                //if (approverData.MarketOffering == "0" || approverData.MarketOffering == "SDE" || approverData.MarketOffering == "SDO") {
                    showTalentGroup();
                    $('#talentGroupLeaderList').val(!approverData.TalentGroupLeaderId ? "0" : approverData.TalentGroupLeaderId);
                //}
                //else {
                  //  hideTalentGroup();
                //}

                // if (!(approverData.Offering == "Systems Engineering" && (approverData.MarketOffering == "SDO" || approverData.MarketOffering == "SDE"))) {
                //     hideTalentGroup();
                // }
                


                $('#resourceManagerList').val(!approverData.resourceManagerDetailsId ? "0" : approverData.resourceManagerDetailsId);

                if (approverData.USPPMD.EMail) {
                    setPeoplePicker("peoplepicker", approverData.USPPMD.EMail);
                }

                if (approverData.USIPPMD.EMail) {
                    setPeoplePicker("peoplepicker1", approverData.USIPPMD.EMail);
                }

                var userIds = [];
                var practitionerId = item.practitionerDetails0Id;
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
                            else if ((prop == "ChecklistItems" || prop == "EligibilityCriteriaItems")) {
                                if (item[prop]) {
                                    var checkLists = item[prop].split(',');
                                    $(checkLists).each(function (idx, val) {
                                        $('[type="checkbox"][value="' + val + '"]').prop('checked', true);
                                    });
                                }
                            }
                            else if ($field.is("[type='checkbox']")) {
                                if (item[prop] == "Y") {
                                    $field.trigger('click');
                                }
                            }
                            else if ($field.is(":radio")) {
                                $field.filter('[value="' + item[prop] + '"]').prop('checked', true);
                            }
                            // else if (prop == "MarketOffering") {
                            //     var marketOfferingText = item[prop];
                            //     switch (marketOfferingText) {
                            //         case "SDE":
                            //             marketOfferingText = "Systems Design & Engineering";
                            //             break;
                            //         case "SDO":
                            //             marketOfferingText = "Service Delivery Optimization";
                            //             break;
                            //         case "AMA":
                            //             marketOfferingText = "App Modernization and App Architecture";
                            //             $field.closest('div').toggleClass('col-sm-4 col-sm-5');
                            //             break;
                            //         case "IS":
                            //             marketOfferingText = "Integration Services";
                            //             break;
                            //     }
                            //     $field.val(marketOfferingText);
                            // }
                            else {
                                $field.val(item[prop]);
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
                            if ($(item.RMComments).text()) {
                                $previousComments.append('<div class="col-md-10"><label>' + $('#resourceManagerList option:selected').text().split(',')[1].trim() + " " + $('#resourceManagerList option:selected').text().split(',')[0] + ':</label><p>' + $(item.RMComments).text() + '</p></div>');
                            }
                            if ($(item.TGLComments).text()) {
                                $previousComments.append('<div class="col-md-10"><label>' + $('#talentGroupLeaderList option:selected').text().split(',')[1].trim() + " " + $('#talentGroupLeaderList option:selected').text().split(',')[0] + ':</label><p>' + $(item.TGLComments).text() + '</p></div>');
                            }
                            if ($(item.OLComments).text()) {
                                $previousComments.append('<div class="col-md-10"><label>' + $('[data-field="offeringLeadDetailsId"]').val() + ':</label><p>' + $(item.OLComments).text() + '</p></div>');
                            }

                            checkIfFinalStageReached();
                            // if (!finalStageReached && !(approverData.IsAdditionalDataRequired == 'Y' && approverData.Pending_x0020_With.results[0] == "TL")) {
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
                    console.log(data.d.results);
                    console.log(data.d.results);
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
    if (urlParam("Type") == "VNL1") {
        isNL1 = true;
    }
    else if (urlParam("Type") == "VEL1") {
        isEL1 = true;
    }
    else if (urlParam("Type") == "VEH1") {
        isEH1 = true;
    }

    checkIfUserIsApprover();
}

function togglePanel(ele) {
    var $ele = $(ele);
    $ele.closest('.panel').find('.panel-body').toggle();
    $ele.toggleClass('glyphicon-plus').toggleClass('glyphicon-minus');
}

function hideTalentGroup() {
    return 1;
    var $tglDiv = $('#talentGroupLeaderList').closest('div');
    if ($tglDiv.is(':visible')) {
        $tglDiv.hide();
    }
}

function showTalentGroup() {
    var $tglDiv = $('#talentGroupLeaderList').closest('div');
    if (!$tglDiv.is(':visible')) {
        $tglDiv.show();
    }
}

$(document).ready(function () {

    //to show the approval History
    $('#approvalHistory, #approvalHistoryMobile').click(function (e){
        $('.loading').show();
        showApprovalHistory();
    
    });

    $('[data-field="ExceptionFlag"]').click(function () {
        if (!$('[data-field="ExceptionFlag"]').is(':checked')) {
            $('#exceptionComments').val("").attr('disabled', 'disabled');
        }
        else {
            $('#exceptionComments').val("").removeAttr('disabled');
        }

    })


    $("input[type='checkbox']").change(function () {
        if ($(this).is(':checked')) {
            $('#' + $(this)[0].id.replace('cb', '')).removeAttr('disabled');
        }
        else {
            $('#' + $(this)[0].id.replace('cb', '')).attr('disabled', 'disabled');
            if ($(this).closest('.row').find('a').length > 0) {
                //DeleteItemAttachment($(this).data('cbcode') + "^$SEP$^" + $(this).closest('.row').find('a')[0].text);
                DeleteItemAttachment($(this).closest('.row').find('a')[0].text);
                var $fileUploadCntrl = $(this).closest('.row').find('[type="file"]');
                $fileUploadCntrl.attr("disabled", "disabled").show();
                $(this).closest('.row').find('a').hide();
                $(this).closest('.row').find('.glyphicon-remove-circle').hide();
            }
            else if ($(this).closest('.row').find('[type="file"]')[0].files.length > 0) {
                $(this).closest('.row').find('[type="file"]').val('').attr("disabled", "disabled");
                $(this).closest('.row').find('.glyphicon-remove-circle').hide();
            }
        }
    })


    var $fileUploadControls = $("input[type='file']");
    $fileUploadControls.change(function (e) {
        var $fileUpload = $(e.target);
        var files = $fileUpload.get(0).files;
        if (files.length > 0) {
            $fileUpload.closest('div').find('span').show();
        }
        else {
            $fileUpload.closest('div').find('span').hide();
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
        if ($ele.closest('.row').find('a').length > 0) {
            //var $checkBoxEleme = $ele.closest('.row').find('input[type="checkbox"]');
            //DeleteItemAttachment($checkBoxEleme.data('cbcode') + "^$SEP$^" + $ele.prev()[0].text);
            DeleteItemAttachment($ele.prev()[0].text);
            //$checkBoxEleme.removeAttr("checked");
            var $fileUploadCntrl = $ele.closest('.row').find('[type="file"]');
            $fileUploadCntrl.show();
            $ele.prev().hide();
        }
        else if ($ele.closest('.row').find('[type="file"]')[0].files.length > 0) {
            $ele.closest('.row').find('[type="file"]').val('');
        }
        $ele.hide();
    });


    // $("#marketOfferingList").change(function () {
    //     if ($(this).val() == "0") {
    //         showTalentGroup();
    //     }
    //     else {
    //         hideTalentGroup();
    //     }
    // })

    initializePeoplePicker('peoplepicker', false, 'People Only', 0);
    initializePeoplePicker('peoplepicker1', false, 'People Only', 0);
    initializePeoplePicker('peoplepicker2', false, 'People Only', 0);
    initializePeoplePicker('peoplepicker3', false, 'People Only', 0);

    if (isUSIToUSTransfer) {
        initializePeoplePicker('usPPMD', false, 'People Only', 0);
        initializePeoplePicker('usiPPMD', false, 'People Only', 0);
    }

    $("#btnSubmit").click(function () {
        $('.loading').show();
        postCreateRequestAjax();
    });

    $("#btnSaveForLater").click(function () {
        $('.loading').show();
        postCreateSaveForLaterAjax();
    });

    function clearPeoplePicker(pickerId) {
        var ppobject = SPClientPeoplePicker.SPClientPeoplePickerDict[pickerId + "_TopSpan"]
        var usersobject = ppobject.GetAllUserInfo();
        usersobject.forEach(function (index) {
            ppobject.DeleteProcessedUser(usersobject[index]);
        });
    }


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

    $('[data-helpinfo]').click(function (e) {
        var currentOffering = $('#Offering').val();
        var $ele = $(e.target);
        var messages = [];
        var code = $ele.data('helpinfo');
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
    //if (isUSIToUSTransfer) {
    //    $('.notUsiTransferElements').remove();
    //    $('.usiTransferElements').show();
    //    $('.sponsorDiv').css("display", "inline-block");
    //}
    //else {
    //    $('.usiTransferElements').remove();
    //}

    //$("#btnSubmit").click(function () {
    //    $('.loading').show();
    //    postCreateRequestAjax();
    //});

    //$("#btnSaveForLater").click(function () {
    //    $('.loading').show();
    //    postCreateSaveForLaterAjax();
    //});


})

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
                    uploadFileSP('VisaRequests', recordID, filesToUpload.splice(0, 1)[0], function () {
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


function DeleteItemAttachment(FileTitle) {
    var UrlDeleteDocument = siteUrl + "/_api/web/lists/GetByTitle('VisaRequests')/GetItemById(" + requestId + ")/AttachmentFiles/getByFileName('" + FileTitle + "')  ";
    $.ajax({
        url: UrlDeleteDocument,
        type: 'DELETE',
        contentType: 'application/json;odata=verbose',
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {

        },
        complete: function () {

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

function showApprovalHistoryTab(){
    
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
        result = "<p>No Records Found.</p>";
    }       
    
       
    $('#approvalHistoryTab').appendChild(result);

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