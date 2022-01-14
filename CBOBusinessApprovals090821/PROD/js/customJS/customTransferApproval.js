NWF$(window).load(function () {
    
    var itemId = ID;
    renderAttachments("divAttach", itemId);

});
function renderAttachments(divID, recordID) {
    var url = "https://americas.internal.deloitteonline.com/sites/USICBOPortal/CBOImmigration/_api/web/lists/getbytitle('Transfer Requests')/items?$select=AttachmentFiles,Attachments&$expand=AttachmentFiles&$filter=ID eq '" + recordID + "'";

    $.ajax({
        url: url,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data)
        {
            var $list = $('<ul></ul>');
            if (data.d.results && data.d.results.length > 0)
            {
                var item = data.d.results[0];
                if (item.Attachments)
                {
                    $.each(item.AttachmentFiles.results, function (idx, val)
                    {
                        var link = "<a target='_blank' href='" + val.ServerRelativeUrl + "'>" + val.FileName + "</a>";
                        $list.append("<li>" + link + "</li>");
                    });
                }
            }
            $('#' + divID).append($list);
        }
    });
}

