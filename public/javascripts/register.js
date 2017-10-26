

$(document).ready(function(){
		$("#register_btn").on("click",function(){
		var username=$("#userName").val();
		var password=$("#userPassword").val();
		var data={
			name:username,
			password:password
		}
        $.post("/register-fnncat/reg",data, function(data) {
             if(data.returnCode=="0"){
             	window.location.href="../postarticle";
             }
           });
	})
})