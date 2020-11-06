import smpp from 'smpp';
import {configs} from './configs';
import { SmsInterface } from './interface';

export default function(text: SmsInterface){

    return new Promise((resolve, reject) => {

        const session = smpp.connect({
            url: `smpp://${configs.host}:${configs.port}`,
            auto_enquire_link_period: 10000
        });
    
        session.on('connect', () => {
            console.log('SESSION CONNECTED');
            sendsms(session, text).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        });
    
        session.on('error', (e) => {
            console.log('SESSION ERROR', e);
            reject({
                status: '001',
                description: 'SMS Server failed to connect'
            });
        });

    });

}

function sendsms(session, text){

    return new Promise((resolve, reject) => {
        session.bind_transceiver({
            system_id: configs.system_id,
            password: configs.password
        }, function(pdu) {
            if (pdu.command_status == 0) {
                console.log('ACCESS GRANTED');
                session.submit_sm({
                    destination_addr: text.recipient,
                    short_message: text.message
                }, function(pdu) {
                    if (pdu.command_status == 0) {
                        console.log('MESSAGE SENT', pdu.message_id);
                        // resolve ({
                        //     status: '000',
                        //     description: 'Message sent',
                        //     data: {
                        //         message_id: pdu.message_id
                        //     }
                        // });
                        resolve(pdu);
                    }else{
                        console.log('COULD NOT SEND MESSAGE');
                        reject({
                            status: '001',
                            description: 'Message failed to send'
                        });
                        reject(pdu);
                    }
                });
            } else {
                console.log('ACCESS DENIED');
                reject ({
                    status: '001',
                    description: 'Access denied'
                })
            }
        });
    });

}