import { camelCase } from 'camel-case';
import slugify from 'slugify';

async function getUrl(plugin) {
  const token = plugin.parameters.global.datoCmsApiToken;
  const apiName = camelCase(plugin.itemType.attributes.api_key);

  try {
    const { data } = await fetch('https://graphql.datocms.com/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `{ ${apiName}(locale: ${plugin.locale}, filter: { id: { eq: "${plugin.itemId}" } }) { parent { url } } }`,
      }),
    }).then(res => res.json());

    return data[apiName].parent ? data[apiName].parent.url : '';
  } catch (e) {
    return '';
  }
}

export default async function setNewUrl(plugin) {
  const value = plugin.getFieldValue(plugin.fieldPath);
  if (value === 'homepage' || (typeof value === 'string' && value.indexOf(':') !== -1)) {
    return;
  }
  const parentUrl = await getUrl(plugin);
  // eslint-disable-next-line max-len
  const slug = slugify(plugin.getFieldValue(plugin.parameters.instance.sourceField, plugin.locale), {
    remove: /[^\w\s-]/g,
    lower: true,
  });
  console.log(`setting new url ${parentUrl ? `${parentUrl}/${slug}` : slug}`);
  plugin.setFieldValue(plugin.fieldPath, parentUrl ? `${parentUrl}/${slug}` : slug);
}
