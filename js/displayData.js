accessToken = 'pk.eyJ1IjoiY2hhbmNlLW5wIiwiYSI6ImNramptc3NpbjFsZmQycW83Z2ZkeHg3ZDgifQ.lbjTyfFz_95mpdQbLpM6qg'

//This function display all the nearby restaurants on the screen for the user
function displayData(current_lat,current_lng){
    //First, set the viewResult button to visible for the users
    $('#viewResBut').css('display','flex');



    //This list stores the original coordinates.
    var from = [current_lng, current_lat];

    //The bounds list stores a rectangle area that restrict the search area.
    var bounds = [current_lng-0.005, current_lat-0.005, current_lng+0.005, current_lat+0.005]

    //Request to the geocoding API to find the 10 nearest restaurants within the bounds of the current location.
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/restaurant.json?types=poi&proximity=${current_lng},${current_lat}&bbox=${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]}&country=SG&limit=10&access_token=${accessToken}`
    
    fetch(url)
    .then(response => response.json())
    .then(function (data){

        //Display on the button how many restaurants are found.
        $('#viewResBut').text(`Found ${data.features.length} Restaurants`)

        //Now find the distance using turf.js external js lib of each restaurant to the current location and store it in the data object.
        var options = { units: 'kilometers' };
        data.features.forEach(function(store) {
            var url = `https://api.mapbox.com/directions/v5/mapbox/walking/${from[0]},${from[1]};${store.geometry.coordinates[0]},${store.geometry.coordinates[1]}?steps=true&geometries=geojson&access_token=${accessToken}`;
            const request = async () => {
                const response = await fetch(url);
                const result = await response.json();
                
                Object.defineProperty(store.properties, 'distance', {
                    value: Math.round(result.routes[0].distance, 0),
                    writable: true,
                    enumerable: true,
                    configurable: true 
                });

                Object.defineProperty(store.properties, 'duration', {
                    value: Math.round(result.routes[0].duration / 60, 0),
                    writable: true,
                    enumerable: true,
                    configurable: true 
                });
            }
            

            request();

        });


        //Make sure that the fetch function finish execution first
        setTimeout(function(){  

            //Using a sort function to arrange the restaurants according to the distance
            data.features.sort(function(a, b) {
            if (a.properties.distance > b.properties.distance) {
              return 1;
            }
            if (a.properties.distance < b.properties.distance) {
              return -1;
            }
            return 0; // a must be equal to b
          }); 


          //Using a for loop to loop thru the sorted data and display them on the sidebar
          for (var i = 0; i < data.features.length; i++){

            var result = data.features[i];

            var result_lat = result.geometry.coordinates[1];
            var result_lng = result.geometry.coordinates[0];

            var distance = result.properties.distance;
            var duration = result.properties.duration;

            var place_info = result.place_name;
            var place_info = place_info.replace("'","");
            var place_info = place_info.replace('"',"");
            var place_info = place_info.replace('\\',"");
            
            $('#sidebarContent').append(`<button type="button" class="btn btn-danger btn-sm" onclick="navigateTo(\'${place_info}\' ,${result_lat}, ${result_lng})">${result.text}</button>`)
            $('#sidebarContent').append(`<p class='restaurant_cat'> Category: ${result.properties.category} </p>`)
            $('#sidebarContent').append(`<p class='restaurant_dist'> Distance: ${distance}m</p>`)
            $('#sidebarContent').append(`<p class='restaurant_dist'> Esti. Duration: : ${duration}m</p>`)
            $('#sidebarContent').append(`<a class='restaurant_add' href="javascript:void(0)" onclick="navigateTo(\'${place_info}\' ,${result_lat}, ${result_lng})"> <u>${result.properties.address} </u></a>`)
                 
            }
        }, 500);
    });
}

