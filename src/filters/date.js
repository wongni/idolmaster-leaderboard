export default (value) => {
  const date = new Date(value)
  return date.toLocaleString(['ko-KR'], {month: 'short', day: '2-digit'})
}
