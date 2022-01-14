$('.loading').show();
$(document).ready(function () {
    $('hr').remove();
    var footerHtml = $('footer').html()
    $('.dol-footer').removeAttr('style').html("<div class='row'>" + footerHtml + "</div>")
    $('footer').remove();
})

var jsFilePaths = [
    "https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js",
    "https://cdn.datatables.net/buttons/1.5.6/js/dataTables.buttons.min.js",
    "https://cdn.datatables.net/buttons/1.5.6/js/buttons.html5.min.js",
    "../SiteAssets/js/libs/dataTables.checkboxes.min.js"

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
var ProjectRefusalPortalUrl = "https://americas.internal.deloitteonline.com/sites/VisaInitiation";
var currentUserId = 0;
var isAdminAccess = false;
var myChart = null;
var skillChart1 = null;
var offeringChart1 = null;
var userRolesOffering = [];

var trackVisaQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('VisaRequests')/items?$select=*,practitionerDetails0/Title,practitionerDetails0/EMail,practitionerDetails0/JobTitle,offeringLeadDetails/EMail,TalentGroupLeader/EMail&$expand=practitionerDetails0/Id,offeringLeadDetails/Id,TalentGroupLeader/Id";
function pendingVisaRequests() {
    if (isAdminTemplate) {
        //Approver
        var adminFilters = [];
        $(userApprovalFor).each(function (idx, val) {
            var pendingRole = val.role;
            if (pendingRole != "RMSP") {
                switch (pendingRole) {
                    case "RM":
                        adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "' and Offering eq '" + val.offering + "' and (resourceManagerDetails/Id eq '" + currentUserId + "'))");
                        break;
                    case "TGL":
                        adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "' and Offering eq '" + val.offering + "' and (TalentGroupLeader/Id eq '" + currentUserId + "'))");
                        break;
                    case "OL":
                        adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "' and Offering eq '" + val.offering + "' and (offeringLeadDetails/Id eq '" + currentUserId + "'))");
                        break;
                    case "OPL":
                        adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "' and Offering eq '" + val.offering + "' and (PortfolioLead/Id eq '" + currentUserId + "'))");
                        break;
                }
            }
            else if (pendingRole == "RMSP") {
                pendingRole = "RM";
                adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "' and Offering eq '" + val.offering + "')");
            }
            if (adminFilters.length == 0) {
                adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "')");
            }
        });

        adminFilters = adminFilters.filter(function (item, pos) { //Removing duplicate roles
            return adminFilters.indexOf(item) == pos;
        })

        trackVisaQueryDataUrl = trackVisaQueryDataUrl + "&$filter=((" + adminFilters.join(" or ") + ") and (Title ne 'Draft'  )) ";
    }
    else {
        //Normal Employee        
        var filterCond = [];
        filterCond.push("practitionerDetails0/EMail eq '" + currentLoggedInUserEmail + "'");
        trackVisaQueryDataUrl = trackVisaQueryDataUrl + "&$filter=(practitionerDetails0/EMail eq '" + currentLoggedInUserEmail + "')"
    }

    // loadListItems({
    //     url: trackQueryDataUrl,
    //     success: ViewingVisaQuerySuccessHandler
    // });
};

