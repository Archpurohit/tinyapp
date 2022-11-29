function generateRandomString(len = 6) {
  // No input
  // 6 random characters
  // includes a-z, A-Z 0-9
  let alphanumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567689";
  // loop through them
  let code = new Array();
  for(let i=0; i< len; i++){
    let index = Math.floor(Math.random() * alphanumeric.length);
    code.push(alphanumeric.charAt(index));
  }
  code = code.join("")
  return code
}
console.log(generateRandomString())