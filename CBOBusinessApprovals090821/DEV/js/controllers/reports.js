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

        if ($ele.is('.statusDropdown')) {
            var $pendingWithDropdown = $ele.closest('.searchContainer').find('.pendingWithDropdown');
            if ($ele.val() == 'Approved' || $ele.val() == 'Rejected') {
                $pendingWithDropdown.attr('disabled', true).val("").trigger('change');
            }
            else {
                $pendingWithDropdown.removeAttr('disabled');
            }
        }
    })

})


var jsFilePaths = [
    "https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js",
    "https://cdn.datatables.net/buttons/1.5.6/js/dataTables.buttons.min.js",
    "https://cdn.datatables.net/buttons/1.5.6/js/buttons.html5.min.js",
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
var leaveTypes ={
    "LOP" : "Loss of Pay",
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

var expenseTypes = {
    // "LDTE": "Travel Expenses for training",
    // "LDAC": "Approval for certifications",
    // "BKPC": "Books & Publications",        
    // "BUSE": "Bus Entertainment",               
    // "GFNE": "Gifts Non-employee",    
    // "CFCT": "Cafeteria Costs",        
    // "FPML": "Firm Provided Meals",
    // "MLOT": "Meals-Overtime",
    // "PKAW": "Parking-Auto Weekend",
    // "PRKL": "Parking-Local",    
    // "REML": "Recr Exp - Meals",
    // "TRPN": "Trans-Personne",    
    // "PRCP": "Printing & Copying",    
    "TREA": "Travel Exp-Airline",
    "MCPN": "Moving Cost-Persnl",        
    "TRHL": "Traveling Exp-Hotel",
    "IMGF": "Intl Immigration Fee",
    "TRSD": "Trvl Exp-Sp & Dep",
    "MVTE": "Moving-Trv Exp",
    "TRET": "Travel Expenses-Taxi",
    "STWF": "Staff Welfare USI",
    "BUML": "Business Meals",
    "TRPD": "Trvl Exp-Per Diem",
    "TRRC": "Travel Exp-Rental Ca",
    "OFSL": "Office Supplies",
    "PHEX": "Physical Exams",
    "TRHT": "Trvl Exp-HotelTax",
    "FPRE": "Firm Provi Rec Ent",
    "CMCO": "Computer Costs-Other",
    "TRME": "Trvl Exp-Meal Exp", 
    "FPMO": "Firm Prov Mls In Off", 
    "TRCS": "Trvl Exp-Car Svc/Lmo",
    "SMRG": "Seminar Registration", 
    "TRIT": "Trvl Exp-InbIntl Tem", 
    "CPUC": "CPU Costs HostingSvs",
    "TRTL": "Trvl Exp-Temp Living",
    "TRAA": "Trvl Exp- Air Alt",
    "TRMC": "Traveling Exp-Misc",    
   // "TRAF": "Trvl Exp-Agency Fee",
   // "TRBF": "Trvl Exp-Air Bag Fee",
   // "TRAH": "Trvl Exp-Air/Htl Cl",
   // "TRAC": "Trvl Exp-Alcohol Fed",    
   // "TRCG": "Trvl Exp-CarRent Gas",
   // "TRFP": "Trvl Exp-Fed PerDiem",
   // "TRHC": "Trvl Exp-Health Club",
   // "TRHI": "Trvl Exp-Hot Int A",             
   // "TRPH": "Trvl Exp-Phone",
   // "TRPK": "Trvl Exp-Pking",
   // "TRCA": "Trvl Exps-Corp Apt",                                    
   // "TRTP": "Trvl Exp-Tips",
   // "TRTO": "Trvl Exp-Tolls",
   // "TROG": "TrvlExp-Oth Grnd Trn",
}



function filterRecords(i, value, dataGrid) {
    dataGrid
        .column(i)
        .search(value)
        .draw();
}


function pendingRequests() {
    var trckQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('" + (isDevMode ? "ApprovalTransferRequests1" : "ApprovalTransferRequests") + "')/items?$select=*,practitionerDetails/Title,practitionerDetails/EMail,practitionerDetails/JobTitle,offeringLeadDetails/EMail,TalentGroupLead/EMail,talentTeamPersonDetails/EMail,newProjectSnrMangerDetails/EMail&$expand=practitionerDetails/Id,offeringLeadDetails/Id,TalentGroupLead/Id,talentTeamPersonDetails/Id,newProjectSnrMangerDetails/Id";
    var adminFilters = [];
    $(userApprovalFor).each(function (idx, val) {
        var pendingRole = val.role;
        adminFilters.push("(Offering eq '" + val.offering + "')");
    });

    adminFilters = adminFilters.filter(function (item, pos) { //Removing duplicate roles
        return adminFilters.indexOf(item) == pos;
    })

    trckQueryDataUrl = trckQueryDataUrl + "&$filter=((" + adminFilters.join(" or ") + "))";

    loadListItems({
        url: trckQueryDataUrl,
        success: ViewingQuerySuccessHandler
    });
};

function pendingVisaRequests() {
    var trckQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('ApprovalVisaRequests')/items?$select=*,practitionerDetails0/Title,practitionerDetails0/EMail,practitionerDetails0/JobTitle,offeringLeadDetails/EMail,TalentGroupLeader/EMail,resourceManagerDetails/Title,USPPMD/Title,USPPMD/EMail&$expand=practitionerDetails0/Id,offeringLeadDetails/Id,TalentGroupLeader/Id,resourceManagerDetails/Id,USPPMD/Id";
    var adminFilters = [];
    $(userApprovalFor).each(function (idx, val) {
        var pendingRole = val.role;
        adminFilters.push("(Offering eq '" + val.offering + "')");
    });
    adminFilters.push("(Offering eq 'Systems Engineering')");
    adminFilters = adminFilters.filter(function (item, pos) { //Removing duplicate roles
        return adminFilters.indexOf(item) == pos;
    })

    trckQueryDataUrl = trckQueryDataUrl + "&$filter=((" + adminFilters.join(" or ") + "))";

    loadListItems({
        url: trckQueryDataUrl,
        success: visaQuerySuccessHandler
    });
};

function pendingLeaveRequests() {
    var trckQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('ApprovalEmployeeRequests')/items?$select=*,Practitioner/Title,Practitioner/EMail,Practitioner/JobTitle,OfferingLead/EMail,TalentGroupLead/EMail,TalentTeamPerson/EMail&$expand=Practitioner/Id,OfferingLead/Id,TalentGroupLead/Id,TalentTeamPerson/Id";
    var adminFilters = [];
    $(userApprovalFor).each(function (idx, val) {
        var pendingRole = val.role;
        adminFilters.push("(Offering eq '" + val.offering + "')");
    });

    adminFilters = adminFilters.filter(function (item, pos) { //Removing duplicate roles
        return adminFilters.indexOf(item) == pos;
    })

    trckQueryDataUrl = trckQueryDataUrl + "&$filter=((" + adminFilters.join(" or ") + "))";

    loadListItems({
        url: trckQueryDataUrl,
        success: LeavesQuerySuccessHandler
    });
};

function pendingExpenseRequests() {
    var trckQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('ApprovalExpenseRequests')/items?$select=*,Practitioner/Title,Practitioner/EMail,Practitioner/JobTitle,OfferingLead/EMail,TalentGroupLead/EMail,ThreadorInitiativeLead/EMail&$expand=Practitioner/Id,OfferingLead/Id,TalentGroupLead/Id,ThreadorInitiativeLead/Id";
    var adminFilters = [];
    $(userApprovalFor).each(function (idx, val) {
        var pendingRole = val.role;
        adminFilters.push("(Offering eq '" + val.offering + "')");
    });

    adminFilters = adminFilters.filter(function (item, pos) { //Removing duplicate roles
        return adminFilters.indexOf(item) == pos;
    })

    trckQueryDataUrl = trckQueryDataUrl + "&$filter=((" + adminFilters.join(" or ") + "))";

    loadListItems({
        url: trckQueryDataUrl,
        success: ExpenseQuerySuccessHandler
    });
};

function togglePanel(ele) {
    var $ele = $(ele);
    $ele.closest('.panel').find('.panel-body').toggle();
    $ele.toggleClass('glyphicon-plus').toggleClass('glyphicon-minus');
}

function visaQuerySuccessHandler(data) {
    try {
        $('.loading').hide();
        $('.expander:eq(1)').trigger('click');

        $(data).each(function (idx, val) {
            if (!val.practitionerDetails0.JobTitle) {
                val.practitionerDetails0.JobTitle = "";
            }

            if (!val.practitionerDetails0.Title) {
                val.practitionerDetails0.Title = "";
            }
        })

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
                            columns: [0, 1, 2, 3, 4, 5, 6,7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25, 26]
                        },
                        text: 'Export to Excel',
                        titleAttr: 'Excel',
                        title: "Visa Requests",
                        filename: excelFileName,
                        className: "gridcommandbutton"
                    }
                ],
                "bInfo": true,
                "data": d,
                "order": [[0, "desc"]],
                "columns": [
                    {
                        //0
                        "data": "OriginalRequestId",
                        "title": "Req#",
                        width: "6%"
                    },
                    {
                        //1
                        "data": "TypeOfRequest",
                        title: "Type of Visa Request",
                        "width": "11%",
                        align: "center"
                    },                    
                    {
                        //2
                        "data": "L1Category",
                        title: "VISA Category",
                        "orderable": false,
                        visible: false,
                        "width": "0%",
                        render: function (data, type, row) {
                            var status = "";
                            if (row.TypeOfRequest == "L1 Extension" || row.TypeOfRequest == "L1 New") {
                                status = "L1"+row.L1Category;
                            }
                            else {
                                status = "";
                            }
                            return status;
                        }
                    },
                    {
                        //3
                        "data": "PID",
                        title: "Personal ID",
                        "orderable": false,
                        visible: false,
                        "width": "0%"
                    },
                    {
                        //4
                        "data": "practitionerDetails0.Title",
                        title: "Name",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        //5
                        "data": "practitionerDetails0.EMail",
                        title: "Practitioner Email ID",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //6
                        "data": "practitionerDetails0.JobTitle",
                        title: "Practitioner Level",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        //7
                        "data": "USIBaseLocation",
                        title: "USI Base Location",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //8
                        "data": "PremiumProcessing",
                        title: "Premium Processing",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //9
                        "data": "USPPMD.Title",
                        title: "US PPMD",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //10
                        "data": "USPPMD.EMail",
                        title: "US PPMD Email Id",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //11
                        "data": "newProjectName",
                        title: "Project Name",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //12
                        "data": "resourceManagerDetails.Title",
                        title: "Resource Manager",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //13
                        "data": "Offering",
                        title: "Practitioner's Offering",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        //14
                        "data": "Status",
                        title: "Status",
                        "width": "7%",
                        align: "center",
                        render: function (data, type, row) {
                            var status = "";
                            if (row.Title == "Draft" && row.IsAdditionalDataRequired == "Y") {
                                status = "Draft";
                            }
                            else {
                                status = row.Status;
                            }
                            return status;
                        }
                    },
                    {
                        //15
                        "data": "Pending_x0020_With",
                        title: "State",
                        "width": "7%",
                        align: "center",
                        render: function (data, type, row) {
                            function getDisplayText(role) {
                                var result = role;
                                switch (role) {
                                    case "OL":
                                        result = "Offering Lead";
                                        break;
                                    case "OPL":
                                        result = "Portfolio Lead";
                                        break;
                                    case "TGL":
                                        result = "Talent Group Leader";
                                        break;
                                    case "RM":
                                        result = "Resource Manager";
                                        break;
                                }
                                return result;
                            }

                            var formattedResults = [];
                            if (data) {
                                $(data.results).each(function (idx, val) {
                                    formattedResults.push(getDisplayText(val));
                                });
                            }


                            return formattedResults.join(",");
                        }
                    },
                    {
                        //16
                        "data": "AssignmentType",
                        title: "Assignment Type",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //17
                        "data": "HasEverTravelledToUS",
                        title: "Has the Employee ever travelled to US for Deloitte in any status other that B1 Visitor?",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //18
                        "data": "ShouldAddNewWorkSite",
                        title: "Is the initiation for a new work site to be added to an existing Deloitte H-1 or E-3 petition?",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //19
                        "data": "DeloitteUSOffice",
                        title: "Deloitte US office",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //20
                        "data": "USZipCode",
                        title: "US Zipcode",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //21
                        "data": "ClientAddress",
                        title: "Client Address",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //22
                        "data": "CurrentUSImmigrationStatus",
                        title: "Current US Immigration Status",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //23
                        "data": "ID",
                        title: "Actions",
                        "width": "15%",
                        "orderable": false,
                        render: function (data, type, row) {
                            return '<div style="display: inline-flex;" class="actionbuttons"><button type="button" onclick="viewVisaRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button></div>';
                        }
                    },
                    {
                        //24
                        "data": "Created",
                        title: "Tenure",
                        "width": "0%",
                        "orderable": false,
                        visible: false,
                        render: function (data, type, row) {
                            if (row.DateOfHire) {
                                var hireDate = new Date(row.DateOfHire);
                                if (!isNaN(hireDate.getMonth())) {
                                    var tenureData = monthDiff(hireDate,new Date());
                                    return (parseInt(tenureData / 12) + " Years and " + (tenureData % 12) + " Months");
                                }
                            }
                            return '';
                        }
                    },
                    {
                        //25
                        "data": "Created",
                        title: "Created Date",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        //26
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
                    if (data.ExceptionFlag == 'Y') {
                        $(row).addClass('exceptionRecord');
                        $(row).attr('title', 'Flagged as exception case');
                    }
                }
            }
        }

        visaSearchGrid = $('#visaTable').DataTable(getCOnfig(data, 'VisaRequests'));

        $('#visaTable').data('dg', visaSearchGrid);

    }
    catch (e) {
        alert(e.message);

    }
}

