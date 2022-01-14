var currentLoggedInEmp = [];
    if(currentLoggedInEmp == undefined || currentLoggedInEmp == null || currentLoggedInEmp.length == 0) {
        $.ajax({
          url: _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties",
          headers: { Accept: "application/json;odata=verbose" },
          success:function(data){
            currentLoggedInEmp["ID"] = _spPageContextInfo.userId;
            currentLoggedInEmp["DisplayName"] = data.d.DisplayName;
            currentLoggedInEmp["Email"] = data.d.Email;
            currentLoggedInEmp["Designation"] = data.d.Title;
          }
        });
        
      }