function pendingRequests() {
    var trckQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('Transfer Requests')/items?$select=*,practitionerDetails/Title,practitionerDetails/EMail,practitionerDetails/JobTitle,offeringLeadDetails/EMail,TalentGroupLead/EMail,newProjectSnrMangerDetails/EMail&$expand=practitionerDetails/Id,offeringLeadDetails/Id,TalentGroupLead/Id,newProjectSnrMangerDetails/Id";

    if (isAdminTemplate) {
        //Approver
        var adminFilters = [];
        $(userApprovalFor).each(function (idx, val) {
            var pendingRole = val.role;
            if (pendingRole != "TLA") {
                switch (pendingRole) {
                    case "TL":
                        adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "' and Offering eq '" + val.offering + "' and talentTeamPersonDetails/Id eq '" + currentUserId + "')")
                        break;
                    case "TGL":
                        adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "' and Offering eq '" + val.offering + "' and TalentGroupLead/Id eq '" + currentUserId + "')")
                        adminFilters.push("(Pending_x0020_With eq 'NTGL' and  TransferTo eq '" + val.offering + "' and transferType eq 'Inter Offering' and New_x0020_Talent_x0020_Group_x00/Id eq '" + currentUserId + "')");
                        break;
                    case "OL":
                        adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "' and Offering eq '" + val.offering + "' and offeringLeadDetails/Id eq '" + currentUserId + "')")
                        adminFilters.push("(Pending_x0020_With eq 'NOL' and  TransferTo eq '" + val.offering + "' and transferType eq 'Inter Offering' and New_x0020_Offering_x0020_Lead/Id eq '" + currentUserId + "')");
                        break;
                    case "OPL":
                        adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "' and Offering eq '" + val.offering + "' and PortfolioLead/Id eq '" + currentUserId + "')")
                        break;
                }
            }
            else if (pendingRole == "TLA") {
                pendingRole = "TL";
                adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "' and Offering eq '" + val.offering + "')");
            }
            if (adminFilters.length == 0) {
                adminFilters.push("(Pending_x0020_With eq '" + pendingRole + "')");
            }
        });

        adminFilters = adminFilters.filter(function (item, pos) { //Removing duplicate roles
            return adminFilters.indexOf(item) == pos;
        })

        trckQueryDataUrl = trckQueryDataUrl + "&$filter=((" + adminFilters.join(" or ") + ") and (Title ne 'Draft'  )) ";
    }
    else {
        //Normal Employee        
        var filterCond = [];
        filterCond.push("practitionerDetails/EMail eq '" + currentLoggedInUserEmail + "'");
        trckQueryDataUrl = trckQueryDataUrl + "&$filter=(practitionerDetails/EMail eq '" + currentLoggedInUserEmail + "')"
    }

    // loadListItems({
    //     url: trckQueryDataUrl,
    //     success: ViewingQuerySuccessHandler
    // });
    loadListItems({
        url: trckQueryDataUrl,
        success: function (transferdata) {
            var totalData = [];
            loadListItems({
                url: trackVisaQueryDataUrl,
                success: function (visadata) {
                    $(transferdata).each(function (idx, val) {
                        var tempData = val;
                        tempData.RequestCategory = "Transfer";
                        tempData.TypeOfRequest = val.transferType;
                        tempData.practitionerDetails0 = {};
                        tempData.practitionerDetails0.Title = val.practitionerDetails.Title;
                        tempData.practitionerDetails0.JobTitle = val.practitionerDetails.JobTitle;
                        tempData.ExceptionFlag = null;
                        totalData.push(tempData);
                    });
                    $(visadata).each(function (idx, val) {
                        var tempData = val;
                        tempData.RequestCategory = "Visa";
                        tempData.transferFromAndTo = "";
                        totalData.push(tempData);
                    });
                    ViewingVisaQuerySuccessHandler(totalData);
                }
            });
        }
    });
}

//SDEB Project Refusal Code Start

function filterRefusalListBasedOnRole(RefusalListDetails) {
    var statusCodesForUserRoles = [];
    var hasRMRoleForMyDashboard = false;
    if (isAdminTemplate) {
        //Approval Dashboard

        $(userRolesOffering).each(function (idx, val) {
            var pendingRole = val.role;
            switch (pendingRole) {
                case "TL":
                    //Or TBA Role
                    statusCodesForUserRoles.push('TBA');
                    break;
                case "ES":
                    statusCodesForUserRoles.push('RES');
                    break;
            }
        });
    }
    else {
        //My Dashboard
        $(userRolesOffering).each(function (idx, val) {
            var pendingRole = val.role;
            switch (pendingRole) {
                case "TL":
                    //Or TBA Role
                    statusCodesForUserRoles.push('RTGL');
                    break;
                case "ES":
                    statusCodesForUserRoles.push('RTBA');
                    statusCodesForUserRoles.push('RTGL');
                    break;
                case "TGL":
                    statusCodesForUserRoles.push('RTGL');
                    break;
                case "RM":
                    hasRMRoleForMyDashboard = true;
                    break;
            }
        });
    }
    if (userRolesOffering.length === 1 && hasRMRoleForMyDashboard) {
        //Do Nothing Return all rows for RM only View
    }
    else if (statusCodesForUserRoles.length > 0) {
        RefusalListDetails = RefusalListDetails.filter(function (item) {
            return ($.inArray(item.Status, statusCodesForUserRoles) !== -1);
        });
    }
    else if (statusCodesForUserRoles.length === 0) {
        RefusalListDetails = [];
    }
    //For hasRMRoleForMyDashboard return all rows
    return RefusalListDetails;
}
function getViewURLForProjectRefusal(ele) {
    var $ele = $(ele);
    var dt = $ele.closest('table').DataTable();
    var dataRow = dt.row($ele.closest('tr')).data();
    if (dataRow && dataRow.PractitionerId && userRolesOffering.length > 0) {
        if (userRolesOffering.filter(function (item) {
            return item.role === "TL";
        }).length > 0) {
            location.href = ProjectRefusalPortalUrl + "/Pages/Refusalworkflow/TBAView.aspx?PractitionerId=" + dataRow.PractitionerId;
        }
        else if (userRolesOffering.filter(function (item) {
            return item.role === "ES";
        }).length > 0) {
            location.href = ProjectRefusalPortalUrl + "/Pages/Refusalworkflow/ESView.aspx?PractitionerId=" + dataRow.PractitionerId;
        }
        else if (userRolesOffering.filter(function (item) {
            return item.role === "RM";
        }).length > 0) {
            location.href = ProjectRefusalPortalUrl + "/Pages/Refusalworkflow/RMView.aspx?PractitionerId=" + dataRow.PractitionerId;
        }

    }
}
function isNotHavingTGLRole() {
    var notHavingTGLRole = false;
    if (userRolesOffering.length > 0) {
        if (userRolesOffering.filter(function (item) {
            return item.role === "TGL";
        }).length === 0) {
            notHavingTGLRole = true;
        }
    }
    return notHavingTGLRole;
}



