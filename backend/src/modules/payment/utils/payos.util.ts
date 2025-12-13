/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { createHmac } from 'node:crypto';

export function sortObjDataByKey(object: Record<string, unknown>) {
  const orderedObject = Object.keys(object)
    .sort()
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
  return orderedObject;
}

export function convertObjToQueryStr(object: Record<string, unknown>) {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];
      // Sort nested object
      if (value && Array.isArray(value)) {
        value = JSON.stringify(value.map((val) => sortObjDataByKey(val)));
      }
      // Set empty string if null
      if ([null, undefined, 'undefined', 'null'].includes(value as string)) {
        value = '';
      }

      return `${key}=${value}`;
    })
    .join('&');
}

export function generateSignature(
  data: Record<string, unknown>,
  checksumKey: string,
) {
  const sortedDataByKey = sortObjDataByKey(data);
  const dataQueryStr = convertObjToQueryStr(sortedDataByKey);
  const dataToSignature = createHmac('sha256', checksumKey)
    .update(dataQueryStr)
    .digest('hex');
  return dataToSignature; // Return signature in hex format, can use for mock testing
}
