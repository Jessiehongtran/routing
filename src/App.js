import React from 'react';
import { routes } from './data';
import './App.css';

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      drivers: [
        {
          driverId: 1,
          cities: ["Seattle", "Shoreline", "Bellevue"],
          clockInAt: 1578871924
        },
        { driverId: 2, cities: ["Seattle", "Shoreline"], clockInAt: 1578856784 },
        { driverId: 3, cities: ["Seattle", "Bellevue"], clockInAt: 1578851577 },
        { driverId: 4, cities: ["Seattle"], clockInAt: 1578868898 },
        { driverId: 5, cities: ["Bellevue"], clockInAt: 1578866448 },
        { driverId: 6, cities: ["Shoreline"], clockInAt: 1578852451 },
        { driverId: 7, cities: ["Seattle", "Shoreline"], clockInAt: 1578872447 },
        { driverId: 8, cities: ["Seattle", "Bellevue"], clockInAt: 1578849122 },
        { driverId: 9, cities: ["Shoreline"], clockInAt: 1578857175 },
        { driverId: 10, cities: ["Shoreline"], clockInAt: 1578845808 },
        { driverId: 11, cities: ["Shoreline", "Bellevue"], clockInAt: 1578846223 },
        { driverId: 12, cities: ["Seattle", "Bellevue"], clockInAt: 1578873005 },
        {
          driverId: 13,
          cities: ["Seattle", "Shoreline", "Bellevue"],
          clockInAt: 1578849115,
        },
      ],
      driverCities: [],
      cities: [0],
      newDriverId: null,
      matches: [],
      matching: false,
      matchedRoute: null
    }

    this.addCityOptions = this.addCityOptions.bind(this)
    this.handleChangeCity = this.handleChangeCity.bind(this)
    this.registerAsDriver = this.registerAsDriver.bind(this)
    this.matching = this.matching.bind(this)

  }

  addCityOptions(){
    this.setState({
      cities: [
        ...this.state.cities,
        this.state.cities[this.state.cities.length -1 ] + 1
      ],
      driverCities: [
        ...this.state.driverCities,
        'x'
      ]
    })
  }

  hasCity(cityList, city){
    for (let i = 0; i < cityList.length ; i++){
      if (city === cityList[i]){
        return true
      }
    }
    return false
  }

  isNotSelectedDriver(selectedDrivers, driver){
    for (let i = 0; i < selectedDrivers.length; i++){
      if (selectedDrivers[i].driverId === driver.driverId){
        return false
      }
    }
    return true
  }

  handleChangeCity(e, i){
    const { driverCities } = this.state;
    driverCities[i] = e.target.value
    this.setState({
      driverCities: driverCities
    })
  }

  registerAsDriver(){
    const maxWithDriverId = this.state.drivers.reduce((a,b) => a.driverId > b.driverId ? a : b)
    this.setState({
      drivers: [
        ...this.state.drivers,
        {
          driverId: maxWithDriverId.driverId + 1,
          cities: this.state.driverCities,
          clockInAt: Math.floor(Date.now()/1000)
        }
      ],
      newDriverId: maxWithDriverId.driverId + 1
    })
  }

  matching(organizedRoutes,organizedDrivers, cityList){
    let output = [];
    let matchedRouteId = null;
    let matchedRoute = null;
    for (let i = 0; i < cityList.length; i++){
      for (let j = 0; j < organizedRoutes[cityList[i]].length; j++){
        let count = 0
        const route = organizedRoutes[cityList[i]][j]
        let k = j
        while (k < organizedDrivers[cityList[i]].length){
          let driver = organizedDrivers[cityList[i]][k]
          if (this.isNotSelectedDriver(output, driver)){
            //get the routeId for this new driver
            if (this.state.newDriverId && driver.driverId === this.state.newDriverId){
              matchedRouteId = route.routeId
            }
            //add into matches
            output.push({
              routeId: route.routeId,
              driverId: driver.driverId
            })
            count = 1
            break
          } 
          k += 1
        } 
        if (k == organizedDrivers[cityList[i]].length && count == 0){
          output.push({
              routeId: route.routeId,
              driverId: null
            })
        }
      }
    }

    console.log('matches', output)

    if (matchedRouteId !== null){
      matchedRoute = routes.filter(route => route.routeId === matchedRouteId)[0]
    }

    this.setState({ 
      matching: true,
      matchedRoute: matchedRoute
    })
  }


  render(){
    const { drivers, cities, newDriverId, matches, matchedRoute, matching } = this.state;

    //sort routes by cities and increasing by minutes
    let organizedRoutes = {}
    const cityList = []
    
    let pre = null
    for (let i = 0; i < routes.length ; i++){
      if (pre !== null && routes[i].city === pre){
        organizedRoutes[routes[i].city].push(routes[i])
      } else {
        if (pre !== null)
        organizedRoutes[pre] = organizedRoutes[pre].sort((a, b) => (a.minutes < b.minutes) ? -1 : 1)
        organizedRoutes[routes[i].city] = []
        organizedRoutes[routes[i].city].push(routes[i])
        cityList.push(routes[i].city)
      }
      pre = routes[i].city 
    }

    //sort drivers by clockInAt
    const sortedDrivers = drivers.sort((a, b) => (a.clockInAt < b.clockInAt) ? -1 : 1)
    
    
    //organize drivers by cities
    let organizedDrivers = {}
    for (let i = 0; i < sortedDrivers.length; i++){
      for (let j = 0; j < sortedDrivers[i].cities.length; j++){
        if (this.hasCity(cityList, sortedDrivers[i].cities[j])){
          if (organizedDrivers[sortedDrivers[i].cities[j]]){
            organizedDrivers[sortedDrivers[i].cities[j]].push(sortedDrivers[i])
          } else {
            organizedDrivers[sortedDrivers[i].cities[j]] = []
            organizedDrivers[sortedDrivers[i].cities[j]].push(sortedDrivers[i])
          }
        }
      }
    }

    console.log('drivers', drivers)

    return (
      <div className="App">
        <h1>Heyyy</h1>
        <label>Which city can you do delivery?
        {cities.map((citi,i) => 
          <select onChange={e => this.handleChangeCity(e, i)}>
            <option>Select a city</option>
            {cityList.map(city => <option value={city}>{city}</option>)}
          </select>
        )}
        <button onClick={() => this.addCityOptions()}>Add city</button>
        </label>
        <button onClick={this.registerAsDriver}>Register to be driver</button>
        { newDriverId !== null 
          ? <div>
              <p>Successfully registered, your driverId is {newDriverId}</p>
              <button onClick={() => this.matching(organizedRoutes, organizedDrivers, cityList)}>Search available routes</button> 
            </div>
          : null}
        {matching 
        ? matchedRoute !== null 
          ? <div>
              <h3>RouteID: {matchedRoute.routeId}</h3>
              <p>City: {matchedRoute.city}</p>
              <p>Minutes: {matchedRoute.minutes}</p>
            </div>
          : <p>There is no route for you currently</p>
        : null}
        {/* {matches.length > 0
        ? matches.map(match => <p>RouteID: {match.routeId} + DriverID: {match.driverId !== null ? match.driverId : "no match"}</p>)
        : null} */}
      </div>
    );
  }
}

export default App;
