$('.loading').show();
$('.welcome-content').next('.ms-table.ms-fullWidth').hide();
$('form').attr('autocomplete', "off");

var jsFilePaths = [
    "../SiteAssets/js/libs/bootbox.min.js",
    "../SiteAssets/js/libs/jqueryUI/jquery-ui.min.js"
];

function togglePanel(ele) {
    var $ele = $(ele);
    $ele.closest('.panel').find('.panel-body').toggle();
    $ele.toggleClass('glyphicon-minus').toggleClass('glyphicon-plus');
}

function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

function backToDashboard() {
    location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
}

function checkForThousand(){
    if($('#ExpenseTypeDropDown').val() == "CMCO" && $('#EstimatedExpenseAmount').val() < 1000)
    {
        bootbox.alert("Expense amount of less than INR 1,000, for Expense Type “Computer Costs-Other”, does not require approval via this application.");
        $('#EstimatedExpenseAmount').prev().addClass("error");
        return false;
    }
}

function acceptTerms(accepted) {
    if (accepted) {
        if(urlParam("TRID") != null){
            window.location.href = window.location.href + "&accept=1";
        }
        else{
            window.location.href = window.location.href + "?accept=1";
        }
    }
    else {
        window.location.href = siteUrl + "/Pages/dashboard.aspx?team=0"
    }
}

function loadJSSet() {
    if (jsFilePaths.length > 0) {
        loadJs(jsFilePaths.splice(0, 1), loadJSSet);
    }
    else {

        $('.loading').hide();
        var header = "";
        var message = "";
        var table ="";
        $('#requestTypeidentifier').text("New Expense Request");
        header = "Please go through below guidelines before you apply for any Expense request";
        message = "<br><ul style='line-height:3rem'><li>If the request has already been raised through ARIBA, no explicit approval is required via this application</li><li>For any Billable expenses please reach out to your Project Leadership and do not submit the request via this application</li><li>Expense amount of less than INR 1000, for Expense Type <span>&#8221;</span>Computer Costs-Other<span>&#8221;</span>, does not require approval via this application</li><li>SM/MD's are not required to raise any Travel Expense request in this application</li><li>Once the request has been approved in the application, please mention the Request Number in comments while claiming the expense in DTE</li></ul>";
        $('hr').remove();
        var footerHtml = $('footer').html()
        $('.dol-footer').removeAttr('style').html("<div class='row'>" + footerHtml + "</div>")
        $('footer').remove();

        if (!urlParam("accept")) {
            var $newDiv = $('<div class="container" style="height: 100%;display: flex;justify-content: center;align-items: center;width: 70%;"><div class="mesaggeWrapper"></div></div>');
            $newDiv.insertAfter($('.welcome-content').next('.ms-table.ms-fullWidth'));
            $newDiv.find('.mesaggeWrapper').append('<h3>' + header + '</h3>');
            $newDiv.find('.mesaggeWrapper').find('table th').css('border','2px solid #dddddd').css('text-align','center').css('padding', '8px').css('color','white');
            $newDiv.find('.mesaggeWrapper').find('table td').css('border','2px solid #dddddd').css('text-align','center').css('padding', '8px');
            $newDiv.find('.mesaggeWrapper').find('table li').css('text-align','left');
            $newDiv.find('.mesaggeWrapper').append(message);
            $newDiv.find('.mesaggeWrapper').append('<div class="modal-footer"><button onclick="acceptTerms()" type="button" class="btn btn-primary"><i class="fa fa-times"></i> Cancel</button><button onclick="acceptTerms(1)" type="button" class="btn btn-primary"><i class="fa fa-check"></i> Continue</button></div>');
            $('.dropdown-menu [href$="?team=1"]').remove();
        }
        else {
            $('.welcome-content').next('.ms-table.ms-fullWidth').show();
            $('.dol-footer').show();
            getNSetUserId();
        }
    }
}
var requestId = urlParam("TRID");
var editMode = false;
$(document).ready(function () {
    $("[data-toggle='tooltip']").tooltip();
    //$("#prmProcess").val('No');
    // $('#prmProcess').attr('disabled', true);

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
    // $("#marketOfferingList").change(function () {
    //     if ($(this).val() == "SDE" || $(this).val() == "SDO" || $(this).val() == "0") {
    //         showTalentGroup();
    //     }
    //     else {
    //         hideTalentGroup();
    //     }
    // })
    $('input:disabled').css('color', 'black');
    if (urlParam('accept')) {

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

        // initializePeoplePicker('ThreadInitiativeLead', false, 'People Only', 0);
        initializePeoplePicker('peoplepicker', false, 'People Only', 0);
        // initializePeoplePicker('peoplepicker1', false, 'People Only', 0);
        // initializePeoplePicker('peoplepicker2', false, 'People Only', 0);
        // initializePeoplePicker('peoplepicker3', false, 'People Only', 0);

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
    }

    // $(function(){
    //     $('#AribaRequestY').click(function(){
    //       if ($(this).is(':checked'))
    //       {
    //         bootbox.alert("The expense raised through Ariba doesn’t require explicit approvals via this application.");
    //         return false;
    //       }
    //     });
    //   });

    //   $('input[name="AribaRequest"]').change(function(){
    //     if($('#AribaRequestY').prop('checked')){
    //         bootbox.alert("The expense raised through Ariba doesn’t require explicit approvals via this application.");
    //         return false;
    //     }
    // });

    $(document).on('change', '#AribaRequestY', function (e) {
        bootbox.confirm({
            message: "The expense raised through Ariba doesn’t require explicit approvals via this application.",
            buttons: {
                cancel: {
                    label: 'OK',
                    className: "btn btn-primary"
                },
                confirm: {
                    label: 'Back To Dashboard',
                    className: "btn btn-primary bootbox-accept"
                }		
            },
            callback: function (result) {
                if (result) {
                    backToDashboard();
                }
            }
        })
        // bootbox.alert("The expense raised through Ariba doesn’t require explicit approvals via this application.");
        // return false;
    });

    // $("input[@name='AribaRequest']").change(function(){
    //     if($('#AribaRequestY').prop("checked"))
    //     {
    //         bootbox.alert("The expense raised through Ariba doesn’t require explicit approvals via this application.");
    //         return false;
    //     }
    // });

    // $(document).on('change', '#approvalcheckbox', function (e) {
    //     $('#approvalcheckbox').removeAttr('disabled');
    // });

});

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
var expenseRequestListType = "";
//var user1 = null;

