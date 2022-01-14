function togglePanel(ele) {
    var $ele = $(ele);
  //  $ele.closest('.panel').find('.panel-body').toggle();
	$ele.closest('.panel').children('.panel-body').toggle();
    $ele.toggleClass('glyphicon-plus').toggleClass('glyphicon-minus');
}

function toggleComment(ele,id) {
	var $ele = $(ele);
	var $id = '#'+'approverComments'+id;
    $($id+'').toggle();

	var $idd = '#'+'businessJusti'+id;
    $($idd+'').toggle();

	$ele.toggleClass('glyphicon-plus').toggleClass('glyphicon-minus');
}

var grpTitle = [];
var email = [];
var LCTitle = '';

$(document).ready(function(){	
	getCertRequests();
	//by Ravi
	getPMCertRequests();
	$('.expander').each(function (idx, val) {
		togglePanel(val);
	});
});

function getCertRequests(){
	var list = "Certification Requests";
	var title = [];
	
	var clientContext = new SP.ClientContext.get_current();
    var oWeb = clientContext.get_web();
    var currentUser = oWeb.get_currentUser();
    var allGroups = currentUser.get_groups();
	clientContext.load(currentUser);
    clientContext.load(allGroups);
	
	
    clientContext.executeQueryAsync(OnSuccess, OnFailure);
 
    function OnSuccess(sender, args)
    {
        var grpsEnumerator = allGroups.getEnumerator();
		var email = currentUser.get_email();
		console.log(email);
        while(grpsEnumerator.moveNext())
        {
            //This object will have the group instance
            //which the current user is part of. 
            //This is can be processed for further 
            //operations or business logic.
            var group = grpsEnumerator.get_current();
			//This gets the title of each group
            //while traversing through the enumerator.          
            grpTitle.push(group.get_title());
			console.log("grp title",grpTitle);
        }
		if(grpTitle.includes('CBO Certifications Learning Champions')){
		//	document.getElementById("requestTypeidentifier").innerHTML = "CBO Certifications - Approver Dashboard - LC";
			console.log("in email",email);
			var html = '';
			$.ajax({
					url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/BusinessApproval/_api/web/lists/getbytitle('Certification Requests')" +
					"/items?$select=*,Certification_x0020_Title/Certification_x0020_Desc,Certification_x0020_Title/Certification_x0020_ID," +
					"Certification_x0020_Title/Title,Certification_x0020_Title/Talent_x0020_Group_x0020_Name,Certification_x0020_Title/Learning_x0020_Champion," +
					"Certification_x0020_Title/Capability_x0020_Name,Certification_x0020_Title/Count,Certification_x0020_Title/ID," +
					"Certification_x0020_Title/Approved,Requestor_x0020_Name%20/Title&$expand=Certification_x0020_Title/Certification_x0020_ID," +
					"Certification_x0020_Title/Learning_x0020_Champion,Requestor_x0020_Name&$filter=substringof('"+ email +"',Certification_x0020_Title/Learning_x0020_Champion) and ((Approval_x0020_Status eq 'Approved') or (Approval_x0020_Status eq 'Rejected'))",
					contentType: "application/json;odata=verbose",
					type: 'GET',
					headers: {
						"Accept": "application/json; odata=verbose"
					},
					success : function(data){
						console.log("results:", data.d.results);		
						
						var objItems = data.d.results;
																		
						createOuterApprovedGrid(objItems);
						//createInnerApprovedGrids(objItems, uniqueNames);
					}
				});
			
				$.ajax({
					url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/BusinessApproval/_api/web/lists/getbytitle('Certification Requests')" +
					"/items?$select=*,Project_x0020_Manager/Title,Certification_x0020_Title/Certification_x0020_Desc,Certification_x0020_Title/Certification_x0020_ID," +
					"Certification_x0020_Title/Title,Certification_x0020_Title/Talent_x0020_Group_x0020_Name,Certification_x0020_Title/Learning_x0020_Champion," +
					"Certification_x0020_Title/Capability_x0020_Name,Certification_x0020_Title/Count,Certification_x0020_Title/ID," +
					"Certification_x0020_Title/Approved,Certification_x0020_Title/LCApproved,Requestor_x0020_Name%20/Title&$expand=Project_x0020_Manager/Title, Certification_x0020_Title/Certification_x0020_ID," +
					"Certification_x0020_Title/Learning_x0020_Champion,Requestor_x0020_Name&$filter=PM_x0020_Approval_x0020_Status eq 'Approved' and substringof('"+ email +"',Certification_x0020_Title/Learning_x0020_Champion) and Approval_x0020_Status eq 'Pending'",
					contentType: "application/json;odata=verbose",
					type: 'GET',
					headers: {
						"Accept": "application/json; odata=verbose"
					},
					success : function(data){
						console.log("results:", data.d.results);		
						
						var objItems = data.d.results;
						
						if(objItems.length == 0){
							html = '<div style="margin: auto;width: 60%;padding: 50px;">'+
							'<p>There are no pending certification requests</p>'+
							'</div>';
							$("#tblCertApproval").append(html);
							return;
						}
						
						var uniqueNames=[];			
						
						for(i = 0; i< objItems.length; i++){    
							if(uniqueNames.indexOf(objItems[i].Certification_x0020_Title.Certification_x0020_Desc) === -1){
								uniqueNames.push(objItems[i].Certification_x0020_Title.Certification_x0020_Desc);        
							}        
						}
						
						createOuterGrid(objItems, uniqueNames);
						createInnerGrids(objItems, uniqueNames);
					}
				});
	    }
		else if(grpTitle.includes('CBO Certifications TGL')){
			//document.getElementById("requestTypeidentifier").innerHTML = "CBO Certifications - Approver Dashboard - TGL";
			$.ajax({
					url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/BusinessApproval/_api/web/lists/getbytitle('Certification Requests')" +
					"/items?$select=*,Certification_x0020_Title/Certification_x0020_Desc,Certification_x0020_Title/Certification_x0020_ID," +
					"Certification_x0020_Title/Title,Certification_x0020_Title/Talent_x0020_Group_x0020_Name,Certification_x0020_Title/Learning_x0020_Champion," +
					"Certification_x0020_Title/Capability_x0020_Name,Certification_x0020_Title/Count,Certification_x0020_Title/ID," +
					"Certification_x0020_Title/Approved,Requestor_x0020_Name%20/Title&$expand=Certification_x0020_Title/Certification_x0020_ID," +
					"Certification_x0020_Title/Learning_x0020_Champion,Requestor_x0020_Name&$filter=substringof('"+ email +"',Certification_x0020_Title/Talent_x0020_Group_x0020_Leader) and ((TGL_x0020_Approval_x0020_Status eq 'Approved') or (TGL_x0020_Approval_x0020_Status eq 'Rejected'))",
					contentType: "application/json;odata=verbose",
					type: 'GET',
					headers: {
						"Accept": "application/json; odata=verbose"
					},
					success : function(data){
						console.log("results:", data.d.results);		
						
						var objItems = data.d.results;
						
																		
						createOuterApprovedGrid(objItems);
						//createInnerApprovedGrids(objItems, uniqueNames);
					}
				});
				$.ajax({
					url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/BusinessApproval/_api/web/lists/getbytitle('Certification Requests')" +
					"/items?$select=*,Project_x0020_Manager/Title,Certification_x0020_Title/Certification_x0020_Desc,Certification_x0020_Title/Certification_x0020_ID," +
					"Certification_x0020_Title/Title,Certification_x0020_Title/Talent_x0020_Group_x0020_Name," +
					"Certification_x0020_Title/Capability_x0020_Name,Certification_x0020_Title/Count,Certification_x0020_Title/ID," +
					"Certification_x0020_Title/Approved,Certification_x0020_Title/Learning_x0020_Champion,Certification_x0020_Title/LCApproved,Requestor_x0020_Name%20/Title&$expand=Project_x0020_Manager/Title, Certification_x0020_Title/Certification_x0020_ID," +
					"Requestor_x0020_Name&$filter=Approval_x0020_Status eq 'Approved' and substringof('"+ email +"',Certification_x0020_Title/Talent_x0020_Group_x0020_Leader) and TGL_x0020_Approval_x0020_Status eq 'Pending'",
					contentType: "application/json;odata=verbose",
					type: 'GET',
					headers: {
						"Accept": "application/json; odata=verbose"
					},
					success : function(data){
						console.log("results:", data.d.results);		
						
						var objItems = data.d.results;
						
						if(objItems.length == 0){
							html = '<div style="margin: auto;width: 60%;padding: 50px;">'+
							'<p>There are no pending certification requests</p>'+
							'</div>';
							$("#tblCertApproval").append(html);
							return;
						}
						
						var uniqueNames=[];			
						
						for(i = 0; i< objItems.length; i++){    
							if(uniqueNames.indexOf(objItems[i].Certification_x0020_Title.Certification_x0020_Desc) === -1){
								uniqueNames.push(objItems[i].Certification_x0020_Title.Certification_x0020_Desc);        
							}        
						}
						
						createOuterGrid(objItems, uniqueNames);
						createInnerGrids(objItems, uniqueNames);
					}
				});
		}
		else{
			$('#certApprovalsBlock').hide();
			//alert("Sorry! you don't have access to this page");
		}
    }
 
    function OnFailure(sender, args)
    {
        console.log(args.get_message());
		alert("Something went wrong!Please try again later.");
    } 
}