function projectRefusalRequests(PractitionerDetails) {
    $('.glyphicon-plus', $('.projectRefusalSection')).trigger('click');
    var trackQueryDataUrlRefusalList = "https://americas.internal.deloitteonline.com/sites/VisaInitiation/_api/web/lists/getbytitle('RefusalList')/items?$select=*,ProjectName,PractitionerEmailId";
    //&$filter=PractitionerEmailId eq 'subdeb@Deloitte.com'
    trackQueryDataUrlRefusalList = trackQueryDataUrlRefusalList + "&$filter=(IsClosed eq 0)";
    loadListItems({
        url: trackQueryDataUrlRefusalList,
        success: function (data) {

            var prdetails = PractitionerDetails;
            var listData = data;
            var RefusalListDetails = [];
            $.each(listData, function (index, value) {
                RefusalListDetails.push({
                    "PractitionerId": value.PractitionerId,
                    "ProjectName": value.ProjectName,
                    "ESEmailId": value.ESEmailId,
                    "TBAEmailId": value.TBAEmailId,
                    "TGLEmailId": value.TGLEmailId,
                    "RefusalReason": value.RefusalReason,
                    "Status": value.Status
                });
            });
            //
            var projectRefusalRequestsSummaryGridArray = [];
            var fullRefusalListDetails = RefusalListDetails;
            RefusalListDetails = filterRefusalListBasedOnRole(RefusalListDetails);
            $.each(PractitionerDetails, function (index, value) {
                var practitionerId = value.ID;
                var PractitionerRefusals = RefusalListDetails.filter(function (item) { return item.PractitionerId === practitionerId; });
                if (PractitionerRefusals.length > 0) {
                    var NoOfRefusals = fullRefusalListDetails.filter(function (item) { return item.PractitionerId === practitionerId; }).length;
                    if (projectRefusalRequestsSummaryGridArray.filter(function (item) { item.PractitionerId === practitionerId; }).length === 0) {
                        projectRefusalRequestsSummaryGridArray.push({
                            "PractitionerId": practitionerId,
                            "PractitionerName": value.PractitionerName,
                            "Designation": value.Designation,
                            "Offering": getOfferingFromType(value.Offering),
                            "NoOfRefusals": NoOfRefusals
                        });
                    }
                }
            });



            function getCOnfig(d, excelFileName) {
                return {
                    destroy: true,
                    "bLengthChange": false,
                    dom: 'Bfrtip',
                    autoWidth: false,
                    buttons: [
                        {
                            extend: 'excel',
                            exportOptions: {
                                columns: $.merge([0, 1, 2, 3, 4, 5], [])//Allowing Exception Flag only for approvers during export
                            },
                            text: 'Export to Excel',
                            titleAttr: 'Excel',
                            title: "Project Refusal Requests",
                            filename: excelFileName,
                            className: "gridcommandbutton"
                        }
                    ],
                    "bInfo": false,
                    "data": d,
                    "order": [[0, "desc"]],
                    "columns": [
                        {
                            "data": "PractitionerId",
                            "title": "Req#",
                            width: "6%"
                        },
                        {
                            "data": "PractitionerName",
                            title: "Practitioner Name",
                            "width": "10%",
                            align: "center"
                        },
                        {
                            "data": "Designation",
                            title: "Designation",
                            "width": "13%",
                            align: "center"
                        },
                        {
                            "data": "Offering",
                            title: "Practitioner's Offering",
                            "width": "8%",
                            align: "center"
                        },
                        {
                            "data": "NoOfRefusals",
                            title: "No. of Refusals",
                            "width": "7%",
                            align: "center"
                        },
                        {
                            "data": "PractitionerId",
                            title: "Actions",
                            "width": "8%",
                            "orderable": false,
                            render: function (data, type, row) {
                                if (isNotHavingTGLRole()) {
                                    buttonsTemplate = '<button type="button" onclick="getViewURLForProjectRefusal(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button>';
                                    return '<div style="display: inline-flex;" class="actionbuttons">' + buttonsTemplate + '</div>';
                                }
                                else {
                                    return "";
                                }
                            }
                        },
                        {
                            "data": "PractitionerId",
                            title: "Created Date",
                            "width": "0%",
                            "orderable": false,
                            visible: false
                        }
                    ],
                    "oLanguage": {
                        "sEmptyTable": "No request raised yet."
                    }
                }
            }

            var dataTableConfigData = getCOnfig(projectRefusalRequestsSummaryGridArray, 'ProjectRefusalRequests');
            $('#ProjectRefusalRequestTable').DataTable(dataTableConfigData);


        }
    });

}