function ViewingQuerySuccessHandler(data) {
    try {
        $('.loading').hide();
        $('.expander:first').trigger('click');

        $(data).each(function (idx, val) {
            if (!val.practitionerDetails.JobTitle) {
                val.practitionerDetails.JobTitle = "";
            }

            if (!val.practitionerDetails.Title) {
                val.practitionerDetails.Title = "";
            }
        })

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
                            columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10]
                        },
                        text: 'Export to Excel',
                        titleAttr: 'Excel',
                        title: "Transfer Requests",
                        filename: excelFileName,
                        className: "gridcommandbutton"
                    }
                ],
                "bInfo": true,
                "data": d,
                "order": [[0, "desc"]],
                "columns": [
                    {
                        "data": (isDevMode ? "OriginalRequestId" : "OriginalTransferRequestIDId"),
                        "title": "Req#",
                        width: "6%"
                    },
                    {
                        "data": "transferType",
                        title: "Transfer Type",
                        "width": "11%",
                        align: "center"
                    },
                    {
                        "data": "practitionerDetails.Title",
                        title: "Name",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        "data": "practitionerDetails.JobTitle",
                        title: "Designation",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        "data": "Offering",
                        title: "Practitioner's Offering",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        "data": "transferFromAndTo",
                        title: "From",
                        "width": "10%",
                        align: "center"
                    },
                    {
                        "data": "TransferTo",
                        title: "To",
                        "width": "10%",
                        align: "center"
                    },
                    {
                        "data": "Status",
                        title: "Status",
                        "width": "7%",
                        align: "center",
                        render: function (data, type, row) {
                            var status = "";
                            if (row.Title == "Draft" && row.IsAdditionalDataRequired == "Y") {
                                status = "Draft";
                            }
                            else {
                                status = row.Status;
                            }
                            return status;
                        }
                    },
                    {
                        "data": "Pending_x0020_With",
                        title: "State",
                        "width": "7%",
                        align: "center",
                        render: function (data, type, row) {
                            function getDisplayText(role) {
                                var result = role;
                                switch (role) {
                                    case "OL":
                                        result = "Offering Lead";
                                        break;
                                    case "OPL":
                                        result = "Portfolio Lead";
                                        break;
                                    case "TGL":
                                        result = "Talent Group Leader";
                                        break;
                                    case "TL":
                                        result = "Talent BA";
                                        break;
                                }
                                return result;
                            }

                            var formattedResults = [];
                            if (data) {
                                $(data.results).each(function (idx, val) {
                                    formattedResults.push(getDisplayText(val));
                                });
                            }


                            return formattedResults.join(",");
                        }
                    },
                    {
                        "data": "ID",
                        title: "Actions",
                        "width": "15%",
                        "orderable": false,
                        render: function (data, type, row) {
                            return '<div style="display: inline-flex;" class="actionbuttons"><button type="button" onclick="viewRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button></div>';
                        }
                    },
                    {
                        "data": "Created",
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

        searchGrid = $('#InterOfficeTable').DataTable(getCOnfig(data, 'TransferRequests'));

        $('#InterOfficeTable').data('dg', searchGrid);

        $.fn.dataTable.ext.search.push(
            function (settings, data, dataIndex) {
                var $containerPanel = $(settings.nTable).closest('.panel');
                var min = $containerPanel.find('.fromDate').datepicker('getDate');
                var max = $containerPanel.find('.toDate').datepicker('getDate');
                if(settings.nTable.id == "InterOfficeTable"){
					var startDate = new Date(data[10]);
				}
				else if(settings.nTable.id == "visaTable"){
					var startDate = new Date(data[25]);
                }
                else if(settings.nTable.id == "LeaveRequestTable"){
					var startDate = new Date(data[14]);
                }
                else if(settings.nTable.id == "ExpenseRequestTable"){
					var startDate = new Date(data[13]);
				}
                if (min) {
                    min.setHours(0, 0, 0, 0);
                }
                if (max) {
                    max.setHours(0, 0, 0, 0);
                }
                startDate.setHours(0, 0, 0, 0);
                if (min == null && max == null) return true;
                if (min == null && startDate <= max) return true;
                if (max == null && startDate >= min) return true;
                if (startDate <= max && startDate >= min) return true;
                return false;
            }
        );
    }
    catch (e) {
        alert(e.message);

    }
}