//by ravi
//1. work here to populate the inner grid for PM approvals
//2. Then update the approval flow
function getPMCertRequests(){

	console.log("###########Inside getPMCertRequests#########");
	//var list = "Certification Requests";
	//var title = [];
	
	var clientContext = new SP.ClientContext.get_current();
    var oWeb = clientContext.get_web();
    var currentUser = oWeb.get_currentUser();
    //var allGroups = currentUser.get_groups();
	clientContext.load(currentUser);
    //clientContext.load(allGroups);
	
	
    clientContext.executeQueryAsync(OnSuccess, OnFailure);
 
    function OnSuccess(sender, args)
    {
        // var grpsEnumerator = allGroups.getEnumerator();
		var email = currentUser.get_email();
		// console.log(email);
        // while(grpsEnumerator.moveNext())
        // {
        //     //This object will have the group instance
        //     //which the current user is part of. 
        //     //This is can be processed for further 
        //     //operations or business logic.
        //     var group = grpsEnumerator.get_current();
		// 	//This gets the title of each group
        //     //while traversing through the enumerator.          
        //     grpTitle.push(group.get_title());
		// 	console.log("grp title",grpTitle);
        // }
		
		//	document.getElementById("requestTypeidentifier").innerHTML = "CBO Certifications - Approver Dashboard - LC";
		console.log("in email",email);
		var html = '';
				
		$.ajax({
			url: "https://americas.internal.deloitteonline.com/sites/USICBOPortal/BusinessApproval/_api/web/lists/getbytitle('Certification Requests')/items?$select=*,Project_x0020_Manager/EMail, Requestor_x0020_Name/Title,Certification_x0020_Title/Capability_x0020_Name, Certification_x0020_Title/Certification_x0020_Desc,Certification_x0020_Title/Talent_x0020_Group_x0020_Name,Certification_x0020_Title/Title,Certification_x0020_Title/Certification_x0020_ID, Anticipated_x0020_Completion_x00 &$expand=Project_x0020_Manager, Requestor_x0020_Name, Certification_x0020_Title&$filter=(PM_x0020_Approval_x0020_Status eq 'Pending' and Project_x0020_Manager/EMail eq '"+email+"')",
			contentType: "application/json;odata=verbose",
			type: 'GET',
			headers: {
				"Accept": "application/json; odata=verbose"
			},
			success : function(data){
				console.log("results:", data.d.results);		
				
				var objItems = data.d.results;
				
				if(objItems.length == 0){
					html = '<div style="margin: auto;width: 60%;padding: 50px;">'+
					'<p>There are no pending certification requests</p>'+
					'</div>';
					$("#tblPMCertApproval").append(html);
					return;
				}
				$("#tblPMCertApproval").append('<div id="PMApproverGrid" style="width: 100%"></div>');
				createPMPendingReqGrid(objItems);
			}
		});
	   
    }
 
    function OnFailure(sender, args)
    {
        console.log(args.get_message());
		alert("Something went wrong!Please try again later.");
    } 
}


