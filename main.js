
const searchButton = document.getElementById("search")

searchButton.onclick = async () => {
  let elt = document.getElementById("specialty-menu")
  let specialty = elt.options[elt.selectedIndex].text
 

  let arr = specialty.split(' ')

  const lowerCaseArr = arr.map(ele => {
   
    return ele.toLowerCase()
  })


  if (lowerCaseArr.includes('&')) {
    let index = lowerCaseArr.indexOf('&') 
    lowerCaseArr.splice(index, 1)
  }

  let specialtyStr = lowerCaseArr.join('-')
  

  let zipCode = document.getElementById('zip-code').value


let location = await getLocation(zipCode)

getDoctorList(location, specialtyStr)
  
}

async function getLocation (zipCode) {

  const response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.zipcodeapi.com/rest/Q0wCDG7leGJdwuSn4kPdjaoSDUcvxQ3e9Wh6ITaWwPPtbMW2ZwiflYrG9P0Dfj3p/info.json/${zipCode}/degrees`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    'Access-Control-Allow-Origin': '*'
  }
})

let JSONres = await response.json()

console.log('JJJJJJ', JSONres)

return JSONres
}


function getDoctorList (location, specialtyStr ) {

  let lat = location.lat
  let lng = location.lng

  console.log('LAT', lat)
  console.log('LNG', lng)

  fetch(`https://cors-anywhere.herokuapp.com/https://api.betterdoctor.com/2016-03-01/doctors?specialty_uid=${specialtyStr}&location=${lat}%2C${lng}%2C25&skip=0&limit=20&user_key=95a77be1775294007d5183c52a5dab57`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Access-Control-Allow-Origin': '*'
    }
  }).then(res => res.json())
    .then(data => {
      console.log('DATATATATATAT', data)

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
    
      } else if(filterType === 'Last Name (Z-A)') {

        docArr.sort((a, b) => {
          let nameA = a.profile.last_name.toUpperCase()
          let nameB = b.profile.last_name.toUpperCase()
          if (nameA < nameB) {
            return 1;
          }
          if (nameA > nameB) {
            return -1;
          }
          return 0;
        })
    
        insertDocList(docArr)
      } else if (filterType === 'Distance') {

        docArr.sort((a,b) => {
          return a.practices[0].distance - b.practices[0].distance
        })

        insertDocList(docArr)
      } else if(filterType === 'Rating') {

      }else {

        insertDocList(data.data)

      }


       
    
    })

}

function insertDocList (docArr) {
  console.log('KKKKKKKKKKK', docArr)
  let docListContainer = document.getElementById('doctor-list-container')

 
  

  const docList = document.createElement('ul')
  docList.id = 'doctor-list'
  
  docArr.forEach(doc => {
    let firstName = doc.profile.first_name
    let lastName = doc.profile.last_name

    const docName = document.createElement('li')
    let radioBtn = document.createElement('input')
    radioBtn.type = 'radio'
    radioBtn.id = doc.npi
    radioBtn.name = 'doctor-name'
    radioBtn.onclick = chooseDoc

    let label = document.createElement('label')
    label.for = radioBtn.id
    label.innerHTML = lastName + ', ' + firstName

    docName.append(radioBtn)
    docName.append(label)
    
    docList.append(docName)
  })
 
  while (docListContainer.firstChild) {
    docListContainer.removeChild(docListContainer.firstChild);
}
  
docListContainer.append(docList)
}





async function chooseDoc (e) {
  console.log('chooseDoc is triggered', e.target.id)

  let npi = e.target.id

  const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.betterdoctor.com/2016-03-01/doctors/npi/${npi}?user_key=95a77be1775294007d5183c52a5dab57`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })

  const JSONres = await response.json()

  console.log('JOSONres in chooseDoc', JSONres)

  const docProfile = document.querySelector('#right-container')

  while(docProfile.firstChild) {
    docProfile.removeChild(docProfile.firstChild)
  }

  const docProfileInfo = JSONres.data.profile
  const education = JSONres.data.educations
  const insurancesArr = JSONres.data.insurances
  const addressInfo = JSONres.data.practices[0].visit_address

  const profilePic = document.createElement('img')
  profilePic.src = docProfileInfo.image_url
  const name = document.createElement('h3')
  name.innerHTML = docProfileInfo.first_name + ' ' + docProfileInfo.last_name
  const address = document.createElement('h4')
  address.innerHTML = addressInfo.street + ' ' + addressInfo.street2 + ', ' + addressInfo.city + ', ' + addressInfo.state + ' ' + addressInfo.zip
  const phone = document.createElement('h4')
  const phoneNum = JSONres.data.practices[0].phones[0].number
  const formattedNum = `(${phoneNum.slice(0, 3)}) ${phoneNum.slice(3, 6)}-${phoneNum.slice(6)}`
  phone.innerHTML = formattedNum
  const bioTitle = document.createElement('h4')
  bioTitle.innerHTML = 'Biography'
  const bio = document.createElement('p')
  bio.innerHTML = docProfileInfo.bio
  const genderTitle = document.createElement('h4')
  genderTitle.innerHTML = 'Gender'
  const gender = document.createElement('p')
  gender.innerHTML = docProfileInfo.gender
  const medicalSchoolTitle = document.createElement('h4')
  medicalSchoolTitle.innerHTML = "Medical School"
  const medicalSchool = document.createElement('p')
  const residencyTitle = document.createElement('h4')
  residencyTitle.innerHTML = 'Residency'
  const residency = document.createElement('p')

  if(education.length > 0) {
    medicalSchool.innerHTML = education[0].school
    residency.innerHTML = education[1].school
  }


  const insuranceTitle = document.createElement('h4')
  insuranceTitle.innerHTML = 'Insurances Accepted'

  const insuranceList = document.createElement('ul')


  insurancesArr.forEach(insurance => {
    const insuranceName = document.createElement('li')
    insuranceName.innerHTML = insurance.insurance_plan.name
    insuranceList.append(insuranceName)
  })

  docProfile.append(profilePic)
  docProfile.append(name)
  docProfile.append(address)
  docProfile.append(phone)
  docProfile.append(bioTitle)
  docProfile.append(bio)
  docProfile.append(genderTitle)
  docProfile.append(gender)
  docProfile.append(medicalSchoolTitle)
  docProfile.append(medicalSchool)
  docProfile.append(residencyTitle)
  docProfile.append(residency)
  docProfile.append(insuranceTitle)
  docProfile.append(insuranceList)
}