function LeavesQuerySuccessHandler(data) {
    try {
        $('.loading').hide();
        $('.expander:first').trigger('click');

        $(data).each(function (idx, val) {
            if (!val.Practitioner.JobTitle) {
                val.Practitioner.JobTitle = "";
            }

            if (!val.Practitioner.Title) {
                val.Practitioner.Title = "";
            }
        })

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
                            columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14]
                        },
                        text: 'Export to Excel',
                        titleAttr: 'Excel',
                        title: "Leave Requests",
                        filename: excelFileName,
                        className: "gridcommandbutton"
                    }
                ],
                "bInfo": true,
                "data": d,
                "order": [[0, "desc"]],
                "columns": [
                    {
                        "data": "OriginalRequestId",
                        "title": "Req#",
                        width: "6%"
                    },
                    {
                        "data": "RequestType",
                        title: "Request Type",
                        "width": "11%",
                        align: "center",
                        render: function (data, type, row) {                            
                            return leaveTypes[row.RequestType] == undefined ? row.RequestType : leaveTypes[row.RequestType];
                        }
                    },
                    {
                        "data": "Practitioner.Title",
                        title: "Name",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        "data": "Practitioner.JobTitle",
                        title: "Designation",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        "data": "Offering",
                        title: "Practitioner's Offering",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        "data": "StartDate",
                        title: "Start Date",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        "data": "EndDate",
                        title: "End Date",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        "data": "Reason",
                        title: "Reason",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        "data": "CurrentLWD",
                        title: "Current Last Working Day",
                        "width": "0%",
                        "orderable": false,
                        visible: false,
                        render: function (data, type, row) {
                            var CurrentLWD = "";
                            if(new Date(data).setHours(0,0,0,0) == new Date('1900-01-01').setHours(0,0,0,0)){
                                CurrentLWD = "";
                            }
                            else{
                                CurrentLWD = row.CurrentLWD;
                            }
                            return CurrentLWD;
                        }
                    },
                    {
                        "data": "ProposedLWD",
                        title: "Proposed Last Working Day",
                        "width": "0%",
                        "orderable": false,
                        visible: false,
                        render: function (data, type, row) {
                            var ProposedLWD = "";
                            if(new Date(data).setHours(0,0,0,0) == new Date('1900-01-01').setHours(0,0,0,0)){
                                ProposedLWD = "";
                            }
                            else{
                                ProposedLWD = row.ProposedLWD;
                            }
                            return ProposedLWD;
                        }
                    },
                    {
                        "data": "RevokeResignationDate",
                        title: "Revoke Resignation Date",
                        "width": "0%",
                        "orderable": false,
                        visible: false,
                        render: function (data, type, row) {
                            var RevokeResignationDate = "";
                            if(new Date(data).setHours(0,0,0,0) == new Date('1900-01-01').setHours(0,0,0,0)){
                                RevokeResignationDate = "";
                            }
                            else{
                                RevokeResignationDate = row.RevokeResignationDate;
                            }
                            return RevokeResignationDate;
                        }
                    },
                    {
                        "data": "Status",
                        title: "Status",
                        "width": "7%",
                        align: "center",
                        render: function (data, type, row) {
                            var status = "";
                            if (row.Title == "Draft" && row.IsAdditionalDataRequired == "Y") {
                                status = "Draft";
                            }
                            else {
                                status = row.Status;
                            }
                            return status;
                        }
                    },
                    {
                        "data": "PendingWith",
                        title: "Pending With",
                        "width": "7%",
                        align: "center",
                        render: function (data, type, row) {
                            function getDisplayText(role) {
                                var result = role;
                                switch (role) {
                                    case "OL":
                                        result = "Offering Lead";
                                        break;
                                    case "OPL":
                                        result = "Portfolio Lead";
                                        break;
                                    case "TGL":
                                        result = "Talent Group Leader";
                                        break;
                                    case "TL":
                                        result = "Talent BA";
                                        break;
                                }
                                return result;
                            }

                            var formattedResults = [];
                            if (data) {
                                $(data.results).each(function (idx, val) {
                                    formattedResults.push(getDisplayText(val));
                                });
                            }


                            return formattedResults.join(",");
                        }
                    },
                    {
                        "data": "ID",
                        title: "Actions",
                        "width": "15%",
                        "orderable": false,
                        render: function (data, type, row) {
                            return '<div style="display: inline-flex;" class="actionbuttons"><button type="button" onclick="viewLeaveRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button></div>';
                        }
                    },
                    {
                        "data": "Created",
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

        searchGrid = $('#LeaveRequestTable').DataTable(getCOnfig(data, 'LeaveRequests'));

        $('#LeaveRequestTable').data('dg', searchGrid);

    }
    catch (e) {
        alert(e.message);

    }
}

