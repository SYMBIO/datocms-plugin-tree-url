import React, { Component } from 'react';
import PropTypes from 'prop-types';
import slugify from 'slugify';

async function getUrl(plugin) {
  const token = plugin.parameters.global.datoCmsApiToken;

  try {
    const { data } = await fetch('https://graphql.datocms.com/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `{ page(locale: ${plugin.locale}, filter: { id: { eq: "${plugin.itemId}" } }) { parent { url } } }`,
      }),
    }).then(res => res.json());

    return data.page.parent ? data.page.parent.url : '';
  } catch (e) {
    return '';
  }
}

async function setNewUrl(plugin) {
  const parentUrl = await getUrl(plugin);
  const slug = slugify(plugin.getFieldValue(plugin.parameters.instance.sourceField, plugin.locale), { remove: /[^\w\s-]/g, lower: true });
  plugin.setFieldValue(plugin.fieldPath, parentUrl ? `${parentUrl}/${slug}` : slug);
}

export default mapPluginToProps => BaseComponent => class ConnectToDatoCms extends Component {
    static propTypes = {
      plugin: PropTypes.object,
    };

    constructor(props) {
      super(props);
      this.state = mapPluginToProps(props.plugin);
    }

    componentDidMount() {
      const { plugin } = this.props;

      const value = plugin.getFieldValue(plugin.fieldPath);

      if (value === '' || value === undefined) {
        setNewUrl(plugin, this.setState, mapPluginToProps);
        this.setState(mapPluginToProps(plugin));
      }

      this.unsubscribe = plugin.addFieldChangeListener(plugin.fieldPath, () => {
        this.setState(mapPluginToProps(plugin));
      });

      const { sourceField } = plugin.parameters.instance;
      this.unsubscribe2 = plugin.addFieldChangeListener(sourceField, () => {
        setNewUrl(plugin, this.setState, mapPluginToProps);
        this.setState(mapPluginToProps(plugin));
      });
    }

    componentWillUnmount() {
      this.unsubscribe();
      this.unsubscribe2();
    }

    render() {
      return <BaseComponent {...this.props} {...this.state} />;
    }
};