function fetchPractitionerDetail() {
    var PractitionerDetailsQuery = "https://americas.internal.deloitteonline.com/sites/VisaInitiation/_api/web/lists/getbytitle('PractitionerDetails')/items?$select=*,PractitionerName";
    loadListItems({
        url: PractitionerDetailsQuery,
        success: function (data) {
            var allPractitioners = data;
            var PractitionerDetails = [];
            $.each(allPractitioners, function (index, value) {
                PractitionerDetails.push({
                    "PractitionerName": value.PractitionerName,
                    "Designation": value.Level,
                    "Offering": value.DeptName,
                    "ID": value.Id
                });
            });
            projectRefusalRequests(PractitionerDetails);
        }
    });

}


//SDEB Project Refusal Code End

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

function togglePanel(ele) {
    var $ele = $(ele);
    $ele.closest('.panel').find('.panel-body').toggle();
    $ele.toggleClass('glyphicon-plus').toggleClass('glyphicon-minus');
}

function NewImmigrationRequest() {
    window.open(siteUrl + '/Pages/immigrationrequest.aspx ', '_blank');
}

function editRecord(ele) {
    var $ele = $(ele);
    var dt = $ele.closest('table').DataTable();
    var data = dt.row($ele.closest('tr')).data();
    if (data.RequestCategory == "Transfer") {
        var transferType = ""
        switch (data.transferType) {
            case "Inter Office":
                transferType = "&Type=L"
                break;
            case "Inter Offering":
                transferType = "&Type=O"
                break;
            case "Inter Portfolio":
                transferType = "&Type=P"
                break;
            case "Transfer to US":
                transferType = "&Type=U"
                break;

        }

        window.location.href = siteUrl + "/Pages/immigrationrequest.aspx?TRID=" + data.ID + transferType;
    }
    else if (data.RequestCategory == "Visa") {
        var transferType = ""
        switch (data.TypeOfRequest) {
            case "H1 Extension":
                transferType = "&Type=VEH1"
                break;
            case "L1 New":
                transferType = "&Type=VNL1"
                break;
            case "L1 Extension":
                transferType = "&Type=VEL1"
                break;
        }

        window.location.href = siteUrl + "/Pages/VisaRequest.aspx?TRID=" + data.ID + transferType;
    }

}

// function editVisaRecord(ele) {
//     var $ele = $(ele);
//     var dt = $ele.closest('table').DataTable();
//     var data = dt.row($ele.closest('tr')).data();
//     var transferType = ""
//     switch (data.TypeOfRequest) {
//         case "H1 Extension":
//             transferType = "&Type=VEH1"
//             break;
//         case "L1 New":
//             transferType = "&Type=VNL1"
//             break;
//         case "L1 Extension":
//             transferType = "&Type=VEL1"
//             break;
//     }

//     window.location.href = siteUrl + "/Pages/VisaRequest.aspx?TRID=" + data.ID + transferType;

// }

// function viewVisaRecord(ele) {
//     var $ele = $(ele);
//     var dt = $ele.closest('table').DataTable();
//     var data = dt.row($ele.closest('tr')).data();
//     var requestId = data.ID;
//     location.href = siteUrl + "/Pages/VisaRequestView.aspx?TRID=" + requestId;
// }

function viewRecord(ele) {
    var $ele = $(ele);
    var dt = $ele.closest('table').DataTable();
    var data = dt.row($ele.closest('tr')).data();
    var requestId = data.ID;
    if (data.RequestCategory == "Transfer") {
        location.href = siteUrl + "/Pages/TransferRequestView.aspx?TRID=" + requestId;
    }
    else if (data.RequestCategory == "Visa") {
        location.href = siteUrl + "/Pages/VisaRequestView.aspx?TRID=" + requestId;
    }
}


