import { fetchDocument } from "./fetchDocument";
import { askQuestion } from "../io/ask";



(async () => {
  // fetch the ACN through terminal
  const ACN = await askQuestion("Enter the ASN number: ");

  try {
    // the path of downloaded document
    const path = await fetchDocument(ACN);

    // upload to S3
  } catch (error) {
    console.log('⚠️ Can not upload document to s3, ', error)
    //send message to slack for the failure happened
  }
  
})();
