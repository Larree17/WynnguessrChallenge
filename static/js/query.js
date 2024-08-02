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
                response = response['rankings'];
                let table = document.getElementById('table-body');
                $("#table-body tr").remove(); 
                console.log('removing rows');
                //for each response, create a row in the table
                for(let i = 0; i < response.length; i++){
                    row = table.insertRow(i);
                    row.className = 'leaderboard-row';
                    //create cells for each row
                    let cell = row.insertCell(0);
                    cell.innerHTML = i + 1;
                    cell.className = 'leaderboard-data';
                    for(let j = 1; j < response[i].length + 1; j++){
                        let cell = row.insertCell(j);
                        cell.innerHTML = response[i][j - 1];
                        cell.className = 'leaderboard-data';
                    }
                    row.insertCell();
                }},
            error: function(error){
                console.log(error);
            }
        });
    }
});