function getExpenseRequestListType() {
    $.ajax({

        url: siteUrl + "/_api/web/lists/getbytitle('ExpenseRequestsData')",
        headers: { Accept: "application/json;odata=verbose" },
        success: function (data) {
            expenseRequestListType = data.d.ListItemEntityTypeFullName;
        }
    })
}

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
                $('.dropdown-menu [href$="?team=1"]').remove();
            }
            else {
                $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
            }
        }
    });
}

var IsAdditionalDataRequiredMode = false;

function showAdditionalInfoText(data) {
    if (data.IsAdditionalDataRequired == 'Y') {
        IsAdditionalDataRequiredMode = true;
        $('<div style="margin-top: 40px;border: 1px #86BC25;border-style: solid;padding: 10px;"><b style="color:red">Additional Information Requested:</b><p>' + data.AdditionalDataComments + '</p></div>').insertAfter('.txt-new-Request');
    }

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
        url: siteUrl + "/_api/web/lists/getbytitle('ExpenseRequestsData')/items?$select=*,Practitioner/EMail&$expand=Practitioner/Id,AttachmentFiles&$filter=ID eq '" + ID + "'",
        contentType: "application/json; odata=verbose",
        headers: {
            "Accept": "application/json; odata=verbose"
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
                        if(department.includes("CH CONS")){
                            offering = metadata.offerings.coreIndustrySolutions;
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
                        $("#CurrLocation").val(currentlocation);
                        $("#Offering").val(offering);
                        if (offering == metadata.offerings.systemsEngineering) {
                            $(".marketOffering").css("display", "inline-block");
                        }
                        $('#transferTo').append('<option value="0">Select an option</option>');
                        $("#TransferType").val(getRequestType());

                        function setEditModeData() {
                            loadTransferRequestData(requestId).done(function (data, textStatus, jqXHR) {
                                var allData = data.d.results;
                                if (allData.length > 0) {
                                    $(allData).each(function (index, item) {
                                        if (item.Id == requestId) {
                                            if (item.Title === "Draft") {
                                                $("#btnSaveForLater").show();
                                            }
                                            expenseRequestListType = item.__metadata.type;
                                            $("#ExpenseTypeDropDown").val(item.ExpenseType);
                                            $("#WBSCodeId").val(item.WBSCode);
                                            $("#EstimatedExpenseAmount").val(item.EstimatedExpenseAmount);
                                            $("#ExpenseReason").val($(item.ExpenseReason).text());  
                                            $("input[name=AribaRequest][value=" + item.IsAribaRequest + "]").prop('checked', true);                                          
                                            $("#practitionerPID").val(item.PID);
                                            $("#deloitteUSOffice").val(item.DeloitteUSOffice);
                                            
                                            if (item.ExpenseDate) {
                                                $("#ExpenseDate").datepicker('setDate', new Date(item.ExpenseDate));
                                            }

                                            if (GetUserbyId(item.ThreadorInitiativeLeadId)) {
                                                setPeoplePicker("peoplepicker", GetUserbyId(item.ThreadorInitiativeLeadId));
                                            }
                                            
                                            showTalentGroup();
                                            $('#talentGroupLeaderList').val(!item.TalentGroupLeadId ? "0" : item.TalentGroupLeadId);

                                            // if (item.ChecklistItems != null && item.ChecklistItems != "") {
                                            //     var checkBoxItems = item.ChecklistItems.split(',');
                                            //     checkBoxItems.forEach(function (id, val) {
                                            //         $('input[value="' + id + '"]').attr('checked', 'checked');
                                            //     })
                                            // }
                                            $("#portfolio").val(item.Portfolio);
                                            $("#Offering").val(item.Offering);
                                            $('#practitionerPersonnelID').val(item.Practitioner.EMail);
                                            $("#offeringLeadId").val(item.OfferingLeadId);
                                            $("#practitionerDetailsId").val(item.PractitionerId);
                                            showAdditionalInfoText(item);
                                            if (item.Attachments) {
                                                $.each(item.AttachmentFiles.results, function (idx, val) {

                                                    var uploadId = val.FileName.split("^$SEP$^")[0];
                                                    var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + val.FileName + "</a>";
                                                    // var $checkBoxEle = $('[data-cbcode=' + uploadId + ']');
                                                    // $checkBoxEle.attr("checked", "checked");
                                                    // $fileUploadControl = $checkBoxEle.closest('.row').find('[type="file"]');
                                                    var $fileUploadControl = $('[type="file"]:visible:first');
                                                    $fileUploadControl.hide().next().show();
                                                    $(link).insertAfter($fileUploadControl);

                                                    // var uploadId = val.FileName.split("^$SEP$^")[0];
                                                    // var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + val.FileName.split("^$SEP$^")[1] + "</a>";
                                                    // var $checkBoxEle = $('[data-cbcode=' + uploadId + ']');
                                                    // $checkBoxEle.attr("checked", "checked");
                                                    // $fileUploadControl = $checkBoxEle.closest('.row').find('[type="file"]');
                                                    // $fileUploadControl.hide().next().show();
                                                    // $(link).insertAfter($fileUploadControl);
                                                });
                                            }
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
                                    getExpenseRequestListType();
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
    // else if (field.indexOf("ChecklistItems") != -1) {
    //     if ($('[data-field="ChecklistItems"]:checked').length == 0) {
    //         $('[data-field="ChecklistItems"]:first').parent().addClass("error");
    //         return false;
    //     }
    //     else {
    //         return true;
    //     }
    // }
    else {
        var fieldData = $("#" + field).val();
        if (!fieldData) {
            $("#" + field).prev().addClass("error");
            return false;
        }

        if (fieldData.length == 0 || fieldData == ""  || fieldData == "0") {
            $("#" + field).prev().addClass("error");
            return false;
        }
        return true;
    }
}

//TODO - MMM
function validate(isDraftMode) {
    if (isDraftMode) {
        return true;
    }
    var isValid = true;
    var mandatoryFields = [
        "practitionerPersonnelID",
        "practitionerPID",
        "WBSCodeId",
        "ExpenseTypeDropDown",
        "ExpenseDate",
        "EstimatedExpenseAmount",
        "ExpenseReason",
        "talentGroupLeaderList",
        "uploadElement"
    ];

    // if ($('#Offering').val() == metadata.offerings.systemsEngineering) {
    //     mandatoryFields.push("marketOfferingList");
    // }

    $.each(mandatoryFields, function (idx, val) {
        if (!isNotEmpty(val)) {
            isValid = false;
        }
    });
    var alertedAlready = false;
    if($('input[type=radio][name=AribaRequest]:checked').length == 0) {
        $('input[type=radio][name=AribaRequest]').closest('div').parent().addClass("error");
        isValid = false;
    }
    
    if ($('#peoplepicker').find('input').val() === "[]" || $('#peoplepicker').find('input').val() === "") {
        $("#peoplepicker").prev().addClass("error");
        isValid = false;
    }

    // if(!$('#approvalcheckbox').is(':checked')) {
    //     $('#approvalcheckbox').closest('div').parent().addClass("error");
    //     isValid = false;
    // }

    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    var expenseDate = new Date($('#ExpenseDate').val());
    expenseDate.setHours(0, 0, 0, 0);

    if (expenseDate < currentDate) {
        bootbox.alert('Expense Date cannot be less than current date.');
        isValid = false;
        alertedAlready = true;
    }


    if (isValid) {
        if($('#AribaRequestY').prop("checked"))
        {
            bootbox.confirm({
                message: "The expense raised through Ariba doesn’t require explicit approvals via this application.",
                buttons: {
                    cancel: {
                        label: 'OK',
                        className: "btn btn-primary"
                    },
                    confirm: {
                        label: 'Back To Dashboard',
                        className: "btn btn-primary bootbox-accept"
                    }		
                },
                callback: function (result) {
                    if (result) {
                        backToDashboard();
                    }
                }
            })
        }

        if($('#ExpenseTypeDropDown').val() == "CMCO" && $('#EstimatedExpenseAmount').val() < 1000)
        {
            bootbox.alert("Expense amount of less than INR 1,000, for Expense Type “Computer Costs-Other”, does not require approval via this application.");
            $('#EstimatedExpenseAmount').prev().addClass("error");
            return false;
        }

        if($("#WBSCodeId").val().length != 22){
            bootbox.alert("Please enter a valid WBS Code");
            $('#WBSCodeId').prev().addClass("error");
            return false;
        }

        if(parseInt($("#EstimatedExpenseAmount").val()) <= 0){
            bootbox.alert("Expense amount should be more than 0");
            $('#EstimatedExpenseAmount').prev().addClass("error");
            return false;
        }

        // if (isNotEmpty("EndDate") && isNotEmpty("StartDate")) {
        //     var rollOffDate = new Date($('#StartDate').val());
        //     if (isNaN(rollOffDate.getMonth()) || rollOffDate.getFullYear() <= 1900 || rollOffDate.getFullYear() >= 2100) {
        //         bootbox.alert("Invalid Date: " + $('#StartDate').val());
        //         $('#StartDate').prev().addClass("error");
        //         return false;
        //     }

        //     var onBoardingDate = new Date($('#EndDate').val());
        //     if (isNaN(onBoardingDate.getMonth()) || onBoardingDate.getFullYear() <= 1900 || onBoardingDate.getFullYear() >= 2100) {
        //         bootbox.alert("Invalid Date: " + $('#EndDate').val());
        //         $('#EndDate').prev().addClass("error");
        //         return false;
        //     }
        //     rollOffDate.setHours(0, 0, 0, 0);
        //     onBoardingDate.setHours(0, 0, 0, 0);
        //     if (onBoardingDate < rollOffDate) {
        //         bootbox.alert("Visa End Date must be greater than Start Date");
        //         return false;
        //     }

        // }
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
    $("#ExpenseDate").datepicker({ minDate: new Date() });

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
            "type": expenseRequestListType
        },
        "Title": isDraft ? "Draft" : "New Expense Request",
        "PendingWith": { results: ["TGL"] },
        "IsAribaRequest": $('input[name=AribaRequest]:checked').val(),
        "WBSCode": $("#WBSCodeId").val(),
        "EstimatedExpenseAmount": parseInt($("#EstimatedExpenseAmount").val()),
        "ExpenseType": $("#ExpenseTypeDropDown").val(),
        "ExpenseReason": $("#ExpenseReason").val(),
        "ExpenseDate": $("#ExpenseDate").val(),
        "ThreadorInitiativeLeadId": getUserInfo('peoplepicker'),
        "TalentGroupLeadId": parseInt($("#talentGroupLeaderList").val()),
        "Portfolio": $("#portfolio").val(),
        "Offering": $("#Offering").val(),
        "PortfolioLeadId": $("#portfolioLeadId").val(),
        "OfferingLeadId": parseInt($("#offeringLeadId").val()),
        "USIBaseLocation": $("#USIBaseLocation").val(),
        "PractitionerId": parseInt($("#practitionerDetailsId").val()),
        "RequestCategory": "Expenses",
        "ExpenseType": $("#ExpenseTypeDropDown").val(),
        "RequestType": $("#ExpenseTypeDropDown").val(),
        "Status": "Pending",
        "PID" : $("#practitionerPID").val()
    };

    if (!isDraft && IsAdditionalDataRequiredMode) {
        result.IsAdditionalDataRequired = 'Completed';
    }

    // var checkedItems = [];
    // $('[data-field="ChecklistItems"]').each(function (idx, val) {
    //     if ($(val).prop('checked')) {
    //         checkedItems.push($(val).val());
    //     }
    // });

    // result["ChecklistItems"] = checkedItems.join(",");


    return result;
}

function postCreateSaveForLaterAjax() {
    $('.error').removeClass('error');
    if (validate(true)) {
        if (editMode) {
            var urlTemplateEditMode = siteUrl + "/_api/web/lists/getbytitle('ExpenseRequestsData')/items(" + requestId + ")";

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
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('ExpenseRequestsData')/items",
                type: "POST",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(cleanDraftData(getPostDataItem(true))),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()

                },
                success: function (data) {
                    uploadFiles(data.d.ID, function () {
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

function DeleteItemAttachment(FileTitle) {
    var UrlDeleteDocument = siteUrl + "/_api/web/lists/GetByTitle('ExpenseRequestsData')/GetItemById(" + requestId + ")/AttachmentFiles/getByFileName('" + FileTitle + "')  ";
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

function postCreateRequestAjax() {
    $('.error').removeClass('error');
    if (validate()) {

        if (editMode) {
            var urlTemplateEditMode = siteUrl + "/_api/web/lists/getbytitle('ExpenseRequestsData')/items(" + requestId + ")";

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
        }
        else {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('ExpenseRequestsData')/items",
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

//TODO - MMM
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
                    uploadFileSP('ExpenseRequestsData', recordID, filesToUpload.splice(0, 1)[0], function () {
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
            userIdDetails = data;
            userid = userIdDetails.d.Email;
        },
        error: function (data) {
            failure(data);
        }
    });
    return userid;
}

//TODO - MMM
function sendConfirmationEmail(Id) {
    var authorEmail = currentLoggedInUserEmail;
    var currentDate = new Date();
    currentDateForYear = currentDate.toDateString().split(' ');

    var EmployeeName = $('#practitionerNameTransfer').val().split(',');
    var to = authorEmail;
    //var TGL = $('#talentGroupLeaderList option:selected').val();
    var cc = null;
    var Employee = EmployeeName[1] + " " + EmployeeName[0];
    var subject = "Expense Approval Request for" + Employee;
    
    var RequestCategory = 'Expense';
    var RequestType = $("#ExpenseTypeDropDown option:selected").text();;
    var RequestNumber = Id;
    var month = currentDate.toLocaleString('en-US', { month: 'long' });;
    var year = currentDateForYear[3];
    var Url = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx?team=0";

    var GetEmailTemplateBody = siteUrl + "/_api/web/lists/getbytitle('EmailTemplates')/items?$select=EmailTemplateHtml&$filter= EmailType eq 'ExpenseNewRequest'";
    loadListItems({
        url: GetEmailTemplateBody,
        success: function (data) {
            siteUrl = _spPageContextInfo.webAbsoluteUrl;
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            var emailHeader = getRequestType() + " Expense Request";

            body = body.replace("{{CurrentMonth}}", month).replace("{{CurrentYear}}", year).
                replace("{{RequestCategory}}", RequestCategory).replace("{{Employee}}", Employee).
                replace("{{RequestType}}", RequestType).replace("{{RequestNumber}}", RequestNumber).
                replace("{{EmailHeader}}", emailHeader).
                replace("/sites/USICBOPortal/BusinessApproval/Lists/EmailTemplates", Url);

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

function getRequestType() {
    var type = "Expense Request";
    return type;
}

function hideTalentGroup() {
    return 1;
    var $tglDiv = $('#talentGroupLeaderList').closest('div');
    if ($tglDiv.is(':visible')) {
        $tglDiv.hide();
        // var $seperatorDiv = $tglDiv.next('div');
        // $seperatorDiv.insertAfter($seperatorDiv.next());
        // var $pflDiv = $tglDiv.closest('.row').next().find('div:first');
        // $pflDiv.insertAfter($seperatorDiv);
    }
}

function showTalentGroup() {
    var $tglDiv = $('#talentGroupLeaderList').closest('div');
    if (!$tglDiv.is(':visible')) {
        $tglDiv.show();
        // var $seperatorDiv = $tglDiv.next('div').next('div');
        // $seperatorDiv.insertAfter($tglDiv);
        // var $pflDiv = $seperatorDiv.next('div').next('div');
        // var $nextRow = $tglDiv.closest('.row').next();
        // $nextRow.append($pflDiv);
    }
}

//TODO - MMM
// Search and replace "VisaRequests" to "ExpenseRequestsData" - DONE
// WBS Code - Auto Populate
// Compare "TODO - MMM" Code with Talent Request js code for reference to know what chance is required in Expense Request
//