function createOuterApprovedGrid(objItems){
	var status = '';
	var tglstatus = '';
	$('#tblRequestStatus tbody > tr').remove();
	for(var x = 0; x < objItems.length; x++){
		/*if(grpTitle.includes('CBO Certifications Learning Champions')){
			status = objItems[x].Approval_x0020_Status;
		}
		else if(grpTitle.includes('CBO Certifications TGL')){
			status = objItems[x].TGL_x0020_Approval_x0020_Status;
		}*/
		status = objItems[x].Approval_x0020_Status;
		tglstatus = objItems[x].TGL_x0020_Approval_x0020_Status;
		
		$('#tblRequestStatus tbody').append('<tr><td>' + objItems[x].Requestor_x0020_Name.Title +
						'</td><td>' + objItems[x].Certification_x0020_Title.Capability_x0020_Name + '/' + objItems[x].Certification_x0020_Title.Talent_x0020_Group_x0020_Name + '/' + objItems[x].Certification_x0020_Title.Title +
                        '</td><td>' + getDateFormat(objItems[x].Anticipated_x0020_Completion_x00) +
						'</td><td>' + status + 
						'</td><td>' + tglstatus + '</td></tr>');
			
	}
		
	
	//console.log("temp array",temp2);
}

function createOuterGrid(objItems, uniqueNames){		
	var temp2 = [];
	
	for(var i=0;i < uniqueNames.length;i++){ 
		temp2.push(objItems.filter(function(d)
		{
			return d.Certification_x0020_Title.Certification_x0020_Desc === uniqueNames[i];
		}));
		var htmlString = '';
		for(var x = 0; x < temp2.length; x++){
			var totalCount = getNumber(temp2[0][x].Certification_x0020_Title.Count);
			var approvedCount = getNumber(temp2[0][x].Certification_x0020_Title.Approved);
			var availableCount = getNumber(temp2[0][x].Certification_x0020_Title.LCApproved);
			
			//get LC title
			var lcEmailId = temp2[0][x].Certification_x0020_Title.Learning_x0020_Champion;
			//GetLCTitle(lcEmailId);
			lcEmailId = lcEmailId.replace(";","\n");			
			
			//var availableCount = totalCount - approvedCount;
			htmlString += 
			'<div class="panel panel-default width-90percent outerCertPanel">' +
				'<div class="row" style="margin: 20px 10px 10px;">' +
					'<div class="col-sm-2"><i class="glyphicon glyphicon-plus expander" onclick="togglePanel(this)"></i>' +
					'&nbsp;&nbsp;' + temp2[0][x].Certification_x0020_Title.Certification_x0020_Desc + '</div>' +
					'<div class="col-sm-2">Total : <b>' + totalCount + '</b></div>' +
					'<div class="col-sm-2">Approved by Talent Group Leader : <b>' + approvedCount + '</b></div>' +
					'<div class="col-sm-2">Approved by Learning Champion : <b>' + availableCount + '</b></div>' +
					'<div class="col-sm-2">Learning Champion Email ID : <b>' + lcEmailId + '</b></div>' +
					//'<div class="col-sm-2">LC Name : <b>' + LCTitle + '</b></div>' +
				'</div>' +				 
				'<div class="panel-body panel-body-padding" style="display: none">' +
					'<div class="row">' +
						'<div class="table-responsive" style="margin: 10px;">' +
							'<table class="table innerCertPanel">' +						
								'<tr>' +
								  '<td>' +
									 '<div id="approverGrid' + temp2[0][x].Certification_x0020_Title.Certification_x0020_ID + '" style="width: 100%"></div>' +
								  '</td>' +
								'</tr>' +
						  '</table>' +
						'</div>' +
					'</div>' +               
				'</div>' +
			'</div>';
		}
		$("#tblCertApproval").append(htmlString);
		temp2 = [];
	}
	//console.log("temp array",temp2);
}

