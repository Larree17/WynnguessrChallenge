function updateRanking(id){
    console.log(id);
    if($("#" + id).css("background-color") == "#857361"){
        $("#" + id).css("background-color", "white");
    }else{
        $("#" + id).css("background-color", "#857361");
    }

    //send ajax request to get rankings

    
}