import { UssdDispatcher } from './src/services/ussd/ussd.dispatcher';

async function testUssd() {
  const response = await UssdDispatcher.dispatch({
    sessionId: "1234",
    serviceCode: "*617*85#",
    phoneNumber: "254700000000",
    text: "",
  });
  console.log("===== USSD MENU RESPONSE =====");
  console.log(response);
  console.log("==============================");
}

testUssd().then(() => process.exit(0)).catch(console.error);
