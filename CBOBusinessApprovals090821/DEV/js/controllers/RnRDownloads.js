$('.loading').show();
$(document).ready(function () {
    $('hr').remove();
    var footerHtml = $('footer').html()
    $('.dol-footer').removeAttr('style').html("<div class='row'>" + footerHtml + "</div>")
    $('footer').remove();
    $('.searchContainer [data-id]').on('change', function (e) {
        var $ele = $(e.currentTarget);
        var dataGrid = $ele.closest('.panel-body').find('.customTable').data('dg');
        if ($ele.is('.hasDatepicker')) {
            filterRecords('0', '', dataGrid);
        }
        else {
            filterRecords($ele.data('id'), $ele.val(), dataGrid)
        }

        // if ($ele.is('.statusDropdown')) {
        //     var $pendingWithDropdown = $ele.closest('.searchContainer').find('.pendingWithDropdown');
        //     if ($ele.val() == 'Approved' || $ele.val() == 'Rejected') {
        //         $pendingWithDropdown.attr('disabled', true).val("").trigger('change');
        //     }
        //     else {
        //         $pendingWithDropdown.removeAttr('disabled');
        //     }
        // }
    })
})

var jsFilePaths = [
    "https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js",
    "https://cdn.datatables.net/buttons/1.5.6/js/dataTables.buttons.min.js",
    "https://cdn.datatables.net/buttons/1.5.6/js/buttons.html5.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/xls/0.7.4-a/xls.core.min.js",
    "../SiteAssets/js/libs/bootbox.min.js",
    "../SiteAssets/js/libs/dataTables.checkboxes.min.js",
    "../SiteAssets/js/libs/jqueryUI/jquery-ui.min.js"
];
function loadJSSet() {
    if (jsFilePaths.length > 0) {
        loadJs(jsFilePaths.splice(0, 1), loadJSSet);
    }
    else {
        getNSetUserId();
    }
}

var currentLoggedInUserEmail = "";
var currentContext = SP.ClientContext.get_current();
var currentWeb = currentContext.get_web();
var currentUser = currentWeb.get_currentUser();
var siteUrl = _spPageContextInfo.webAbsoluteUrl;
var currentUserId = 0;
var isAdminAccess = false;
var myChart = null;
var skillChart1 = null;
var offeringChart1 = null;
var userRolesOffering = [];
var userRoleHighest = "";
var insertItems=0;
var updateItems=0;
var totalData=0;
var noOfRows=0;
var requestIdstoApprove=[];
$('.bulkapprove').hide();

function filterRecords(i, value, dataGrid) {
    dataGrid
        .column(i)
        .search(value)
        .draw();
}

var RnRApprovalRequestListType = "";
//var user1 = null;

function getRnRApprovalRequestListType() {
    $.ajax({

        url: siteUrl + "/_api/web/lists/getbytitle('RnRApprovalRequest')",
        headers: { Accept: "application/json;odata=verbose" },
        success: function (data) {
            RnRApprovalRequestListType = data.d.ListItemEntityTypeFullName;
        }
    })
}

function loadRnRUploadList() {
    var rnrDownloadQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('RnRUploadList')/items?$select=*,Author/Title,Author/EMail&$expand=Author/Id&AttachmentFiles&$filter=(IsActive eq 'Y')&$top=5000&$orderby= ID desc";
    $.ajax({
        url: rnrDownloadQueryDataUrl,
        type:"GET",
        headers: { Accept: "application/json;odata=verbose" },
        async: false,
        success: function (rnrDownloadData) {
            var totalData = [];
            if(rnrDownloadData.d.results.length>0){
                $(rnrDownloadData.d.results).each(function (idx, val) {
                    var tempData = val;                
                    var url = siteUrl + "/_api/web/lists/getbytitle('RnRUploadList')/items?$select=*&$expand=AttachmentFiles&$filter=ID eq '" + val.ID + "'";

                    loadListItems({
                        url: url,
                        success: function (data) {
                            if (data.length > 0) {
                                var item = data[0];
                                if (item.Attachments) {
                                    tempData.AttachmentFiles = item.AttachmentFiles;                                                                
                                }
                                totalData.push(tempData);
                                if(rnrDownloadData.d.results.length == totalData.length){
                                    ViewingRnRUploadListSuccessHandler(totalData);
                                }
                            }
                        }
                    })            
                });  
            }
            else{
                ViewingRnRUploadListSuccessHandler(totalData);
            }                      
        }
    })
}                