function getNumber(x){
	if(x == null){
		return 0;
	}
	return x;
}


function createInnerGrids(objItems, uniqueNames){	
	var temp2 = [];
	
	for(var i=0;i < uniqueNames.length;i++){ 
		temp2.push(objItems.filter(function(d){
			return d.Certification_x0020_Title.Certification_x0020_Desc === uniqueNames[i]
		}));
		
		var fullresult =  '<table id="table" style="width:100%"><thead><tr><td><b>Staff</b></td>' + '<td><b>Talent Group/Offering</b></td>'+ '<td><b>Anticipated Completion Date</b></td>' + '<td><b>Project Manager/Coach Name</b></td>' + '<td colspan="2"><b>Action</b></td>' + '</tr></thead><tbody>';
		for (var x = 0; x < temp2[0].length; x++) 
		{  
			var certId = temp2[0][x].Certification_x0020_Title.Certification_x0020_ID;
			var totalCerts = getNumber(temp2[0][x].Certification_x0020_Title.Count);
			var approvedCerts = getNumber(temp2[0][x].Certification_x0020_Title.Approved);
			var LCapprovedCerts = getNumber(temp2[0][x].Certification_x0020_Title.LCApproved);
			var certRowId = temp2[0][x].Certification_x0020_TitleId;
			var businessJusti = temp2[0][x].Business_x0020_Justification === null ? '' : temp2[0][x].Business_x0020_Justification;
			fullresult += '<tr>';
			fullresult += '<td><i class="glyphicon glyphicon-plus" onclick="toggleComment(this,' + temp2[0][x].ID + ')"></i>&nbsp;&nbsp;' + temp2[0][x].Requestor_x0020_Name.Title  + '</td>';
			fullresult += '<td style="text-align:center;">' + temp2[0][x].Certification_x0020_Title.Talent_x0020_Group_x0020_Name + '/' + temp2[0][x].Certification_x0020_Title.Title +'</td>';
			fullresult += '<td style="text-align:center;">' + getDateFormat(temp2[0][x].Anticipated_x0020_Completion_x00) + '</td>';
			
			fullresult += '<td style="text-align:center;">' + temp2[0][x].Project_x0020_Manager.Title + '</td>';
			//fullresult += '<td style="text-align:center;">' + businessJusti + '</td>';

			fullresult += '<td style="width:27%;text-align:center;" class="actionbuttons">' + '<button class="btn btn-secondary btn-xs" type="button" onclick="updateRecord(' + temp2[0][x].ID + ', \'Approved\',\'' + certId + '\',' + approvedCerts + ',' + totalCerts + ',' + certRowId + ',' + LCapprovedCerts + ');return false;">Approve</button>' 
							  + '&nbsp;&nbsp;'
							  + '<button class="btn btn-secondary btn-xs" type="button" onclick="updateRecord(' + temp2[0][x].ID + ', \'Rejected\',\'' + certId + '\',' + approvedCerts + ',' + totalCerts + ',' + certRowId + ',' + LCapprovedCerts + ');return false;">Reject</button>' + '</td>';
			fullresult += '</tr>';
			fullresult += '<tr><td colspan="3" align="center"><textarea id="businessJusti' + temp2[0][x].ID + '" style="display:none" class="form-control dropdownHight height-40px" disabled>Business Justification: '+ businessJusti +'</textarea></td></tr>';
			fullresult += '<tr><td colspan="3" align="center"><textarea id="approverComments' + temp2[0][x].ID + '" style="display:none" placeholder="Enter comments here" class="form-control dropdownHight height-40px"></textarea></td></tr>';

			
		}
		$('#approverGrid' + certId ).append(fullresult);
		temp2 = [];
	}
}

