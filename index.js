const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const https = require('https');

const apiKey = '3wk2jgc6gbpf4znkvryp8hjz7drfbcdv';

// function to download the image from a public URL
async function downloadImage(url) {
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  const response = await axios.get(url, {
    responseType: 'stream',
    httpsAgent,
  });
  const writer = fs.createWriteStream('./captcha.jpg');
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// set up the request data
const formData = new FormData();
formData.append('method', 'post');
formData.append('key', apiKey);
formData.append('file', fs.createReadStream('captcha.jpg'));

// function to solve the captcha
async function solveCaptcha(url) {
  try {
    // download the image from the URL
    await downloadImage(url);
    console.log('Image downloaded successfully');

    // send the image to AZCaptcha API to get the captcha ID
    const response = await axios.post('http://azcaptcha.com/in.php', formData, {
      headers: formData.getHeaders(),
    });
    const captchaID = response.data.split('|')[1];
    console.log('Captcha ID:', captchaID);

    // wait before checking the status of the captcha
    await new Promise(resolve => setTimeout(resolve, 5000));

    // check the status of the captcha and get the result
    const statusResponse = await axios.get(`http://azcaptcha.com/res.php?key=${apiKey}&action=get&id=${captchaID}`);
    const captchaResult = statusResponse.data.split('|')[1];
    console.log('Captcha result:', captchaResult);

  } catch (error) {
    console.error('Error solving captcha:', error);
  }
}

// call the solveCaptcha function with the image URL
solveCaptcha('https://i.ibb.co/jTKYQqP/Captcha-United.png');


// solveCaptcha('https://i.ibb.co/R4BB4DW/Captcha-Bajaj.jpg');
