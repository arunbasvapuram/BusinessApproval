$('.loading').show();
$('.welcome-content').next('.ms-table.ms-fullWidth').hide();
$('form').attr('autocomplete', "off");
$('.LOPText').hide();
var BusinessRequestConfigData;

var jsFilePaths = [
    "../SiteAssets/js/libs/bootbox.min.js",
    "../SiteAssets/js/libs/jqueryUI/jquery-ui.min.js"

];

function togglePanel(ele) {
    var $ele = $(ele);
    $ele.closest('.panel').find('.panel-body').toggle();
    $ele.toggleClass('glyphicon-minus').toggleClass('glyphicon-plus');
}

function getRequestType() {
    var type = "Leave Request";
    return type;
}
function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}
function acceptTerms(accepted) {
    if (accepted) {
        window.location.href = window.location.href + "&accept=1";
        var url = window.location.href.slice(window.location.href.indexOf('=') + 1).split('&');

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
        //$('#requestTypeidentifier').text("New Leaves Request: " + getRequestType());
        $('#requestTypeidentifier').text("Additional Leave Requests");
         //to get the FAQs
        getFAQ('Talent');
        
        $('hr').remove();
        var footerHtml = $('footer').html()
        $('.dol-footer').removeAttr('style').html("<div class='row'>" + footerHtml + "</div>")
        $('footer').remove();

        $('.welcome-content').next('.ms-table.ms-fullWidth').show();
        $('.dol-footer').show();
        getNSetUserId();
        
    }
}

//var alertedAlready = false;
var editMode = false;
var isInterOffering = false;
var isInterOffice = false;
var isInterPortfolio = false;
var isUSIToUSTransfer = false;
var isH1 = false;
var isNL1 = false;
var isEL1 = false;
var mandatoryFields = [
    "practitionerPersonnelID",
    "practitionerNameTransfer",
    "practitionerLevelTransfer",
    "USIBaseLocation",
    "dateOfHire",				
    "talentLeadList",
    "RequestTypeDropDown",
    "talentGroupLeaderList",
    "portfolio",
    "Offering",
    "offeringLeadId",
    "portfolioLeadId",
    "resourceManagerList",
    "talentEsList"
];
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
var requestId = urlParam("TRID");
var pendingWith = "TL";
var isTGLApprovalRequired = "";
var isOLApprovalRequired = "";
var isOPLApprovalRequired = "";
var FieldsToCapture = "";
var isTBAApprovalRequired = "";

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