function createPMPendingReqGrid(objItems){	
	//var temp2 = [];
	
	var fullresult =  '<table id="table" style="width:100%"><thead><tr><td><b>Staff</b></td><td colspan="2"><b>Certification Name</b></td>' + '<td><b>Talent Group/Offering</b></td>'+ '<td><b>Anticipated Completion Date</b></td>' +'<td colspan="2"><b>Action</b></td>' + '</tr></thead><tbody>';
	for (var x = 0; x < objItems.length; x++) 
	{  
		var certId = objItems[x].Certification_x0020_Title.Certification_x0020_ID;
		var businessJusti = objItems[x].Business_x0020_Justification === null ? '' : objItems[x].Business_x0020_Justification;

		fullresult += '<tr>';
		fullresult += '<td><i class="glyphicon glyphicon-plus" onclick="toggleComment(this,' + objItems[x].ID + ')"></i>&nbsp;&nbsp;' + objItems[x].Requestor_x0020_Name.Title  + '</td>';
		fullresult += '<td style="text-align:center;">' + objItems[x].Certification_x0020_Title.Certification_x0020_Desc + '<td>';
		fullresult += '<td style="text-align:center;">' + objItems[x].Certification_x0020_Title.Talent_x0020_Group_x0020_Name + '/' + objItems[x].Certification_x0020_Title.Title +'</td>';
		fullresult += '<td style="text-align:center;width:18%;">' + getDateFormat(objItems[x].Anticipated_x0020_Completion_x00) + '</td>';
		fullresult += '<td style="width:27%;text-align:center;" class="actionbuttons">' + '<button class="btn btn-secondary btn-xs" type="button" onclick="updatePMApprovalRecord(' + objItems[x].ID + ', \'Approved\',\'' + certId + '\');return false;">Approve</button>' 
							+ '&nbsp;&nbsp;'
							+ '<button class="btn btn-secondary btn-xs" type="button" onclick="updatePMApprovalRecord(' + objItems[x].ID + ', \'Rejected\',\'' + certId + '\');return false;">Reject</button>' + '</td>';
		fullresult += '</tr>';
		fullresult += '<tr><td colspan="5" align="center"><textarea id="businessJusti' + objItems[x].ID + '" style="display:none" class="form-control dropdownHight height-40px" disabled>Business Justification: '+ businessJusti +'</textarea></td></tr>';
		fullresult += '<tr><td colspan="5" align="center"><textarea id="approverComments' + objItems[x].ID + '" style="display:none" placeholder="Enter comments here" class="form-control dropdownHight height-40px"></textarea></td></tr>';
	}

	//
	// $('#approverGrid' + certId ).append(fullresult);
	// temp2 = [];
	$("#PMApproverGrid").append(fullresult);

}

