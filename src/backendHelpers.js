export function isError(response) {
  return response && response.type && response.type === 'error';
}
