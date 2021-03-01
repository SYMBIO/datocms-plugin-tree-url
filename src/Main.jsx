import React, { Component, createRef } from 'react';
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

  constructor(props) {
    super(props);
    this.state = {
      value: props.plugin.getFieldValue(props.plugin.fieldPath),
    };
    this.ref = createRef();
  }

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

  componentDidUpdate() {
    const { fieldValue } = this.props;

    if (this.ref.current && this.ref.current.value !== fieldValue) {
      console.log('current value', this.ref.current.value);
      console.log('incoming value', fieldValue);
      this.updateValue(fieldValue);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateValue(value) {
    this.ref.current.value = value;
    this.setState({
      value,
    });
  }

  render() {
    const { setFieldValue } = this.props;
    const { value } = this.state;

    return (
      <div className="container">
        <input
          type="text"
          defaultValue={value}
          onChange={(e) => {
            setFieldValue(e.target.value);
            this.setState({
              value: e.target.value,
            });
          }}
          ref={this.ref}
        />
      </div>
    );
  }
}
