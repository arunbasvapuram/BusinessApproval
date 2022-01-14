$('body').append('<div class="ms-cui-ribbonTopBars"><div></div><div></div></div>'); //To prevent the unhandled exception from sharepoint layout page
$('body').append('<div class="ms-rte-layoutszone-inner"><div></div></div>');
$('.loading').show();
$('.welcome-content').next('.ms-table.ms-fullWidth').hide();
//$('.dol-footer').hide();
$('form').attr('autocomplete', "off");


var isDevMode = true;

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
var jsFilePaths = [
    "../SiteAssets/js/libs/bootbox.min.js",
    "../SiteAssets/js/libs/jqueryUI/jquery-ui.min.js"

];

function togglePanel(ele) {
    var $ele = $(ele);
    $ele.closest('.panel').find('.panel-body').toggle();
    $ele.toggleClass('glyphicon-plus').toggleClass('glyphicon-minus');
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
	else if (isExpenseRequest) {
		type = "Expense Request";
	}
    return type;
}

function acceptTerms(accepted) {
    if (accepted) {
        window.location.href = window.location.href + "&accept=1";
    }
    else {
        window.location.href = siteUrl + "/Pages/dashboard.aspx"
    }
}
function loadJSSet() {
    if (jsFilePaths.length > 0) {
        loadJs(jsFilePaths.splice(0, 1), loadJSSet);
    }
    else {

        $('.loading').hide();
        var header = "Please ensure you meet <b>one</b> of the following prerequisites for Inter Offering transfer";
        var message = "<ul style='line-height:3rem'><li><b>Please note</b>: Transfer will be processed Quarterly – March, June, September, December</li><li>If you are currently staffed on a project, then current project SM/MD has approved transfer to other Offering while you continue to be staffed on the same project</li><li><b>OR</b> If you are currently staffed on a project and current project SM/MD has approved roll off from current project, then you need confirmation of staffing on new project in new Offering from concerned SM/MD</li><li><b>OR</b> If you are on bench, then you need confirmation of staffing on a new project in new Offering from concerned SM/MD</li></ul>";
        $('#requestTypeidentifier').text("New Request: " + getRequestType());

        if (isInterOffice) {
            header = "Please ensure you meet <b>one</b> of the following prerequisites for Inter Office transfer";
            message = "<ul style='line-height:3rem' ><li>If you are currently staffed on a project, then current project SM/MD has to approve relocation to new location while you continue to be staffed on the same project</li><li><b>OR</b> If you are currently staffed on a project and current project SM/MD has approved roll off from current project, then you need to have confirmation of staffing on a new project in new location from concerned SM/MD</li><li><b>OR</b> If you are currently on bench, then you need to have confirmation of staffing on new project in new location from concerned SM/MD</li><li>For Gurgaon – 9 months minimum staffing needed in new location</li></ul>";
        }
        else if (isInterPortfolio) {
            header = "Please ensure you meet <b>one</b> of the following prerequisites for Inter Portfolio transfer";
            message = "<ul style='line-height:3rem' ><li><b>Please note</b>: Transfer will be processed <b>Biannually</b></li><li>If you are currently staffed on a project, current project SM/MD has approved transfer to other Portfolio while you continue to be staffed on the same project</li><li><b>OR</b> If you are currently staffed on a project and current project SM/MD has approved roll off from current project, then confirmation of staffing on new project in new Portfolio from concerned SM/MD is needed</li> <li><b>OR</b> If you are currently on bench, then you need to have confirmation of staffing on a new project in new Portfolio from concerned SM/MD</li></ul>";
        }
        else if (isUSIToUSTransfer) {
            header = "Please confirm you meet the following prerequisites for a transfer to the US Firm before you proceed with your application";
            message = "<ul style='line-height:3rem' ><li>Been staffed Onsite for the last 12 months or more.</li><li>Are you a top rater for the last two performance cycles</li><li>Your Visa is eligible for at least the next 24 months</li><li>You have confirmed staffing on assigned project for at least 9 months</li><li>Approvals from  US Sponsors and USI leadership are in place</li><b>Note</b><li>If Offshore or other cases , - please contact your RM or TBA</li><li>Transfer will be effective in Sep to March</li></ul>";
        }
		else if(isExpenseRequest) {
			header = 'Following are the expense requests that would not require any approval.';
			message = "<ul style='line-height:3rem'><li><b>BCP Expenses</b><br>USI Offshore practitioners: For All levels, BCP expenses up to limit of  INR 500/month are pre-approved<br>USI Onsite practitioners: For All levels, BCP expenses shouldn’t be charged.</li><li><b>PDA Equipment</b><br>USI Offshore practitioners: For Senior Consultant and above levels, PDA equipment expenses up to limit of INR 25000/once in 2 years are pre-approved.</li><li><b>Mobile Equipment</b><br>USI Onsite practitioners: For All Levels on Short & Medium term assignment, Mobile equipment expenses up to limit of USD 70/year are pre-approved.</li><li><b>Driving License & Classes fee</b><br>USI Onsite practitioners: For All Levels on Short & Medium term assignment, Driving License & Classes fees on actuals are pre-approved.</li><li><b>PDA Phone bill</b><br>USI Onsite practitioners: For All Levels on Short & Medium term assignment, PDA Phone bill expenses up to limit of USD 70/Month (or INR 4000/month for India plan) are pre-approved.</li><li><b>Medical Insurance</b><br>USI Onsite practitioners: For All Levels on Business Trips, Medical Insurance expenses are preapproved</li></ul><h4 style='padding-top: 20px;padding-bottom: 10px;'>For any other Expense Request, click <b>Continue</b> to proceed</h4>";
		}

        $('hr').remove();
        var footerHtml = $('footer').html()
        $('.dol-footer').removeAttr('style').html("<div class='row'>" + footerHtml + "</div>")
        $('footer').remove();

        if (!urlParam("accept")) {
            var $newDiv = $('<div class="container" style="height: 100%;display: flex;justify-content: center;align-items: center;width: 70%;"><div class="mesaggeWrapper"></div></div>');
            $newDiv.insertAfter($('.welcome-content').next('.ms-table.ms-fullWidth'));
            $newDiv.find('.mesaggeWrapper').append('<h3>' + header + '</h3>');
            $newDiv.find('.mesaggeWrapper').append(message);
            $newDiv.find('.mesaggeWrapper').append('<div class="modal-footer"><button onclick="acceptTerms()" type="button" class="btn btn-primary"><i class="fa fa-times"></i> Cancel</button><button onclick="acceptTerms(1)" type="button" class="btn btn-primary"><i class="fa fa-check"></i> Continue</button></div>');
            $('.dropDownMenu [href$="?team=1"]').remove();
        }
        else {
            $('.welcome-content').next('.ms-table.ms-fullWidth').show();
            $('.dol-footer').show();
            getNSetUserId();
        }
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

var editMode = false;
var isInterOffering = false;
var isInterOffice = false;
var isInterPortfolio = false;
var isUSIToUSTransfer = false;
var isExpenseRequest = false;

var requestId = urlParam("TRID");
if (urlParam("Type") == "L") {
    isInterOffice = true;
    $('.usiTransferElements').remove();
}
else if (urlParam("Type") == "O") {
    isInterOffering = true;
    $('.usiTransferElements').remove();
}
else if (urlParam("Type") == "P") {
    isInterPortfolio = true;
    $('.usiTransferElements').remove();
}
else if (urlParam("Type") == "U") {
    isUSIToUSTransfer = true;
}
else if (urlParam("Type") == "E") {
	isExpenseRequest = true;
}

function hideTalentGroup() {
    var $tglDiv = $('#talentGroupLeaderList').closest('div');
    $tglDiv.hide();
    var $seperatorDiv = $tglDiv.next('div');
    $seperatorDiv.insertAfter($seperatorDiv.next());
    var $pflDiv = $tglDiv.closest('.row').next().find('div:first');
    $pflDiv.insertAfter($seperatorDiv);
}

$(document).ready(function () {
    $("[data-toggle='tooltip']").tooltip();

    $('[data-helpinfo]').click(function (e) {
        var currentOffering = $('#Offering').val();
        var $ele = $(e.target);
        var messages = [];
        var code = $ele.data('helpinfo');
        switch (code) {
            case "TBA":
                messages.push("Talent Business Advisors for your respective Offering");
                if (currentOffering == metadata.offerings.systemsEngineering) {
                    messages.push("Systems Engineering: Varkey Ancheril");
                }
                else if (currentOffering == metadata.offerings.operationsTransformation) {
                    messages.push("Operations Transformation: Abhishek Mohanty");
                }
                else if (currentOffering == metadata.offerings.cloudEngineering) {
                    messages.push("Cloud Engineering: Apparna Madireddi");
                }
                else if (currentOffering == metadata.offerings.coreIndustrySolutions) {
                    messages.push("Abhishek Mohanty");
                }
                break;
            case "TGL":
                messages.push("Talent Group Leaders (TGL) for your respective Offering");
                if (currentOffering == metadata.offerings.systemsEngineering) {
                    messages.push("Systems Design & Engineering - Ponnu Kailasam");
                    messages.push("Service Delivery Optimization - Venkatesh Gurumurthy");
                    messages.push("App Modernization and App Architecture - Karthik Banda");
                    messages.push("Integration Services - Ravi S Choudhary");
                }
                else if (currentOffering == metadata.offerings.operationsTransformation) {
                    messages.push("Op Model Transformation - Carmel D’Silva");
                    messages.push("Tech Ops - Tushar Salgia");
                    messages.push("Op Model Transformation Healthcare - Carmel D’Silva");
                    messages.push("Revenue Cycle Transformation - Dinesh Kalluri");
                }
                else if (currentOffering == metadata.offerings.cloudEngineering) {
                    messages.push("Cloud Migration & ATADATA - Shanmukha Polepeddi");
                    messages.push("Cloud Managed Services - Vineet Patil");
                    messages.push("Cloud Infra and Eng - Kamlesh Totlani");
                    messages.push("Cloud Strategy & Op Model - Dilip Adiga");
                    messages.push("Cloud Development & Integration - Vikram Vishal");
                    messages.push("Cloud Integration and APIs - Ramana Vadranapu");
                }
                else if (currentOffering == metadata.offerings.coreIndustrySolutions) {
                    messages.push("Digital Care - Phani Rallabandi");
                    messages.push("Digital Banking Solutions - Arun Bhandari");
                    messages.push("Insurance CST - Sachin Dalal");
                    messages.push("Life Sciences R&D - Lakuma Tumati");
                    messages.push("Emerging Solutions - George Ignatius");
                }
                break;
            case "RM":
                messages.push("Please select your Resource Managers as per your skillset within your Offering/Talent Group");
                if (currentOffering == metadata.offerings.systemsEngineering) {
                    messages.push("Systems Design & Engineering -Namit Misra,  Anishok Mishra,  Namrata Dhage, Jagan Mohan Gangiredla");
                    messages.push("Service Delivery Optimization – Ashish Kumar, Akshay Sudhakar Donadkar");
                    messages.push("App Modernization and App Architecture - Anishok Mishra");
                    messages.push("Integration Services – Roja Pabbaraju");
                }
                else if (currentOffering == metadata.offerings.operationsTransformation) {
                    messages.push("All Talent Groups -  Namit Misra");
                }
                else if (currentOffering == metadata.offerings.cloudEngineering) {
                    messages.push("All Talent Groups - Asha E Franklin");
                }
                else if (currentOffering == metadata.offerings.coreIndustrySolutions) {
                    messages.push("All Talent Groups – Roja Pabbaraju");
                }
                break;
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
	
	var allData = [];
	
	loadExpenseData().done(function (data, textStatus, jqXHR) {
		allData = data.d.results;
		if (allData.length > 0) {
			var options = '';
			$(allData).each(function (index, item) {
				options += '<option value="' + item.Title + '">' + item.Title + '</option>';
			});
			$("#expenseTypeList").html(options);
		}
	});
	
	$('#expenseTypeList').change(function() {
		var expenseType = $(this).val();
		
		$("#eligibilityCriteriaDetails").val(allData.filter(function(data){ return data.Title == expenseType })[0].Eligibility_x0020_Criteria);
		$("#eligibilityLimitDetails").val(allData.filter(function(data){ return data.Title == expenseType })[0].Eligibility_x0020_Limit);
		$("#applicableToDetails").val(allData.filter(function(data){ return data.Title == expenseType })[0].Applicable_x0020_To);
	});

	
    if (urlParam('accept')) {

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




        if (isUSIToUSTransfer) {
            $('.notUsiTransferElements').remove();
            $('.usiTransferElements').show();
            $('.sponsorDiv').css("display", "inline-block");
        }
        else {
            $('.usiTransferElements').remove();
        }


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




    }

})

var currentLoggedInUserEmail = "";
var currentContext = SP.ClientContext.get_current();
var currentWeb = currentContext.get_web();
var currentUser = currentWeb.get_currentUser();
var siteUrl = _spPageContextInfo.webAbsoluteUrl;
var currentUserId = 0;
var currentUserName = null;
var isAdminAccess = false;
var myChart = null;
var skillChart1 = null;
var offeringChart1 = null;
var locationPractioner = null;
var serviceLinePractioner = null;
var practitionerEmailIdPractioner = null;
var transferRequestListType = "";
//var user1 = null;

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

function checkIfUserIsApprover() {
    var queryDataUrl = siteUrl + "/_api/web/lists/getbytitle('Approvers')/items?$select=*,Approvers/Title,Approvers/EMail&$expand=Approvers/Id&$filter=Approvers/EMail eq '" + currentLoggedInUserEmail + "'";
    loadListItems({
        url: queryDataUrl,
        success: function (data) {
            if (data.length == 0) {
                $('.dropDownMenu [href$="?team=1"]').remove();
            }
        }
    });
}

function userContextLoaded() {

    currentLoggedInUserEmail = currentUser.get_email();

    currentUserId = currentContext.get_web().get_currentUser().get_id();
    currentUserName = currentContext.get_web().get_currentUser().get_title();

    loadLoggedInUserDetails(null);

    if (requestId != null) {
        editMode = true;
        $("#btnSaveForLater").hide();
    }

    if (isUSIToUSTransfer) {
        $('.expander').trigger('click');
    }



    checkIfUserIsApprover();
}

function loadTransferRequestData(ID) {

    return $.ajax({
        method: 'GET',
        url: siteUrl + "/_api/web/lists/getbytitle('Transfer Requests')/items?$select=*,practitionerDetails/EMail,currentProjectSnrManagerDetails/EMail,newProjectSnrMangerDetails/EMail,USPPMD/EMail,USIPPMD/EMail&$expand=USIPPMD/Id,USPPMD/Id,currentProjectSnrManagerDetails/Id,practitionerDetails/Id,newProjectSnrMangerDetails/Id&$filter=ID eq '" + ID + "'",
        contentType: "application/json; odata=verbose",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    });
}

function loadExpenseData() {

    return $.ajax({
        method: 'GET',
        url: siteUrl + "/_api/web/lists/getbytitle('Expense Requests')/items?$select=id,*&$filter=Approval_x0020_Required eq 1",
        contentType: "application/json; odata=verbose",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    });
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


// function getUserId(loginName) {
//     var context = new SP.ClientContext.get_current();
//     this.user1 = context.get_web().ensureUser(loginName);
//     context.load(this.user1);
//     context.executeQueryAsync(
//         Function.createDelegate(null, ensureUserSuccess),
//         Function.createDelegate(null, onFail)
//     );
// }

// function ensureUserSuccess() {

//     $("#currentProjectSMOrMDNameTransfer").val(this.user.get_id());
// }

// function onFail(sender, args) {
//     alert('Query failed. Error: ' + args.get_message());
// }

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

function getTransferRequestListType() {
    $.ajax({

        url: siteUrl + "/_api/web/lists/getbytitle('Transfer Requests')",
        headers: { Accept: "application/json;odata=verbose" },
        success: function (data) {
            transferRequestListType = data.d.ListItemEntityTypeFullName;
        }
    })
}

// This function will set the currentLoggedInUser variable with current logged in user Sharepoint object
function loadLoggedInUserDetails(currentLoggedInUser) {
    $('.loading').show();
    try {
        initializeDatepickers();
        if (currentLoggedInUser == undefined || currentLoggedInUser == null || currentLoggedInUser.length == 0) {
            $.ajax({

                url: _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties",
                headers: { Accept: "application/json;odata=verbose" },
                success: function (data) {
                    try {
                        $("#practitionerDetailsId").val(_spPageContextInfo.userId);
                        $("#practitionerNameTransfer").val(data.d.DisplayName);
                        $("#practitionerEmailIdTransfer").val(data.d.Email);
                        $("#practitionerLevelTransfer").val(data.d.Title);

                        var office = "";
                        $.each(data.d.UserProfileProperties.results, function (idx, val) {
                            if (val.Key == "Office") {
                                office = val.Value;
                                return false;
                            }
                        });

                        var department = "";
                        $.each(data.d.UserProfileProperties.results, function (idx, val) {
                            if (val.Key == "Department") {
                                department = val.Value;
                                return false;
                            }
                        });
                        var departmentSplit = department.split(' ');
                        var offering = $.trim(departmentSplit[0]);

                        switch (offering) {
                            case "SYSENG":
                                offering = metadata.offerings.systemsEngineering;
                                break;
                            case "CLOUDENG":
                                offering = metadata.offerings.cloudEngineering;
                                break;
                            case "OPSTRANS":
                                offering = metadata.offerings.operationsTransformation;
                                break;
                            case "CIS":
                                offering = metadata.offerings.coreIndustrySolutions;
                                break;
                            default:
                                if (departmentSplit.length == 3 && offering == "C" && $.trim(departmentSplit[1]) == "IND" && $.trim(departmentSplit[2]) == "SO") {
                                    offering = metadata.offerings.coreIndustrySolutions;
                                }
                                break;
                        }



                        var location = office.split('-')[1];
                        var currentlocation = $.trim(location);
                        var Loc = "";
                        switch (currentlocation) {
                            case "Mumbai":
                                locationPractioner = "MUM";
                                break;
                            case "Bengaluru":
                                locationPractioner = "BAN";
                                break;
                            case "Hyderabad":
                                locationPractioner = "HYD";
                                break;
                            case "Gurgaon":
                                locationPractioner = "DEL";
                                break;
                            default:
                                locationPractioner = "ONS";
                                break;
                        }

                        $("#USIBaseLocation").val(currentlocation);
                        $("#Offering").val(offering);
                        $('#transferTo').append('<option value="0">Select an option</option>');
                        $("#TransferType").val(getRequestType());
                        if (isInterOffering) {

                            $('#transferFrom').append('<option selected="true" value="' + offering + '">' + offering + '</option>');
                            for (var prop in metadata.offerings) {
                                $('#transferTo').append('<option value="' + metadata.offerings[prop] + '">' + metadata.offerings[prop] + '</option>');
                            }
                            if (!editMode) {
                                $("#transferFrom").val(offering);
                                $('#transferTo').find('option[value="' + offering + '"]').attr('disabled', true);
                            }

                            //Hiding the TGL for Interoffering
                            hideTalentGroup();

                        }
                        else if (isInterOffice) {
                            $('#transferFrom').append('<option selected="true" value="' + currentlocation + '">' + currentlocation + '</option>');
                            for (var prop in metadata.locations) {
                                $('#transferTo').append('<option value="' + metadata.locations[prop] + '">' + metadata.locations[prop] + '</option>');
                            }

                            if (!editMode) {
                                $("#transferFrom").val(currentlocation);
                                $('#transferTo').find('option[value="' + currentlocation + '"]').attr('disabled', true);
                            }

                            if (offering !== metadata.offerings.systemsEngineering) {

                                hideTalentGroup();

                            }
                        }
                        else if (isInterPortfolio) {
                            //Hiding the TGL for InterPortfolio
                            hideTalentGroup();
                            $('#transferFrom').append('<option selected="true" value="Core Business Operations"> Core Business Operations </option>');
                            for (var prop in metadata.portfolio) {
                                $('#transferTo').append('<option value="' + metadata.portfolio[prop] + '">' + metadata.portfolio[prop] + '</option>');
                            }
                            $('#transferTo').find('option[value="Core Business Operations"]').attr('disabled', true);
                        }
                        else if (isUSIToUSTransfer) {
                            hideTalentGroup();
                            for (var prop in metadata.usTransfer) {
                                $('#transferTo').append('<option value="' + metadata.usTransfer[prop] + '">' + metadata.usTransfer[prop] + '</option>');
                            }
                            $('#transferFrom').append('<option selected="true" value="' + currentlocation + '">' + currentlocation + '</option>');
                        }

                        function setEditModeData() {
                            loadTransferRequestData(requestId).done(function (data, textStatus, jqXHR) {
                                var allData = data.d.results;
                                if (allData.length > 0) {
                                    $(allData).each(function (index, item) {
                                        if (item.Id == requestId) {
                                            if (item.Title === "Draft") {
                                                $("#btnSaveForLater").show();
                                            }
                                            transferRequestListType = item.__metadata.type;
                                            $('#transferTo').find('option[value="' + item.transferFromAndTo + '"]').attr('disabled', true);
                                            $("#transferFrom").val(!item.transferFromAndTo ? "0" : item.transferFromAndTo);
                                            $("#transferTo").val(!item.TransferTo ? "0" : item.TransferTo);
                                            $('#talentLeadList').val(!item.talentTeamPersonDetailsId ? "0" : item.talentTeamPersonDetailsId);
                                            $('#resourceManagerList').val(!item.resourceManagerDetailsId ? "0" : item.resourceManagerDetailsId);
                                            $('#currentAssignment').val(!item.CurrentAssignment ? "0" : item.CurrentAssignment);
                                            $('#newAssignment').val(!item.NewAssignment ? "0" : item.NewAssignment);
                                            $("#currentProjectNameTransfer").val(item.currentProjectName);
                                            $("#newProjectNameTransfer").val(item.newProjectName);
                                            $('#TransferReason').val($(item.ReasonForTransfer).text());

                                            if (item.currentProjectSnrManagerDetails.EMail) {
                                                setPeoplePicker("peoplepicker", item.currentProjectSnrManagerDetails.EMail);
                                            }
                                            if (item.newProjectSnrMangerDetails.EMail) {
                                                setPeoplePicker("peoplepicker1", item.newProjectSnrMangerDetails.EMail);
                                            }
                                            if (item.currentProjectRollOffDate) {
                                                $("#currentProjectRollOfDateTransfer").datepicker('setDate', new Date(item.currentProjectRollOffDate));
                                            }
                                            if (item.newProjectOnBoardingDate) {
                                                $("#newProjectOnBoardingDateTransfer").datepicker('setDate', new Date(item.newProjectOnBoardingDate));
                                            }
                                            if (item.newProjectOnBoardingDate) {
                                                $("#newProjectOnBoardingDateTransfer").datepicker('setDate', new Date(item.newProjectOnBoardingDate));
                                            }
                                            if (item.TransferTenure) {
                                                $('#transferTenure').val(item.TransferTenure);
                                            }

                                            if (item.DateOfHire) {
                                                $("#dateOfHire").datepicker('setDate', new Date(item.DateOfHire));
                                            }

                                            if (item.USPPMD.EMail) {
                                                setPeoplePicker("usPPMD", item.USPPMD.EMail);
                                            }

                                            if (item.USIPPMD.EMail) {
                                                setPeoplePicker("usiPPMD", item.USIPPMD.EMail);
                                            }

                                            $('#newAssignment').trigger('change');
                                            $('#talentGroupLeaderList').val(!item.TalentGroupLeadId ? "0" : item.TalentGroupLeadId);
                                            $("#USIBaseLocation").val(item.USIBaseLocation);
                                            $("#portfolio").val(item.Portfolio);
                                            $("#Offering").val(item.Offering);
                                            $('#practitionerPersonnelID').val(item.practitionerDetails.EMail);
                                            $("#offeringLeadId").val(item.offeringLeadDetailsId);
                                            $("#practitionerDetailsId").val(item.practitionerDetailsId);
                                            $("#resourceManagerDetailsId").val(item.resourceManagerDetailsId);
                                            $("#talentTeamPersonDetailsId").val(item.talentTeamPersonDetailsId);

                                            $('.loading').hide();
                                            return false;
                                        }


                                    });

                                }
                            });
                        }

                        LoadApproversPopulatedData().done(function (data, textStatus, jqXHR) {
                            var allData = data.d.results;
                            if (allData.length > 0) {
                                $(allData).each(function (index, item) {
                                    var title = item.Title.split(' ');
                                    if (getOfferingCode(offering) === title[0]) {
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
                                        } else if (item.ImmigrationRoles === "OPL") {
                                            $("#portfolioLeadId").val(item.Approvers.results[0].ID);
                                            $("#portfolioLead").val(item.Approvers.results[0].Title);
                                        } else if (item.ImmigrationRoles === "OL") {
                                            $('#offeringLead').val(item.Approvers.results[0].Title);
                                            $('#offeringLeadId').val(item.Approvers.results[0].ID);
                                        }
                                    }
                                });

                                if (editMode) {
                                    setEditModeData();
                                }
                                else {
                                    getTransferRequestListType();
                                    $('#practitionerPersonnelID').val(currentLoggedInUserEmail);
                                    $('.loading').hide();
                                }

                            }
                        });
                        $(".portfolioText").val("Core Business Operations");
                    }
                    catch (err2) {
                        alert(JSON.stringify(err2));
                    }
                    finally {
                        $('.loading').hide();
                    }
                },
                error: function (jQxhr, errorCode, errorThrown) {

                }
            });
        }
    }
    catch (err) {
        alert("Unhandled Error while getting the current user instance");
    }
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

function validate(isDraftMode) {

    if (isDraftMode) {
        return true;
    }

    var isValid = true;

    var mandatoryFields = [
        "currentProjectNameTransfer",
        "practitionerPersonnelID",
        "TransferReason",
        "transferTo",
        "offeringLead",
        "talentLeadList",
        "resourceManagerList"

    ];

    if (isInterOffice && $('#Offering').val() == metadata.offerings.systemsEngineering) {
        mandatoryFields.push("talentGroupLeaderList");
    }

    if (isUSIToUSTransfer) {
        mandatoryFields.push("dateOfHire");
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
    if (isUSIToUSTransfer) {
        var dateOfHire = new Date($('#dateOfHire').val());
        dateOfHire.setHours(0, 0, 0, 0);
        if (dateOfHire > currentDate) {
            bootbox.alert('Date of hire cannot be a future date.');
            alertedAlready = true;
            isValid = false;
        }
    }

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

function cleanDraftData(data) {
    for (var prop in data) {
        if (!data[prop] || data[prop] == "0") {
            delete data[prop];
        }
    }
    return data;
}

function initializeDatepickers() {
    $("#newProjectOnBoardingDateTransfer").datepicker();
    $("#currentProjectRollOfDateTransfer").datepicker();
    $('#dateOfHire').datepicker({ maxDate: new Date() });

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

function getPostDataItem(isDraft) {
    var result = {
        "__metadata": {
            "type": transferRequestListType
        },
        "Title": isDraft ? "Draft" : "New Request",
        "PersonalID": $("#practitionerPersonnelID").val(),
        "transferType": $("#TransferType").val(),
        "relocationCatergory": $("#newAssignment option:selected").val(),
        "transferFromAndTo": $("#transferFrom option:selected").val(),
        "TransferTo": $("#transferTo option:selected").val(),

        "offeringLeadDetailsId": parseInt($("#offeringLeadId").val()),
        "practitionerDetailsId": parseInt($("#practitionerDetailsId").val()),
        "resourceManagerDetailsId": parseInt($("#resourceManagerList").val()),
        "talentTeamPersonDetailsId": parseInt($("#talentLeadList").val()),


        "ReasonForTransfer": $('#TransferReason').val(),
        "TalentGroupLeadId": parseInt($('#talentGroupLeaderList').val()),
        "USIBaseLocation": $("#USIBaseLocation option:selected").val(),
        "Portfolio": $("#portfolio").val(),
        "Offering": $("#Offering").val(),
        "PortfolioLeadId": $("#portfolioLeadId").val(),
        "currentProjectName": $("#currentProjectNameTransfer").val(),
        "currentProjectSnrManagerDetailsId": getUserInfo('peoplepicker')
    };

    if (isUSIToUSTransfer) {
        result.USPPMDId = getUserInfo('usPPMD');
        result.USIPPMDId = getUserInfo('usiPPMD');
        result.DateOfHire = $("#dateOfHire").val();
        result.TransferTenure = $("#transferTenure").val();
    }
    else {
        result.CurrentAssignment = $('#currentAssignment').val(),
            result.currentProjectRollOffDate = $("#currentProjectRollOfDateTransfer").val(),
            result.newProjectName = $("#newProjectNameTransfer").val(),
            result.newProjectOnBoardingDate = $("#newProjectOnBoardingDateTransfer").val(),
            result.newProjectSnrMangerDetailsId = getUserInfo('peoplepicker1');
    }
    return result;
}

function postCreateSaveForLaterAjax() {
    $('.error').removeClass('error');
    if (validate(true)) {
        if (editMode) {
            var urlTemplateEditMode = siteUrl + "/_api/web/lists/getbytitle('Transfer Requests')/items(" + requestId + ")";

            $.ajax({
                url: urlTemplateEditMode,
                type: "PATCH",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(cleanDraftData(getPostDataItem(true))),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "If-Match": "*"

                },
                success: function (data) {

                    uploadFiles(requestId, function () {
                        bootbox.alert("Draft request saved successfully.", function () {
                            window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/dashboard.aspx?team=0";
                        });
                    });
                },
                complete: function () {
                    //$('.loading').hide();
                }
            })
        } else {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Transfer Requests')/items",
                type: "POST",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(cleanDraftData(getPostDataItem(true))),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()

                },
                success: function (data) {
                    uploadFiles(data.ID, function () {
                        bootbox.alert("Draft request saved successfully.", function () {
                            window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/dashboard.aspx?team=0";
                        });
                    });

                },
                complete: function () {
                    //$('.loading').hide();
                }
            })
        }

    }
    else {
        $('.loading').hide();
        $([document.documentElement, document.body]).animate({
            scrollTop: $(".error").offset().top
        }, 1000);
    }

}

function postCreateRequestAjax() {
    $('.error').removeClass('error');
    if (validate()) {

        if (editMode) {
            var urlTemplateEditMode = siteUrl + "/_api/web/lists/getbytitle('Transfer Requests')/items(" + requestId + ")";

            $.ajax({
                url: urlTemplateEditMode,
                type: "PATCH",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(getPostDataItem()),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "If-Match": "*"

                },
                success: function (data) {
                    uploadFiles(requestId, function () {
                        bootbox.alert("Request submitted successfully.", function () {
                            window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/dashboard.aspx?team=0";
                        });
                    });

                    sendConfirmationEmail(requestId);
                },
                complete: function () {
                    //$('.loading').hide();
                }
            })
        } else {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Transfer Requests')/items",
                type: "POST",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(getPostDataItem()),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()

                },
                success: function (data) {
                    uploadFiles(data.d.ID, function () {
                        bootbox.alert("Request submitted successfully.", function () {
                            window.location.href = _spPageContextInfo.webAbsoluteUrl + "/Pages/dashboard.aspx?team=0";
                        });
                    });
                    sendConfirmationEmail(data.d.ID);

                },
                complete: function () {

                }
            })
        }

    }
    else {
        $('.loading').hide();
        $([document.documentElement, document.body]).animate({
            scrollTop: $(".error").offset().top
        }, 1000);
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
            debugger;
            userIdDetails = data;
            userid = userIdDetails.d.Email;
        },
        error: function (data) {
            failure(data);
        }
    });
    return userid;
}


