NWF$(window).load(function(){

//Below is the Javascript for Deloitte Branding on Nintex form
NWF$("#Ribbon").remove();
NWF$(".dol-header-icon").remove();
NWF$(".dol-w2dol").remove();
NWF$(".ms-belltown-anonShow").remove();

NWF$(".dol-header-top").attr("display","none");
NWF$(".dol-header").css('background-color','black');
NWF$("#rootUrl" ).find( "img" ).attr("src","https://americas.internal.deloitteonline.com/sites/KXIntegrate/SiteAssets/Styles/Images/logo.png");

NWF$(".dol-header-top").css({"height": "70px","border-bottom":"none"});
NWF$(".dol-user-img").css({"border-bottom":"none"});

NWF$("#dolrightmenu").append("<label class='nf-label-control'><strong rtenodeid='3' style='font-size: xx-Large; color: rgb(255, 255, 255); text-decoration: none solid rgb(255, 255, 255);'>USI CBO Business Approvals</strong></label>");

var username = $(".ms-core-menu-root").find('div').text();

NWF$("#suiteLinksBox").prepend("<span id='userNameSpan' style='font-size: small;margin-top: 20px;margin-right:10px;font-family: sans-serif;font-weight: bold;color:white; border : none'>Welcome "+ username +"</span>");

NWF$("#onetIDListForm").css({"display": "flex", "justify-content": "center"});

});
