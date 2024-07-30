document.addEventListener("DOMContentLoaded", (event) => {
    updateRanking();
function updateRanking(){
    let form = document.getElementById('filter-options');
    let params = {};
    for(let i = 0; i < form.length; i++){
        params[form[i].value] = form[i].checked;

    }
    //send ajax request to get rankings
    $.ajax({
        url: '/api/updaterank',
        data: params,
        type: 'POST',
        dataType: 'json',
        success: function(response){
            console.log(response);
        },
        error: function(error){
            console.log(error);
        }
    });
}});