function ViewingRnRUploadListSuccessHandler(data) {
    try {
        if(noOfRows == 0){
            $('.loading').hide();
        }
        function getCOnfig(d, excelFileName) {
            return {
                destroy: true,
                "bLengthChange": false,
                dom: 'Bfrtip',
                autoWidth: false,
                bFilter: false,
                buttons: [],
                "data": d,
                "order": [[0, "desc"]],
                "columns": [
                    {
                        "data": "ID",
                        "title": "Request ID",
                        width: "10%",
                        "orderable": false
                    },
                    {
                        "data": "FileName",
                        title: "File Name",
                        "width": "25%",
                        "orderable": false,
                        align: "center"
                    },
                    {
                        "data": "FileName",
                        title: "Approval Email",
                        "width": "20%",
                        "orderable": false,
                        align: "center",
                        render: function (data, type, row) {
                            if (row.Attachments) {
                                var link=""
                                $.each(row.AttachmentFiles.results, function (idx, val) {
                                    var fileName = val.FileName;
                                    if (fileName.indexOf("^$SEP$^") !== -1) {
                                        fileName = fileName.split('^$SEP$^')[1];
                                    }
                                    if(fileName.indexOf(".xlsx") == -1){
                                        link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + fileName + "</a>";
                                    } 
                                });
                                return link;                                
                            }
                            return "";
                        }
                    },
                    {
                        "data": "Author.Title",
                        title: "Uploaded By",
                        "width": "10%",
                        align:"center",
                        "orderable": false
                    },
                    {
                        "data": "Created",
                        title: "Uploaded Date&Time",
                        "width": "25%",
                        align:"center",
                        "orderable": false,
                        render: function (data, type, row) {
                            return new Date(row.Created).toLocaleString();
                        }
                    },
                    {
                        "data": "ID",
                        title: "Check to Complete Request",
                        "width": "10%",
                        "orderable": false,
                        render: function (data, type, row) {                            
                            if (row.IsApproved == 'Y') {
                                return '<div style="display: inline-flex;align:center;"><input type="checkbox" checked disabled/></div>';                                
                             }
                             else{
                                var buttonsTemplate = '';
                                buttonsTemplate = '<input type="checkbox" onclick="completeRequest(this)" />'
                                return '<div style="display: inline-flex;align:center;">' + buttonsTemplate + '</div>';
                             }
                            // return "";
                        }
                    }
                ],
                "oLanguage": {
                    "sEmptyTable": "No request raised yet."
                }                
            }
        }
        
        $('#RequestsText').text("Total Uploads: ");
        $('#RequestsCount').text(data.length);
        $('#RequestsText').closest('label').show();

        $('#InterOfficeTable').DataTable(getCOnfig(data, 'Requests'));
    }
    catch (e) {
        alert(e.message);

    }
}

window.onload = function () {
    $('.dashboardContainer').hide();
    loadJSSet();
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
    currentUserId = currentContext.get_web().get_currentUser().get_id();
    loadLoggedInUserDetails(null);    

}