// function approveVisaRecord(ele) {
//     var $ele = $(ele);
//     var dt = $ele.closest('table').DataTable();
//     var data = dt.row($ele.closest('tr')).data();
//     var requestId = data.ID;
//     location.href = siteUrl + "/Pages/VisaApprovalPage.aspx?TRID=" + requestId;
// }



function approveRecord(ele) {
    var $ele = $(ele);
    var dt = $ele.closest('table').DataTable();
    var data = dt.row($ele.closest('tr')).data();
    var requestId = data.ID;
    if (data.RequestCategory == "Transfer") {
        location.href = siteUrl + "/Pages/TransferApprovalPage.aspx?TRID=" + requestId;
    }
    else if (data.RequestCategory == "Visa") {
        location.href = siteUrl + "/Pages/VisaApprovalPage.aspx?TRID=" + requestId;
    }
}

function ViewingVisaQuerySuccessHandler(data) {
    try {
        $('.loading').hide();
        //$('.expander:first').trigger('click');

        function getCOnfig(d, excelFileName) {
            return {
                destroy: true,
                "bLengthChange": false,
                dom: 'Bfrtip',
                autoWidth: false,
                buttons: [
                    {
                        extend: 'excel',
                        exportOptions: {
                            columns: $.merge([0, 1, 2, 3, 4, 5, 6, 7, 9], isAdminTemplate ? [10] : [])//Allowing Exception Flag only for approvers during export
                        },
                        text: 'Export to Excel',
                        titleAttr: 'Excel',
                        title: "Requests",
                        filename: excelFileName,
                        className: "gridcommandbutton"
                    }
                ],
                "bInfo": false,
                "data": d,
                "order": [[0, "desc"]],
                "columns": [
                    {
                        "data": "ID",
                        "title": "Req#",
                        width: "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        "data": "RequestCategory",
                        title: "Request Category",
                        "width": "10%",
                        align: "center"
                    },
                    {
                        "data": "TypeOfRequest",
                        title: "Request Type",
                        "width": "10%",
                        align: "center"
                    },
                    {
                        "data": "practitionerDetails0.Title",
                        title: "Name",
                        "width": "13%",
                        align: "center"
                    },
                    {
                        "data": "practitionerDetails0.JobTitle",
                        title: "Designation",
                        "width": "8%",
                        align: "center"
                    },
                    {
                        "data": "Offering",
                        title: "Practitioner's Offering",
                        "width": "10%",
                        align: "center"
                    },
                    // {
                    //     "data": "Title",
                    //     title: "Status",
                    //     "width": "7%",
                    //     align: "center",
                    //     render: function (data, type, row) {
                    //         var status = "";
                    //         if ((isAdminTemplate || row.Title == 'Draft') && row.IsAdditionalDataRequired == 'Y') {
                    //             status = '<div>Need More Information</div>';
                    //         }
                    //         else if (row.Title == 'Draft') {
                    //             status = "Draft";
                    //         }
                    //         else {
                    //             status = row.Status;
                    //         }
                    //         return status;
                    //     }
                    // },
                    {
                        "data": "Pending_x0020_With",
                        title: "Status",
                        "width": "15%",
                        align: "center",
                        render: function (data, type, row) {
                            function getDisplayText(role) {
                                var result = role;
                                switch (role) {
                                    case "ADMIN":
                                        break;
                                    case "OL":
                                        result = "Offering Lead";
                                        break;
                                    case "OPL":
                                        result = "Portfolio Lead";
                                        break;
                                    case "RM":
                                        result = "Resource Manager";
                                        break;
                                    case "RMSP":
                                        result = "Resource Manager";
                                        break;
                                    case "TGL":
                                        result = "Talent Group Leader";
                                        break;
                                    case "TL":
                                        result = "Talent BA";
                                        break;
                                    case "RM":
                                        result = "Resource Manager";
                                        break;
                                    case "NPM":
                                        result = "New Project Manager";
                                        break;
                                    case "NTGL":
                                        result = "New Talent Group Leader";
                                        break;
                                    case "NOL":
                                        result = "New Offering Lead";
                                        break;
                                }
                                result = "Pending - " + result;
                                return result;
                            }

                            var formattedResults = [];
                            if (data && row.Title != "Draft") {
                                $(data.results).each(function (idx, val) {
                                    formattedResults.push(getDisplayText(val));
                                });
                            }
                            var returnText = formattedResults.join(",");
                            if (returnText != "") {
                                returnText = returnText + "</br>";
                            }
                            var status = "";
                            if ((isAdminTemplate || row.Title == 'Draft') && row.IsAdditionalDataRequired == 'Y') {
                                status = '<div>Need More Information</div>';
                            }
                            else if (row.Title == 'Draft') {
                                status = "Draft";
                            }
                            else if (row.Status != 'Pending') {
                                status = row.Status;
                            }
                            returnText = returnText + status;
                            return returnText;
                        }
                    },
                    {
                        "data": "transferFromAndTo",
                        title: "Additional Info.",
                        "width": "15%",
                        align: "left",
                        render: function (data, type, row) {
                            var status = "";
                            if (row.transferFromAndTo != "") {
                                status = "Transfer From : " + row.transferFromAndTo + "</br>  Transfer To : " + row.TransferTo;
                            }
                            return '<div style="text-align:left !important;">' + status + '</div>';
                        }
                    },
                    {
                        "data": "ID",
                        title: "Actions",
                        "width": "10%",
                        "orderable": false,
                        render: function (data, type, row) {
                            var buttonsTemplate = '';
                            if (isAdminTemplate) {
                                if (row.Status == "Approved" || row.Status == "Rejected") {
                                    buttonsTemplate = '<button type="button" onclick="viewRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button>';
                                }
                                else {
                                    buttonsTemplate = '<button type="button" onclick="viewRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button><button type="button" onclick="approveRecord(this)" class="btn btn-secondary btn-sm"><span class="glyphicon glyphicon-check"></span> Action</button>';
                                }
                            }
                            else {
                                if (row.Title == "Draft") {
                                    buttonsTemplate = '<button type="button" onclick="editRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-edit"></span> Edit</button>';
                                }
                                else {
                                    buttonsTemplate = '<button type="button" onclick="viewRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button>';
                                }
                            }

                            return '<div style="display: inline-flex;align:center;" class="actionbuttons">' + buttonsTemplate + '</div>';
                        }
                    },
                    {
                        "data": "Created",
                        title: "Created Date",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        "data": "ExceptionFlag",
                        title: "Is Flagged as Exception Case",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    }
                ],
                "oLanguage": {
                    "sEmptyTable": "No request raised yet."
                },
                "createdRow": function (row, data, dataIndex) {
                    if (isAdminTemplate && data.ExceptionFlag == 'Y') {
                        $(row).addClass('exceptionRecord');
                        $(row).attr('title', 'Flagged as exception case');
                    }
                }
            }
        }
        // if (!isAdminTemplate) {
        //     $('#VisaRequestsText').text("Total Visa requests pending for you: ");
        // }
        // else {
        //     $('#VisaRequestsText').text("Total Visa requests pending for your approval: ");
        // }

        // $('#VisaRequestsCount').text(data.length);
        // $('#VisaRequestsText').closest('li').show();

        // $('#VisaRequestTable').DataTable(getCOnfig(data, 'VisaRequests'));
        // setTimeout(function () {
        //     if (!isAdminTemplate) {
        //         $('.approveButton').remove();
        //     }
        // }, 100);
        if (!isAdminTemplate) {
            $('#RequestsText').text("Total Requests pending for you: ");
        }
        else {
            $('#RequestsText').text("Total Requests pending for your approval: ");
        }

        $('#RequestsCount').text(data.length);
        $('#RequestsText').closest('li').show();

        $('#InterOfficeTable').DataTable(getCOnfig(data, 'Requests'));
        setTimeout(function () {
            if (!isAdminTemplate) {
                $('.approveButton').remove();
            }
        }, 100);
    }
    catch (e) {
        alert(e.message);

    }
}


