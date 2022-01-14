$('body').append('<div class="ms-cui-ribbonTopBars"><div></div><div></div></div>'); //To prevent the unhandled exception from sharepoint layout page
$('body').append('<div class="ms-rte-layoutszone-inner"><div></div></div>');

window.onload = function() {
    window.location.replace("https://americas.internal.deloitteonline.com/sites/USICBOPortal/BusinessApproval/Pages/certificationrequest.aspx");
}

function loadLoggedInUserDetails() {
    return $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties",
        headers: { Accept: "application/json;odata=verbose" },
        async: false,
        contentType: "application/json;odata=verbose",
        type: 'GET',
    });
}

//Call this function to upload the files.
function uploadFiles(fileInputControlId, webUrl, documentLibraryName, folderName, fileName) {
    for (var i = 0; i < $(fileInputControlId)[0].files.length; i++) {
        var uploadFile = $(fileInputControlId)[0].files[i];
        var getFile = getFileBuffer(uploadFile);
        getFile.done(function (arrayBuffer) {

            //alert(fileName);
            uploadFileToFolder(webUrl, documentLibraryName, folderName, fileName, arrayBuffer, function (data) {

            }, function (data) {
                //   alert("File uploading fail");
            });
        });
    }
}
//Get the uploaded file buffer.
function getFileBuffer(uploadFile) {
    var deferred = jQuery.Deferred();
    var reader = new FileReader();
    reader.onloadend = function (e) {
        deferred.resolve(e.target.result);
    }
    reader.onerror = function (e) {
        deferred.reject(e.target.error);
    }
    reader.readAsArrayBuffer(uploadFile);
    return deferred.promise();
}

//Upload files into SharePoint library with REST API
function uploadFileToFolder(webUrl, documentLibraryName, folderName, fileName, arrayBuffer, success, failure) {
    //file added to the subfolder of Rootfolder.
    var apiUrl = webUrl + "/_api/web/lists/getByTitle('" + documentLibraryName + "')/RootFolder/folders('" + folderName + "')/files/add(url='" + fileName + "', overwrite=true)";

    $.ajax({
        url: apiUrl,
        type: "POST",
        data: arrayBuffer,
        processData: false,
        async: false,
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });
}
// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function clearCompletionDetail() {
    $('#selCompletionStatus').prop('selectedIndex', 0);
    $('#txtCompletionDate').value = '';
    $('#txtCompletionDate').datepicker('setDate', null);
    $('#uplCertificate').value = null;
    $('#divUplCertificateName').empty();
    $('#WBSCode').text('Not Available');

    if ($('#selCompletionStatus').hasClass('error-label')) {
        $('#selCompletionStatus').removeClass('error-label');
    }
    if ($('#txtCompletionDate').hasClass('error-label')) {
        $('#txtCompletionDate').removeClass('error-label');
    }
    if ($('#divUplCertification').hasClass('error-label')) {
        $('#divUplCertification').removeClass('error-label');
    }
    if ($('#WBSCodeId').hasClass('error-label')) {
        $('#WBSCodeId').removeClass('error-label');
    }

    $("#errorCompletionDetail").text("");
}
function clearRequestDetail() {
    //$('#selOfferingList').prop('selectedIndex', 0);
    $('#selTalentGroupList').prop('selectedIndex', 0);
    //$('#selCapabilityList').prop('selectedIndex', 0);
    $('#selCertificationList').prop('selectedIndex', 0);
    $('#txtAnticipatedCompletionDate').value = '';
    $('#txtAnticipatedCompletionDate').datepicker('setDate', null);
    $('#uplApproval').value = null;
    $('#uplApprovalName').empty();
    $("#hdnCertificationRequestRowId").val(0);

    $("#uplApprovalName").attr('href', '#');
    $("#hdnApprovalStatus").value = '';
    $("#hdnTGLApprovalStatus").value = '';

    if ($('#lblOfferingList').hasClass('error-label')) {
        $('#lblOfferingList').removeClass('error-label');
    }
    if ($('#lblTalentGroupList').hasClass('error-label')) {
        $('#lblTalentGroupList').removeClass('error-label');
    }
    if ($('#lblCapabilityList').hasClass('error-label')) {
        $('#lblCapabilityList').removeClass('error-label');
    }
    if ($('#lblCertificationList').hasClass('error-label')) {
        $('#lblCertificationList').removeClass('error-label');
    }
    if ($('#lblAnticipatedCompletionDate').hasClass('error-label')) {
        $('#lblAnticipatedCompletionDate').removeClass('error-label');
    }
    if ($('#lblApproval').hasClass('error-label')) {
        $('#lblApproval').removeClass('error-label');
    }

    $("#errorRequestDetail").text("");
}
function disableCompletionSection() {
    $('#selCompletionStatus').attr('disabled', 'disabled');
    $('#uplCertificate').prop('disabled', true);
    $('#divUplCertification').attr('style', 'background-color : #eee !important; border : 1px solid #eee !important; color: black !important;');
    $("#txtCompletionDate").attr('disabled', 'disabled');
    $("#txtCompletionDate").addClass("disabledInput");
    $("#WBSCode").addClass("disabledInput");
    $('#btnSaveCompletionDetail').attr('style', 'background-color : #eee !important; border : 1px solid #eee !important; color: black !important;');
    $("#btnSaveCompletionDetail").attr('disabled', 'disabled');
    $('#btnCancelCompletionDetail').attr('style', 'background-color : #eee !important; border : 1px solid #eee !important; color: black !important;');
    $("#btnCancelCompletionDetail").attr('disabled', 'disabled');
}
function enableCompletionSection() {
    $('#selCompletionStatus').removeAttr('disabled');
    $('#uplCertificate').prop('disabled', false);
    $("#divUplCertification").removeAttr("style");
    $("#txtCompletionDate").removeAttr('disabled');
    $("#txtCompletionDate").removeClass("disabledInput");
    $("#WBSCode").removeClass("disabledInput");

    $('#btnSaveCompletionDetail').removeAttr('style');
    $("#btnSaveCompletionDetail").removeAttr('disabled');
    $('#btnCancelCompletionDetail').removeAttr('style');
    $("#btnCancelCompletionDetail").removeAttr('disabled');
}
function disableRequestSection() {
    //$('#selOfferingList').attr('disabled', 'disabled');
    $('#selTalentGroupList').attr('disabled', 'disabled');
    //$('#selCapabilityList').attr('disabled', 'disabled');
    $('#selCertificationList').attr('disabled', 'disabled');
    $('#uplApproval').prop('disabled', true);
    $('#divUplApproval').attr('style', 'background-color : #eee !important; border : 1px solid #eee !important;color: black !important;');
    $("#txtAnticipatedCompletionDate").attr('disabled', 'disabled');
    $("#txtAnticipatedCompletionDate").addClass("disabledInput");
    $(".sp-peoplepicker-editorInput").attr('disabled', 'disabled');
    $("span#peoplepicker_TopSpan_ResolvedList").attr('style','pointer-events:none;');
    $("#txtBusinessJustification").attr('disabled', 'disabled');

    $('#btnSaveRequestDetail').attr('style', 'background-color : #eee !important; border : 1px solid #eee !important;color: black !important;');
    $("#btnSaveRequestDetail").attr('disabled', 'disabled');
    //$('#btnCancelRequestDetail').attr('style', 'background-color : #eee !important; border : 1px solid #eee !important;color: black !important;');
    //$("#btnCancelRequestDetail").attr('disabled', 'disabled');
}
function enableRequestSection(isUpdateRequest) {
    if (isUpdateRequest == true) {
        $('#selCertificationList').prop('disabled', 'disabled');
    }
    else {
        $('#selCertificationList').removeAttr('disabled');
    }
    $('#uplApproval').prop('disabled', false);
    $("#divUplApproval").removeAttr("style");
    $("#txtAnticipatedCompletionDate").removeAttr('disabled');
    $("#txtAnticipatedCompletionDate").removeClass("disabledInput");

    $('#btnSaveRequestDetail').removeAttr('style');
    $("#btnSaveRequestDetail").removeAttr('disabled');
    $('#btnCancelRequestDetail').removeAttr('style');
    $("#btnCancelRequestDetail").removeAttr('disabled');
}

