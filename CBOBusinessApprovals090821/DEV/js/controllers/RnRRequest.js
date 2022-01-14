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
    var $fileUploadControls = $("input[type='file']");
    $fileUploadControls.change(function (e) {
        var $fileUploadValidation = $(e.target);
        var files = $fileUploadValidation.get(0).files;
        if (files.length > 0) {
            $fileUploadValidation.closest('div').find('span').show();
        }
        else {
            $fileUploadValidation.closest('div').find('span').hide();
        }
    });
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
var actualRecordCount = 0;
var actualFields = ["Recepient_LName_FName","Recepient_Email_ID","Recepient_Personnel_No","Recipient_Location","Type_of_award","USD_INR","Amount","Tax_grossed_upto_Business","Client_WBS_code","Recipient_Function","Recipient_Business_Area","Recipient_Business_Line","Project_Engagement_Name","Award_Rational_Citation","Nominator_Personnel_No","Nominator_LName_FName","Nominator_Email_Id","ES_for_Business","Sent_by_ES"];
var fields = ["Recepient's Last Name, First Name","Recepient's Email ID","Recepient's Personnel#","Recipient's Location","Type of award","USD/ INR","Amount","Tax grossed up to Business (Yes/No)","Client WBS code","Recipient's Function","Recipient's Business Area (Offering Portfolio)","Recipient's Business Line (Service Offering)","Project/ Engagement Name","Award Rational/ Citation","Nominator's Personnel#","Nominator's Last Name, First Name","Nominator's Email Id","ES for Business","Sent by ES"];
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
    var rnrUploadQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('RnRUploadList')/items?$select=*,Author/Title,Author/EMail,Author/JobTitle&$expand=Author/Id&$filter=(Author/EMail eq '" + currentLoggedInUserEmail + "' and IsActive eq 'Y')&$orderby= ID desc";
    $.ajax({
        url: rnrUploadQueryDataUrl,
        type:"GET",
        headers: { Accept: "application/json;odata=verbose" },
        async: false,
        success: function (rnrUploadData) {
            var totalData = [];
            if(rnrUploadData.d.results.length>0){
                $(rnrUploadData.d.results).each(function (idx, val) {
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
                                if(rnrUploadData.d.results.length == totalData.length){
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

function showsection(type, ele) {
    $('.activeType').removeClass('activeType');
    $(ele).addClass('activeType');
    switch (type) {
        case 1://transfer
            $('.transferSection').show();
            $('.visaSection').hide()
            break;
        case 2://visa
            $('.transferSection').hide();
            $('.visaSection').show();
            break;
    }
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
                bFilter : false,
                buttons: [],
                "data": d,
                "order": [[0, "desc"]],
                "columns": [
                    {
                        "data": "ID",
                        "title": "Request ID",
                        width: "10%",
                        "orderable": false,
                        align: "center"
                    },
                    {
                        "data": "FileName",
                        title: "File Name",
                        "width": "20%",
                        "orderable": false,
                        align: "center"
                    },
                    {
                        "data": "FileName",
                        title: "Approval Email",
                        "width": "15%",
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
                        "width": "15%",
                        align:"center",
                        "orderable": false
                    },
                    {
                        "data": "IsApproved",
                        title: "Status",
                        "width": "10%",
                        align:"center",
                        "orderable": false,
                        render: function (data, type, row) {
                            return row.IsApproved == 'Y' ? "Approved" : "Pending";
                        }
                    },
                    {
                        "data": "Created",
                        title: "Uploaded Date&Time",
                        "width": "20%",
                        align:"center",
                        "orderable": false,
                        render: function (data, type, row) {
                            return new Date(row.Created).toLocaleString();
                        }
                    },
                    {
                        "data": "ID",
                        title: "Actions",
                        "width": "10%",
                        "orderable": false,
                        render: function (data, type, row) {                            
                            if (row.Attachments) {
                                var buttonsTemplate = '';
                                var fileNameToDownload = row.FileName;
                                $.each(row.AttachmentFiles.results, function (idx, val) {
                                    var fileName = val.FileName;
                                    if (fileName.indexOf(".xlsx") !== -1) {
                                        buttonsTemplate = '<a target="_blank" href="' + val.ServerRelativeUrl + '" download="'+ fileNameToDownload +'"><button type="button" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-download"></span> Download</button></a>';
                                    }
                                });
                                if(row.IsApproved != 'Y'){
                                    buttonsTemplate = buttonsTemplate + '<button type="button" onclick="deleteRequest(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> Delete Request</button>'
                                }
                                return '<div style="display: inline-flex;align:center;" class="actionbuttons">' + buttonsTemplate + '</div>';                                
                            }
                            return "";
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
    //checkIfUserIsApproval();
}

// This function will set the currentLoggedInUser variable with current logged in user Sharepoint object
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
                            
                        }
                        else{
                            bootbox.alert("Non-CBO users are not authorized to login this site!!!", function () {
                                window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
                            });
                        }

                        var userDesignation = data.d.Title.toUpperCase();
                        var roleArr = ["MANAGING DIRECTOR","VICE PRESIDENT", "SENIOR VICE PRESIDENT", "PRODUCT MANAGER","XIN-IN DC MANAGER","XIN-DC SPECIALIST MASTER",
                        "XIN-DC SPECIALIST LEADER","XIN-DC SENIOR PRODUCT MASTER 2","XIN-DC SENIOR MANAGER","XIN-DC PRODUCT MASTER","XIN-DC MANAGER","XIN-DC BUSINESS MANAGER",
                         "XIN-DC ASSOCIATE VICE PRESIDENT","XDE-DC SPECIALIST MASTER","XDE-DC SPECIALIST LEADER","XDE-DC SENIOR MANAGER","XDE-DC QA LEAD",
                         "XDE-DC PRODUCT ARCHITECT LEAD","XDE-DC MANAGER","DC SR PRODUCT STRATEGY LEAD 1","DC SR PRODUCT ARCHITECT LEAD 1","DC SR ENGINEERING LEAD 1",
                         "DC SPECIALIST MASTER","DC SPECIALIST LEADER","DC SPECIALIST EXECUTIVE","DC SOLUTION MANAGER","DC SOLUTION ARCHITECT","DC SERVICES MANAGER",
                         "DC SENIOR SOLUTION MANAGER","DC SENIOR SOLUTION ARCHITECT","DC SENIOR MANAGER","DC QA MANAGER","DC QA LEAD","DC PROJECT DELIVERY MANAGER II",
                         "DC PROJECT DELIVERY MANAGER","DC PROJECT DELIVERY LEAD","DC PRODUCT STRATEGY MANAGER","DC PRODUCT ARCHITECT LEAD","DC PRINCIPAL","DC MANAGER",
                         "DC ENGINEERING MANAGER","DC ENGINEERING LEAD","DC ENABLING SENIOR MANAGER","DC ENABLING MANAGER","CONSULTING MANAGING DIRECTOR"];
                        // if(roleArr.indexOf(userDesignation) == -1 || userDesignation.indexOf("DC VP") == -1 || userDesignation.indexOf("DC ASSOC VP") == -1 || userDesignation.indexOf("MANAGING DIRECTOR") == -1) { 
                            // bootbox.alert("Only Managers and above levels are authorized to view this form!!!", function () {
                                // window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
                            // });                                                                                                
                        // }
                        // else{
                            $('.dashboardContainer').show();
                            $('.glyphicon-remove-circle').click(function (e) {
                                var $ele = $(e.target);
                                if ($ele.closest('.row').find('a').length > 0) {
                                    DeleteItemAttachment($ele.prev()[0].text);
                                    var $fileUploadCntrl = $ele.closest('.row').find('[type="file"]');
                                    $fileUploadCntrl.show();
                                    $ele.prev().hide();
                                }
                                else if ($ele.closest('.row').find('[type="file"]')[0].files.length > 0) {
                                    $ele.closest('.row').find('[type="file"]').val('');
                                }
                                $ele.hide();
                            });
                            initializeDatepickers();
                            getRnRApprovalRequestListType();
                            $('#dashboardHeader').text("Project Award Tracker");
                            $('.recordsInserted').css('margin-left','0px');
                            $('.loading').hide();
                            loadRnRUploadList();
                            getFAQ();
                        // }

                    }
                    catch (err2) {
                        alert(err2);
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
}

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    else {
        return decodeURI(results[1]) || 0;
    }
}

//#region Upload_Data_to_List
function ExportToTable() {
    if(isNotEmpty("uploadElement")){
        var approvalEmailName = $("#uploadfile").val().substring($("#uploadfile").val().lastIndexOf("\\") +1,$("#uploadfile").val().length);
        if(approvalEmailName.split('.')[1] =='eml' || approvalEmailName.split('.')[1] =='msg'){
            $('.loading').show();
            console.log("export called");
            var regex = /^([a-zA-Z0-9\s_()\\.\-:])+(.xlsx|.xls)$/;
            if (regex.test($("#uploadapproval1").val().toLowerCase())) {
                var xlsxflag = false;
                if ($("#uploadapproval1").val().toLowerCase().indexOf(".xlsx") > 0) {
                    xlsxflag = true;
                }
                if (typeof (FileReader) != "undefined") {
                    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
                    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -5);
                    var fileName = $("#uploadapproval1").val().substring($("#uploadapproval1").val().lastIndexOf("\\") +1,$("#uploadapproval1").val().length);            
                    refreshLogs();
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = e.target.result;
                        var data = "";
                        var bytes = new Uint8Array(e.target.result);
                        var length = bytes.byteLength;
                        for (var i = 0; i < length; i++) {
                            data += String.fromCharCode(bytes[i]);
                        }
                        if (xlsxflag) {
                            var workbook = XLSX.read(data, { type: 'binary' },{raw:false});
                        }
                        else {
                            var workbook = XLS.read(data, { type: 'binary' });
                        }
                        var sheet_name_list = workbook.SheetNames;
                        var cnt = 0;
                        sheet_name_list.forEach(function (y) {
                            if (xlsxflag) {
                                var exceljson = XLSX.utils.sheet_to_json(workbook.Sheets[y],{raw: false});
                            }
                            else {
                                var exceljson = XLS.utils.sheet_to_row_object_array(workbook.Sheets[y]);
                            }
                            if (exceljson.length > 0 && cnt == 0) {
                                var erroCode = 0;
                                var recepientName = ""
                                exceljson.forEach(function (excelRow) {                 
                                    if (excelRow != null && Object.keys(excelRow).length > 0) {
                                        fields.forEach(function(value){
                                            if(excelRow[value] == null || (excelRow[value] != null && excelRow[value].trim() == "")){
                                                erroCode = 1;
                                                if(excelRow["Recepient's Last Name, First Name"] != undefined && excelRow["Recepient's Last Name, First Name"] != null){
                                                    recepientName = excelRow["Recepient's Last Name, First Name"];
                                                }                                            
                                                return false;
                                            }
                                            else if(value == "Recepient's Email ID" || value == "Nominator's Email Id"){
                                                var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i
                                                if(!pattern.test(excelRow[value])){
                                                    erroCode = 2;
                                                    recepientName = excelRow["Recepient's Last Name, First Name"];
                                                    return false;
                                                }
                                                else if(excelRow[value].toLowerCase().indexOf('@deloitte.com') == -1){
                                                    erroCode = 6;
                                                    recepientName = excelRow["Recepient's Last Name, First Name"];
                                                    return false;
                                                }
                                            }
                                            else if(value == "Recepient's Personnel#" || value == "Nominator's Personnel#"){
                                                if(!(/^\d+$/.test(excelRow[value]))){
                                                    erroCode = 3;
                                                    recepientName = excelRow["Recepient's Last Name, First Name"];
                                                    return false;
                                                }
                                            }
                                            else if(value == "Client WBS code"){
                                                if(excelRow[value].length != 22){
                                                    erroCode = 4;
                                                    recepientName = excelRow["Recepient's Last Name, First Name"];
                                                    return false;
                                                }
                                                else if(excelRow[value].length == 22){
                                                    var wbcPattern = /^[A-Z0-9]{8}-[A-Z0-9]{2}-[0-9]{2}-[0-9]{2}-[A-Z0-9]{4}$/
                                                    if(!wbcPattern.test(excelRow[value])){
                                                        erroCode = 5;
                                                        recepientName = excelRow["Recepient's Last Name, First Name"];
                                                        return false;
                                                    }
                                                }
                                            }
                                            if(erroCode > 0){
                                                return false;
                                            }
                                        })
                                        if(erroCode > 0){
                                            return false;
                                        }
                                    }
                                    if(erroCode > 0){
                                        return false;
                                    }
                                });
                                if(erroCode == 0){
                                    actualRecordCount = exceljson.length;
                                    $.ajax
                                    ({
                                        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('RnRUploadList')/items",
                                        type: "POST",
                                        data: JSON.stringify
                                        ({
                                            __metadata:
                                            {
                                                type: "SP.Data.RnRUploadListListItem"
                                            },
                                            Title: 'Project Awards Bulk Upload',
                                            FileName: fileName.split('.')[0]+'_'+localISOTime+'.'+fileName.split('.')[1],
                                            IsActive : 'Y'																																												
                                        }),
                                        headers:
                                        {
                                            "Accept": "application/json;odata=verbose",
                                            "Content-Type": "application/json;odata=verbose",
                                            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                            "X-HTTP-Method": "POST"
                                        },
                                        success: function (data, status, xhr) {
                                            console.log("success creating Log");
                                            uploadFiles(data.d.ID);                                        
                                            exceljson.forEach(function (excelRow) {                 
                                                if (excelRow != null && Object.keys(excelRow).length > 0) {
                                                    totalData++;
                                                    noOfRows++;                                                
                                                    createRnRApprovalRequestItem(excelRow,data.d.ID); //insert                                                
                                                }
                                            });
                                            cnt++;
                                        },
                                        error: function (xhr, status, error) {
                                            console.log("error creating Log");
                                        }
                                    });
                                }
                                else{
                                    $("#uploadapproval1").val("");
                                    $('.rnrFile').hide();
                                    switch (erroCode) {
                                        case 1:
                                            $('.loading').hide();
                                            bootbox.alert("All fields are mandatory, few of the fields are not entered for Recepient "+ recepientName +". Kindly recheck and reupload the file!");
                                            break;
                                        case 2:
                                            $('.loading').hide();
                                            bootbox.alert("Please enter a valid Email for the Recepient "+ recepientName);
                                            break;
                                        case 3:
                                            $('.loading').hide();
                                            bootbox.alert("Please enter only numbers for the " + recepientName +" Personal ID");
                                            break;
                                        case 4:
                                            $('.loading').hide();
                                            bootbox.alert("Please enter a WBS code of length 22 for the Recepient " + recepientName);
                                            break;
                                        case 5:
                                            $('.loading').hide();
                                            bootbox.alert("Please enter a valid WBS Code for the Recepient " + recepientName);
                                            break;
                                        case 6:
                                            $('.loading').hide();
                                            bootbox.alert("Please enter Deloitte Email for the Recepient "+ recepientName);
                                            break;
                                        default:
                                            break;
                                    }
                                }                                                 
                            }               
                        });
                    }
                    if (xlsxflag) {
                        reader.readAsArrayBuffer($("#uploadapproval1")[0].files[0]);
                    }
                    else {
                        reader.readAsBinaryString($("#uploadapproval1")[0].files[0]);
                    }
                }
                else {
                    $('.loading').hide();
                    alert("Sorry! Your browser does not support HTML5!");
                }
            }
            else {
                $('.loading').hide();
                bootbox.alert("Please upload a valid Excel file!");
            }
        }
        else{
            $('.loading').hide();
            bootbox.alert("Please upload only the Email messages (.eml/.msg) file");
        }
    }
    else {
        $('.loading').hide();
        bootbox.alert("Please upload the SM and director approval email!");
    }
}     
function getRnRApprovalRequestItem(IDValue, excelRow) {
    var objHeaders = {
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        },
        async: false,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include'
    }
    fetch(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('RnRApprovalRequest')/items?$filter=Id eq '" + IDValue + "'&$select=Id,Offering&$orderby=Id", objHeaders)
        .then(function (response) {
            return response.json()
        })
    .then(function (json) {
        var results = json.d.results;
        if (results.length > 0) {
            for (i in results) {
               // console.log("updateRnRApprovalRequestItem called:"+IDValue);
                updateRnRApprovalRequestItem(results[i].ID, excelRow);
            }
        }
        else {
            //console.log("createRnRApprovalRequestItem L1 called:"+IDValue);
            createRnRApprovalRequestItem(excelRow);
        }
    })
    .catch(function (ex) {
        console.log("getRnRApprovalRequestItem error"+ex.message);
    });
}
function updateRnRApprovalRequestItem(itemID, excelRow) {
    $.ajax
    ({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('RnRApprovalRequest')/items(" + itemID + ")",
        type: "POST",
        data: JSON.stringify
        ({
            __metadata:
            {
                type: RnRApprovalRequestListType
            },
            Recepient_LName_FName: excelRow["Recepient's Last Name, First Name"],
            //Title: excelRow["OP"],
            Recepient_Email_ID: excelRow["Recepient's Email ID"],
            Recepient_Personnel_No: excelRow["Recepient's Personnel#"],
            Recipient_Location:excelRow["Recipient's Location"],	
            Type_of_award:excelRow["Type of award"],
            USD_INR:excelRow["USD/ INR"],
            Amount:excelRow["Amount"],	
            Tax_grossed_upto_Business:excelRow["Tax grossed up to Business (Yes/No)"],            
            Client_WBS_code:excelRow["Client WBS code"],		
            Recipient_Function:excelRow["Recipient's Function"],
            Recipient_Business_Area:excelRow["Recipient's Business Area (Offering Portfolio)"],
            Recipient_Business_Line:excelRow["Recipient's Business Line (Service Offering)"],
            Project_Engagement_Name: excelRow["Project/ Engagement Name"],            
            Award_Rational_Citation:excelRow["Award Rational/ Citation"],          
            Nominator_Personnel_No:excelRow["Nominator's Personnel#"],
            Nominator_LName_FName:excelRow["Nominator's Last Name, First Name"],
            Nominator_Email_Id:excelRow["Nominator's Email Id"],
            ES_for_Business:excelRow["ES for Business"],
            Sent_by_ES:excelRow["Sent by ES"]		
        }),
        headers:
        {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE"
        },
        async: false,
        success: function (data, status, xhr) {
            console.log("success");
            updateItems++;
            //$("#UpdateRequestsCount").text(updateItems);
            if(noOfRows == (insertItems + updateItems)){
                $('.loading').hide();
                noOfRows=0;
                bootbox.alert('Upload Complete!!!');
            }
        },
        error: function (xhr, status, error) {
            console.log("updateRnRApprovalRequestItem error");
            $('.loading').hide();
        }
    });
}
function createRnRApprovalRequestItem(excelRow, documentID) {
    $.ajax
        ({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('RnRApprovalRequest')/items",
            type: "POST",
            data: JSON.stringify
            ({
                __metadata:
                {
                    type: RnRApprovalRequestListType
                },
                Recepient_LName_FName: excelRow["Recepient's Last Name, First Name"],
                //Title: excelRow["OP"],
                Recepient_Email_ID: excelRow["Recepient's Email ID"],
                Recepient_Personnel_No: excelRow["Recepient's Personnel#"],
                Recipient_Location:excelRow["Recipient's Location"],	
                Type_of_award:excelRow["Type of award"],
                USD_INR:excelRow["USD/ INR"],
                Amount:excelRow["Amount"],	
                Tax_grossed_upto_Business:excelRow["Tax grossed up to Business (Yes/No)"],            
                Client_WBS_code:excelRow["Client WBS code"],		
                Recipient_Function:excelRow["Recipient's Function"],
                Recipient_Business_Area:excelRow["Recipient's Business Area (Offering Portfolio)"],
                Recipient_Business_Line:excelRow["Recipient's Business Line (Service Offering)"],
                Project_Engagement_Name: excelRow["Project/ Engagement Name"],            
                Award_Rational_Citation:excelRow["Award Rational/ Citation"],          
                Nominator_Personnel_No:excelRow["Nominator's Personnel#"],
                Nominator_LName_FName:excelRow["Nominator's Last Name, First Name"],
                Nominator_Email_Id:excelRow["Nominator's Email Id"],
                ES_for_Business:excelRow["ES for Business"],
                Sent_by_ES:excelRow["Sent by ES"],
                DocumentID:documentID,
                OriginalDocumentID:documentID            																																															
            }),
            headers:
            {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "POST"
            },
            async: false,
            success: function (data, status, xhr) {
                console.log("success");
                insertItems++;                
                //$("#InsertRequestsCount").text(insertItems);
                if(noOfRows == (insertItems + updateItems)){                    
                    noOfRows=0;
                    sendConfirmationEmail(documentID);
                    sendConfirmationEmailToES(documentID);                    
                }
            },
            error: function (xhr, status, error) {
                console.log("error");
                $('.loading').hide();
            }
        });
}

function refreshLogs(){
    insertItems=0;
    updateItems=0;
    totalData=0;
}

function exportToExcel(fn, dl)
{
    $('.loading').show();
    var htmlconetnt = "<table id='htmlconetnt'><thead><tr>";        
    for (var k = 0; k < fields.length; k++) {
        htmlconetnt+="<th>"+fields[k]+"</th>";
    }
    htmlconetnt+="</tr></thead>";
    var htmlconetnt1="";
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
                    uploadFileSP('RnRUploadList', recordID, filesToUpload.splice(0, 1)[0], function () {
                        if (filesToUpload.length == 0) {
                            if (callback && typeof callback == "function") {
                                callback();
                            }
                            else{                                
                                loadRnRUploadList();
                                $("#uploadapproval1").val("");               
                                $("#uploadfile").val(""); 
                                $('.loading').hide();
                                $('.glyphicon-remove-circle').hide();
                                bootbox.alert('Upload of '+ actualRecordCount +' records Successful. Please note down the Request ID : '+recordID);
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


function deleteRequest(ele) {    
    var $ele = $(ele);
    var dt = $ele.closest('table').DataTable();
    var data = dt.row($ele.closest('tr')).data();
    var requestId = data.ID;
    bootbox.confirm({
        message: "Are you sure you want to Delete the request #"+ requestId +"?",
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
                if(new Date(data.Created).getFullYear() == new Date().getFullYear() && new Date(data.Created).getMonth() == new Date().getMonth()){
                    $('.loading').show();
                    $.ajax({    
                        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('RnRUploadList')/items(" + requestId + ")",    
                        type: "PATCH",    
                        contentType: "application/json;odata=verbose",
                        data: JSON.stringify
                        ({
                            __metadata:
                            {
                                type: "SP.Data.RnRUploadListListItem"
                            },
                            IsActive:'N'
                        }),
                        headers: {
                            "Accept": "application/json;odata=verbose",
                            "content-type": "application/json;odata=verbose",
                            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                            "If-Match": "*"
            
                        },    
                        success: function(data) {        
                            $.ajax({
                                url: siteUrl + "/_api/web/lists/getbytitle('RnRApprovalRequest')/items?$select=*&$filter=(OriginalDocumentID eq " + requestId + ")",
                                type:"GET",
                                headers: { Accept: "application/json;odata=verbose" },
                                async: false,
                                success: function (rnrData) {
                                    var rnrRecords = rnrData.d.results.length;
                                    var count =0;
                                    $(rnrData.d.results).each(function (idx, val) {                            
                                        $.ajax({    
                                            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('RnRApprovalRequest')/items("+ val.ID +")",    
                                            type: "PATCH",    
                                            contentType: "application/json;odata=verbose",
                                            data: JSON.stringify
                                            ({
                                                __metadata:
                                                {
                                                    type: RnRApprovalRequestListType
                                                },
                                                DocumentID:0	
                                            }),
                                            headers: {
                                                "Accept": "application/json;odata=verbose",
                                                "content-type": "application/json;odata=verbose",
                                                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                                "If-Match": "*"
                            
                                            },    
                                            success: function(data) { 
                                                count=count+1;    
                                                if(count == rnrRecords)
                                                {
                                                    bootbox.alert('Request ID : '+ requestId + ' data removed successfully!!!');   
                                                    $('.loading').hide();     
                                                    loadRnRUploadList();   
                                                }
                                            },    
                                            error: function(error) {    
                                                console.log(JSON.stringify(error));    
                                        
                                            }    
                                        
                                        })
                                    })
                                }
                            })
                        },    
                        error: function(error) {    
                            console.log(JSON.stringify(error));    
                    
                        }    
                    
                    })    
                }
                else{
                    bootbox.alert("Please contact your respective ES team for deleting the request!!!");
                }
            }
        }
    });
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

//TODO - MMM
function sendConfirmationEmail(Id) {
    var authorEmail = currentLoggedInUserEmail;
    var currentDate = new Date();
    currentDateForYear = currentDate.toDateString().split(' ');
    var EmployeeName = currentUser.get_title().split(',');
    var to = authorEmail;
    //var TGL = $('#talentGroupLeaderList option:selected').val();
    var cc = null;
    var Employee = EmployeeName[1] + " " + EmployeeName[0];
    var subject = "Project Awards Bulk Upload Completed";
    
    var RequestCategory = 'Project Awards Bulk Upload';
    var RequestType = 'Project Awards Bulk Upload';
    var RequestNumber = Id;
    var month = currentDate.toLocaleString('en-US', { month: 'long' });;
    var year = currentDateForYear[3];
    var Url = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx?team=0";

    var GetEmailTemplateBody = siteUrl + "/_api/web/lists/getbytitle('EmailTemplates')/items?$select=EmailTemplateHtml&$filter= EmailType eq 'RnRNewRequest'";
    loadListItems({
        url: GetEmailTemplateBody,
        success: function (data) {
            siteUrl = _spPageContextInfo.webAbsoluteUrl;
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            var emailHeader = "Rewards & Recognition Upload";

            body = body.replace("{{CurrentMonth}}", month).replace("{{CurrentYear}}", year).
                replace("{{RequestCategory}}", RequestCategory).replace("{{Employee}}", Employee).
                replace("{{RequestType}}", RequestType).replace("{{RequestNumber}}", RequestNumber).
                replace("{{EmailHeader}}", emailHeader).
                replace("{{NoOfRequests}}", actualRecordCount).
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

function sendConfirmationEmailToES(Id) {
    var authorEmail = currentLoggedInUserEmail;
    var currentDate = new Date();
    currentDateForYear = currentDate.toDateString().split(' ');

    var EmployeeName = currentUser.get_title().split(',');
    var to = authorEmail;//TODO change it to ES email
    //var TGL = $('#talentGroupLeaderList option:selected').val();
    var cc = null;
    var NominatorName = EmployeeName[1] + " " + EmployeeName[0];
    var subject = "New Request for Project Awards Bulk Upload";
    
    var RequestNumber = Id;
    var month = currentDate.toLocaleString('en-US', { month: 'long' });;
    var year = currentDateForYear[3];
    var Url = _spPageContextInfo.webAbsoluteUrl + "/Pages/Dashboard.aspx?team=0";

    var GetEmailTemplateBody = siteUrl + "/_api/web/lists/getbytitle('EmailTemplates')/items?$select=EmailTemplateHtml&$filter= EmailType eq 'RnRTalentESNotification'";
    loadListItems({
        url: GetEmailTemplateBody,
        success: function (data) {
            siteUrl = _spPageContextInfo.webAbsoluteUrl;
            var body = $('<div></div>').html(data[0].EmailTemplateHtml).html();
            var emailHeader = "Rewards & Recognition Upload";

            body = body.replace("{{CurrentMonth}}", month).replace("{{CurrentYear}}", year).
                replace("{{Employee}}", "ES Team").replace("{{NominatorName}}", NominatorName).
                replace("{{NominatorEmail}}", authorEmail).replace("{{RequestNumber}}", RequestNumber).
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

function getFAQ(){
   
    var item = "";
     $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('FAQList')/items?$select=*,RequestCategory &$expand=AttachmentFiles",
        type: "GET",
        async: false,
        contentType: "application/json;odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            data.d.results.forEach(function(attachment){
                if(attachment.RequestCategory == "ProjectAward"){
                    item = attachment;
                    if (item.Attachments) {
                        var val= item.AttachmentFiles.results[0]
                        var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + 'Project Award Process' + "</a>";
                        
                        $('#projectAwardProcess').append(link);
                    }
                }
            })
			
	
        },
        error: function (data) {
			console.log(data);
        }
    });

}

