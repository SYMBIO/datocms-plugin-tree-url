import React, { Component } from 'react';
import PropTypes from 'prop-types';

import connectToDatoCms from './connectToDatoCms';
import './style.css';

@connectToDatoCms(plugin => ({
  fieldValue: plugin.getFieldValue(plugin.fieldPath),
  setFieldValue: value => plugin.setFieldValue(plugin.fieldPath, value),
}))
export default class Main extends Component {
  static propTypes = {
    fieldValue: PropTypes.string,
    setFieldValue: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.fieldValue,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.fieldValue !== state.value) {
      return {
        value: props.fieldValue,
      };
    }

    // Return null to indicate no change to state.
    return null;
  }

  render() {
    const { value } = this.state;
    const { setFieldValue } = this.props;

    return (
      <div className="container">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            this.setState({
              value: e.target.value,
            });
            setFieldValue(e.target.value);
          }}
        />
      </div>
    );
  }
}