// function ViewingQuerySuccessHandler(data) {
//     try {
//         $('.loading').hide();
//         $('.expander:first').trigger('click');

//         function getCOnfig(d, excelFileName) {
//             return {
//                 destroy: true,
//                 "bLengthChange": false,
//                 dom: 'Bfrtip',
//                 autoWidth: false,
//                 buttons: [
//                     {
//                         extend: 'excel',
//                         exportOptions: {
//                             columns: [0, 1, 2, 3, 4, 5, 6, 7]
//                         },
//                         text: 'Export to Excel',
//                         titleAttr: 'Excel',
//                         title: "Transfer Requests",
//                         filename: excelFileName,
//                         className: "gridcommandbutton"
//                     }
//                 ],
//                 "bInfo": false,
//                 "data": d,
//                 "order": [[0, "desc"]],
//                 "columns": [
//                     {
//                         "data": "ID",
//                         "title": "Req#",
//                         width: "6%"
//                     },
//                     {
//                         "data": "transferType",
//                         title: "Transfer Type",
//                         "width": "11%",
//                         align: "center"
//                     },
//                     {
//                         "data": "practitionerDetails.Title",
//                         title: "Name",
//                         "width": "17%",
//                         align: "center"
//                     },
//                     {
//                         "data": "practitionerDetails.JobTitle",
//                         title: "Designation",
//                         "width": "17%",
//                         align: "center"
//                     },
//                     {
//                         "data": "transferFromAndTo",
//                         title: "From",
//                         "width": "10%",
//                         align: "center"
//                     },
//                     {
//                         "data": "TransferTo",
//                         title: "To",
//                         "width": "10%",
//                         align: "center"
//                     },
//                     {
//                         "data": "Title",
//                         title: "Status",
//                         "width": "7%",
//                         align: "center",
//                         render: function (data, type, row) {
//                             var status = "";
//                             if ((isAdminTemplate || row.Title == 'Draft') && row.IsAdditionalDataRequired == 'Y') {
//                                 status = '<div>Need More Information</div>';
//                             }
//                             else if (row.Title == 'Draft') {
//                                 status = "Draft";
//                             }
//                             else {
//                                 status = row.Status;
//                             }
//                             return status;
//                         }
//                     },
//                     {
//                         "data": "Pending_x0020_With",
//                         title: "State",
//                         "width": "7%",
//                         align: "center",
//                         render: function (data, type, row) {
//                             function getDisplayText(role) {
//                                 var result = role;
//                                 switch (role) {
//                                     case "ADMIN":
//                                         break;
//                                     case "OL":
//                                         result = "Offering Lead";
//                                         break;
//                                     case "OPL":
//                                         result = "Portfolio Lead";
//                                         break;
//                                     case "RM":
//                                         result = "Resource Manager";
//                                         break;
//                                     case "RMSP":
//                                         result = "Resource Manager";
//                                         break;
//                                     case "TGL":
//                                         result = "Talent Group Leader";
//                                         break;
//                                     case "TL":
//                                         result = "Talent BA";
//                                         break;
//                                     case "NPM":
//                                         result = "New Project Manager";
//                                         break;
//                                     case "NTGL":
//                                         result = "New Talent Group Leader";
//                                         break;
//                                     case "NOL":
//                                         result = "New Offering Lead";
//                                         break;
//                                 }
//                                 return result;
//                             }