$(document).ready(function () {
    $("[data-toggle='tooltip']").tooltip();
    $("#prmProcess").val('No');
    $('.uploadpanel').hide();
    // $('#prmProcess').attr('disabled', true);
    $('#SDEDSection').hide();
    $('#RevokeResignation').hide();
    $('#ReasonSection').hide();
    $('#LWDSection').hide(); 
    $('#AccumulatedSection').hide();
    //Get BusinessRequestsConfiguration
    var brcdata = siteUrl + "/_api/web/lists/getbytitle('BusinessRequestsConfiguration')/items?$select=*&$filter=RequestCategory eq 'Talent'";   
    loadListItems({
        url: brcdata,
        success: function (data) {
            BusinessRequestConfigData = data;
        },
        error: function(){
            alert('Business Request Configuration get failed.');
          }
    });

    

    $('#RequestTypeDropDown').change(function (e) 
    {
        var selectedRequestType = $(this).val();
        var IsLeadershipApprovalRequired = "N";        
        if(selectedRequestType == 'LOP'){
            $('.LOPText').show();
        }
        else{
            $('.LOPText').hide();
        }
        $.each(BusinessRequestConfigData, function (idx, val) {
            if(val.RequestTypeCode === selectedRequestType)
            {
                IsLeadershipApprovalRequired = val.IsLeadershipApprovalRequired;
                FieldsToCapture = val.FieldsToCapture;
                isTGLApprovalRequired = val.IsTGLApprovalRequired;
                isOLApprovalRequired = val.IsOLApprovalRequired;
                isOPLApprovalRequired = val.IsOPLApprovalRequried;
                isTBAApprovalRequired = val.IsTBAApprovalRequired;
            }
        });

        if(IsLeadershipApprovalRequired == "Y")
        {
            $('.uploadpanel').show();
            if(mandatoryFields.indexOf("uploadElement") == -1)
            {
                mandatoryFields.push("uploadElement");
            }
        }
        else
        {
            $('.uploadpanel').hide();
            if(mandatoryFields.indexOf("uploadElement") > -1){
                mandatoryFields.splice(mandatoryFields.indexOf("uploadElement"),1);
            }
        }

        if(FieldsToCapture)
        {
            FieldsToCapture = $(FieldsToCapture).text();
            var cleanFields = FieldsToCapture.split(",");

            if(cleanFields.indexOf("StartDate") > -1)
            {
                $('#SDEDSection').show();
                mandatoryFields.push("StartDate");
                mandatoryFields.push("EndDate");
            }
            else
            {
                $('#SDEDSection').hide();
                if(mandatoryFields.indexOf("StartDate") > -1){
                    mandatoryFields.splice(mandatoryFields.indexOf("StartDate"),1);
                }
                if(mandatoryFields.indexOf("EndDate") > -1){
                    mandatoryFields.splice(mandatoryFields.indexOf("EndDate"),1);
                }
            }

            //ResignationRevoke
            if(cleanFields.indexOf("RevokeResignationDate") > -1)
            {
                $('#RevokeResignation').show();
                if($('#RevokeResignationDate').val() == ""){
                    var date =new Date();
                    $('#RevokeResignationDate').val(((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' 
                    + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());
                }                
                mandatoryFields.push("RevokeResignationDate");
            }
            else
            {
                $('#RevokeResignation').hide();
                $('#RevokeResignationDate').val("");
                mandatoryFields.splice(mandatoryFields.indexOf("RevokeResignationDate"),1);
            }

            if(cleanFields.indexOf("Reason") > -1)
            {
                $('#ReasonSection').show();
                mandatoryFields.push("Reason");
            }
            else
            {
                $('#ReasonSection').hide();
                if(mandatoryFields.indexOf("Reason") > -1){
                    mandatoryFields.splice(mandatoryFields.indexOf("Reason"),1);
                }
            }

            if(cleanFields.indexOf("CurrentLWD") > -1)
            {
                $('#LWDSection').show();
                mandatoryFields.push("CurrentLWD");
                mandatoryFields.push("ProposedLWD");
            }
            else
            {
                $('#LWDSection').hide();
                if(mandatoryFields.indexOf("CurrentLWD") > -1){
                    mandatoryFields.splice(mandatoryFields.indexOf("CurrentLWD"),1);
                }
                if(mandatoryFields.indexOf("ProposedLWD") > -1){
                    mandatoryFields.splice(mandatoryFields.indexOf("ProposedLWD"),1);
                }
            }

            if(cleanFields.indexOf("AccumulatedLeaves") > -1)
            {
                $('#AccumulatedSection').show();
                $('#endDateDiv').removeClass().addClass("col-sm-2");
                mandatoryFields.push("AccumulatedLeaves");
            }
            else
            {
                $('#AccumulatedSection').hide();
                $('#endDateDiv').removeClass().addClass("col-sm-3");
                if(mandatoryFields.indexOf("AccumulatedLeaves") > -1){
                    mandatoryFields.splice(mandatoryFields.indexOf("AccumulatedLeaves"),1);
                }
            }
        }
    
    });

    $('[data-helpinfo]').click(function (e) {
        var currentOffering = $('#Offering').val();
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

    // $('[data-helpinfo]').click(function (e) {
    //     var currentOffering = $('#Offering').val();
    //     var $ele = $(e.target);
    //     var messages = [];
    //     var code = $ele.data('helpinfo');

    //     var helptext = GetHelpTextIconInfo(currentOffering, code);
    //     //helptext.responseJSON.d.results[0].MarketOfferingApprover

    //     switch (code) {
    //         case "TBA":
    //             messages.push("Talent Business Advisors for your respective Offering");
    //             messages.push(helptext);
    //             break;
    //         case "TGL":
    //             messages.push("Talent Group Leaders (TGL) for your respective Offering");
    //             messages.push(helptext);
    //             break;
    //         case "RM":
    //             messages.push("Please select your Resource Managers as per your skillset within your Offering/Talent Group");
    //             messages.push(helptext);
    //             break;
    //         case "ES":
    //             messages.push("Please select your Talent ES as per your skillset within your Offering/Talent Group");
    //             messages.push(helptext);
    //             break;
    //     }

    //     var $result = $('<div><ul></ul></div>');
    //     var header = messages.splice(0, 1);
    //     //$result.find('ul').append("<b>"+messages.slice(0,1)+"</b>");
    //     $.each(messages, function (idx, val) {
    //         var data = val.split('-');
    //         var formattedValue = "<b>" + data[0] + "</b>";
    //         data.splice(0, 1);
    //         formattedValue += data.join();
    //         $result.find('ul').append("<li>" + val + "</li>");
    //     })


    //     bootbox.dialog({
    //         title: header,
    //         message: $result.html(),
    //         'margin-top': function () {
    //             var w = $(window).height();
    //             var b = $(".modal-dialog").height();
    //             // should not be (w-h)/2
    //             var h = (w - b) / 2;
    //             return h + "px";
    //         }
    //     });
    // });
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
    $("#marketOfferingList").change(function () {
        if ($(this).val() == "SDE" || $(this).val() == "SDO" || $(this).val() == "0") {
            showTalentGroup();
        }
        else {
            hideTalentGroup();
        }
    })
    $('input:disabled').css('color', 'black');
    //if (urlParam('accept')) {

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

        $('#btnSubmit').click(function () {
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




    //}
	
	
	// TODO
	//$("#RequestTypeDropDown").change(function () {
        // $('.threeColFields').hide();
		
		// if($(this.val() === 'val1'))
		// {
			// $('#LOPSection').show();
		// }
		// else if($(this.val() === 'val2'))
		// {
			// $('#StartDateMaternityLeavesSection').show();
		// }
		// else if($(this.val() === 'val3'))
		// {
			// $('#MLESection').show();
		// }
		// else if($(this.val() === 'val4'))
		// {
			// $('#MiscarriageLeavesSection').show();
		// }
		// else if($(this.val() === 'val5'))
		// {
			// $('#BenchSection').show();
		// }
		// else if($(this.val() === 'val6'))
		// {
			// $('#LWDEarlyReleaseBuyOutSection').show();
		// }
		// else if($(this.val() === 'val7'))
		// {
			// $('#BereavementLeavesSection').show();
		// }
		// else if($(this.val() === 'val8'))
		// {
			// $('#PaternityLeavesSection').show();
		// }
		// else if($(this.val() === 'val9'))
		// {
			// $('#AdvancePTOSection').show();
		// }
				
    //})
    
    //Get Help Text Icon Info
    function GetHelpTextIconInfo(offering, immigrationrole)
    {
        var urlTemplate = siteUrl + "/_api/web/lists/getbytitle('Approvers')/items?$select=*&$filter=ImmigrationRoles eq '" + immigrationrole + "'";
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
	$('.threeColFields').hide();
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
            // else {
            //     $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
            // }
        }
    });
}

var IsAdditionalDataRequiredMode = false;

function showAdditionalInfoText(data) {
    if (data.IsAdditionalDataRequired == 'Y') {
        IsAdditionalDataRequiredMode = true;
        $('<div style="margin-top: 40px;border: 1px #86BC25;border-style: solid;padding: 10px;"><b style="color:red">Additional Information Requested:</b><p>' + data.AdditionalDataComments + '</p></div>').insertAfter('.additionalTextDiv');
        //$('<div style="margin-top: 40px;border: 1px #86BC25;border-style: solid;padding: 10px;"><b style="color:red">Additional Information Requested By: </b> <b style="color:black">'+getUserNameById(getAdditionalInfoReqBy(data.Id))+'</b> <p>' + data.AdditionalDataComments + '</p></div>').insertAfter('.txt-new-Request');
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
        url: siteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')/items?$select=*,Practitioner/EMail&$expand=Practitioner/Id,AttachmentFiles&$filter=ID eq '" + ID + "'", 
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

function getTransferRequestListType() {
    $.ajax({

        url: siteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')",
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
                        if(offering == "GPS"){
                            offering = $.trim(departmentSplit[1]).toUpperCase();
                        }
                        if(department.indexOf('APP ARCH') > -1){
                            offering = "AMI";
                        }
                        if(department.indexOf('AMI') > -1){
                            offering = "AMI";
                        }
                        switch (offering) {                            
                            case "CLOUDENG":
                                offering = metadata.offerings.cloudEngineering;
                                break;        
                            case "OPSTR":                    
                            case "OPSTRANS":
                                offering = metadata.offerings.operationsTransformation;
                                break;                            
                            case "CIS":
                                offering = metadata.offerings.coreIndustrySolutions;
                                break;
                            case "CH":
                                offering = metadata.offerings.coreIndustrySolutions;
                                break;
                            case "AMI":
                                offering = metadata.offerings.applicationModernizationInnovation;
                                break;
                            case "SE":
                                offering = metadata.offerings.applicationModernizationInnovation;
                                break;
                            case "SYSENG":
                                offering = metadata.offerings.applicationModernizationInnovation;
                                break;
                            case "CNVG":
                                offering = metadata.offerings.coreIndustrySolutions;
                                break;
                            case "CBO":
                            case "CORE":
                                offering = metadata.offerings.coreTechnologyOperations;
                                break;
                            case "CR":
                                offering = metadata.offerings.coreTechnologyOperations;
                                break;
                            case "CE":
                                offering = metadata.offerings.cloudEngineering;
                                break;
                            case "HASHEDIN":
                                offering = metadata.offerings.cloudEngineering;
                                break;
                            case "OPS":
                                offering = metadata.offerings.operationsTransformation;
                                break;
                            default:
                                if (departmentSplit.length == 3 && offering == "C" && $.trim(departmentSplit[1]).toUpperCase() == "IND" && $.trim(departmentSplit[2]).toUpperCase() == "SO") {
                                    offering = metadata.offerings.coreIndustrySolutions;
                                }
                                break;
                        }
                        if(department.toUpperCase().includes("CH CONS USI") || department.toUpperCase().includes("CH MINER")){
                            offering = metadata.offerings.coreIndustrySolutions;
                        }

                        var location = office.split('-')[1];
                        var currentlocation = $.trim(location);
                        var Loc = "";
                        if(currentlocation === "Delhi"){
                            currentlocation = "Gurgaon";
                        }
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
                                            // if (item.Title === "Draft") {
                                            //     $("#btnSaveForLater").show();
                                            // }
                                            transferRequestListType = item.__metadata.type;
                                            $('#resourceManagerList').val(!item.ResourceManagerId ? "0" : item.ResourceManagerId);
                                            
                                            //TalentEs
                                            $('#talentEsList').val(!item.TalentESId ? "0" : item.TalentESId);
                                            $('#talentLeadList').val(!item.TalentTeamPersonId ? "0" : item.TalentTeamPersonId);
                                            $('#talentGroupLeaderList').val(!item.TalentGroupLeadId ? "0" : item.TalentGroupLeadId);
                                            if (item.DateOfHire) {
                                                $("#dateOfHire").datepicker('setDate', new Date(item.DateOfHire));
                                            }
                                            $("#RequestTypeDropDown").val(item.RequestTypeId);                                                                                        
                                            if (item.StartDate) {
                                                $("#StartDate").datepicker('setDate', new Date(item.StartDate));
                                            }
                                            if (item.EndDate) {
                                                $("#EndDate").datepicker('setDate', new Date(item.EndDate));
                                            }
                                            if (item.CurrentLWD) {
                                                $("#CurrentLWD").datepicker('setDate', new Date(item.CurrentLWD));
                                            }
                                            if (item.ProposedLWD) {
                                                $("#ProposedLWD").datepicker('setDate', new Date(item.ProposedLWD));
                                            }
                                            if (item.Reason) {
                                                $("#Reason").val($(item.Reason).text());
                                            }
                                            if (item.RevokeResignationDate) {
                                                $("#RevokeResignationDate").val(item.RevokeResignationDate);
                                            }
                                            if(item.AccumulatedLeaves){
                                                $("#AccumulatedLeaves").val(item.AccumulatedLeaves);
                                            }
                                            $("#RequestTypeDropDown").trigger('change');
                                            $("#portfolio").val(item.Portfolio);
                                            $("#Offering").val(item.Offering);
                                            $('#practitionerPersonnelID').val(item.Practitioner.EMail);
                                            $("#offeringLeadId").val(item.OfferingLeadId);
                                            $("#practitionerDetailsId").val(item.PractitionerId);
                                            showAdditionalInfoText(item);
                                            if (item.Attachments) {
                                                $('.uploadpanel').show();
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

function validate(isDraftMode) {

    if (isDraftMode) {
        return true;
    }

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
    var dateOfHire = new Date($('#dateOfHire').val());
    dateOfHire.setHours(0, 0, 0, 0);
    
    if (dateOfHire > currentDate) {
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

function cleanDraftData(data) {
    for (var prop in data) {
        if (!data[prop] || data[prop] == "0") {
            delete data[prop];
        }
    }
    return data;
}

//Date Picker Settings and Validator
function initializeDatepickers() 
{
    $("#dateOfHire").datepicker();
    $("#EndDate").datepicker();
    $("#StartDate").datepicker();
    $("#CurrentLWD").datepicker();
    $("#ProposedLWD").datepicker();
    $("#RevokeResignationDate").datepicker();

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
    
     //this is to jump to teh approver who requested for additional info
     //var pendingWithInfo = "TL";//deafult pending with "TL"
     var RequesterType = "";
     var requestIdForAPI = "";
 
     if(null != IsAdditionalDataRequiredMode && IsAdditionalDataRequiredMode == true){
         //pendingWithInfo = data from API ---(isDevMode ? approverData.OriginalRequestId : approverData.OriginalTransferRequestIDId)
         requestIdForAPI = requestId;
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
         pendingWith = getSortPendingWith(RequesterType);
     }
     //////////////
    
    
    
    
    var result = {
        "__metadata": {
            "type": transferRequestListType
        },
        "Title": isDraft ? "Draft" : "New Leave Request",
        "RequestCategory": "Talent",

        "PersonalID": $("#practitionerPersonnelID").val(),
        "PendingWith": { results: [pendingWith] },
        "PractitionerId": parseInt($("#practitionerDetailsId").val()),

        "USIBaseLocation": $("#USIBaseLocation option:selected").val(),
        "Portfolio": $("#portfolio").val(),
        "Offering": $("#Offering").val(),
        "DateOfHire": $("#dateOfHire").val(),
		// "Practitioner": $("#practitionerPID").val(),
		"TalentTeamPersonId": parseInt($("#talentLeadList").val()),
        "RequestTypeId": $('#RequestTypeDropDown').val(),
        "StartDate": $("#StartDate").val(),
		"EndDate": $("#EndDate").val(),
        "Reason": $("#Reason").val(),
		"CurrentLWD": $("#CurrentLWD").val(),
        "ProposedLWD": $("#ProposedLWD").val(),        
        "ResourceManagerId": parseInt($("#resourceManagerList").val()),
        "TalentESId": parseInt($("#talentEsList").val()),
		"TalentGroupLeadId": parseInt($("#talentGroupLeaderList").val()),
		"OfferingLeadId": parseInt($("#offeringLeadId").val()),
        "PortfolioLeadId": parseInt($("#portfolioLeadId").val()),
        "RevokeResignationDate": $("#RevokeResignationDate").val(),
        "AccumulatedLeaves": parseInt($("#AccumulatedLeaves").val())
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
function postCreateSaveForLaterAjax() {
    $('.error').removeClass('error');
    if (validate(true)) {
        if (editMode) {
            var urlTemplateEditMode = siteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')/items(" + requestId + ")";

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
                    $('.loading').hide();
                }
            })
        } else {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')/items",
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
    var UrlDeleteDocument = siteUrl + "/_api/web/lists/GetByTitle('EmployeeRequests')/GetItemById(" + requestId + ")/AttachmentFiles/getByFileName('" + FileTitle + "')  ";
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
            var urlTemplateEditMode = siteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')/items(" + requestId + ")";
            if(isTGLApprovalRequired == "Y"){
                pendingWith = "TGL";
            }
            if(isTBAApprovalRequired == "Y"){
                pendingWith = "TL";
            }

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

                    //sendConfirmationEmail(requestId);
                },
                complete: function () {
                    //$('.loading').hide();
                }
            })
        }
        else {
            if(isTGLApprovalRequired == "Y"){
                pendingWith = "TGL";
            }
            if(isTBAApprovalRequired == "Y"){
                pendingWith = "TL";
            }
            //New configuration changes
            // if(FieldsToCapture.includes('StartDate') && FieldsToCapture.includes('EndDate') && !(isOPLApprovalRequired == "N" && isOLApprovalRequired == "N")){
            //     if(((new Date($("#EndDate").val()).getTime() - new Date($("#StartDate").val()).getTime()) / (1000 * 3600 * 24)) > 90){
            //         if(isOPLApprovalRequired == "YC"){
            //             pendingWith = "OPL";
            //         }
            //     }
                
            //     else{
            //         if(isOPLApprovalRequired == "YC"){
            //             pendingWith = "OL";
            //         }
            //     }
            // }

            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')/items",
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
                complete: function (data) {
                    var b=0;
                },
                error: function (error) {
                    var a=0;
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

function getFAQ(requestType){
   
    var item = "";
     $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('FAQList')/items?$select=*,RequestCategory &$expand=AttachmentFiles",
        //&$filter=RequestCategory eq '" + requestType + "'",
        type: "GET",
        async: false,
        contentType: "application/json;odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            data.d.results.forEach(function(attachment){
                if(attachment.RequestCategory == "Talent"){
                    item = attachment;
                    if (item.Attachments) {
                        var val= item.AttachmentFiles.results[0]
                        var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + 'Leave Policy' + "</a>";
                        
                        $('#policy').append(link);
                    }
                }
                else if(attachment.RequestCategory == "PTOProgram"){
                    item = attachment;
                    if (item.Attachments) {
                        var val= item.AttachmentFiles.results[0]
                        var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + 'PTO Program Details' + "</a>";
                        
                        $('#ptoProgram').append(link);
                    }
                }
            })
			
	
        },
        error: function (data) {
			console.log(data);
        }
    });

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


function sendConfirmationEmail(Id) {
    var currentDate = new Date();
    currentDateForYear = currentDate.toDateString().split(' ');

    var EmployeeName = $('#practitionerNameTransfer').val().split(',');
    var RequestType = leaveTypes[$("#RequestTypeDropDown").val()];

    var to = currentLoggedInUserEmail;
    var Employee = EmployeeName[1] + " " + EmployeeName[0];
    var subject = "Leave Approval Request for" + Employee;
    var RequestCategory = 'Talent ELE';
    var cc = "";
    var month = currentDate.toLocaleString('en-US', { month: 'long' });;
    var year = currentDateForYear[3];
    var Url = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx?team=0";


    var GetEmailTemplateBody = siteUrl + "/_api/web/lists/getbytitle('EmailTemplates')/items?$select=EmailTemplateHtml&$filter= EmailType eq 'EmployeeNewApplication'";
    loadListItems({
        url: GetEmailTemplateBody,
        success: function (data) {
            siteUrl = _spPageContextInfo.webAbsoluteUrl;
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            //var emailHeader = getRequestType() + " Visa Request";

            body = body.replace("{{CurrentMonth}}", month).replace("{{CurrentYear}}", year).
                replace("{{RequestCategory}}", RequestCategory).replace("{{RequestType}}", RequestType).
                replace("{{Employee}}", Employee).
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

function loadNewTGLAndOLData(newOffering)
{
    if(isInterOffering){
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
        if (currentOffering == metadata.offerings.systemsEngineering) {
            messages.push("Systems Design & Engineering - Ponnu Kailasam");
            messages.push("Service Delivery Optimization - Brunda Mahishi");
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

function loadBusinessRequestConfigurations(item){
    var url = siteUrl + "/_api/web/lists/getbytitle('BusinessRequestsConfiguration')/items?$select=*&$filter=RequestCategory eq 'Talent'";
    loadListItems({
        url: url,
        success: function (data) {
            if (data.length > 0) {
                businessRequestsConfiguration = data;
                requestTypeCode = item.RequestTypeId;
                var requestTypeText = leaveTypes[item.RequestTypeId];
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
                                    isOLApprovalRequired = "N";
                                }
                            }
                            else{
                                if(val.IsOPLApprovalRequried == "YC"){
                                    isOPLApprovalRequired = "N";
                                    isOLApprovalRequired = "Y";
                                }
                            }
                        }
                        if(val.IsLeadershipApprovalRequired == "Y"){
                            $('.uploadpanel').show();
                        }
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
                    }
                    else if(element.trim() == "EndDate"){
                        $('.EndDate').show();
                    }
                    else if(element.trim() == "Reason"){
                        $('.Reason').show();
                    }
                    else if(element.trim() == "CurrentLWD"){
                        $('.CurrentLWD').show();
                    }
                    else if(element.trim() == "ProposedLWD"){
                        $('.ProposedLWD').show();
                    }
                    else if(element.trim() == "AccumulatedLeaves"){
                        $('.AccumulatedLeaves').show();
                    }
                });
            }
        }
    });
}