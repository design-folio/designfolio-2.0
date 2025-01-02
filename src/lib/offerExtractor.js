export const extractOfferDetails = async (model, data) => {
  console.log("Extracting data from offer letter...");
  const extractionPrompt = `
    You are an expert at analyzing job offer letters. Extract the following information from this offer letter. Be precise and only extract what is explicitly stated:

    1. Job Title/Position
    2. Company Name
    3. Base Salary/Compensation Amount (only numerical values)
    4. Location/Country
    5. Any mentioned current salary or previous compensation

    Offer Letter Content:
    ${data.offerContent}

    Format your response exactly like this, with only the extracted information:
    Position: [exact position from letter]
    Company: [exact company name]
    Offered Salary: [exact numerical amount]
    Location: [exact location]
    Current Salary: [exact amount if mentioned]

    If any information is not found, leave it blank but keep the label.
  `;

  try {
    const extraction = await model.generateContent(extractionPrompt);
    const extractedText = extraction.response.text();
    console.log("Extracted raw data:", extractedText);

    // Parse the extracted data
    const extractedData = { ...data };
    const lines = extractedText.split("\n");

    lines.forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();

      if (
        value &&
        !value.includes("[") &&
        value !== "not found" &&
        value !== "not mentioned"
      ) {
        switch (key.trim()) {
          case "Position":
            extractedData.position = value || data.position;
            break;
          case "Company":
            extractedData.company = value || data.company;
            break;
          case "Offered Salary":
            // Extract only numbers from the salary
            const salaryMatch = value.match(/\d+/);
            if (salaryMatch) {
              extractedData.offeredSalary = salaryMatch[0];
            }
            break;
          case "Location":
            extractedData.country = value || data.country;
            break;
          case "Current Salary":
            if (!data.currentSalary) {
              const currentSalaryMatch = value.match(/\d+/);
              if (currentSalaryMatch) {
                extractedData.currentSalary = currentSalaryMatch[0];
              }
            }
            break;
        }
      }
    });

    console.log("Processed extracted data:", extractedData);
    return extractedData;
  } catch (error) {
    console.error("Error extracting offer details:", error);
    return data; // Return original data if extraction fails
  }
};