function ExpenseQuerySuccessHandler(data) {
    try {
        $('.loading').hide();
        $('.expander:first').trigger('click');

        $(data).each(function (idx, val) {
            if (!val.Practitioner.JobTitle) {
                val.Practitioner.JobTitle = "";
            }

            if (!val.Practitioner.Title) {
                val.Practitioner.Title = "";
            }
        })

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
                            columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13]
                        },
                        text: 'Export to Excel',
                        titleAttr: 'Excel',
                        title: "Expense Requests",
                        filename: excelFileName,
                        className: "gridcommandbutton"
                    }
                ],
                "bInfo": true,
                "data": d,
                "order": [[0, "desc"]],
                "columns": [
                    {
                        "data": "OriginalRequestId",
                        "title": "Req#",
                        width: "6%"
                    },
                    {
                        "data": "RequestType",
                        title: "Request Type",
                        "width": "11%",
                        align: "center",
                        render: function (data, type, row) {                            
                            return expenseTypes[row.RequestType] == undefined ? row.RequestType : expenseTypes[row.RequestType];
                        }
                    },
                    {
                        "data": "Practitioner.Title",
                        title: "Name",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        "data": "Practitioner.JobTitle",
                        title: "Designation",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        "data": "Offering",
                        title: "Practitioner's Offering",
                        "width": "17%",
                        align: "center"
                    },
                    {
                        "data": "ExpenseDate",
                        title: "Expense Date",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        "data": "WBSCode",
                        title: "WBS Code",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        "data": "EstimatedExpenseAmount",
                        title: "Estimated Expense Amount",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        "data": "ExpenseReason",
                        title: "Expense Reason",
                        "width": "0%",
                        "orderable": false,
                        visible: false
                    },
                    {
                        "data": "IsAribaRequest",
                        title: "Is Ariba Request",
                        "width": "0%",
                        "orderable": false,
                        visible: false                    
                    },
                    {
                        "data": "Status",
                        title: "Status",
                        "width": "7%",
                        align: "center",
                        render: function (data, type, row) {
                            var status = "";
                            if (row.Title == "Draft" && row.IsAdditionalDataRequired == "Y") {
                                status = "Draft";
                            }
                            else {
                                status = row.Status;
                            }
                            return status;
                        }
                    },
                    {
                        "data": "PendingWith",
                        title: "Pending With",
                        "width": "7%",
                        align: "center",
                        render: function (data, type, row) {
                            function getDisplayText(role) {
                                var result = role;
                                switch (role) {
                                    case "OL":
                                        result = "Offering Lead";
                                        break;
                                    case "OPL":
                                        result = "Portfolio Lead";
                                        break;
                                    case "TGL":
                                        result = "Talent Group Leader";
                                        break;
                                    case "TL":
                                        result = "Talent BA";
                                        break;
                                }
                                return result;
                            }

                            var formattedResults = [];
                            if (data) {
                                $(data.results).each(function (idx, val) {
                                    formattedResults.push(getDisplayText(val));
                                });
                            }


                            return formattedResults.join(",");
                        }
                    },
                    {
                        "data": "ID",
                        title: "Actions",
                        "width": "15%",
                        "orderable": false,
                        render: function (data, type, row) {
                            return '<div style="display: inline-flex;" class="actionbuttons"><button type="button" onclick="viewExpenseRecord(this)" class="btn btn-secondary btn-xs"><span class="glyphicon glyphicon-share"></span> View</button></div>';
                        }
                    },
                    {
                        "data": "Created",
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

        searchGrid = $('#ExpenseRequestTable').DataTable(getCOnfig(data, 'ExpenseRequests'));

        $('#ExpenseRequestTable').data('dg', searchGrid);

    }
    catch (e) {
        alert(e.message);

    }
}

