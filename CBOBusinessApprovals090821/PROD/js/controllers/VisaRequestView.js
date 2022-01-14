$('.loading').show();

var isEH1 = false;
var isNL1 = false;
var isEL1 = false;

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
    $('[data-field="StartDate"').datepicker();
    $('[data-field="EndDate"').datepicker();
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

function getRequestType() {
        var type = "Visa Request";
        if (isEH1) {
            type = "H1 Extension";
        }
        else if (isNL1) {
            type = "L1 New";
        }
        else if (isEL1) {
            type = "L1 Extension";
        }
    
        return type;
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
                data.filter(function (val, id) {
                    if (val.ImmigrationRoles == "TGL" || val.ImmigrationRoles == "OL" || val.ImmigrationRoles == "OPL") {
                        var $personalIDDiv = $('.PersonalID');
                        $personalIDDiv.hide();
                        var $NextDiv = $personalIDDiv.next('div');
                        $personalIDDiv.insertAfter($NextDiv.next());
                    }
                });
            }

            bootstrapper();
        }
    });
}

function getCheckListName(type) {
            return type;
    
        } 

function bootstrapper() {
    var url = siteUrl + "/_api/web/lists/getbytitle('VisaRequests')/items?$select=*,practitionerDetails0/EMail&$expand=AttachmentFiles,practitionerDetails0/Id&$filter=ID eq '" + requestID + "'";
    loadListItems({
        url: url,
        success: function (data) {
            console.log(data)
            if (data.length > 0) {
                var item = data[0];
                if (!isApprover && item.practitionerDetails0Id != currentLoggedInUserId) {
                    $('.divTransferTable').html('<div class="container" style="height: 100%;display: flex;justify-content: center;align-items: center;width: 70%;"><div class="mesaggeWrapper"><h3>You do not have access to this page</h3></div></div>').show()
                    return false;
                }

                $('.divTransferTable').show();

                window.approverData = item;
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
                // if( approverData.Offering == "Systems Engineering")
                // {
                //     $('.divMarketOffering').show();
                // }

                // if (approverData.Offering != "Systems Engineering") {
                //     $('[data-field="MarketOffering"]').closest('div').hide();
                // }

                // if (!(approverData.Offering == "Systems Engineering" && (approverData.MarketOffering == "SDO" || approverData.MarketOffering == "SDE"))) {
                //     hideTalentGroup();
                // }

                if (!(isNL1 || isEL1)) {
                    $('.l1TypeDiv').remove();
                    $('.premiumProcess').insertAfter($('.TypeOfRequest').closest('div'));
                    $(".onlyH1").hide();
                }

                var userIds = [];
                var practitionerId = item.practitionerDetails0Id;
                console.log(practitionerId);
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
//                             else if (prop == "MarketOffering") {
//                                 var marketOfferingText = item[prop];
//                                 switch (marketOfferingText) {
//                                     case "SDE":
//                                         marketOfferingText = "Systems Design & Engineering";
//                                         break;
//                                     case "SDO":
//                                         marketOfferingText = "Service Delivery Optimization";
//                                         break;
//                                     case "AMA":
//                                         marketOfferingText = "App Modernization and App Architecture";
//                                         $field.closest('div').toggleClass('col-sm-4 col-sm-5');
//                                         break;
//                                     case "IS":
//                                         marketOfferingText = "Integration Services";
//                                         break;
//                                 }
//                                 $field.val(marketOfferingText);
//                             }
                            else {
                                $field.val(item[prop]);
                            }
                        }
                    }
                }

                if (item.Attachments) {
                    var $list = $('<ul></ul>');
                    $.each(item.AttachmentFiles.results, function (idx, val) {
                                                var fileName = val.FileName;
                                                var checkListType = "";
                                                if (fileName.indexOf("^$SEP$^") !== -1) {
                                                    checkListType = fileName.split('^$SEP$^')[0];
                                                    fileName = fileName.split('^$SEP$^')[1];
                                                }
                                                var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + fileName + "</a>";
                                                if (checkListType) {
                                                    link += ("<span style='paddding-left:10px'>(" + getCheckListName(checkListType) + ")</span>");
                                                }
                                                $list.append("<li>" + link + "</li>");
                                            });
                                            $('.attachments').append($list); 
                        
                }

              
               
                var Onsiteroles = $(item.OnsiteRolesandResponsibilities).text();
                $('[data-field="PremiumProcessing"]').val(item.PremiumProcessing);
                $('[data-field="OnsiteRoles"]').val(Onsiteroles);
                $('[data-field="ProjectName"]').val(item.newProjectName);
                $('[data-field="CurrentLocation"]').val(item.PractitionerLocation);
                $('[data-field="ProjectLocation"]').val(item.CurrentProjectLocation);
                $('[data-field="PractitionerEmail"]').val(item.practitionerDetails0.EMail);
                $('[data-field="ClientAddress"]').val($(item.ClientAddress).text());
                $('[data-field="CurrentUSImmigrationStatus"]').val(item.CurrentUSImmigrationStatus);
                var userInfoUrl = siteUrl + "/_api/Web/SiteUserInfoList/items/?$filter=(" + userIds.join(" or ") + ")";

                loadListItems(
                    {
                        url: userInfoUrl,
                        success: function (data) {
                            $.each(data, function (idx, val) {
                                var name = val.LastName + ", " + val.FirstName;
                               
                                console.log(val.Id);
                              
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
                    switch (approverData.TypeOfRequest) {
                        case "H1 Extension":
                            isEH1 = true;
                            break;
                        case "L1 New":
                            isNL1 = true;
                            break;
                        case "L1 Extension":
                            isEL1 = true;
                            break;
                    }
                    $('#requestTypeidentifier').text("Visa Request - " + getRequestType());   
                    if(approverData.Status == "Rejected" && isApprover && approverData.FinalActionRole != "" && approverData.FinalActionRole != null){
                        $('[data-field="Status"]').text("Rejected("+ approverData.FinalActionRole + ")");
                    }

            }
            else {
                $('.divTransferTable').html('<div class="container" style="height: 100%;display: flex;justify-content: center;align-items: center;width: 70%;"><div class="mesaggeWrapper"><h3>You do not have access to this page</h3></div></div>').show();
            }

        },
        
  error: function(){
    alert('failure');
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
    console.log(currentLoggedInUserId);
    checkIfUserIsApprover();    
        
}

function hideTalentGroup() {
    return 1;
    var $tglDiv = $('[data-field="TalentGroupLeaderId"]').closest('div');
    $tglDiv.remove();
}



