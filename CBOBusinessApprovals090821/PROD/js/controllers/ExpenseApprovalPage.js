
var metadata = {
    locations: {
        hyderabad: "Hyderabad",
        mumbai: "Mumbai",
        gurgaon: "Gurgaon",
        bengaluru: "Bengaluru"
    },
    offerings: {
        systemsEngineering: "Systems Engineering",
        cloudEngineering: "Cloud Engineering",
        operationsTransformation: "Operations Transformation",
        coreIndustrySolutions: "Core Industry Solutions"
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

var expenseRequestListType = "";
var approvalExpenseRequestListType = "";
var additionalInfoRequestsLogType = "";
var approverAuditRequestType = "";

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
var expenseTypes = {
    "LDTE": "Travel Expenses for training",
    "LDAC": "Approval for certifications",
    "BKPC": "Books & Publications",
    "CMCO": "Computer Costs-Other",
    "CPUC": "CPU Costs HostingSvs",
    "BUSE": "Bus Entertainment",
    "BUML": "Business Meals",
    "STWF": "Staff Welfare USI",
    "SMRG": "Seminar Registration",
    "MCPN": "Moving Cost-Persnl",
    "GFNE": "Gifts Non-employee",
    "IMGF": "Intl Immigration Fee",
    "CFCT": "Cafeteria Costs",
    "FPMO": "Firm Prov Mls In Off",
    "FPRE": "Firm Provi Rec Ent",
    "FPML": "Firm Provided Meals",
    "MLOT": "Meals-Overtime",
    "PKAW": "Parking-Auto Weekend",
    "PRKL": "Parking-Local",
    "PHEX": "Physical Exams",
    "REML": "Recr Exp - Meals",
    "TRPN": "Trans-Personne",
    "OFSL": "Office Supplies",
    "PRCP": "Printing & Copying",
    "MVTE": "Moving-Trv Exp",
    "TREA": "Travel Exp-Airline",
    "TRET": "Travel Expenses-Taxi",
    "TRRC": "Travel Exp-Rental Ca",
    "TRHL": "Traveling Exp-Hotel",
    "TRMC": "Traveling Exp-Misc",
    "TRAA": "Trvl Exp- Air Alt",
    "TRAF": "Trvl Exp-Agency Fee",
    "TRBF": "Trvl Exp-Air Bag Fee",
    "TRAH": "Trvl Exp-Air/Htl Cl",
    "TRAC": "Trvl Exp-Alcohol Fed",
    "TRCS": "Trvl Exp-Car Svc/Lmo",
    "TRCG": "Trvl Exp-CarRent Gas",
    "TRFP": "Trvl Exp-Fed PerDiem",
    "TRHC": "Trvl Exp-Health Club",
    "TRHI": "Trvl Exp-Hot Int A",
    "TRHT": "Trvl Exp-HotelTax",
    "TRIT": "Trvl Exp-InbIntl Tem",
    "TRME": "Trvl Exp-Meal Exp",
    "TRPD": "Trvl Exp-Per Diem",
    "TRPH": "Trvl Exp-Phone",
    "TRPK": "Trvl Exp-Pking",
    "TRCA": "Trvl Exps-Corp Apt",                            
    "TRSD": "Trvl Exp-Sp & Dep",
    "TRTL": "Trvl Exp-Temp Living",
    "TRTP": "Trvl Exp-Tips",
    "TRTO": "Trvl Exp-Tolls",
    "TROG": "TrvlExp-Oth Grnd Trn",
}
var isTBAApprovalRequired = "";
var isTGLApprovalRequired = "";
var isOLApprovalRequired = "";
var isOPLApprovalRequired = "";

window.onload = function () {
    loadJSSet();
}

$('.loading').show();
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

function initializeDatepickers() {
    $('[data-field="expenseDate"').datepicker();
  

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
    //if (urlParam("Type") == "VNL1") {
    //    isNL1 = true;
    //}
    //else if (urlParam("Type") == "VEL1") {
    //    isEL1 = true;
    //}
    //else if (urlParam("Type") == "VEH1") {
    //    isEH1 = true;
    //}
    debugger;
    console.log(currentLoggedInUserEmail);
    checkIfUserIsApprover();
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
                getExpenseRequestListType();
                getAdditionalInfoRequestLogListType();
                getApproverAuditDataRequestListType();
                bootstrapper();
            }
            // else {
            //     data.filter(function (val, id) {
            //         //if (val.ImmigrationRoles == "RMSP") {
            //         //    isRMSPUser = true;
            //         //}
            //         //if (val.ImmigrationRoles == "TGL" || val.ImmigrationRoles == "OL" || val.ImmigrationRoles == "OPL") {
            //         //    var $personalIDDiv = $('.PersonalID');
            //         //    $personalIDDiv.hide();
            //         //    var $NextDiv = $personalIDDiv.next('div');
            //         //    $personalIDDiv.insertAfter($NextDiv.next());
            //         //}
            //     });
            //     //getVisaRequestListType();
            //     //getAdditionalInfoRequestLogListType();
            //     //getApproverAuditDataRequestListType();
            //     bootstrapper();
            // }
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
                replace("{{RequestHyperLink}}", '<a href="' + options.requestUrl + '">here</a>').replace("{{RequestNumber}}", options.Id);

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
    //if(validate()){

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
                    currentComments = { "OLComments": $('#comments').val() }
                    break;
                case "OPL":
                    currentComments = { "OPLComments": $('#comments').val() }
                    break;
            }
    
    
    
            var fieldsToUpdate = {
                "__metadata": {
                    "type": approvalExpenseRequestListType
                },
                IsAdditionalDataRequired: ''
            }            

            if (!finalStageReached && !isRejected) {
                fieldsToUpdate = {
                    PendingWith: { results: [nextPendingWith] },
                    "__metadata": {
                        "type": approvalExpenseRequestListType
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
            // fieldsToUpdate["DateOfHire"] = $("#DateOfHire").val();
            // fieldsToUpdate["TalentTeamPersonId"]  = $("#talentLeadList").val();
            // fieldsToUpdate["ResourceManagerId"]  = $("#resourceManagerList").val();
            // fieldsToUpdate["TalentESId"]  = $("#talentEsList").val();
            // fieldsToUpdate["StartDate"]  = $("#StartDate").val();
            // fieldsToUpdate["EndDate"]  = $("#EndDate").val();
            // fieldsToUpdate["Reason"]  = $("#Reason").val();
            // fieldsToUpdate["CurrentLWD"]  = $("#CurrentLWD").val();
            // fieldsToUpdate["ProposedLWD"]  = $("#ProposedLWD").val();
            // fieldsToUpdate["TalentGroupLeadId"] = $("#talentGroupLeaderList").val();
            // fieldsToUpdate["RevokeResignationDate"]  = $("#RevokeResignationDate").val();
            ////
    
            $.extend(fieldsToUpdate, currentComments);
            $('.loading').show();
            var urlTemplateEditMode = siteUrl + "/_api/web/lists/getbytitle('ApprovalExpenseRequests')/items(" + approverData.ID + ")";
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
                    // uploadFiles(approverData.OriginalRequestId, function () {
                    //     // bootbox.alert("Request submitted successfully.", function () {
                    //     //     window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/dashboard.aspx?team=0";
                    //     // });
                    // });



                    var to = "";
                    var toName = ""
                    var cc = "";
                    var emailTemplate = "";
                    if (isRejected) {
                        to = $('[data-field="PractitionerEmail"]').val();
                        toName = $('[data-field="PractitionerName"]').val();
                        // if (finalStageReached)
                        // {
                            // cc = $('[data-field="resourceManagerDetailsId"]').data("email"); 
                            //cc = GetUserbyId($("#resourceManagerList").val()); 
                            
                            // cc += "," + $('[data-field="TalentTeamPersonId"]').data("email");
                            // cc += "," + $('[data-field="TalentGroupLeadId"]').data("email");
                            // cc += "," + $('[data-field="TalentEsId"]').data("email");

                            cc += "," + $('[data-field="ThreadorInitiativeLeadId"]').data("email");
                            cc += "," + $('[data-field="TalentGroupLeadId"]').data("email");
                            //cc += "," + GetUserbyId($("#talentEsList").val()); 

                            if(approverData.PendingWith.results[0] == "OPL")
                            {
                                cc += "," + $('[data-field="OfferingLeadId"]').data("email");
                            }
                        // }
                        emailTemplate = "ExpenseRequestReject";
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
                    //     emailTemplate = "ExpenseRequestForApproval";
                    // }
                    else {
                        to = $('[data-field="PractitionerEmail"]').val();
                        toName = $('[data-field="PractitionerName"]').val();
                        if (finalStageReached)
                        {
                            // cc = $('[data-field="resourceManagerDetailsId"]').data("email");
                            //cc = GetUserbyId($("#resourceManagerList").val()); 
                            
                            // cc += "," + $('[data-field="TalentTeamPersonId"]').data("email");
                            // cc += "," + $('[data-field="TalentGroupLeadId"]').data("email");
                            // cc += "," + $('[data-field="TalentEsId"]').data("email");

                            cc += "," + $('[data-field="ThreadorInitiativeLeadId"]').data("email");
                            //cc += "," + $('[data-field="TalentGroupLeadId"]').data("email");
                            //cc += "," + GetUserbyId($("#talentEsList").val()); 

                            // if(approverData.PendingWith.results[0] == "OPL")
                            // {
                            //     cc += "," + $('[data-field="OfferingLeadId"]').data("email");
                            // }
                        }
                        emailTemplate = "ExpenseRequestApproval";
                    }
    
                    // if (!isRejected && isRMSPUser && approverData.PendingWith.results[0] == "RM") {
                    //     cc = cc + "," + currentLoggedInUserEmail;
                    // }
					if(finalStageReached || isRejected){
						options = {
							to: to,
							cc: cc,
							subject: "Expense Approval Request for " + $('[data-field="PractitionerName"]').val(),
							templateType: emailTemplate,
							requestType: expenseTypes[requestTypeCode],
							requestCategory: 'Expense',
							employee: $('[data-field="PractitionerName"]').val(),
							Id: approverData.OriginalRequestId
		
						}
		
		
						// if (emailTemplate == "EmployeeRequestApproval") {
						//     options.requestTo = options.RM;
						// }
		
						//options.emailHeader = "Expense Request";
		
		
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
    
            var openListUrl = siteUrl + "/_api/web/lists/getbytitle('ExpenseRequestsData')/items(" + approverData.OriginalRequestId + ")";
            fieldsToUpdate = {
                "__metadata": {
                    "type": expenseRequestListType
                },
                IsAdditionalDataRequired: ''
            }
    
            // fieldsToUpdate["ExceptionFlag"] = $('[data-field="ExceptionFlag"]').is(":checked") ? "Y" : "N";
            
            //by me 
            // fieldsToUpdate["DateOfHire"] = $("#DateOfHire").val();
            // fieldsToUpdate["TalentTeamPersonId"]  = $("#talentLeadList").val();
            // fieldsToUpdate["ResourceManagerId"]  = $("#resourceManagerList").val();
            // fieldsToUpdate["TalentESId"]  = $("#talentEsList").val();
            // fieldsToUpdate["StartDate"]  = $("#StartDate").val();
            // fieldsToUpdate["EndDate"]  = $("#EndDate").val();
            // fieldsToUpdate["Reason"]  = $("#Reason").val();
            // fieldsToUpdate["CurrentLWD"]  = $("#CurrentLWD").val();
            // fieldsToUpdate["ProposedLWD"]  = $("#ProposedLWD").val();
            // fieldsToUpdate["TalentGroupLeadId"] = $("#talentGroupLeaderList").val();
            // fieldsToUpdate["RevokeResignationDate"]  = $("#RevokeResignationDate").val();
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
                complete: function (data) {
                    var a=0;
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
                "Title": "ExpenseApproval",
                "Category": "Expense",
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
    //}

   
}

function hideTalentGroup() {
    return 1;
    var $tglDiv = $('[data-field="TalentGroupLeadId"]').closest('div');
    $tglDiv.remove();
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
    var url = siteUrl + "/_api/web/lists/getbytitle('BusinessRequestsConfiguration')/items?$select=*&$filter=RequestCategory eq 'Expense'";
    loadListItems({
        url: url,
        success: function (data) {
            if (data.length > 0) {
                businessRequestsConfiguration = data;
                requestTypeCode = item.RequestType;
                var requestTypeText = expenseTypes[item.RequestType];
                businessRequestsConfiguration.filter(function (val, id) {
                    if (val.RequestType == requestTypeText) {
                        isTBAApprovalRequired = val.IsTBAApprovalRequired;
                        isTGLApprovalRequired = val.IsTGLApprovalRequired;
                        isOLApprovalRequired = val.IsOLApprovalRequired;
                        isOPLApprovalRequired = val.IsOPLApprovalRequried;
                        if(!(val.IsOPLApprovalRequried == "N" && val.IsOLApprovalRequired == "N")){
                            //Need to Modify this total code after we know the exception criteria
                            if(val.IsOLApprovalRequired == "YC"){                                
                                isOLApprovalRequired = "N";
                            }
                            if(val.IsOPLApprovalRequired == "YC"){
                                isOPLApprovalRequired = "N";
                            }
                        }
                        if(val.IsLeadershipApprovalRequired == "Y"){
                            $('.uploadpanel').show();
                        }
                        checkIfFinalStageReached();
                        //TO-DO YC logic
                    }
                })
            }
        }
    });
}

function loadExteriorAttachments() {
    var url = siteUrl + "/_api/web/lists/getbytitle('ExpenseRequestsData')/items?$select=*&$expand=AttachmentFiles&$filter=ID eq '" + requestID + "'";
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
    var url = siteUrl + "/_api/web/lists/getbytitle('ApprovalExpenseRequests')/items?$select=*,Practitioner/EMail&$expand=AttachmentFiles,Practitioner/Id&$filter=OriginalRequestId eq '" + requestID + "'";
    //var url = siteUrl + "/_api/web/lists/getbytitle('ApprovalExpenseRequests')/items/?&$filter=OriginalRequestId eq '" + requestID + "'";
    

    loadListItems({
        url: url,
        success: function (data) {
            if (data.length > 0) {
                $('.divTransferTable').show();
                var item = data[0];
                window.approverData = item;
                approvalExpenseRequestListType = item.__metadata.type;
                $('#requestTypeidentifier').text("Approval Request: Expense");
                checkIfCurrentUserIsTheRightApprover();
                loadBusinessRequestConfigurations(item);
                var userIds = [];
                var practitionerId = item.PractitionerId;
                for (var prop in item) {
                    if (item.hasOwnProperty(prop)) {
                        var $field = $('[data-field="' + prop + '"]');
                        if ($field.length > 0) {
                            if($field.selector.includes("ExpenseType")){
                                $field.val(expenseTypes[item[prop]]);
                            }
                            else if ($field.is('[data-expand]')) {
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
                            else {
                                $field.val(item[prop]);
                            }
                        }
                    }
                }

                // $('input[name=RaisedThroughAriba][value=' + approverData.IsAribaRequest + ']').prop('checked', 'true');

                //$('#practitionerPersonnelID').val(approverData.practitionerDetails.EMail);
                ////$("#offeringLeadId").val(approverData.offeringLeadDetailsId);
                //$("#practitionerDetailsId").val(approverData.practitionerDetailsId);
                //$("#resourceManagerDetailsId").val(approverData.resourceManagerDetailsId);
                //$("#talentTeamPersonDetailsId").val(approverData.talentTeamPersonDetailsId);

                //LoadApproversPopulatedData().done(function (data, textStatus, jqXHR) {
                //    var allData = data.d.results;
                //    if (allData.length > 0) {
                //        $.each(allData, function (index, item) {
                //            //$(allData).each(function (index, item) {
                //            var title = item.Title.split(' ');
                //            if (getOfferingCode(approverData.Offering) === title[0]) {
                //                if (item.ImmigrationRoles === "TGL" || item.ImmigrationRoles === "TL" || item.ImmigrationRoles === "RM") {
                //                    var elementSelector = "";
                //                    switch (item.ImmigrationRoles) {
                //                        case "TGL":
                //                            elementSelector = "talentGroupLeaderList";
                //                            break;
                //                        case "TL":
                //                            elementSelector = "talentLeadList";
                //                            break;
                //                        case "RM":
                //                            elementSelector = "resourceManagerList";
                //                            break;
                //                    }

                //                    $.each(item.Approvers.results, function (k, v) {
                //                        $("#" + elementSelector).append('<option value="' + item.Approvers.results[k].ID + '">' + item.Approvers.results[k].Title + '</option>');
                //                    });
                //                }
                //                else if (item.ImmigrationRoles === "OPL") {
                //                    $("#portfolioLeadId").val(item.Approvers.results[0].ID);
                //                    $("#portfolioLead").val(item.Approvers.results[0].Title);
                //                }
                //                else if (item.ImmigrationRoles === "OL") {
                //                    $('#offeringLead').val(item.Approvers.results[0].Title);
                //                    $('#offeringLeadId').val(item.Approvers.results[0].ID);
                //                }
                //            }
                //        });
                //    }
                //});
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
                            // if ($(item.TBAComments).text()) {
                            //    // $previousComments.append('<div class="col-md-10"><label>' + $('[data-field="TalentTeamPersonId"]').val() + ':</label><p>' + $(item.TBAComments).text() + '</p></div>');
                            //     $previousComments.append('<div class="col-md-10"><label>' + $('#talentLeadList option:selected').text().split(',')[1].trim() + " " + $('#talentLeadList option:selected').text().split(',')[0] + ':</label><p>' + $(item.TBAComments).text() + '</p></div>');
                            // }    
                            if ($(item.TGLComments).text()) {
                                //$previousComments.append('<div class="col-md-10"><label>' + $('[data-field="TalentGroupLeadId"]').val() + ':</label><p>' + $(item.TGLComments).text() + '</p></div>');
                                $previousComments.append('<div class="col-md-10"><label>' + $('[data-field="TalentGroupLeadId"]').val() + ':</label><p>' + $(item.TGLComments).text() + '</p></div>');
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

function getExpenseRequestListType() {
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('ExpenseRequestsData')",
        headers: { Accept: "application/json;odata=verbose" },
        success: function (data) {
            expenseRequestListType = data.d.ListItemEntityTypeFullName;
        }
    })
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

        //Fetch Marker Offering Approvers Data 
        LoadOfferingApproversData().done(function (data, textStatus, jqXHR) {
            var allData = data.d.results;
            $(allData).each(function (index, item) {
                if (code == "RM") {
                    if (item.Title == "SYSENG RM" && currentOffering == metadata.offerings.systemsEngineering) {
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
                }

                else if (code == "TGL") {
                    if (item.Title == "SYSENG TGL" && currentOffering == metadata.offerings.systemsEngineering) {
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

                }
                else if (code == "TBA") {
                    if (item.Title == "SYSENG TL" && currentOffering == metadata.offerings.systemsEngineering) {
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
                }
                else if (code == "ES") {
                    if (item.Title == "SYSENG TALENTES" && currentOffering == metadata.offerings.systemsEngineering) {
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
})

///by me 

function showApprovalHistory(){
    
    //$('.loading').show();
    var approvalHistoryData = "";

    $.ajax({
    url: _spPageContextInfo.webAbsoluteUrl+"/_api/web/lists/getbytitle('ApproverAudit')/items?$select=ApproverNameId,Created&$filter=((OriginalRequestId eq " + approverData.OriginalRequestId + ") and  (RequestId eq " + approverData.ID	+ " ) and (Action eq 'Approved') and (Category eq 'Expense')) &$orderby=Id desc",
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
        case metadata.offerings.systemsEngineering:
            result = "SYSENG";
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
    }
    return result;
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

function getApproverAuditDataRequestListType() {
    $.ajax({

        url: siteUrl + "/_api/web/lists/getbytitle('ApproverAudit')",
        headers: { Accept: "application/json;odata=verbose" },
        success: function (data) {
            approverAuditRequestType = data.d.ListItemEntityTypeFullName;
        }
    })
}