function clearSearchCriteria(ele) {
    $(ele).closest('.searchContainer').find('[data-id]').each(function (idx, val) {
        $(val).val("").trigger('change');
    })
}

function viewRecord(ele) {
    var $ele = $(ele);
    var dt = $ele.closest('table').DataTable();
    var data = dt.row($ele.closest('tr')).data();
    var requestId = isDevMode ? data.OriginalRequestId : data.OriginalTransferRequestIDId;
    location.href = siteUrl + "/Pages/TransferRequestView.aspx?RPTS=1&TRID=" + requestId;
}

function viewVisaRecord(ele) {
    var $ele = $(ele);
    var dt = $ele.closest('table').DataTable();
    var data = dt.row($ele.closest('tr')).data();
    var requestId = data.OriginalRequestId;
    location.href = siteUrl + "/Pages/VisaRequestView.aspx?RPTS=1&TRID=" + requestId;
}

function viewLeaveRecord(ele) {
    var $ele = $(ele);
    var dt = $ele.closest('table').DataTable();
    var data = dt.row($ele.closest('tr')).data();
    var requestId = data.OriginalRequestId;
    location.href = siteUrl + "/Pages/TalentRequestView.aspx?RPTS=1&TRID=" + requestId;
}

function viewExpenseRecord(ele) {
    var $ele = $(ele);
    var dt = $ele.closest('table').DataTable();
    var data = dt.row($ele.closest('tr')).data();
    var requestId = data.OriginalRequestId;
    location.href = siteUrl + "/Pages/ExpenseRequestView.aspx?RPTS=1&TRID=" + requestId;
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

function userContextLoaded() {
    currentLoggedInUserEmail = currentUser.get_email();
    currentUserId = currentContext.get_web().get_currentUser().get_id();
    checkIfUserIsApproval();
}

function initializeDatepickers() {
    $(".fromDate").datepicker();
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

var userApprovalFor = [];

function getOfferingFromType(type) {
    var result = "";
    switch (type) {
        case "AMI":
            result = "Application Modernization Innovation";
            break;
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
        case "CR":
            result = "Core Technology Operations";
            break;
    }
    return result;
}

function checkIfUserIsApproval() {

    var trckQueryDataUrl = siteUrl + "/_api/web/lists/getbytitle('Approvers')/items?$select=*,Approvers/Title,Approvers/EMail&$expand=Approvers/Id&$filter= Approvers/EMail eq '" + currentLoggedInUserEmail + "'";
    loadListItems({
        url: trckQueryDataUrl,
        success: function (data) {
            if (data.length === 0) {
                $('.dropDownMenu [href$="?team=1"]').remove();
				$('.loading').hide();
                bootbox.alert("You are not authorized to view this form!!!", function () {
                window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
				});
            }
			else if(!reportsLinkAdded){
				$('.loading').hide();
				bootbox.alert("You are not authorized to view this form!!!", function () {
                window.location.href = siteUrl + "/Pages/Dashboard.aspx?team=0";
				});
			}
            else {
                // if (isDevMode) {
                //     $('.nav.navbar-nav').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
                // }
                // else {
                //     $('.dropDownMenu').append('<li><a href="' + siteUrl + '/Pages/Reports.aspx">Reports</a></li>');
                // }
                $(data).each(function (idx, val) {
                    $(val.Approvers.results).each(function (di, va) {
                        if (va.EMail == currentLoggedInUserEmail) {
                            var offering = getOfferingFromType(val.Title.split(" ")[0]);
                            userApprovalFor.push(
                                {
                                    offering: offering,
                                    role: val.ImmigrationRoles
                                });
                            return false;
                        }
                    })
                });
				initializeDatepickers();
				pendingRequests();
				pendingVisaRequests();
                pendingLeaveRequests();
                pendingExpenseRequests();
            }            
        }
    });

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

function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() +
        (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}