function getDateFormat(mData) { 
	if(mData == null){
		return "";
	}
	var date = new Date(mData);  
	var month = date.getMonth() + 1;  
	return (month.toString().length > 1 ? month : "0" + month) + "/" + date.getDate() + "/" + date.getFullYear(); 
}	

function updateRecord(id, approvalStatus, certId, approvedCerts, totalCerts, certRowId, LCapprovedCerts){
	var r = confirm("Do you want to continue?");
	var userLoginName;
	if (r == true) {	
		var clientContext = new SP.ClientContext.get_current();
		var	web = clientContext.get_web();	
		var loginId = _spPageContextInfo.userId;
			console.log('login id',loginId);	
		  
			
			var oList = web.get_lists().getByTitle('Certification Requests');
		
			this.oListItem = oList.getItemById(id);	

			if(approvedCerts == totalCerts & approvalStatus == 'Approved'){
				alert("No seats available so please reject it");
				return;
			}
				
			var approverComments = $("#approverComments"+id).val();
			
			console.log("user grp",grpTitle);	
			if(grpTitle.includes('CBO Certifications Learning Champions')){
				oListItem.set_item('Approval_x0020_Status', approvalStatus); 
				oListItem.set_item('Title', approverComments);	
				// rejecting the request if LC rejects 
				if(approvalStatus == 'Rejected'){
					if(approverComments.trim() == ''){
						alert("Please enter valid comments");
						return;
					}else if(approverComments.length < 30 || approverComments.length > 300){
						alert("Minimum of 30 and maximum of 300 characters justification is required to reject.");
						return;
					}
					oListItem.set_item('TGL_x0020_Approval_x0020_Status', 'NA');
				}
						
				oListItem.update();  
			}
			else if(grpTitle.includes('CBO Certifications TGL')){
				oListItem.set_item('TGL_x0020_Approval_x0020_Status', approvalStatus); 
				oListItem.set_item('TGL_x0020_Approver_x0020_Comment', approverComments);	
				//check below column name
				//oListItem.set_item('TGL_x0020_Approver_x0020_Details',userID);
				if(approvalStatus == 'Rejected'){
					if(approverComments.trim() == ''){
						alert("Please enter valid comments");
						return;
					}else if(approverComments.length < 30 || approverComments.length > 300){
						alert("Minimum of 30 and maximum of 300 characters justification is required to reject.");
						return;
					}
				}
				
				oListItem.update();				
			}
			else{
				//alert("You don't have access to this page");
				$('#certApprovalsBlock').hide();
				return;
			}

		clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded(certId, approvalStatus)), Function.createDelegate(this, this.onQueryFailed));		
			
			//if(approvalStatus == 'Approved' && grpTitle.includes('CBO Certifications TGL')){
			if(approvalStatus == 'Approved'){
				updateApprovedCount(certId, approvedCerts, certRowId, LCapprovedCerts);
			}
         
  
				
	}
	else {
		return;
	}
}

