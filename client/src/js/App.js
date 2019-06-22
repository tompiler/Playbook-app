import React from 'react'
import ReactDOM from 'react-dom'

import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCheck,
  faAngleDown,
  faAngleUp,
  faBars
} from '@fortawesome/free-solid-svg-icons'
library.add(faCheck, faAngleDown, faAngleUp, faBars)

import Master from './Master'
import FrontPage from './FrontPage'

// useful commands

// echo -ne "\033]0;title\007" : changes title of terminal to "title"
// sudo watch -n 0.5  tail -25 /var/log/mongodb/mongod.log : creates watch of mongod log file
// sudo service mongod start / sudo service mongod stop

// lsof -i :8081 : checks process on port 8081
// sudo netstat -plnt

// in Playbook: forever start -c "npm start" ./
// in Playbook/client: forever start -c "npm start" ./

// to stop:
// forever list
// forever stop [pid]
// sudo netstat -plnt (to stop processes on background ports)
// kill -9 [pid]
// TODO

// Frontpage -> .co.uk
// decthlon.uk -> Store --> business unit

class App extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <React.Fragment>
        <BrowserRouter>
          <div className="app">
            <Switch>
              <Route path="/" component={FrontPage} exact />
              <Route path="/store" component={Master} />
              <Route path="/sport" component={Master} />
            </Switch>
          </div>
        </BrowserRouter>
        <div className="background" />
      </React.Fragment>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