function loadLoggedInUserDetails(currentLoggedInUser) {
    $('.loading').show();
    try {
        if (currentLoggedInUser == undefined || currentLoggedInUser == null || currentLoggedInUser.length == 0) {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties",
                headers: { Accept: "application/json;odata=verbose" },
                success: function (data) {
                    try {
                        var department = "";
                        $.each(data.d.UserProfileProperties.results, function (idx, val) {
                            if (val.Key == "Department") {
                                department = val.Value;
                                return false;
                            }
                        });
                        department = department.toUpperCase();
                        var departmentSplit = department.split(' ');
                        var offering = $.trim(departmentSplit[0]);
                        var isCBOUser = false;
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
                                isCBOUser = true;
                                break;        
                            case "OPSTR":                    
                            case "OPSTRANS":
                                isCBOUser = true;
                                break;                            
                            case "CIS":
                                isCBOUser = true;
                                break;
                            case "CH":
                                isCBOUser = true;
                                break;
                            case "AMI":
                                isCBOUser = true;
                                break;
                            case "SE":
                                isCBOUser = true;
                                break;
                            case "SYSENG":
                                isCBOUser = true;
                                break;
                            case "CNVG":
                                isCBOUser = true;
                                break;
                            case "CBO":
                            case "CORE":
                                isCBOUser = true;
                                break;
                            case "CR":
                                isCBOUser = true;
                                break;
                            case "CE":
                                isCBOUser = true;
                                break;
                            case "HASHEDIN":
                                isCBOUser = true;
                                break;
                            case "OPS":
                                isCBOUser = true;
                                break;
                            default:
                                if (departmentSplit.length == 3 && offering == "C" && $.trim(departmentSplit[1]).toUpperCase() == "IND" && $.trim(departmentSplit[2]).toUpperCase() == "SO") {
                                    isCBOUser = true;
                                }
                                break;
                        }
                        if(department.toUpperCase().includes("CH CONS USI") || department.toUpperCase().includes("CH MINER")){
                            isCBOUser = true;
                        }
                        if(isCBOUser){
                            checkIfUserIsApproval();
                        }
                        else{
                            bootbox.alert("Non-CBO users are not authorized to login this site!!!", function () {
                                window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
                            });
                        }

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

var userApprovalFor = [];

function checkIfUserIsApproval() {

    var trckQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('Approvers')/items?$select=*,Approvers/Title,Approvers/EMail&$expand=Approvers/Id&$filter= Approvers/EMail eq '" + currentLoggedInUserEmail + "'";
    loadListItems({
        url: trckQueryDataUrl,
        success: function (data) {
            if (data.length === 0) {                
                $('.dropdown-menu [href$="?team=1"]').remove();
                $('.loading').hide();
                bootbox.alert("You are not authorized to view this form!!!", function () {
                window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
             });
            }
            else {
                $('.dashboardContainer').show();
                var isESUser = false;
                $(data).each(function (idx, val) {
                    if(val.ImmigrationRoles == "ES" || val.ImmigrationRoles == "TL"){
                        $(val.Approvers.results).each(function (di, va) {
                            if (va.EMail == currentLoggedInUserEmail) {                                
                                isESUser = true;
                                return true;
                            }
                        })
                    }                    
                });
                if(isESUser){
                    initializeDatepickers();
                    getRnRApprovalRequestListType();
                    $('#dashboardHeader').text("Project Awards Bulk Downloads");
                    $('.loading').hide();
                    loadRnRUploadList();
                }
                else{
                    bootbox.alert("Only Talent Engagement Specialists are authorized to view this form!!!", function () {
                        window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
                    });
                }
            }
        }
    });

}

function retrieveAuditData() {
    $('.loading').show();
    var fromDate = $('.fromDate').datepicker('getDate');
    var fromdateNew    = new Date(fromDate),
    fromyr      = fromdateNew.getFullYear(),
    frommonth   = fromdateNew.getMonth() + 1 < 10 ? '0' + (fromdateNew.getMonth()+1) : (fromdateNew.getMonth()+1),
    fromday     = fromdateNew.getDate()  < 10 ? '0' + fromdateNew.getDate()  : fromdateNew.getDate(),
    newFromDate = fromyr + '-' + frommonth + '-' + fromday +'T00:00:00.000Z';
    var toDate = $('.toDate').datepicker('getDate');
    var todateNew    = new Date(toDate),
    toyr      = todateNew.getFullYear(),
    tomonth   = todateNew.getMonth() + 1 < 10 ? '0' + (todateNew.getMonth()+1) : (todateNew.getMonth()+1),
    today     = todateNew.getDate()  < 10 ? '0' + todateNew.getDate()  : todateNew.getDate(),
    newtoDate = toyr + '-' + tomonth + '-' + today +'T23:59:59.000Z';
    var idValue = $('.requestID').val();
    var dl = false;
    var fn = false;
    var htmlconetnt = "<table id='htmlconetnt'><thead><tr>";
    var actualFields = ["Recepient_LName_FName","Recepient_Email_ID","Recepient_Personnel_No","Recipient_Location","Type_of_award","USD_INR","Amount","Tax_grossed_upto_Business","Client_WBS_code","Recipient_Function","Recipient_Business_Area","Recipient_Business_Line","Project_Engagement_Name","Award_Rational_Citation","Nominator_Personnel_No","Nominator_LName_FName","Nominator_Email_Id","ES_for_Business","Sent_by_ES","DocumentID","Created"];
    var fields = ["Recepient's Last Name, First Name","Recepient's Email ID","Recepient's Personnel#","Recipient's Location","Type of award","USD/ INR","Amount","Tax grossed up to Business (Yes/No)","Client WBS code","Recipient's Function","Recipient's Business Area (Offering Portfolio)","Recipient's Business Line (Service Offering)","Project/ Engagement Name","Award Rational/ Citation","Nominator's Personnel#","Nominator's Last Name, First Name","Nominator's Email Id","ES for Business","Sent by ES","Request ID","Created Date"];
    for (var k = 0; k < fields.length; k++) {
        htmlconetnt+="<th>"+fields[k]+"</th>";
    }
    htmlconetnt+="</tr></thead>";
    var siteURL ="";
    if(fromyr == 1970){
        siteURL = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('RnRApprovalRequest')/items?$select=*&$filter=DocumentID eq "+ idValue +"&$top=5000&&$orderby=ID desc";
    }
    else{        
        siteURL = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('RnRApprovalRequest')/items?$select=*&$filter=Created ge datetime'" + newFromDate + "' and Created le datetime'" + newtoDate + "' and DocumentID ne 0&$top=5000&&$orderby=ID desc";
    }
    $.ajax({
        url: siteURL,
        type:"GET",
        headers: { Accept: "application/json;odata=verbose" },
        async: false,
        success: function (data) 
        {
            var items = data.d.results;
            var htmlconetnt1="";
            if (items.length > 0) 
            {
            
              for(var index=0;index<items.length;index++)
              {
                  htmlconetnt1+="<tr>";
                  for (var k = 0; k < actualFields.length; k++) {                      
                        htmlconetnt1+="<td>"+items[index][actualFields[k]]+"</td>";
                  }
                  htmlconetnt1+="</tr>";
              }
              htmlconetnt=htmlconetnt+"<tbody>"+htmlconetnt1+"</tbody>"+"</table>";
              $('#template').html('');
              $('#template').append(htmlconetnt);
              var elt = document.getElementById('htmlconetnt');
              var wb = XLSX.utils.table_to_book(elt, {sheet:"Project awards - payroll input"});
              $('.loading').hide();
              return dl ?
              XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'base64'}) :
              XLSX.writeFile(wb, fn || ('ProjectAwards.xlsx'));
            }
            else
            {
                htmlconetnt=htmlconetnt+"<tbody>"+htmlconetnt1+"</tbody>"+"</table>";
                $('#template').html('');
                $('#template').append(htmlconetnt);
                var elt = document.getElementById('htmlconetnt');
                var wb = XLSX.utils.table_to_book(elt, {sheet:"Project awards - payroll input"});
                $('.loading').hide();
                return dl ?
                XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'base64'}) :
                XLSX.writeFile(wb, fn || ('ProjectAwards.xlsx'));
            }
        }, eror: function (data) {
            console.log($('#txtSomethingWentWrong').val());
        }
    });
    return htmlconetnt;
} 