//                             var formattedResults = [];
//                             if (data && row.Title != "Draft") {
//                                 $(data.results).each(function (idx, val) {
//                                     formattedResults.push(getDisplayText(val));
//                                 });
//                             }


//                             return formattedResults.join(",");
//                         }
//                     },
//                     {
//                         "data": "ID",
//                         title: "Actions",
//                         "width": "15%",
//                         "orderable": false,
//                         render: function (data, type, row) {
//                             var buttonsTemplate = '';
//                             if (isAdminTemplate) {
//                                 if (row.Status == "Approved" || row.Status == "Rejected") {
//                                     buttonsTemplate = '<button type="button" onclick="viewRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button>';
//                                 }
//                                 else {
//                                     buttonsTemplate = '<button type="button" onclick="viewRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button><button type="button" onclick="approveRecord(this)" class="btn btn-secondary btn-sm"><span class="glyphicon glyphicon-check"></span> Action</button>';
//                                 }
//                             }
//                             else {
//                                 if (row.Title == "Draft") {
//                                     buttonsTemplate = '<button type="button" onclick="editRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-edit"></span> Edit</button>';
//                                 }
//                                 else {
//                                     buttonsTemplate = '<button type="button" onclick="viewRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button>';
//                                 }
//                             }

//                             return '<div style="display: inline-flex;" class="actionbuttons">' + buttonsTemplate + '</div>';
//                         }
//                     }
//                 ],
//                 "oLanguage": {
//                     "sEmptyTable": "No request raised yet."
//                 }
//             }
//         }
//         if (!isAdminTemplate) {
//             $('#transferRequestsText').text("Total Transfer requests pending for you: ");
//         }
//         else {
//             $('#transferRequestsText').text("Total Transfer requests pending for your approval: ");
//         }

//         $('#transferRequestsCount').text(data.length);
//         $('#transferRequestsText').closest('li').show();

//         $('#InterOfficeTable').DataTable(getCOnfig(data, 'TransferRequests'));
//         setTimeout(function () {
//             if (!isAdminTemplate) {
//                 $('.approveButton').remove();
//             }
//         }, 100);
//     }
//     catch (e) {
//         alert(e.message);

//     }
// }

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

