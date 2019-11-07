import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Demo from '@/views/Demo';
import DrawGraph from '@/views/DrawGraph';

class App extends PureComponent {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path='/test' component={DrawGraph} />
          <Route path='/' component={Demo} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default hot(App);
