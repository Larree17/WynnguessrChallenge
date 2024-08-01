$( document ).ready(function() {
    let form = document.getElementById('filter-options');
    for(let i = 0; i < form.length; i++){
        form[i].addEventListener('change', function(){
            updateRank();
        });
    }
    updateRank();
    function updateRank(){
        let params = {};
        let provinces = '[\'';
        for(let i = 0; i < form.length; i++){
            if(i < 5 && i >= 0){
                if(form[i].checked){
                    provinces += form[i].value + "', '";
                }
            }
            else if(i == 5){
                if(form[i].checked){
                    params = {
                        'nolook': 'Yes'
                    }
                }
                else{
                    params = {
                        'nolook': 'No'
                    }
                }
            }
            else if(i > 5){
                if(form[i].checked){
                    num = {'three': 3, 'five': 5, 'ten': 10, 'fifteen': 15, 'twenty-five': 25};
                    params['rounds'] = num[form[i].value];
                }
            }
        }
        params['provinces'] = provinces.substring(0, provinces.length - 3) + ']';

    
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
    }
});