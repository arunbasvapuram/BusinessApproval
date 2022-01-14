$('.loading').show();

var requestID = urlParam("TRID");
var fromReports = urlParam("RPTS") ? true : false;

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
        initializeDatepickers();
        getNSetUserId();
    }
}

function initializeDatepickers() {
    $('[data-field="StartDate"').datepicker();
    $('[data-field="EndDate"').datepicker();
    $('[data-field="DateOfHire"').datepicker();
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
//by me
function showRejectedByName() {
    if (null != approverData.Status && approverData.Status == 'Rejected') {
         $('#actionBy').text("Rejected By: "+getUserNameById(getRejectedBy(approverData.Id)));
    }
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
//

var currentLoggedInUserEmail = "";
var currentLoggedInUserId = "";
var currentContext = SP.ClientContext.get_current();
var currentWeb = currentContext.get_web();
var currentUser = currentWeb.get_currentUser();
var siteUrl = _spPageContextInfo.webAbsoluteUrl;
var serviceLinePractioner = null;
var practitionerEmailIdPractioner = null;
var user1 = null;
var requestTypeCode = "";
var businessRequestsConfiguration={};
var leaveTypes ={
    "LOP" : "Loss Of Pay / Leave Of Absence",
    "MTL" : "Maternity Leaves",
    "MLE" : "ML Extensions",
    "MCL" : "Miscarriage / Abortion Leaves",
    "POB" : "PTO on bench",
    "ELB" : "Early Release from Firm with Buy out of notice period", 
    "BER" : "Bereavement Leaves",
    "PTL" : "Paternity Leave",
    "APA" : "Advance PTO Approvals",
    "RRD" : "Revoke Resignation"   
}
var isTBAApprovalRequired = "";
var isTGLApprovalRequired = "";
var isOLApprovalRequired = "";
var isOPLApprovalRequired = "";

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
    if(!fromReports){
        location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
    }
    else{
        location.href = siteUrl + "/Pages/Reports.aspx";
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
                // $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
                // data.filter(function (val, id) {
                //     if (val.ImmigrationRoles == "TGL" || val.ImmigrationRoles == "OL" || val.ImmigrationRoles == "OPL") {
                //         var $personalIDDiv = $('.PersonalID');
                //         $personalIDDiv.hide();
                //         var $NextDiv = $personalIDDiv.next('div');
                //         $personalIDDiv.insertAfter($NextDiv.next());
                //     }
                // });
            }

            bootstrapper();
        }
    });
}

function getCheckListName(type) {
            return type;
    
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
                    else if(element.trim() == "RevokeResignationDate"){
                        $('.RevokeResignationDate').show();
                    }
                });
            }
        }
    });
}
function bootstrapper() {
    var url = siteUrl + "/_api/web/lists/getbytitle('EmployeeRequests')/items?$select=*,Practitioner/EMail&$expand=AttachmentFiles,Practitioner/Id&$filter=ID eq '" + requestID + "'";
    loadListItems({
        url: url,
        success: function (data) {
            console.log(data)
            if (data.length > 0) {
                var item = data[0];
                if (!isApprover && item.PractitionerId != currentLoggedInUserId) {
                    $('.divTransferTable').html('<div class="container" style="height: 100%;display: flex;justify-content: center;align-items: center;width: 70%;"><div class="mesaggeWrapper"><h3>You do not have access to this page</h3></div></div>').show()
                    return false;
                }

                $('.divTransferTable').show();

                window.approverData = item;
                loadBusinessRequestConfigurations(item);
                var userIds = [];
                var practitionerId = item.PractitionerId;
                for (var prop in item) {
                    if (item.hasOwnProperty(prop)) {
                        var $field = $('[data-field="' + prop + '"]');
                        if ($field.length > 0) {
                            if($field.selector.includes("RequestTypeId")){
                                $field.val(leaveTypes[item[prop]]);
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
                    $('#requestTypeidentifier').text("Leave Request - " + leaveTypes[item.RequestTypeId]);   
                    showRejectedByName();
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