//by ravi
//update PM/Coach approval
function updatePMApprovalRecord(id, approvalStatus, certId){
	var r = confirm("Do you want to continue?");
	var userLoginName;
	if (r == true) {	
		var clientContext = new SP.ClientContext.get_current();
		var	web = clientContext.get_web();	
		var loginId = _spPageContextInfo.userId;
			console.log('login id',loginId);	
		  
			
			var oList = web.get_lists().getByTitle('Certification Requests');
		
			this.oListItem = oList.getItemById(id);	

			// if(approvedCerts == totalCerts & approvalStatus == 'Approved'){
			// 	alert("No seats available so please reject it");
			// 	return;
			// }
				
			var approverComments = $("#approverComments"+id).val();

			oListItem.set_item('PM_x0020_Approval_x0020_Status', approvalStatus); 
			oListItem.set_item('PM_x0020_Comments', approverComments);	
			// rejecting the request if PM/Coach rejects 
			if(approvalStatus == 'Rejected'){
				if(approverComments.trim() == ''){
					alert("Please enter valid comments");
					return;
				}else if(approverComments.length < 30 || approverComments.length > 300){
					alert("Minimum of 30 and maximum of 300 characters justification is required to reject.");
					return;
				}
				
				oListItem.set_item('Approval_x0020_Status', 'NA');
				oListItem.set_item('TGL_x0020_Approval_x0020_Status', 'NA');
			}
					
			oListItem.update(); 


		
			// console.log("user grp",grpTitle);	
			// if(grpTitle.includes('CBO Certifications Learning Champions')){
			// 	oListItem.set_item('Approval_x0020_Status', approvalStatus); 
			// 	oListItem.set_item('Title', approverComments);	
			// 	// rejecting the request if LC rejects 
			// 	if(approvalStatus == 'Rejected'){
			// 		if(approverComments.trim() == ''){
			// 			alert("Please enter valid comments");
			// 			return;
			// 		}
			// 		oListItem.set_item('TGL_x0020_Approval_x0020_Status', 'NA');
			// 	}
						
			// 	oListItem.update();  
			// }
			// else if(grpTitle.includes('CBO Certifications TGL')){
			// 	oListItem.set_item('TGL_x0020_Approval_x0020_Status', approvalStatus); 
			// 	oListItem.set_item('TGL_x0020_Approver_x0020_Comment', approverComments);	
			// 	//check below column name
			// 	//oListItem.set_item('TGL_x0020_Approver_x0020_Details',userID);
			// 	if(approvalStatus == 'Rejected'){
			// 		if(approverComments.trim() == ''){
			// 			alert("Please enter valid comments");
			// 			return;
			// 		}
			// 	}
				
			// 	oListItem.update();				
			// }
			// else{
			// 	//alert("You don't have access to this page");
			// 	$('#certApprovalsBlock').hide();
			// 	return;
			// }

		clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded(certId, approvalStatus)), Function.createDelegate(this, this.onQueryFailed));		
			
			//if(approvalStatus == 'Approved' && grpTitle.includes('CBO Certifications TGL')){
			// if(approvalStatus == 'Approved'){
			// 	updateApprovedCount(certId, approvedCerts, certRowId, LCapprovedCerts);
			// }
         
  
				
	}
	else {
		return;
	}
}

