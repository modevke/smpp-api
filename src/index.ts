import sms from './Smpp';

sms({
    recipient: '',
    message: ''
}).then((data: any) => {
    console.log('EVERYTHING OK', data);    
}).catch((err) => {
    console.log('EVERYTHING WRONG', err);
})