function userContextLoaded() {
    currentLoggedInUserEmail = currentUser.get_email();
    currentUserId = currentContext.get_web().get_currentUser().get_id();
    checkIfUserIsApproval();

}

var userApprovalFor = [];
var isAdminTemplate = false;

function getOfferingFromType(type) {
    var result = "";
    switch (type) {
        case "SYSENG":
            result = "Systems Engineering";
            break;
        case "CLOUDENG":
            result = "Cloud Engineering";
            break;
        case "OPSTRANS":
            result = "Operations Transformation";
            break;
        case "CIS":
            result = "Core Industry Solutions";
            break;
    }
    return result;
}

function checkIfUserIsApproval() {
    if ($.urlParam("team") == "1") {
        isAdminTemplate = true;
    }
	
	//Certification Requests and Approvals.
			
	if(!isAdminTemplate){
		getCertificationRequest();
		$('#certRequestsBlock').show();
		$('#certApprovalsBlock').hide();
	}
	else if(isAdminTemplate) {
		$('#certApprovalsBlock').show();
		$('#certRequestsBlock').hide();
	}

    var trckQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('Approvers')/items?$select=*,Approvers/Title,Approvers/EMail&$expand=Approvers/Id&$filter= Approvers/EMail eq '" + currentLoggedInUserEmail + "'";
    loadListItems({
        url: trckQueryDataUrl,
        success: function (data) {
            if (data.length === 0) {
                isAdminTemplate = false;
                $('.dropdown-menu [href$="?team=1"]').remove();
            }
            else {
                $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');

                if (!$.urlParam("team")) {
                    isAdminTemplate = true;
                }

                $(data).each(function (idx, val) {
                    $(val.Approvers.results).each(function (di, va) {
                        if (va.EMail == currentLoggedInUserEmail) {
                            var offering = getOfferingFromType(val.Title.split(" ")[0]);
                            userApprovalFor.push(
                                {
                                    offering: offering,
                                    role: val.ImmigrationRoles
                                });
                            userRolesOffering.push(
                                {
                                    offering: offering,
                                    role: val.ImmigrationRoles
                                });
                            return false;
                        }
                    })
                });
            }



            if (!isAdminTemplate) {
                userApprovalFor = [];
                $('#dashboardHeader').text("My Dashboard");
            }
            else {
                $('#dashboardHeader').text("Approval Dashboard");
            }
            pendingVisaRequests();
            pendingRequests();
            //SDEB Project Refusal Code Start
            fetchPractitionerDetail();
            //SDEB Project Refusal Code End
            if (!isAdminTemplate) {
                $('.expander').each(function (idx, val) {
                    togglePanel(val);
                })
            }

        }
    });

}

//Certification Requests
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
            }

            itemCertificationReq.AnticipatedCompletionDate = (itemCertificationReq.AnticipatedCompletionDate.getMonth() + 1) + '/' + itemCertificationReq.AnticipatedCompletionDate.getDate() + '/' + itemCertificationReq.AnticipatedCompletionDate.getFullYear();
            itemCertificationReq.RequestDate = (itemCertificationReq.RequestDate.getMonth() + 1) + '/' + itemCertificationReq.RequestDate.getDate() + '/' + itemCertificationReq.RequestDate.getFullYear();
            if (itemCertificationReq.CompletionDate != '') {
                itemCertificationReq.CompletionDate = (itemCertificationReq.CompletionDate.getMonth() + 1) + '/' + itemCertificationReq.CompletionDate.getDate() + '/' + itemCertificationReq.CompletionDate.getFullYear();
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
                '<input type="hidden" id="hdnApprovalEmail_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.ApprovalEmail + '">' +
                '<input type="hidden" id="hdnCertificate_' + itemCertificationReq.RowId + '" value="' + itemCertificationReq.Certificate + '">' +
                '</td><td style="padding:10px;">' + itemCertificationReq.RequestDate +
                '</td><td style="padding:10px;">' + itemCertificationReq.ApprovalStatus +
                '</td><td style="padding:10px;">' + itemCertificationReq.TGLApprovalStatus +
                '</td><td style="padding:10px;"><a href="https://americas.internal.deloitteonline.com/sites/USICBOPortal/UsiCboBusinessApprovals/Pages/CertificationRequest.aspx?RequestId=' + itemCertificationReq.RowId+'" name = "' + itemCertificationReq.RowId + '" id = "view_' + itemCertificationReq.RowId + '" target="_blank">View</a></td></tr>');            
        }
    });    
}


//End

function bulkApprove(ele) {
    //it should be available only to TGL (Talent Group Leader) and OL (Offering Leader)


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