function updateApprovedCount(certId, approvedCerts, certRowId, LCapprovedCerts){
	var clientContext = new SP.ClientContext.get_current();
	var	web = clientContext.get_web();	
	
	var oList = web.get_lists().getByTitle('Offerings Certification Master');
	
	this.oListItem = oList.getItemById(certRowId);
	if(grpTitle.includes('CBO Certifications Learning Champions')) {
	oListItem.set_item('LCApproved', LCapprovedCerts+1);
	}
	if(grpTitle.includes('CBO Certifications TGL')) {
	oListItem.set_item('Approved', approvedCerts+1); 
	}
			
	oListItem.update();    

	clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededLookup), Function.createDelegate(this, this.onQueryFailedLookup));
}

function onQuerySucceeded(certId, approvalStatus) {
	if (approvalStatus == 'Approved') {
		bootbox.alert("Certification Request is successfully approved.", function () {
			//$('.outerCertPanel').remove();
		});
	}
	else if (approvalStatus == 'Rejected') {
		bootbox.alert("Certification Request is successfully Rejected.", function () {
			//$('.outerCertPanel').remove();
		});
	}
    console.log('Item updated!');
	$('.outerCertPanel').remove();
	$('#PMApproverGrid').remove();
	
	getCertRequests();
	getPMCertRequests();
	//location.reload();
	//windows.location.href = "https://americas.internal.deloitteonline.com/sites/USICBOPortal/BusinessApproval/Pages/Dashboard.aspx?team=1";
}

function onQueryFailed(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

function onQuerySucceededLookup() {
    console.log('Item updated!');
	//location.reload();
	//windows.location.href = "https://americas.internal.deloitteonline.com/sites/USICBOPortal/BusinessApproval/Pages/Dashboard.aspx?team=1";
}

function onQueryFailedLookup(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*function GetLCTitle(userEmailId) {  
	siteURL = _spPageContextInfo.siteAbsoluteUrl;
	var LCArray = userEmailId.split(";");
	
	var apiPath = siteURL + "/_api/web/sitegroups/getbyname('CBO%20Certifications%20Learning%20Champions')/users?$select=Title,Email";  
	$.ajax({  
		url: apiPath,  
		headers: {  
			Accept: "application/json;odata=verbose"  
		},  
		async: false,  
		success: function(data) {  
			var items; // Data will have user object  
			var results;  
			if (data != null) {  
				items = data.d;  
				if (items != null) {  
					results = items.results;
						if(LCArray.length > 1){
						  for(i = 0; i < LCArray.length; i++){
							  var filtered = results.filter(function(x){return x.Email == LCArray[i]});
							  if(filtered.length > 0){
								LCTitle+ = filtered[0].Title + "\n";
							  }
						  }
						}
						else{
							var filteredNew = results.filter(function(x){return x.Email == userEmailId});
							if(filteredNew.length > 0){
								LCTitle = filteredNew[0].Title;
							}
						}
					}  
				}  
			},
		eror: function(data) {  
			console.log("An error occurred. Please try again.");  
		} 
	}); 
}	*/