function limitTextOnKeyUpDown(limitField, limitNum) {
    //var limitField = $("#txtBusinessJustification");
    var limitCount = $("#pcountdown");

    if (limitField.value.length > limitNum) {
        limitField.value = limitField.value.substring(0, limitNum);
    } else {
        limitCount.text(limitNum - limitField.value.length + ' chars are left');
    }
}

function getOfferingsCertificationMaster() {
    var lstCertification = [];
    $.ajax({
        url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/_api/web/lists/getbytitle('Offerings Certification Master')" +
            "/items?$select=*,ID, Title, Offering_x0020_Alias, Talent_x0020_Group_x0020_Name, Talent_x0020_Group_x0020_Alias,Capability_x0020_Name, Capability_x0020_Alias,Certification_x0020_ID,Certification_x0020_Desc,Count,WBSCode&$filter=IsActive eq 1&$top=1000 ",
        contentType: "application/json;odata=verbose",
        type: 'GET',
        async: false,
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: function (data) {

            var objItems = data.d.results;

            for (i = 0; i < objItems.length; i++) {
                var itemCertification = {
                    ItemID: objItems[i].ID,
                    OfferingName: objItems[i].Title,
                    OfferingAlias: objItems[i].Offering_x0020_Alias,
                    TalentGroupName: objItems[i].Talent_x0020_Group_x0020_Name,
                    TalentGroupAlias: objItems[i].Talent_x0020_Group_x0020_Alias,
                    CapabilityName: objItems[i].Capability_x0020_Name,
                    CapabilityAlias: objItems[i].Capability_x0020_Alias,
                    CertificationID: objItems[i].Certification_x0020_ID,
                    CertificationDesc: objItems[i].Certification_x0020_Desc,
                    WBSCode: objItems[i].WBSCode
                }
                lstCertification.push(itemCertification);
            }
        }
    });
    return lstCertification;
}
function getCertificationRequestItems() {
    var loggedInUserID = _spPageContextInfo.userId;
    var lstCertificationRequest = null;

    return $.ajax({
        url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/_api/web/lists/getbytitle('Certification Requests')" +
            "/items?$select=*,ID,Certification_x0020_Title/ID,Certification_x0020_Title/Certification_x0020_Desc,Certification_x0020_Title/Certification_x0020_ID," +
            "Certification_x0020_Title/Offering_x0020_Alias,Certification_x0020_Title/Talent_x0020_Group_x0020_Alias," +
            "Certification_x0020_Title/Capability_x0020_Alias,Certification_x0020_Title/Count,Certification_x0020_Title/ID," +
            "Certification_x0020_Title/Approved,Requestor_x0020_Name%20/Title&$expand=Certification_x0020_Title/Certification_x0020_ID," +
            "Requestor_x0020_Name&$filter=Requestor_x0020_Name/Id eq '" + loggedInUserID + "'",
        contentType: "application/json;odata=verbose",
        type: 'GET',
        async: false,
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    });
}
function getCertificationRequest() {

    getCertificationRequestItems().done(function (data) {

        var objItems = data.d.results;
        lstCertificationRequest = [];
        $('#tblCertificationRequest tbody > tr').remove();

        for (i = 0; i < objItems.length; i++) {

            var itemCertificationReq = {
                RowId: objItems[i].ID,
                CertificationDesc: objItems[i].Certification_x0020_Title.Certification_x0020_Desc,
                CertificationID: objItems[i].Certification_x0020_Title.Certification_x0020_ID,
                CertificationItemID: objItems[i].Certification_x0020_Title.ID,
                OfferingAlias: objItems[i].Certification_x0020_Title.Offering_x0020_Alias,
                TalentGroupAlias: objItems[i].Certification_x0020_Title.Talent_x0020_Group_x0020_Alias,
                CapabilityAlias: objItems[i].Certification_x0020_Title.Capability_x0020_Alias,
                AnticipatedCompletionDate: objItems[i].Anticipated_x0020_Completion_x00 != null ? new Date(objItems[i].Anticipated_x0020_Completion_x00) : '',
                ApprovalStatus: objItems[i].Approval_x0020_Status,
                TGLApprovalStatus: objItems[i].TGL_x0020_Approval_x0020_Status,
                RequestDate: new Date(objItems[i].Created),
                CompletionStatus: objItems[i].Completion_x0020_status,
                CompletionDate: objItems[i].Completion_x0020_Date != null ? new Date(objItems[i].Completion_x0020_Date) : '',
                WBSCode: objItems[i].WBS_x0020_Code != null ? objItems[i].WBS_x0020_Code : 'Not Available',
                ApprovalEmail: objItems[i].Approval_x0020_Email != null ? objItems[i].Approval_x0020_Email : '',
                Certificate: objItems[i].Certificate != null ? objItems[i].Certificate : '',
                PMId: objItems[i].Project_x0020_ManagerId,
                BusinessJustification: objItems[i].Business_x0020_Justification != null ? objItems[i].Business_x0020_Justification : '',
            }

            itemCertificationReq.AnticipatedCompletionDate = (itemCertificationReq.AnticipatedCompletionDate.getMonth() + 1) + '/' + itemCertificationReq.AnticipatedCompletionDate.getDate() + '/' + itemCertificationReq.AnticipatedCompletionDate.getFullYear();
            itemCertificationReq.RequestDate = (itemCertificationReq.RequestDate.getMonth() + 1) + '/' + itemCertificationReq.RequestDate.getDate() + '/' + itemCertificationReq.RequestDate.getFullYear();
            if (itemCertificationReq.CompletionDate != '') {
                itemCertificationReq.CompletionDate = (itemCertificationReq.CompletionDate.getMonth() + 1) + '/' + itemCertificationReq.CompletionDate.getDate() + '/' + itemCertificationReq.CompletionDate.getFullYear();
            }
            if (itemCertificationReq.Certificate == '') {
                itemCertificationReq.WBSCode = '';
            }
            lstCertificationRequest.push(itemCertificationReq);

            $('#tblCertificationRequest tbody').append('<tr style="text-align:center;"><td style="padding:10px;">' +
                itemCertificationReq.CertificationDesc +
                '<input type="hidden" id="hdnOfferingAlias_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.OfferingAlias + '">' +
                '<input type="hidden" id="hdnTalentGroupAlias_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.TalentGroupAlias + '">' +
                '<input type="hidden" id="hdnCapabilityAlias_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.CapabilityAlias + '">' +
                '<input type="hidden" id="hdnCertificationItemID_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.CertificationItemID + '">' +
                '<input type="hidden" id="hdnAnticipatedCompletionDate_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.AnticipatedCompletionDate + '">' +
                '<input type="hidden" id="hdnApprovalStatus_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.ApprovalStatus + '">' +
                '<input type="hidden" id="hdnTGLApprovalStatus_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.TGLApprovalStatus + '">' +
                '<input type="hidden" id="hdnAnticipatedCompletionDate_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.AnticipatedCompletionDate + '">' +
                '<input type="hidden" id="hdnCompletionStatus_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.CompletionStatus + '">' +
                '<input type="hidden" id="hdnCompletionDate_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.CompletionDate + '">' +
                '<input type="hidden" id="hdnWBSCode_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.WBSCode + '">' +
                '<input type="hidden" id="hdnBusJus_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.BusinessJustification + '">' +
                '<input type="hidden" id="hdnPMId_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.PMId + '">' +
                '<input type="hidden" id="hdnApprovalEmail_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.ApprovalEmail + '">' +
                '<input type="hidden" id="hdnCertificate_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.Certificate + '">' +
                '</td><td style="padding:10px;">' + itemCertificationReq.RequestDate +
                '</td><td style="padding:10px;">' + itemCertificationReq.ApprovalStatus +
                '</td><td style="padding:10px;">' + itemCertificationReq.TGLApprovalStatus +
                '</td><td style="padding:10px;"><a class="btn btn-secondary btn-xs glyphicon glyphicon-share viewCertReq" href="https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/Pages/CertificationRequest.aspx?RequestId=' + itemCertificationReq.RowId + '" name = "' + itemCertificationReq.RowId + '" id = "view_' + itemCertificationReq.RowId + '" >View</a></td></tr>');
        }
    });
}