function PullAuditData() {
    var fromDate = $('.fromDate').datepicker('getDate');
    var fromdateNew = new Date(fromDate);
    var fromyr = fromdateNew.getFullYear();
    var toDate = $('.toDate').datepicker('getDate');
    var todateNew = new Date(toDate);
    var toyr = todateNew.getFullYear();
    if((fromyr != 1970 && toyr != 1970) || $('.requestID').val()){
        retrieveAuditData();
    }
    else{
        bootbox.alert("Please enter the Request ID (OR) Start Date and End Date to download the requests");
    }    
}

function initializeDatepickers() {
    $(".fromDate").datepicker({ maxDate: new Date() });
    $('.toDate').datepicker({ maxDate: new Date() });

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

function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() +
        (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}

function completeRequest(ele) {    
    var $ele = $(ele);
    var dt = $ele.closest('table').DataTable();
    var data = dt.row($ele.closest('tr')).data();
    if(ele.checked){
        var tempIds ={};
        tempIds.id = data.ID;
        tempIds.name = data.Author.Title;
        tempIds.email = data.Author.EMail;
        requestIdstoApprove.push(tempIds);
        $('.bulkapprove').show();
    }
    else{
        requestIdstoApprove = requestIdstoApprove.filter(obj => (obj.id != data.ID))
        if(requestIdstoApprove.length == 0){
            $('.bulkapprove').hide();
        }
    }
}

function approveBulkRequests(){
    bootbox.confirm({
        message: "Are you sure you want to Approve all the selected requests?",
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
                var count = 0;
                requestIdstoApprove.forEach(element => {
                    $('.loading').show();
                    count = count + 1;
                    $.ajax({    
                        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('RnRUploadList')/items(" + element.id + ")",    
                        type: "PATCH",    
                        contentType: "application/json;odata=verbose",
                        data: JSON.stringify
                        ({
                            __metadata:
                            {
                                type: "SP.Data.RnRUploadListListItem"
                            },
                            IsApproved:'Y'
                        }),
                        headers: {
                            "Accept": "application/json;odata=verbose",
                            "content-type": "application/json;odata=verbose",
                            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                            "If-Match": "*"
            
                        },    
                        success: function(data) {                                    
                            sendConfirmationEmailToRequestor(element);
                            if(requestIdstoApprove.length == count){
                                $('.loading').hide();
                                location.reload();
                            }
                        },    
                        error: function(error) {    
                            console.log(JSON.stringify(error));    
                    
                        }    
                    
                    })    
                });
            }
        }
    });
}
function sendConfirmationEmailToRequestor(element) {
    var authorEmail = element.email;
    var currentDate = new Date();
    currentDateForYear = currentDate.toDateString().split(' ');

    var to = authorEmail;//TODO change it to ES email
    //var TGL = $('#talentGroupLeaderList option:selected').val();
    var cc = "sriaitha@deloitte.com,sriaitha@deloitte.com ";
    var subject = "Project Award Bulk Upload Application approval";
    
    var RequestNumber = element.id;
    var month = currentDate.toLocaleString('en-US', { month: 'long' });;
    var year = currentDateForYear[3];
    var Url = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx?team=0";

    var GetEmailTemplateBody = siteUrl + "/_api/web/lists/getbytitle('EmailTemplates')/items?$select=EmailTemplateHtml&$filter= EmailType eq 'RnRApprovalEmailtoRequestor'";
    loadListItems({
        url: GetEmailTemplateBody,
        success: function (data) {
            siteUrl = _spPageContextInfo.webAbsoluteUrl;
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            var emailHeader = "Project Award Bulk Upload Application approval";

            body = body.replace("{{CurrentMonth}}", month).replace("{{CurrentYear}}", year).
                replace("{{Employee}}", element.name.replace(',','')).
                replace("{{RequestNumber}}", RequestNumber).
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


