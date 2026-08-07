import { UssdDispatcher } from './src/services/ussd/ussd.dispatcher';

async function simulate() {
  const dispatcher = new UssdDispatcher();
  
  // Test Phone Number
  const phoneNumber = "254700000001";
  
  const steps = [
    "", // 0: Start session
    "1", // 1: Language (English)
    "John Doe", // 2: Name
    "12345678", // 3: ID Number
    "1", // 4: Region
    "1", // 5: Town
    "1", // 6: Accept Terms (was failing here)
  ];

  let currentText = "";

  for (let i = 0; i < steps.length; i++) {
    if (i > 0) {
      currentText += (currentText ? "*" : "") + steps[i];
    }
    
    console.log(`\n--- STEP ${i} | User inputs: "${steps[i]}" | Full Text: "${currentText}" ---`);
    
    const params = {
      sessionId: "test-session",
      serviceCode: "*617*85#",
      phoneNumber,
      text: currentText,
    };
    
    const response = await UssdDispatcher.dispatch(params);
    console.log(response);
  }
}

simulate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
