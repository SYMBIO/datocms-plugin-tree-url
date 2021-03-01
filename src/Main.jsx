import React, { Component, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import connectToDatoCms from './connectToDatoCms';
import './style.css';
import setNewUrl from './setNewUrl';

@connectToDatoCms(plugin => ({
  plugin,
  fieldValue: plugin.getFieldValue(plugin.fieldPath),
  setFieldValue: value => plugin.setFieldValue(plugin.fieldPath, value),
}))
export default class Main extends Component {
  static propTypes = {
    plugin: PropTypes.object,
    fieldValue: PropTypes.string,
    setFieldValue: PropTypes.func,
  };

  componentDidMount() {
    const { plugin } = this.props;

    const value = plugin.getFieldValue(plugin.fieldPath);

    if (value === '' || value === undefined) {
      setNewUrl(plugin);
    }

    const { sourceField } = plugin.parameters.instance;
    this.unsubscribe = plugin.addFieldChangeListener(sourceField, () => {
      setNewUrl(plugin);
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { fieldValue, setFieldValue } = this.props;
    const [value, setValue] = useState(fieldValue);

    useEffect(() => {
      if (fieldValue !== value) {
        setValue(fieldValue);
      }
    }, [fieldValue]);

    return (
      <div className="container">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setFieldValue(e.target.value);
          }}
        />
      </div>
    );
  }
}
