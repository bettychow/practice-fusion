//With the given lat, lng and the specailty specified by user in the drop down menu, user will be able to 
//retrieve a list of doctors of same specialty within 25 miles from zip code provided.

function getDoctorList (location, specialtyStr ) {

  let lat = location.lat
  let lng = location.lng

  fetch(`https://cors-anywhere.herokuapp.com/https://api.betterdoctor.com/2016-03-01/doctors?specialty_uid=${specialtyStr}&location=${lat}%2C${lng}%2C25&skip=0&limit=25&user_key=95a77be1775294007d5183c52a5dab57`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Access-Control-Allow-Origin': '*'
    }
  }).then(res => res.json())
    .then(data => {

      const filterMenu = document.getElementById('filter-menu')
      const filterType = filterMenu.options[filterMenu.selectedIndex].text
      const docArr = data.data

      if(filterType === 'Last Name (A-Z)') {
        
        docArr.sort((a, b) => {
          let nameA = a.profile.last_name.toUpperCase()
          let nameB = b.profile.last_name.toUpperCase()
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        })

        insertDocList(docArr)
    
      } else if (filterType === 'Last Name (Z-A)') {

        docArr.sort((a, b) => {
          let nameA = a.profile.last_name.toUpperCase()
          let nameB = b.profile.last_name.toUpperCase()
          if (nameA < nameB) {
            return 1
          }
          if (nameA > nameB) {
            return -1
          }
          return 0
        })

        insertDocList(docArr)
    
      } else if (filterType === 'Distance (Closest First)') {

        docArr.sort((a,b) => {
          return a.practices[0].distance - b.practices[0].distance
        })

        insertDocList(docArr)

      } else if (filterType === 'Rating') {
        const filteredArr = docArr.filter(doc => doc.ratings.length > 0)

        filteredArr.sort((a, b) => {
          let docARating = a.ratings[0].rating !== null ? a.ratings[0].rating : a.ratings[1].rating
          let docBRating = b.ratings[0].rating !== null ? b.ratings[0].rating : b.ratings[1].rating

          return docARating - docBRating
        })

        insertDocList(filteredArr)

      } else {
        insertDocList(docArr)
      }    
    })
}