function sendConfirmationEmail(Id) {
    var authorEmail = currentLoggedInUserEmail;
    var toTBA = $('#talentLeadList').val();
    var currentDate = new Date();
    currentDateForYear = currentDate.toDateString().split(' ');

    var EmployeeName = $('#practitionerNameTransfer').val().split(',');
    var RequestType = $("#TransferType").val();

    var RM = $('#resourceManagerList option:selected').val();
    var RmEmail = GetUserbyId(RM);
    var to = GetUserbyId(toTBA);
    var cc = authorEmail + "," + RmEmail;
    var Employee = EmployeeName[1] + " " + EmployeeName[0];
    var subject = "Transfer Approval Request for" + Employee;
    var RequestTo = $('#talentLeadList option:selected').text().split(',')[1] + " " + $('#talentLeadList option:selected').text().split(',')[0];
    var TransferTo = $('#transferTo option:selected').text();
    var RequestTypeFrom = $("#TransferType").val().split(' ')[1];
    var TransferFrom = $('#transferFrom option:selected').text();
    var CurrentProject = $('#currentProjectNameTransfer').val();
    var NewProject = $('#newProjectNameTransfer').val();
    var specifics = $('#transferTenure').val();

    var month = currentDate.toLocaleString('en-US', { month: 'long' });;
    var year = currentDateForYear[3];
    var Url = _spPageContextInfo.webAbsoluteUrl + "/Pages/TransferApprovalPage.aspx?TRID=" + Id;


    var GetEmailTemplateBody = siteUrl + "/_api/web/lists/getbytitle('EmailTemplates')/items?$select=EmailTemplateHtml&$filter= EmailType eq '" + (isUSIToUSTransfer ? "RequestForApprovalUs" : "RequestForApproval") + "'";
    loadListItems({
        url: GetEmailTemplateBody,
        success: function (data) {
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            var emailHeader = "";
            if (!isUSIToUSTransfer) {
                emailHeader = getRequestType()+" Transfer Request";
            }
            else {
                emailHeader ="Transfer Request to US Firm";
            }
            
            body = body.replace("{{CurrentMonth}}", month).replace("{{CurrentYear}}", year).
                replace("{{RequestTypeFrom}}", RequestTypeFrom).replace("{{RequestTypeFrom}}", RequestTypeFrom).
                replace("{{RequestType}}", RequestType).replace("{{RequestType}}", RequestType).replace("{{RequestTo}}", RequestTo).
                replace("{{Employee}}", Employee).replace("{{TransferTo}}", TransferTo).replace("{{Employee}}", Employee).
                replace("{{TransferTo}}", TransferTo).replace("{{CurrentProject}}", CurrentProject).
                replace("{{NewProject}}", NewProject).replace("/sites/USICBOPortal/BusinessApproval/Lists/EmailTemplates", Url).
                replace("{{TransferFrom}}", TransferFrom).replace("{{Specifics}}", specifics).
                replace("{{EmailHeader}}",emailHeader);

            var deloitteImage = "<img src='" + siteUrl + "/PublishingImages/deloitte.png' class='img-responsive'style='height:40px;' alt=''/>";
            var twitter = "<img src='" + siteUrl + "/PublishingImages/twitter.png' style='width:30px;height:30px; padding-right:30px'>";
            var linkedin = "<img src='" + siteUrl + "/PublishingImages/linkedin.png' style='width:30px;height:30px; padding-right:30px'>";
            var instagram = "<img src='" + siteUrl + "/PublishingImages/intsgram.png' style='width:30px;height:30px; padding-right:30px'>";
            var yammer = "<img src='" + siteUrl + "/PublishingImages/yammer.png' style='width:30px;height:30px; padding-right:30px'>";
            var contactus = "<img src='" + siteUrl + "/PublishingImages/email.png' style='width:30px;height:30px; padding-right:30px'> ";
            var googlePlus = "<img src='" + siteUrl + "/PublishingImages/googleplus.png' style='width:30px;height:30px; padding-right:30px'> ";

            body = body.replace("{{linkedinimage}}", linkedin).replace("{{instgramimage}}", instagram).replace("{{yammerimage}}", yammer).replace("{{twitterimage}}", twitter);
            body = body.replace("{{googleplusimage}}", googlePlus).replace("{{emailimage}}", contactus).replace("{{deloitteimage}}", deloitteImage);



            sendEmailHtml(to, subject, body, cc);
        }
    });



}

// This function can send email with an HTML body
function sendEmailHtml(to, subject, body, cc) {
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

            },
            error: function (err) {

            }
        });
    }
    catch (err) {
        alert("An unexpected error occurred while sending email");
    }
}