function getCertificationRequestItemById(itemID) {
    var lstCertificationRequest = null;

    return $.ajax({
        url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/_api/web/lists/getbytitle('Certification Requests')" +
            "/items?$select=*,ID,Certification_x0020_Title/ID,Certification_x0020_Title/Certification_x0020_Desc,Certification_x0020_Title/Certification_x0020_ID," +
            "Certification_x0020_Title/Offering_x0020_Alias,Certification_x0020_Title/Talent_x0020_Group_x0020_Alias," +
            "Certification_x0020_Title/Capability_x0020_Alias,Certification_x0020_Title/Count,Certification_x0020_Title/ID," +
            "Certification_x0020_Title/Approved,Requestor_x0020_Name%20/Title&$expand=Certification_x0020_Title/Certification_x0020_ID," +
            "Requestor_x0020_Name&$filter=ID eq '" + itemID + "'",
        contentType: "application/json;odata=verbose",
        type: 'GET',
        async: false,
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    });
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

function getCertificationRequestById(itemID) {

    var constApprovalStatusNone = 'NA';
    var constApprovalStatusPending = 'Pending';
    var constApprovalStatusApproved = 'Approved';
    var constApprovalStatusRejected = 'Rejected';

    getCertificationRequestItemById(itemID).done(function (data) {

        var objItems = data.d.results;
        lstCertificationRequest = [];
        $('#tblCertificationRequest tbody > tr').remove();

        for (i = 0; i < objItems.length; i++) {

            var itemCertificationReq = {
                RowId: objItems[i].ID,
                CertificationDesc: objItems[i].Certification_x0020_Title.Certification_x0020_Desc,
                CertificationID: objItems[i].Certification_x0020_Title.Certification_x0020_ID,
                CertificationItemID: objItems[i].Certification_x0020_Title.ID,
                OfferingAlias: objItems[i].Certification_x0020_Title.Offering_x0020_Alias,
                TalentGroupAlias: objItems[i].Certification_x0020_Title.Talent_x0020_Group_x0020_Alias,
                CapabilityAlias: objItems[i].Certification_x0020_Title.Capability_x0020_Alias,
                AnticipatedCompletionDate: objItems[i].Anticipated_x0020_Completion_x00 != null ? new Date(objItems[i].Anticipated_x0020_Completion_x00) : '',
                PMApprovalStatus: objItems[i].PM_x0020_Approval_x0020_Status,
                ApprovalStatus: objItems[i].Approval_x0020_Status,
                TGLApprovalStatus: objItems[i].TGL_x0020_Approval_x0020_Status,
                RequestDate: new Date(objItems[i].Created),
                CompletionStatus: objItems[i].Completion_x0020_status,
                CompletionDate: objItems[i].Completion_x0020_Date != null ? new Date(objItems[i].Completion_x0020_Date) : '',
                WBSCode: objItems[i].WBS_x0020_Code != null ? objItems[i].WBS_x0020_Code : 'Not Available',
                ApprovalEmail: objItems[i].Approval_x0020_Email != null ? objItems[i].Approval_x0020_Email : '',
                Certificate: objItems[i].Certificate != null ? objItems[i].Certificate : '',
                PMId: objItems[i].Project_x0020_ManagerId,
                BusinessJustification: objItems[i].Business_x0020_Justification != null ? objItems[i].Business_x0020_Justification : '',
            }

            itemCertificationReq.AnticipatedCompletionDate = (itemCertificationReq.AnticipatedCompletionDate.getMonth() + 1) + '/' + itemCertificationReq.AnticipatedCompletionDate.getDate() + '/' + itemCertificationReq.AnticipatedCompletionDate.getFullYear();
            itemCertificationReq.RequestDate = (itemCertificationReq.RequestDate.getMonth() + 1) + '/' + itemCertificationReq.RequestDate.getDate() + '/' + itemCertificationReq.RequestDate.getFullYear();
            if (itemCertificationReq.CompletionDate != '') {
                itemCertificationReq.CompletionDate = (itemCertificationReq.CompletionDate.getMonth() + 1) + '/' + itemCertificationReq.CompletionDate.getDate() + '/' + itemCertificationReq.CompletionDate.getFullYear();
            }

            if (itemCertificationReq.Certificate == '') {
                itemCertificationReq.WBSCode = '';
            }

            if (itemCertificationReq.ApprovalStatus == 'Approved' && itemCertificationReq.TGLApprovalStatus == 'Approved' && itemCertificationReq.WBSCode == 'Not Available') {

                $.ajax({
                    url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/_api/web/lists/getbytitle('Offerings Certification Master')" +
                        "/items?$select=*,ID, WBSCode&$filter=ID eq '" + itemCertificationReq.CertificationItemID + "'",
                    contentType: "application/json;odata=verbose",
                    type: 'GET',
                    async: false,
                    headers: {
                        "Accept": "application/json; odata=verbose"
                    },
                    success: function (offeringData) {

                        var objOfferingItems = offeringData.d.results;
                        if (objOfferingItems.length > 0) {

                            itemCertificationReq.WBSCode = objOfferingItems[0].WBSCode;
                        }
                    }
                });
            }
            lstCertificationRequest.push(itemCertificationReq);

            clearRequestDetail();
            clearCompletionDetail();

            var rowId = itemCertificationReq.RowId;
            var offeringAlias = itemCertificationReq.OfferingAlias;
            var talentGroupAlias = itemCertificationReq.TalentGroupAlias;
            var capabilityAlias = itemCertificationReq.CapabilityAlias;
            var certificationItemID = itemCertificationReq.CertificationItemID;
            var CertificationID = itemCertificationReq.CertificationID;
            var anticipatedCompletionDate = itemCertificationReq.AnticipatedCompletionDate;
            var pmApprovalStatus = itemCertificationReq.PMApprovalStatus;
            var approvalStatus = itemCertificationReq.ApprovalStatus;
            var tGLApprovalStatus = itemCertificationReq.TGLApprovalStatus;
            var completionStatus = itemCertificationReq.CompletionStatus;
            var completionDate = itemCertificationReq.CompletionDate;
            var approvalEmail = itemCertificationReq.ApprovalEmail;
            var certificate = itemCertificationReq.Certificate;
            var wbsCode = itemCertificationReq.WBSCode;
            var busJust = itemCertificationReq.BusinessJustification;
            var PMIdN = itemCertificationReq.PMId;

            if (talentGroupAlias != null)
                $("#selTalentGroupList").val(talentGroupAlias);

            var isUpdateRequest;
            if (CertificationID != null) {
                $("#selCertificationList").val(CertificationID);
                isUpdateRequest = true;
            }

            $('#txtAnticipatedCompletionDate').datepicker("setDate", anticipatedCompletionDate);
            $("#hdnApprovalStatus").val(approvalStatus);
            $("#hdnTGLApprovalStatus").val(tGLApprovalStatus);
            if (completionStatus != null)
                $("#selCompletionStatus").val(completionStatus);

            $('#txtCompletionDate').datepicker("setDate", completionDate);
            $("#hdnCertificationRequestRowId").val(rowId);

            $("#txtBusinessJustification").text(busJust);
            //var PMUserName = getUserInfo('peoplepicker', true);
            //setPeoplePicker("peoplepicker", PMIdN);

            if (GetUserbyId(PMIdN)) {
                setPeoplePicker("peoplepicker", GetUserbyId(PMIdN));
            }

            $("#uplCertificateName").attr('href', certificate);
            $("#uplCertificateName").attr('target', '_blank');
            $("#uplCertificateName").attr('rel', 'noopener noreferrer');
            $("#uplCertificateName").text(certificate.split('/').pop());

            if (wbsCode != null && wbsCode != undefined && wbsCode != '') {
                $("#WBSCode").text(wbsCode);
            }
            if (pmApprovalStatus != null && approvalStatus != null && (approvalStatus == constApprovalStatusNone || approvalStatus == constApprovalStatusPending) && (pmApprovalStatus == constApprovalStatusNone || pmApprovalStatus == constApprovalStatusPending)) {
                enableRequestSection(isUpdateRequest);
                disableCompletionSection();
            }
            else if (pmApprovalStatus != null && approvalStatus != null && tGLApprovalStatus != null && (approvalStatus == constApprovalStatusApproved && tGLApprovalStatus == constApprovalStatusApproved && pmApprovalStatus == constApprovalStatusApproved)) {
                disableRequestSection();
                //enableCompletionSection();
            }
            else {
                disableRequestSection();
                disableCompletionSection();
            }

            $("#divRequestDetail").removeClass("display-none");
            // $("#divCompletionDetail").removeClass("display-none");
        }
    });
}

function validateCompletionDetail() {

    var constApprovalStatusApproved = 'Approved';
    var constCompletionStatusCompleted = 'Completed';
    var isError = false;

    if ($('#selCompletionStatus').val() == 0) {
        //$("#selCompletionStatus").addClass("error");
        $("#lblCompletionStatus").addClass("error-label");
        isError = true;
    }
    if ($('#selCompletionStatus').val() == constCompletionStatusCompleted && $('#txtCompletionDate').val() == '') {
        // $("#txtCompletionDate").addClass("error");
        $("#lblCompletionDate").addClass("error-label");
        isError = true;
    }
    if ($('#uplCertificateName').attr('href') == undefined || $('#uplCertificateName').attr('href') == '' || $('#uplCertificateName').attr('href') == '#') {
        var uploadedfile = $('#uplCertificate').val();
        if (uploadedfile.length <= 0) {
            //  $("#divUplCertification").addClass("error");
            $("#lblCertificate").addClass("error-label");
            isError = true;
        }
    }
    if (isError == true) {
        //$("#errorCompletionDetail").text("*Please enter all mandatory fields.");
        bootbox.alert("Please enter the mandatory fields.");
        return false;
    }
    else {
        $("#errorCompletionDetail").text("");
        return true;
    }
}
function validateRequestDetail() {

    var constApprovalStatusApproved = 'Approved';
    var constCompletionStatusCompleted = 'Completed';
    var isError = false;

    if ($('#selTalentGroupList').val() == 0) {
        // $("#selTalentGroupList").addClass("error");
        $("#lblTalentGroupList").addClass("error-label");
        isError = true;
    }
    if ($('#selCertificationList').val() == 0) {
        // $("#selCertificationList").addClass("error");
        $("#lblCertificationList").addClass("error-label");
        isError = true;
    }
    if ($('#txtAnticipatedCompletionDate').val() == '') {
        //$("#txtAnticipatedCompletionDate").addClass("error");
        $("#lblAnticipatedCompletionDate").addClass("error-label");
        isError = true;
    }
    if (getUserInfo('peoplepicker') == '') {
        //$("#txtAnticipatedCompletionDate").addClass("error");
        $("#lblPMName").addClass("error-label");
        isError = true;
    }
    if ($('#txtBusinessJustification').val() == '' || $('#txtBusinessJustification').val().length < 100) {
        //$("#txtAnticipatedCompletionDate").addClass("error");
        $("#lblBussJus").addClass("error-label");
        isError = true;
    }

    if (isError == true) {
        bootbox.alert("Please review the mandatory fields.");
        return false;
    }
    else {
        $("#errorRequestDetail").text("");
        return true;
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
            /*$('#txtLevel').text(users[0].AutoFillSubDisplayText);
            $('#txtEmail').text(users[0].EntityData.Email);*/
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
                    /*$('#ddlLocation').text(data.d.UserProfileProperties.results.filter(x => x.Key === 'Office')[0].Value);
                    $('#txtDepartment').text(data.d.UserProfileProperties.results.filter(x => x.Key === 'Department')[0].Value);*/
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

function getCertificationTitleId(certificationId) {
    var lstCertificationMaster = [];
    lstCertificationMaster = getOfferingsCertificationMaster();

    for (i = 0; i < lstCertificationMaster.length; i++) {
        if (lstCertificationMaster[i].CertificationID == certificationId &&
            lstCertificationMaster[i].TalentGroupAlias == $("#selTalentGroupList").val()) {
            return lstCertificationMaster[i].ItemID;
        }
    }
    return 0;
}

function createCertificationRequest() {
    var webUrl = "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals";
    var loggedInUserID = _spPageContextInfo.userId;
    var todayDate = new Date();
    var anticipatedDateArray = ($("#txtAnticipatedCompletionDate").val()).split('/');
    var anticipatedCompletionDate = new Date(anticipatedDateArray[2], anticipatedDateArray[0] - 1, anticipatedDateArray[1]);// year,month ,day
    var approvalEmail = '';
    var completionStatus = 'Not Started';
    var completionDate = null;
    var wbsCode = '';
    var PMName = getUserInfo('peoplepicker');
    var busJus = $("#txtBusinessJustification").val();
    var approvalStatus = $("#hdnApprovalStatus").val();
    var tGLApprovalStatus = $("#hdnTGLApprovalStatus").val();

    var certificationId = $("#selCertificationList").val();
    var certificationTitleId = getCertificationTitleId(certificationId);
    var certificate = '';

    $.ajax({
        async: false,
        url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/_api/web/lists/getbytitle('Certification Requests')/Items",
        method: "POST", //Specifies the operation to create the list item  
        data: JSON.stringify({
            '__metadata': { 'type': 'SP.Data.Certification_x0020_RequestsListItem' },
            'Title': '',
            'Requestor_x0020_NameId': loggedInUserID,
            'Anticipated_x0020_Completion_x00': anticipatedCompletionDate.toISOString(),
            'Approval_x0020_Email': approvalEmail,
            'Completion_x0020_status': completionStatus,
            'Completion_x0020_Date': completionDate,
            'Approval_x0020_Status': approvalStatus,
            'Certification_x0020_TitleId': certificationTitleId,
            'TGL_x0020_Approval_x0020_Status': tGLApprovalStatus,
            'Business_x0020_Justification': busJus,
            'Project_x0020_ManagerId': PMName,
            'Certificate': certificate,
            'AuthorId': loggedInUserID,
            'EditorId': loggedInUserID,
            'Modified': todayDate.toISOString(),
            'Created': todayDate.toISOString()
        }),
        headers: {
            "accept": "application/json;odata=verbose", //It defines the Data format   
            "content-type": "application/json;odata=verbose", //It defines the content type as JSON  
            "X-RequestDigest": $("#__REQUESTDIGEST").val() //It gets the digest value   
        },
        success: function (data) {
            getCertificationRequest();
            console.log("successfully inserted");
            console.log(data);
        },
        error: function (error) {
            console.log(error);
            console.log("insert failure");
        }
    })
}
function updateCertificationRequest() {
    var webUrl = "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals";
    var loggedInUserID = _spPageContextInfo.userId;
    var todayDate = new Date();
    var anticipatedDateArray = ($("#txtAnticipatedCompletionDate").val()).split('/');
    var anticipatedCompletionDate = new Date(anticipatedDateArray[2], anticipatedDateArray[0] - 1, anticipatedDateArray[1]);
    var approvalEmail = '';

    var certificationTitleId = $("#selCertificationList").val();
    var rowId = $("#hdnCertificationRequestRowId").val();

    var busJus = $("#txtBusinessJustification").val();

    var loggedInUserID = _spPageContextInfo.userId;
    var todayDate = new Date();

    $.ajax({
        async: false,
        url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/_api/web/lists/getbytitle('Certification Requests')/items(" + rowId + ")",
        method: "POST", //Specifies the operation to create the list item
        data: JSON.stringify({
            '__metadata': { 'type': 'SP.Data.Certification_x0020_RequestsListItem' },
            'Title': '',
            'Requestor_x0020_NameId': loggedInUserID,
            'Anticipated_x0020_Completion_x00': anticipatedCompletionDate.toISOString(),
            'Approval_x0020_Email': approvalEmail,
            //'Certification_x0020_TitleId': certificationTitleId,
            'Business_x0020_Justification': busJus,
            'EditorId': loggedInUserID,
            'Modified': todayDate.toISOString()

        }),
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json; odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "If-Match": "*"
        },
        success: function (data) {

        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    })
}

function updateCompletionDetails() {
    var webUrl = "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals";
    var loggedInUserID = _spPageContextInfo.userId;
    var todayDate = new Date();
    var completionStatus = $("#selCompletionStatus").val();
    var completionDateArray = ($("#txtCompletionDate").val()).split('/');
    var completionDate = new Date(completionDateArray[2], completionDateArray[0] - 1, completionDateArray[1]);
    var wbsCode = '';//$("#WBSCodeId").val();
    var rowId = $("#hdnCertificationRequestRowId").val();

    var loggedInUserID = _spPageContextInfo.userId;
    var todayDate = new Date();

    var fileName = "Certificate_" + loggedInUserID + "_" + rowId + "_" + completionDateArray[2] + (completionDateArray[0] - 1) + completionDateArray[1];
    var fileExtension = $("#uplCertificate").val().split('.').pop();
    var uploadFileName = fileName + "." + fileExtension;
    var certificate = webUrl + "/Shared Documents/CertificateDocuments/" + uploadFileName;

    $.ajax({
        async: false,
        url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/_api/web/lists/getbytitle('Certification Requests')/items(" + rowId + ")",
        method: "POST", //Specifies the operation to create the list item
        data: JSON.stringify({
            '__metadata': { 'type': 'SP.Data.Certification_x0020_RequestsListItem' },
            'Requestor_x0020_NameId': loggedInUserID,
            'Completion_x0020_status': completionStatus,
            'Completion_x0020_Date': completionDate.toISOString(),
            'Certificate': certificate,
            'EditorId': loggedInUserID,
            'Modified': todayDate.toISOString()
        }),
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json; odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "If-Match": "*"
        },
        success: function (data) {

        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    })

    uploadFiles("#uplCertificate", "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals", "Documents", "CertificateDocuments", uploadFileName);
}

function clearPeoplePicker(pickerId) {
    var ppobject = SPClientPeoplePicker.SPClientPeoplePickerDict[pickerId + "_TopSpan"]
    var usersobject = ppobject.GetAllUserInfo();
    usersobject.forEach(function (index) {
        ppobject.DeleteProcessedUser(usersobject[index]);
    });
}

$(function () {    
    var result = new Date();
    result.setDate(result. getDate() + 90);

    $("#txtAnticipatedCompletionDate").datepicker({
        minDate: 0,
        maxDate: result,
        buttonImage: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/SiteAssets/img/calendar_icon.png",
        buttonImageOnly: true,

    });
    $("#txtCompletionDate").datepicker({
        defaultDate: 0,
        maxDate: 0,
        buttonImage: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/CBOCertification/SiteAssets/img/calendar_icon.png",
        buttonImageOnly: true,
    });

    //Project Manager Picker
    initializePeoplePicker('peoplepicker', false, 'People Only', 0);

    getCertificationRequest();
});

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

var userOffering = "";

$(document).ready(function () {

    //DOL Footer issue

    $('hr').remove();
    var footerHtml = $('footer').html()
    $('.dol-footer').removeAttr('style').html("<div class='row'>" + footerHtml + "</div>")
    $('footer').remove();

    // End

    //help info for business justification

    $('[data-helpinfo]').click(function (e) {
        var $ele = $(e.target);
        var messages = [];
        var code = $ele.data('helpinfo');

        switch (code) {
            case "PM": messages.push("PM/Coach Name");
                messages.push("Provide your Project Manager's name. If on bench, provide your Coach's name");
                break;
            case "Business Justification": messages.push("Business Case Justification");
                messages.push("Mention the project name & your role on this project");
                messages.push("Briefly describe the certification and how will the certification add value");
                break;
            case "Offering Learning Champions": messages.push("Offering Learning Champions");
                /*
                Application Modernization & Innovation: Kulshrestha, Jitin Prakash jkulshrestha@deloitte.com
                Cloud Engineering: Mistry, Jigneshkumar jimistry@deloitte.com
                Operations Transformation: Barton, Tyrone tybarton@deloitte.com
                Core Industry Solutions: Sharma, Deepika deepisharma@deloitte.com
                Core Technology Operations: Singhal, Sumit X sumisinghal@deloitte.com
                */
                messages.push("<span style='font-weight:bold'>Application Modernization & Innovation:</span> Kulshrestha, Jitin Prakash jkulshrestha@deloitte.com");
                messages.push("<span style='font-weight:bold'>Cloud Engineering:</span> Mistry, Jigneshkumar jimistry@deloitte.com");
                messages.push("<span style='font-weight:bold'>Operations Transformation:</span> Barton, Tyrone tybarton@deloitte.com");
                messages.push("<span style='font-weight:bold'>Core Industry Solutions:</span> Sharma, Deepika deepisharma@deloitte.com");
                messages.push("<span style='font-weight:bold'>Core Technology Operations:</span> Singhal, Sumit X sumisinghal@deloitte.com");
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

    // End

    var lstCertificationMaster = [];
    var constApprovalStatusNone = 'NA';
    var constApprovalStatusPending = 'Pending';
    var constApprovalStatusApproved = 'Approved';
    var constApprovalStatusRejected = 'Rejected';

    lstCertificationMaster = getOfferingsCertificationMaster();

    if (lstCertificationMaster == undefined) {
        lstCertificationMaster = [];
        lstCertificationMaster = getOfferingsCertificationMaster();
    }

    //Certifications    
    $("#selCertificationList").empty();
    $('#selCertificationList').append('<option value="0"> Select the certification </option>');

    userOffering = "";
    loadLoggedInUserDetails().done(function (data) {
        try {
            $("#practitionerName").val(data.d.DisplayName);
            $("#practitionerEmailId").val(data.d.Email);
            $("#practitionerLevel").val(data.d.Title);

            var department = "";
            $.each(data.d.UserProfileProperties.results, function (idx, val) {
                if (val.Key == "Department") {
                    department = val.Value;
                    return false;
                }
            });
            console.log(department);

            var departmentSplit = department.split(' ');
            var offering = $.trim(departmentSplit[0]);

            if (offering == "GPS") {
                offering = $.trim(departmentSplit[1]).toUpperCase();
            }

            switch (offering) {
                case "CLOUDENG":
                    offering = "Cloud Engineering";
                    break;
                case "OPSTRANS":
                    offering = "Operations Transformation";
                    break;
                case "CIS":
                    offering = "Core Industry Solutions";
                    break;
                case "CH":
                    offering = "Core Industry Solutions";
                    break;
                case "AMI":
                    offering = "Application Modernization Innovation";
                    break;
                case "SE":
                    offering = "Application Modernization Innovation";
                    break;
                case "SYSENG":
                    offering = "Application Modernization Innovation";
                    break;
                case "CNVG":
                    offering = "Core Industry Solutions";
                    break;
                case "CORE":
                    offering = "Core Technology Operations";
                    break;
                case "CR":
                    offering = "Core Technology Operations";
                    break;
                case "CE":
                    offering = "Cloud Engineering";
                    break;
                case "HASHEDIN":
                    offering = "Cloud Engineering";
                    break;
                case "OPS":
                    offering = "Operations Transformation";
                    break;
                default:
                    if (departmentSplit.length == 3 && offering == "C" && $.trim(departmentSplit[1]).toUpperCase() == "IND" && $.trim(departmentSplit[2]).toUpperCase() == "SO") {
                        offering = "Core Industry Solutions";
                    }
                    break;
                /*
                GPS CLO USDC CMS PHX 
                GPS USI CBO AMI MUM
                */
            }
            if (department.toUpperCase().includes("CH CONS USI") || department.toUpperCase().includes("CH MINER")) {
                offering = "Core Industry Solutions";
            }
            else if (department.toUpperCase().includes("AMI")) {
                offering = "Application Modernization Innovation";
            }
            else if (department.toUpperCase().includes("CLOUDENG")) {
                offering = "Cloud Engineering";
            }
            else if (department.toUpperCase().includes("OPSTRANS")) {
                offering = "Operations Transformation";
            }
            else if (department.toUpperCase().includes("CIS")) {
                offering = "Core Industry Solutions";
            }
            else if (department.toUpperCase().includes("CTO")) {
                offering = "Core Technology Operations";
            }
			else if (department.toUpperCase().includes("ISI CONS")) {
                offering = "Learning And Development";
            }

            //Updating logged in user offering            
            $("#Offering").val(offering);

        }
        catch (err2) {
            alert(JSON.stringify(err2));
        }
        finally {
            userOffering = offering;
        }
    });

    lstCertificationMaster.forEach(function (cert) {
        if (cert.OfferingName == userOffering) {
            $('#selCertificationList').append('<option value="' + cert.CertificationID + '">' + cert.CertificationDesc + '</option>');
        }
    })

    var sel = $('#selCertificationList');
    var selected = sel.val(); // cache selected value, before reordering
    var opts_list = sel.find('option');
    opts_list.sort(function (a, b) { return $(a).text() > $(b).text() ? 1 : -1; });
    sel.html('').append(opts_list);
    sel.val(selected); // set cached selected value    

    //TalentGroups
    $("#selTalentGroupList").empty();
    $('#selTalentGroupList').append('<option value="0"> Select the certification </option>');

    lstCertificationMaster.forEach(function (cert) {
        $('#selTalentGroupList').append('<option value="' + cert.TalentGroupAlias + '">' + cert.TalentGroupName + '</option>');
    }
    );

    //Remove duplicate cert names
    var map = {};
    $('#selCertificationList option').each(function () {
        if (map[this.value]) {
            $(this).remove()
        }
        map[this.value] = true;
    });

    //Remove duplicate TG names
    var map = {};
    $('#selTalentGroupList option').each(function () {
        if (map[this.value]) {
            $(this).remove()
        }
        map[this.value] = true;
    });

    var lstCertificationRequestList = [];
    lstCertificationRequestList = getCertificationRequest();

    var queryStrings = getUrlVars();
    if (queryStrings != null && queryStrings["RequestId"] != null && queryStrings["RequestId"] != undefined) {
        //Update functionality will go here
        var requestItemId = getUrlVars()["RequestId"];
        getCertificationRequestById(requestItemId)
    }
    else {
        //Add functionality will go here
        // #region [Create Request functionality As Is]
        clearRequestDetail();
        clearCompletionDetail();

        if (lstCertificationMaster == undefined) {
            lstCertificationMaster = [];
            lstCertificationMaster = getOfferingsCertificationMaster();
        }
        //getAllOfferings();
        enableRequestSection();
        disableCompletionSection();

        $('#hdnApprovalStatus').val(constApprovalStatusPending);
        $('#hdnTGLApprovalStatus').val(constApprovalStatusPending);
        //----------------------------------
        $("#divRequestDetail").removeClass("display-none");
        //$("#divCompletionDetail").removeClass("display-none");
        // #endregion
    }

    $("#selCertificationList").change(function () {
        var certSelected = $("#selCertificationList").val();
        //var offeringSelected = $("#Offering").val();
        var offeringSelected = userOffering;

        if (lstCertificationMaster == undefined) {
            lstCertificationMaster = [];
            lstCertificationMaster = getOfferingsCertificationMaster();
        }

        $("#selTalentGroupList").empty();
        $('#selTalentGroupList').append('<option value="0"> Select the certification </option>');

		console.log("Cert selected : " + certSelected);
		console.log("offering selected : " + offeringSelected);
		
        var objTalentGroups = [];
        for (j = 0; j < lstCertificationMaster.length; j++) {
            if (lstCertificationMaster[j].CertificationID == certSelected && lstCertificationMaster[j].OfferingName == offeringSelected) {

                if (objTalentGroups.filter(e => e.TalentGroupName == lstCertificationMaster[j].TalentGroupName).length <= 0) {
                    var newTalent = { TalentGroupName: lstCertificationMaster[j].TalentGroupName, TalentGroupAlias: lstCertificationMaster[j].TalentGroupAlias };
                    objTalentGroups.push(newTalent);
                }
            }
        }
        objTalentGroups.forEach(function (talent) {
            $('#selTalentGroupList').append('<option value="' + talent.TalentGroupAlias + '">' + talent.TalentGroupName + '</option>');
        });

        if (objTalentGroups.length > 1) {
            $('#selTalentGroupList').prop('disabled', '');
            $('#selTalentGroupList').removeClass('readOnlySelect');
        }
        else {
            $('#selTalentGroupList').prop('disabled', 'disabled');
            $('#selTalentGroupList').addClass('readOnlySelect');
            for (i = 0; i < lstCertificationMaster.length; i++) {
                if (lstCertificationMaster[i].CertificationID == certSelected) {
                    $('[id=selTalentGroupList] option').filter(function () {
                        return ($(this).text() == lstCertificationMaster[i].TalentGroupName); //To select TG
                    }).prop('selected', true);
                    break;
                }
            }
        }
    });

    $("#btnCreateNewRequest").click(function () {
        clearRequestDetail();
        clearCompletionDetail();

        if (lstCertificationMaster == undefined) {
            lstCertificationMaster = [];
            lstCertificationMaster = getOfferingsCertificationMaster();
        }
        //getAllOfferings();

        enableRequestSection();
        disableCompletionSection();

        $('#hdnApprovalStatus').val(constApprovalStatusPending);
        $('#hdnTGLApprovalStatus').val(constApprovalStatusNone);
        //----------------------------------
        //$("#divCertification").show();
        $("#divRequestDetail").removeClass("display-none");
        //$("#divCompletionDetail").removeClass("display-none");


    });
    $("#btnSaveRequestDetail").click(function () {
        if (validateRequestDetail()) {
            if ($("#hdnCertificationRequestRowId").val() == 0) {
                createCertificationRequest();
            }
            else if ($("#hdnCertificationRequestRowId").val() > 0) {
                updateCertificationRequest();
            }
            bootbox.alert("Certification Request details submitted successfully.", function () {
                clearRequestDetail();
                clearCompletionDetail();

                $("#divRequestDetail").addClass("display-none");
                $("#divCompletionDetail").addClass("display-none");
                window.location.href = "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/Pages/Dashboard.aspx?team=0";
            });
        }
    });
    $("#btnCancelRequestDetail").click(function () {
        clearRequestDetail();
        clearCompletionDetail();

        $("#divRequestDetail").addClass("display-none");
        $("#divCompletionDetail").addClass("display-none");

        window.location.href = "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/Pages/Dashboard.aspx?team=0";
    });
    $("#btnCancelCompletionDetail").click(function () {
        clearRequestDetail();
        clearCompletionDetail();

        $("#divRequestDetail").addClass("display-none");
        $("#divCompletionDetail").addClass("display-none");

        window.location.href = "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/Pages/Dashboard.aspx?team=0";
    });
    $("#btnSaveCompletionDetail").click(function () {
        if (validateCompletionDetail()) {
            if ($("#hdnCertificationRequestRowId").val() > 0) {
                updateCompletionDetails();
            }

            bootbox.alert("Certification Completion details submitted successfully.", function () {
                clearRequestDetail();
                clearCompletionDetail();
                $("#divRequestDetail").addClass("display-none");
                $("#divCompletionDetail").addClass("display-none");
                window.location.href = "https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/Pages/Dashboard.aspx?team=0";
            });
        }
    });

    $('#txtAnticipatedCompletionDate').on('change', function () {
        if ($('#txtAnticipatedCompletionDate').val() != "") {
            if ($('#lblAnticipatedCompletionDate').hasClass('error-label')) {
                $('#lblAnticipatedCompletionDate').removeClass('error-label');
            }
        }
    });
    $('#txtBusinessJustification').on('keypress', function () {
        if ($('#txtBusinessJustification').val() != "" && ('#txtBusinessJustification').val().length >= 100) {
            if ($('#lblBussJus').hasClass('error-label')) {
                $('#lblBussJus').removeClass('error-label');
            }
        }
    });
    $('#peoplepicker').on('change', function () {
        if ($('#peoplepicker_TopSpan_HiddenInput').val() != "") {
            if ($('#lblPMName').hasClass('error-label')) {
                $('#lblPMName').removeClass('error-label');
            }
        }
    });

    $('#selCompletionStatus').on('change', function () {
        if ($('#selCompletionStatus').val() != "0") {
            if ($('#lblCompletionStatus').hasClass('error-label')) {
                $('#lblCompletionStatus').removeClass('error-label');
            }
        }
    });
    $('#txtCompletionDate').on('change', function () {
        if ($('#txtCompletionDate').val() != "") {
            if ($('#lblCompletionDate').hasClass('error-label')) {
                $('#lblCompletionDate').removeClass('error-label');
            }
        }
    });
    $("#uplCertificate").change(function () {
        $("#uplCertificateName").removeAttr("href");
        $("#uplCertificateName").text('');
        var uploadedfile = $('#uplCertificate').val();
        if (uploadedfile.length > 0) {
            var fileExtension = ['pdf'];
            if ($.inArray(uploadedfile.split('.').pop().toLowerCase(), fileExtension) == -1) {
                $("#uplCertificateName").text("Only pdf format is allowed.");
                this.value = ''; // Clean field
                return false;
            }
            else {
                $("#lblCertificate").removeClass("error-label");
                var file = $('#uplCertificate')[0].files[0].name;
                $("#uplCertificateName").text(file);
            }
        }
    });
    view_certification_request = function (ele) {
        clearRequestDetail();
        clearCompletionDetail();

        var rowId = $(ele).attr('name');
        var offeringAlias = $("#hdnOfferingAlias_" + rowId).val();
        var talentGroupAlias = $("#hdnTalentGroupAlias_" + rowId).val();
        var capabilityAlias = $("#hdnCapabilityAlias_" + rowId).val();
        var certificationItemID = $("#hdnCertificationItemID_" + rowId).val();
        var anticipatedCompletionDate = $("#hdnAnticipatedCompletionDate_" + rowId).val();
        var approvalStatus = $("#hdnApprovalStatus_" + rowId).val();
        var tGLApprovalStatus = $("#hdnTGLApprovalStatus_" + rowId).val();
        var completionStatus = $("#hdnCompletionStatus_" + rowId).val();
        var completionDate = $("#hdnCompletionDate_" + rowId).val();
        var approvalEmail = $("#hdnApprovalEmail_" + rowId).val();
        var certificate = $("#hdnCertificate_" + rowId).val();
        var wbsCode = $("#hdnWBSCode_" + rowId).val();


        //getAllTalentGroupForSelectedOffering();
        if (talentGroupAlias != null)
            $("#selTalentGroupList").val(talentGroupAlias);


        var isUpdateRequest;
        if (certificationItemID != null) {
            $("#selCertificationList").val(certificationItemID);
            isUpdateRequest = true;
        }

        $('#txtAnticipatedCompletionDate').datepicker("setDate", anticipatedCompletionDate);
        $("#hdnApprovalStatus").val(approvalStatus);
        $("#hdnTGLApprovalStatus").val(tGLApprovalStatus);
        if (completionStatus != null)
            $("#selCompletionStatus").val(completionStatus);

        $('#txtCompletionDate').datepicker("setDate", completionDate);
        $("#hdnCertificationRequestRowId").val(rowId);

        $("#uplCertificateName").attr('href', certificate);
        $("#uplCertificateName").attr('target', '_blank');
        $("#uplCertificateName").attr('rel', 'noopener noreferrer');
        $("#uplCertificateName").text(certificate.split('/').pop());

        if (wbsCode != null && wbsCode != undefined && wbsCode != '') {
            $("#WBSCode").text(wbsCode);
        }
        if (approvalStatus == constApprovalStatusNone || approvalStatus == constApprovalStatusPending) {
            enableRequestSection(isUpdateRequest);
            disableCompletionSection();
        }
        else if (approvalStatus == constApprovalStatusApproved && tGLApprovalStatus == constApprovalStatusApproved) {
            disableRequestSection();
            enableCompletionSection();
        }
        else {
            disableRequestSection();
            disableCompletionSection();
        }

        $("#divRequestDetail").removeClass("display-none");
    };
});
