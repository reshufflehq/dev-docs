export function isError(response) {
  return response && response.type === 'error';
}
